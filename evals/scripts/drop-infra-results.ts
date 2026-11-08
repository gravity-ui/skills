// Remove eval results that contain infrastructure outcomes (timeout, 429 usage/rate limit, OOM-killed
// runner) so the next `pnpm eval:run` re-runs them: agent-eval's own classifier would do this, but it
// needs the Vercel AI Gateway. Whole eval directories go (pass@k needs all its runs from one config).
// A result with at least MIN_REAL model verdicts is kept by default — export-results reports its infra
// runs as `+n t/o` beside the rate — so a fill-in run that lost one of four runs to the clock still
// counts. --all drops every result with any infra run, to force a full re-run.
//
//   node scripts/drop-infra-results.ts <experiment|glob>... [--dry] [--all]
import { INFRA } from '../lib/infra.ts';
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const all = args.includes('--all');
const MIN_REAL = 2;
const patterns = args.filter((a) => !a.startsWith('--'));
if (!patterns.length) { console.error('usage: node scripts/drop-infra-results.ts <experiment|glob>... [--dry]'); process.exit(1); }
const toRegExp = (glob: string) => new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
const dirs = (p: string) => (existsSync(p) ? readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()) : []);

let removed = 0;
function* evalDirs(dir: string): Generator<string> {
  for (const entry of dirs(dir)) {
    const path = join(dir, entry);
    if (existsSync(join(path, 'summary.json'))) yield path;
    else yield* evalDirs(path);
  }
}
for (const experiment of dirs(join(root, 'results')).filter((e) => patterns.some((p) => toRegExp(p).test(e)))) {
  for (const evalDir of evalDirs(join(root, 'results', experiment))) {
    const runs = dirs(evalDir).filter((r) => r.startsWith('run-')).map((run) => join(evalDir, run, 'result.json')).filter((f) => existsSync(f));
    const infraRuns = runs.filter((f) => INFRA.test(String(JSON.parse(readFileSync(f, 'utf8')).error ?? ''))).length;
    if (!infraRuns || (!all && runs.length - infraRuns >= MIN_REAL)) continue;
    removed++;
    console.log(`${dry ? 'would remove' : 'removing'} ${evalDir.slice(root.length + 1)}`);
    if (!dry) rmSync(evalDir, { recursive: true, force: true });
  }
}
console.log(`${removed} eval result(s) with infrastructure outcomes${dry ? ' (dry run)' : ' removed'}`);
