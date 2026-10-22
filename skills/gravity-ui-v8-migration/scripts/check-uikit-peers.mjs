#!/usr/bin/env node
//
// check-uikit-peers.mjs — find the dependencies that block an upgrade of
// @gravity-ui/uikit to v8.
//
// Usage (from the folder with the package.json to upgrade; in a monorepo, from
// each workspace that depends on uikit):
//   node <skill-dir>/scripts/check-uikit-peers.mjs [target-version]
//
// target-version defaults to dist-tag `latest` when it is 8.x, otherwise the
// highest 8.x among the other dist-tags. The first line of the output names it.
//
// Skips @gravity-ui/* packages: they move to v8 together with uikit, in a
// known order. Every other direct dependency whose installed package.json names
// @gravity-ui/uikit in peerDependencies or dependencies is sorted into:
//   - accepts the target as installed;
//   - upgrade before uikit: a newer version accepts both the installed uikit
//     and the target;
//   - upgrade with uikit: a newer version accepts the target only, so it goes
//     into the same install as uikit;
//   - local: a workspace:/file:/link:/portal: dependency, migrated in this repo;
//   - blocking: no published version accepts the target. For a `dependency`
//     range this means a second copy of uikit inside that package;
//   - unchecked: the registry did not answer (the npm error code is printed),
//     or the dependency comes from git or a URL.
// Ranges are compared with npm's semver rules: `*` accepts anything, and a
// prerelease target satisfies only ranges that name a prerelease of it.
//
// Requires: node 18+, npm on PATH with access to the project's registry, and
// installed node_modules (Yarn Plug'n'Play is not supported).
// Exit codes: 0 — nothing blocks; 1 — something blocks or could not be
// checked; 2 — usage or environment error.

import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';

const UIKIT = '@gravity-ui/uikit';
const PEER_FIELD = `peerDependencies.${UIKIT}`;
const DEP_FIELD = `dependencies.${UIKIT}`;
const LOCAL_PROTOCOLS = ['workspace:', 'file:', 'link:', 'portal:'];
const cwd = process.cwd();
const shell = process.platform === 'win32';

function fail(message) {
    console.error(message);
    process.exit(2);
}

/** Parsed JSON of `npm <args> --json`, or `{error: code}` when npm fails */
function npmJson(args) {
    try {
        const out = execFileSync('npm', [...args, '--json'], {
            cwd,
            shell,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            maxBuffer: 64 * 1024 * 1024,
        });
        return out.trim() ? JSON.parse(out) : undefined;
    } catch (error) {
        try {
            return {error: JSON.parse(error.stdout).error?.code ?? 'npm failed'};
        } catch {
            return {error: 'npm failed'};
        }
    }
}

function loadSemver() {
    try {
        return createRequire(path.join(cwd, 'package.json'))('semver');
    } catch {}
    try {
        const globalRoot = execFileSync('npm', ['root', '-g'], {shell, encoding: 'utf8'}).trim();
        return createRequire(path.join(globalRoot, 'npm', 'package.json'))('semver');
    } catch {}
    return undefined;
}

function readJson(file) {
    return JSON.parse(readFileSync(file, 'utf8'));
}

function findUp(relative) {
    for (let dir = cwd; ; dir = path.dirname(dir)) {
        const file = path.join(dir, relative);
        if (existsSync(file)) return file;
        if (path.dirname(dir) === dir) return undefined;
    }
}

function findInstalled(name) {
    const file = findUp(path.join('node_modules', name, 'package.json'));
    return file ? readJson(file) : undefined;
}

const rootFile = path.join(cwd, 'package.json');
if (!existsSync(rootFile)) fail(`No package.json in ${cwd}.`);
if (findUp('.pnp.cjs')) fail('Yarn Plug\'n\'Play project: no node_modules to read; compare the ranges by hand.');
const root = readJson(rootFile);

const semver = loadSemver();
if (!semver) fail('semver is not resolvable from the project or from npm itself; compare the ranges by hand.');

const installedUikit = findInstalled(UIKIT)?.version;
if (!installedUikit) fail(`${UIKIT} is not installed here: install the dependencies first.`);

function accepts(range, version) {
    if (range === undefined || range.trim() === '' || range.trim() === '*') return true;
    if (!semver.validRange(range)) return undefined;
    return semver.satisfies(version, range);
}

function resolveTarget(arg) {
    if (arg) {
        if (!semver.valid(arg)) fail(`Not a version: ${arg}`);
        return arg;
    }
    const tags = npmJson(['view', UIKIT, 'dist-tags']);
    if (!tags || tags.error) fail(`Cannot read the dist-tags of ${UIKIT} (${tags?.error ?? 'no answer'}).`);
    if (tags.latest && semver.major(tags.latest) === 8) return tags.latest;
    const v8 = Object.values(tags).filter((v) => semver.valid(v) && semver.major(v) === 8);
    if (!v8.length) fail(`No 8.x version of ${UIKIT} is published under a dist-tag.`);
    return v8.sort(semver.rcompare)[0];
}

function uikitRange(manifest) {
    return manifest[PEER_FIELD] ?? manifest[DEP_FIELD];
}

/** Published versions newer than `installed` with their uikit range, or `{error}` */
function candidates(name, installed) {
    // `name` makes npm answer with objects even for a package with one version
    const fields = ['name', 'version', PEER_FIELD, DEP_FIELD];
    const stable = npmJson(['view', `${name}@>=0`, ...fields]);
    if (stable?.error) return stable;
    const rows = [].concat(stable ?? []);
    const seen = new Set(rows.map((row) => row.version));
    // Ranges leave prereleases out: those come from the dist-tags
    const tags = npmJson(['view', name, 'dist-tags']);
    for (const version of new Set(Object.values(tags?.error ? {} : (tags ?? {})))) {
        if (seen.has(version) || !semver.prerelease(version)) continue;
        const row = npmJson(['view', `${name}@${version}`, ...fields]);
        if (row && !row.error) rows.push(row);
    }
    return rows.filter(
        (row) =>
            semver.valid(row.version) &&
            !row.version.startsWith('0.0.0-') &&
            (!installed || semver.gt(row.version, installed)),
    );
}

function aliasName(spec) {
    // npm:<name>@<range>; the name may be scoped
    const body = spec.slice('npm:'.length);
    const at = body.indexOf('@', 1);
    return at === -1 ? body : body.slice(0, at);
}

function isRemote(spec) {
    return /^(git\+|git:|github:|gitlab:|bitbucket:|https?:)/.test(spec) || /^[^@][^:]*\/[^:]+$/.test(spec);
}

const target = resolveTarget(process.argv[2]);
const declared = {
    ...root.optionalDependencies,
    ...root.devDependencies,
    ...root.dependencies,
};

const results = [];
const missing = [];
for (const name of Object.keys(declared).sort()) {
    if (name.startsWith('@gravity-ui/')) continue;
    const spec = String(declared[name]);
    const installed = findInstalled(name);
    if (!installed) {
        missing.push(name);
        continue;
    }
    const peer = installed.peerDependencies?.[UIKIT];
    const range = peer ?? installed.dependencies?.[UIKIT];
    if (range === undefined) continue;
    const r = {name, version: installed.version, range, kind: peer === undefined ? 'dependency' : 'peer'};
    r.ok = accepts(range, target);
    if (r.ok === true) {
        r.status = 'ok';
    } else if (LOCAL_PROTOCOLS.some((protocol) => spec.startsWith(protocol))) {
        r.status = 'local';
    } else if (isRemote(spec)) {
        r.status = 'unchecked';
        r.note = `from ${spec}`;
    } else {
        const registryName = spec.startsWith('npm:') ? aliasName(spec) : name;
        const found = candidates(registryName, installed.version);
        if (found.error) {
            r.status = 'unchecked';
            r.note = found.error;
        } else {
            const fit = found
                .filter((row) => accepts(uikitRange(row), target))
                .sort((a, b) => semver.rcompare(a.version, b.version));
            const both = fit.find((row) => accepts(uikitRange(row), installedUikit));
            if (both) {
                r.status = 'before';
                r.newest = both.version;
            } else if (fit.length) {
                r.status = 'with';
                r.newest = fit[0].version;
            } else {
                r.status = 'blocking';
            }
        }
    }
    results.push(r);
}

const label = (r) => {
    if (r.ok === undefined) return '?';
    return r.ok ? 'yes' : 'no';
};
const rows = [
    {name: 'package', version: 'installed', range: 'uikit range', ok: 'accepts', newest: 'newer that accepts'},
    ...results.map((r) => ({
        name: r.name,
        version: r.version,
        range: `${r.range} (${r.kind})`,
        ok: label(r),
        newest: r.newest ?? (r.status === 'blocking' ? 'none' : '-'),
    })),
];
const columns = ['name', 'version', 'range', 'ok', 'newest'];
const widths = Object.fromEntries(
    columns.map((key) => [key, Math.max(...rows.map((row) => String(row[key]).length))]),
);

console.log(`target ${UIKIT}@${target} (installed ${installedUikit})\n`);
if (results.length) {
    for (const row of rows) {
        console.log(columns.map((key) => String(row[key]).padEnd(widths[key])).join('  ').trimEnd());
    }
} else if (!missing.length) {
    console.log(`No direct dependency outside @gravity-ui/* names ${UIKIT}.`);
}

const list = (status, format = (r) => r.name) =>
    results.filter((r) => r.status === status).map(format).join(', ');
const sections = [
    ['Upgrade before uikit (accepts both majors)', list('before', (r) => `${r.name} → ${r.newest}`)],
    ['Upgrade in the same install as uikit (accepts the target only)', list('with', (r) => `${r.name} → ${r.newest}`)],
    ['Local, migrated in this repo', list('local')],
    ['Not checked, resolve by hand', list('unchecked', (r) => `${r.name} (${r.note})`)],
    [
        `Blocking, no published version accepts ${target}`,
        list('blocking', (r) => (r.kind === 'dependency' ? `${r.name} (bundles its own uikit)` : r.name)),
    ],
    ['Not installed, not checked', missing.join(', ')],
];
for (const [title, items] of sections) {
    if (items) console.log(`\n${title}: ${items}`);
}

if (results.some((r) => r.status === 'blocking' || r.status === 'unchecked')) process.exit(1);
