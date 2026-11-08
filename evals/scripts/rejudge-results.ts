// Re-grade stored runs against the current EVAL.ts without regenerating code — for criterion-only
// changes. A "replay" agent stands in for the codegen agent: setup writes the run's stored project
// files and transcript into the sandbox, the replay runner hands the transcript back, and agent-eval's
// own pipeline then installs, builds and runs EVAL.ts with the experiment's judge. The run's code,
// transcript, duration and usage stay as they were; status, outputs/eval.txt and outputs/scripts are
// replaced, summary.json is recounted and, when the results belong to this config, re-fingerprinted so
// agent-eval treats them as fresh for the new EVAL.ts.
//
//   node scripts/rejudge-results.ts <experiment> --evals a,b [--results <results experiment>] [--dry] [--limit N] [--concurrency N]
//
// <experiment> supplies judge, sandbox and setup. --results points at another results tree judged by
// that config (e.g. opencode-go--codex judged through openrouter--codex once Go's cap is spent); those keep
// their fingerprints, since this config did not produce them.
import { existsSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getAgent, loadConfig, loadFixture, registerAgent, runSingleEval, computeFingerprint, computeReuseCompatibilityFingerprint } from '@vercel/agent-eval';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const opt = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const experiment = args[0];
const evals = (opt('--evals') ?? '').split(',').filter(Boolean);
const resultsExp = opt('--results') ?? experiment;
const dry = args.includes('--dry');
const limit = Number(opt('--limit') ?? Infinity);
const concurrency = Number(opt('--concurrency') ?? 4);
if (!experiment || !evals.length) {
  console.error('usage: node scripts/rejudge-results.ts <experiment> --evals a,b [--results <exp>] [--dry] [--limit N] [--concurrency N]');
  process.exit(1);
}

// agent-eval's internals by file URL: package "exports" only expose the root, and the same realpath
// keeps these the same module instances the package itself uses.
const pkgDir = realpathSync(join(root, 'node_modules', '@vercel', 'agent-eval'));
const { runWithDefinition } = await import(pathToFileURL(join(pkgDir, 'dist/lib/agents/plugin/orchestrator.js')).href);
const { computeContentFingerprint } = await import(pathToFileURL(join(pkgDir, 'dist/lib/fingerprint.js')).href);

// The agent-eval CLI reads .env / .env.local itself (subscription tokens, gateway keys); a script must too.
for (const f of ['.env', '.env.local']) if (existsSync(join(root, f))) process.loadEnvFile(join(root, f));
process.env.TIER ||= 'all'; // every model of the list, so any stored model has a config
const config = await loadConfig(join(root, 'experiments', `${experiment}.ts`));
const base = getAgent(config.agent);
const replayName = `replay:${base.name}`;
const def = {
  ...base.definition,
  name: replayName,
  displayName: 'Replay (rejudge)',
  install: (o: Parameters<typeof base.definition.install>[0]) => base.definition.install(o).filter((s: { scope?: string }) => s.scope === 'project'),
  configFiles: () => [],
  authEnv: () => ({}),
  versionCommand: undefined,
  runnerExtra: undefined,
  runnerPath: join(root, 'scripts', 'replay-run.mjs'),
};
registerAgent({ ...base, name: replayName, displayName: def.displayName, run: (fx: string, o: unknown) => runWithDefinition(def, fx, o), definition: def });
const apiKey = process.env[base.getApiKeyEnvVar()] ?? '';

const dirs = (p: string) => (existsSync(p) ? readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()) : []);
const SKIP = /^(node_modules|dist|__agent_eval__)\/|(^|\/)(EVAL\.tsx?|PROMPT\.md|vitest\.config\.[cm]?[jt]s)$/;
function projectFiles(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name), rel = relative(dir, p);
      if (e.isDirectory()) { if (!SKIP.test(rel + '/')) walk(p); continue; }
      if (SKIP.test(rel) || statSync(p).size > 2_000_000) continue;
      const buf = readFileSync(p);
      if (!buf.includes(0)) out[rel] = buf.toString('utf8'); // text only; binaries are never judged
    }
  };
  walk(dir);
  return out;
}

// Newest result per (model, eval) in the results tree.
type Target = { model: string; evalName: string; dir: string };
const newest = new Map<string, Target & { ts: string }>();
const walkResults = (d: string) => {
  for (const e of dirs(d)) {
    const p = join(d, e);
    if (!/^\d{4}-\d{2}-\d{2}T/.test(e)) { walkResults(p); continue; }
    for (const ev of dirs(p).filter((x) => evals.includes(x))) {
      const r1 = join(p, ev, 'run-1', 'result.json');
      if (!existsSync(join(p, ev, 'summary.json')) || !existsSync(r1)) continue;
      const model = String(JSON.parse(readFileSync(r1, 'utf8')).model ?? '').split('?')[0];
      const key = `${model}/${ev}`;
      if (!newest.has(key) || newest.get(key)!.ts < e) newest.set(key, { model, evalName: ev, dir: join(p, ev), ts: e });
    }
  }
};
walkResults(join(root, 'results', resultsExp));

const jobs: { target: Target; run: string }[] = [];
for (const t of newest.values()) for (const run of dirs(t.dir).filter((r) => r.startsWith('run-'))) {
  if (existsSync(join(t.dir, run, 'project'))) jobs.push({ target: t, run }); // no project = infra failure, left as is
}
jobs.splice(limit);
console.log(`${jobs.length} run(s) to re-judge in results/${resultsExp} with ${experiment} (${[...newest.keys()].join(', ')})`);

let changed = 0, failed = 0;
const touched = new Set<string>();
async function rejudge({ target, run }: { target: Target; run: string }) {
  const runDir = join(target.dir, run);
  const resultFile = join(runDir, 'result.json');
  const old = JSON.parse(readFileSync(resultFile, 'utf8'));
  const files = projectFiles(join(runDir, 'project'));
  const transcriptFile = join(runDir, 'transcript-raw.jsonl');
  files['.agent-eval-replay-transcript'] = existsSync(transcriptFile) ? readFileSync(transcriptFile, 'utf8') : '';
  const fixture = loadFixture(join(root, 'evals'), target.evalName);
  try {
    const data = await runSingleEval(fixture, {
      agent: replayName,
      model: target.model,
      timeout: config.timeout,
      apiKey,
      setup: async (sandbox: { writeFiles: (f: Record<string, string>) => Promise<void> }) => { await config.setup?.(sandbox as never); await sandbox.writeFiles(files); },
      scripts: config.scripts,
      validation: config.validation,
      sandbox: config.sandbox,
      sandboxImage: config.sandboxImage,
      sandboxUser: config.sandboxUser,
      judge: config.judge,
    } as never);
    const res = (data as { result: { status: string; error?: string } }).result;
    const out = (data as { outputContent?: { eval?: string; scripts?: Record<string, string> } }).outputContent ?? {};
    if (!out.eval) throw new Error(res.error || 'no EVAL.ts output');
    // A judge that could not answer (gateway 429, quota, crash) is not a verdict: keep the old one.
    const judgeInfra = out.eval.match(/judge agent failed[^\n]*|could not parse a judge verdict[^\n]*|429 Too Many Requests|exceeded retry limit|rate limit/i);
    if (judgeInfra) throw new Error(`judge unavailable: ${judgeInfra[0].slice(0, 120)}`);
    const label = `${relative(root, runDir)}: ${old.status} -> ${res.status}`;
    if (old.status !== res.status) changed++;
    console.log(`${old.status !== res.status ? '≠' : '='} ${label}`);
    if (dry) return;
    const next = { ...old, status: res.status, rejudged: { at: new Date().toISOString(), by: experiment, previousStatus: old.status } };
    if (res.status === 'passed') delete next.error; else next.error = res.error ?? next.error;
    writeFileSync(resultFile, JSON.stringify(next, null, 2) + '\n');
    mkdirSync(join(runDir, 'outputs', 'scripts'), { recursive: true });
    writeFileSync(join(runDir, 'outputs', 'eval.txt'), out.eval);
    for (const [name, text] of Object.entries(out.scripts ?? {})) if (text) writeFileSync(join(runDir, 'outputs', 'scripts', `${name}.txt`), text);
    touched.add(target.dir);
  } catch (e) {
    failed++;
    console.error(`✗ ${relative(root, runDir)}: ${(e as Error).message.split('\n')[0]} (verdict kept)`);
  }
}
const queue = [...jobs];
await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => { while (queue.length) await rejudge(queue.shift()!); }));

for (const t of [...newest.values()].filter((x) => touched.has(x.dir))) {
  const summaryFile = join(t.dir, 'summary.json');
  const s = JSON.parse(readFileSync(summaryFile, 'utf8'));
  const runs = dirs(t.dir).filter((r) => r.startsWith('run-')).map((r) => JSON.parse(readFileSync(join(t.dir, r, 'result.json'), 'utf8')));
  s.passedRuns = runs.filter((r) => r.status === 'passed').length;
  s.passRate = s.totalRuns ? s.passedRuns / s.totalRuns : 0;
  if (resultsExp === experiment) {
    const fixturePath = join(root, 'evals', t.evalName);
    const modelConfig = { ...config, model: t.model };
    s.fingerprint = computeFingerprint(fixturePath, modelConfig);
    s.contentFingerprint = computeContentFingerprint(fixturePath);
    s.reuseCompatibilityFingerprint = computeReuseCompatibilityFingerprint(modelConfig);
  }
  writeFileSync(summaryFile, JSON.stringify(s, null, 2) + '\n');
}
console.log(`${jobs.length - failed} re-judged, ${changed} verdict(s) changed, ${failed} kept after an error${dry ? ' (dry run)' : ''}`);
