// Remove eval result directories that a newer result of the same experiment, model and eval supersedes.
// export-results and agent-eval's reuse both read only the newest, so the rest is dead weight in arc;
// history keeps the old versions. Infra-tainted results are not special here: run drop-infra-results first.
//
//   node scripts/prune-results.ts [<experiment|glob>...] [--dry] [--keep best]
//
// --keep best keeps the result with the most passed runs instead of the newest (newest on ties): used
// when the same model was served by two gateways and the better-served run should stand.
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const resultsDir = join(root, 'results');
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const keepBest = args[args.indexOf('--keep') + 1] === 'best';
const globs = args.filter((a, i) => a !== '--dry' && a !== '--keep' && args[i - 1] !== '--keep').map((g) => new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`));
const dirs = (p: string) => (existsSync(p) ? readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()) : []);

function passes(evalDir: string): number {
  let p = 0;
  for (const run of dirs(evalDir).filter((d) => d.startsWith('run-'))) {
    const file = join(evalDir, run, 'result.json');
    if (existsSync(file) && JSON.parse(readFileSync(file, 'utf8')).status === 'passed') p++;
  }
  return p;
}
function modelOf(evalDir: string): string {
  const file = join(evalDir, 'run-1', 'result.json');
  if (!existsSync(file)) return '?';
  const r = JSON.parse(readFileSync(file, 'utf8'));
  return String(r.requestedModel ?? r.observedModel ?? r.model ?? '?').split('?')[0];
}
function* evalDirs(dir: string): Generator<{ timestamp: string; dir: string }> {
  for (const entry of dirs(dir)) {
    if (/^\d{4}-\d{2}-\d{2}T/.test(entry)) for (const ev of dirs(join(dir, entry))) yield { timestamp: entry, dir: join(dir, entry, ev) };
    else yield* evalDirs(join(dir, entry));
  }
}

let removed = 0;
for (const exp of dirs(resultsDir).filter((e) => !globs.length || globs.some((g) => g.test(e)))) {
  const newest = new Map<string, { timestamp: string; dir: string }>();
  const all: { key: string; timestamp: string; dir: string }[] = [];
  for (const e of evalDirs(join(resultsDir, exp))) {
    if (!existsSync(join(e.dir, 'summary.json'))) continue;
    const key = `${modelOf(e.dir)}/${e.dir.split('/').at(-1)}`;
    all.push({ key, ...e });
    const cur = newest.get(key);
    const better = !cur || (keepBest && passes(e.dir) !== passes(cur.dir) ? passes(e.dir) > passes(cur.dir) : cur.timestamp < e.timestamp);
    if (better) newest.set(key, e);
  }
  for (const e of all) {
    if (newest.get(e.key)!.dir === e.dir) continue;
    console.log(`${dry ? 'would remove' : 'removing'} ${e.dir.slice(root.length + 1)}`);
    if (!dry) rmSync(e.dir, { recursive: true, force: true });
    removed++;
  }
}
// Timestamp directories left without any eval result are noise for export-results.
for (const exp of dirs(resultsDir)) {
  const walk = (dir: string) => { for (const entry of dirs(dir)) { const p = join(dir, entry); if (/^\d{4}-\d{2}-\d{2}T/.test(entry)) { if (!dirs(p).length) rmSync(p, { recursive: true, force: true }); } else walk(p); } };
  walk(join(resultsDir, exp));
}
console.log(`${removed} superseded eval result(s) ${dry ? 'found (dry run)' : 'removed'}`);
