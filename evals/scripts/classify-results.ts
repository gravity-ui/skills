// Stand-in for agent-eval's failure classifier (which needs the Vercel AI Gateway).
//
// agent-eval reuses an eval result only if it passed at least once OR carries a classification.json;
// without the classifier an eval the model simply fails 4/4 is re-run on every invocation. This writes
// the classification from evidence the runs already carry:
//   - any run with a timeout / 429 / OOM-killed runner  → infra  (skipped by reuse → re-run)
//   - otherwise                                          → model  (reused: a real 0/4)
//
//   node scripts/classify-results.ts [<experiment|glob>...]      (default: everything)
import { INFRA } from '../lib/infra.ts';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const patterns = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const toRegExp = (glob: string) => new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
const dirs = (p: string) => (existsSync(p) ? readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()) : []);

function* evalDirs(dir: string): Generator<string> {
  for (const entry of dirs(dir)) {
    const path = join(dir, entry);
    if (existsSync(join(path, 'summary.json'))) yield path;
    else yield* evalDirs(path);
  }
}

export function classifyResults(selected: string[] = []): { model: number; infra: number } {
  const counts = { model: 0, infra: 0 };
  const experiments = dirs(join(root, 'results')).filter((e) => !selected.length || selected.some((p) => toRegExp(p).test(e)));
  for (const experiment of experiments) {
    for (const evalDir of evalDirs(join(root, 'results', experiment))) {
      const summary = JSON.parse(readFileSync(join(evalDir, 'summary.json'), 'utf8'));
      if (summary.passedRuns > 0 || existsSync(join(evalDir, 'classification.json'))) continue;
      const errors = dirs(evalDir).filter((r) => r.startsWith('run-')).map((run) => {
        const file = join(evalDir, run, 'result.json');
        return existsSync(file) ? String(JSON.parse(readFileSync(file, 'utf8')).error ?? '') : '';
      });
      const infra = errors.find((e) => INFRA.test(e));
      const classification = infra
        ? { failureType: 'infra', failureReason: `infrastructure outcome in at least one run: ${infra.slice(0, 120)}` }
        : { failureType: 'model', failureReason: 'every run failed validation; no infrastructure error recorded' };
      writeFileSync(join(evalDir, 'classification.json'), JSON.stringify(classification, null, 2));
      counts[infra ? 'infra' : 'model']++;
    }
  }
  return counts;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const counts = classifyResults(patterns);
  console.log(`classified ${counts.model} eval result(s) as model failures, ${counts.infra} as infrastructure`);
}
