// Sequential, sleep-proof wrapper around `agent-eval run`.
//
//   node scripts/eval-run.ts <experiment|glob>... [--force] [--smoke] [--batch N]
//
// Why not `agent-eval run` directly:
//   - agent-eval runs every named experiment in parallel; with evals × runs sandboxes each, a laptop
//     drowns. This runs them one after another (a few sandboxes at a time, not dozens).
//   - a sandbox whose attempt times out as the last one of an experiment leaks: the CLI exits before
//     its abort handler's stop() completes. Labelled sandboxes left behind are removed after each run.
//   - macOS sleep freezes node timers and the containers; on wake every in-flight attempt is reported
//     as "timed out". The run is kept awake with caffeinate (idle/display/system sleep on AC power —
//     a closed lid on battery still sleeps).
//   - within one experiment agent-eval still starts evals × runs sandboxes at once (17 evals × 4 runs
//     = 68). --batch N (default 4) runs the evals N at a time through EVAL_FILTER, so a laptop sees at
//     most N × runs sandboxes.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { classifyResults } from './classify-results.ts';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const batchArg = args.indexOf('--batch');
const batchSize = batchArg >= 0 ? Number(args[batchArg + 1]) || 4 : 4;
const passthrough = args.filter((a, i) => a.startsWith('--') && a !== '--batch' && !(i === batchArg + 1));
const flags = passthrough;
const patterns = args.filter((a, i) => !a.startsWith('--') && i !== batchArg + 1);
if (!patterns.length) {
  console.error('usage: node scripts/eval-run.ts <experiment|glob>... [--force] [--smoke]');
  process.exit(1);
}
const available = readdirSync(join(root, 'experiments')).filter((f) => f.endsWith('.ts')).map((f) => f.slice(0, -3)).sort();
const toRegExp = (glob: string) => new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
const experiments = available.filter((name) => patterns.some((p) => toRegExp(p).test(name)));
if (!experiments.length) {
  console.error(`no experiment matches ${patterns.join(', ')}; available: ${available.join(', ')}`);
  process.exit(1);
}

const have = (cmd: string) => spawnSync('which', [cmd], { stdio: 'ignore' }).status === 0;
const caffeinate = process.platform === 'darwin' && have('caffeinate');
const run = (cmd: string, cmdArgs: string[]) => spawnSync(cmd, cmdArgs, { cwd: root, stdio: 'inherit', env: process.env }).status ?? 1;

function removeLeakedSandboxes(): void {
  const ps = spawnSync('docker', ['ps', '-q', '--filter', 'label=agent-eval.sandbox=true'], { encoding: 'utf8' });
  const ids = (ps.stdout || '').split('\n').map((s) => s.trim()).filter(Boolean);
  if (!ids.length) return;
  console.log(`removing ${ids.length} sandbox container(s) the finished run left behind`);
  spawnSync('docker', ['rm', '-f', ...ids], { stdio: 'ignore' });
}

// Evals to run: EVAL_FILTER if set, else every fixture; split into batches of `batchSize`.
const allEvals = readdirSync(join(root, 'evals')).filter((d) => existsSync(join(root, 'evals', d, 'EVAL.ts'))).sort();
const wanted = process.env.EVAL_FILTER ? process.env.EVAL_FILTER.split(',').map((s) => s.trim()).filter(Boolean) : allEvals;
const batches: string[][] = [];
for (let i = 0; i < wanted.length; i += batchSize) batches.push(wanted.slice(i, i + batchSize));

removeLeakedSandboxes(); // from a previous, interrupted queue
console.log(`${experiments.length} experiment(s), one at a time${caffeinate ? ', under caffeinate' : ''}, ${wanted.length} eval(s) in batches of ${batchSize}:\n  ${experiments.join('\n  ')}\n`);
let failed = 0;
for (const name of experiments) {
  for (const batch of batches) {
    console.log(`##### ${new Date().toISOString()} start ${name} [${batch.join(',')}]`);
    const cli = ['agent-eval', 'run', name, ...flags];
    const env = { ...process.env, EVAL_FILTER: batch.join(',') };
    const status = spawnSync(caffeinate ? 'caffeinate' : 'npx', caffeinate ? ['-dims', 'npx', ...cli] : cli, { cwd: root, stdio: 'inherit', env }).status ?? 1;
    if (status !== 0) failed++;
    removeLeakedSandboxes();
    // Without agent-eval's gateway-backed classifier a 0/4 eval would be re-run on every invocation.
    classifyResults([name]);
    console.log(`##### ${new Date().toISOString()} done ${name} [${batch.join(',')}] (exit ${status})\n`);
  }
}
if (existsSync(join(root, 'scripts', 'screenshot-results.ts'))) run('node', ['scripts/screenshot-results.ts', ...experiments]);
if (existsSync(join(root, 'scripts', 'export-results.ts'))) run('node', ['scripts/export-results.ts']);
process.exitCode = failed ? 1 : 0;
