// Fold OpenRouter results into the OpenCode Go experiment directories under Go's model ids, so each model has
// one history regardless of which gateway served it (same models, same judges — the gateway is not the
// variable under test). Moves results/openrouter--<cli>[--skill]/<openrouter id>/<ts>/<eval> to
// results/opencode-go--<cli>[--skill]/<go id>/<ts>/<eval> and rewrites the model id in run-N/result.json.
// Safe to re-run; a result that already exists at the destination is left alone.
//
//   node scripts/merge-openrouter-results.ts [--dry]
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const resultsDir = join(root, 'results');
const dry = process.argv.includes('--dry');
const IDS: Record<string, string> = { 'moonshotai/kimi-k3': 'kimi-k3', 'anthropic/claude-haiku-5.5': 'claude-haiku-5-5', 'deepseek/deepseek-v4-pro': 'deepseek-v4-pro', 'z-ai/glm-5.3-flash': 'glm-5.3-flash' };
const dirs = (p: string) => (existsSync(p) ? readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()) : []);

let moved = 0;
for (const exp of dirs(resultsDir).filter((e) => e.startsWith('openrouter--'))) {
  const target = exp.replace(/^openrouter--/, 'opencode-go--');
  // agent-eval adds the model directory only for multi-model runs; a MODEL_FILTER run lands flat in
  // <exp>/<timestamp>/<eval>, so the model is read from the run's result.json there.
  const sources: { src: string; orId?: string }[] = [
    ...Object.keys(IDS).map((orId) => ({ src: join(resultsDir, exp, orId), orId })),
    { src: join(resultsDir, exp) },
  ];
  for (const { src, orId: fixedId } of sources) {
    for (const ts of dirs(src).filter((d) => fixedId || /^\d{4}-\d{2}-\d{2}T/.test(d))) {
      for (const ev of dirs(join(src, ts))) {
        const r1 = join(src, ts, ev, 'run-1', 'result.json');
        const orId = fixedId ?? (existsSync(r1) ? String(JSON.parse(readFileSync(r1, 'utf8')).model ?? '').split('?')[0] : '');
        const goId = IDS[orId];
        if (!goId) continue;
        const from = join(src, ts, ev), to = join(resultsDir, target, goId, ts, ev);
        if (existsSync(to)) continue;
        console.log(`${dry ? 'would move' : 'moving'} ${from.slice(root.length + 1)} -> ${to.slice(root.length + 1)}`);
        moved++;
        if (dry) continue;
        mkdirSync(join(to, '..'), { recursive: true });
        renameSync(from, to);
        for (const run of dirs(to).filter((d) => d.startsWith('run-'))) {
          const file = join(to, run, 'result.json');
          if (!existsSync(file)) continue;
          const r = JSON.parse(readFileSync(file, 'utf8'));
          for (const k of ['model', 'requestedModel', 'observedModel']) if (typeof r[k] === 'string') r[k] = r[k].replace(orId, goId);
          writeFileSync(file, JSON.stringify(r, null, 2) + '\n');
        }
      }
      if (!dry && !dirs(join(src, ts)).length) rmSync(join(src, ts), { recursive: true, force: true });
    }
    if (!dry && fixedId && existsSync(src) && !dirs(src).length) rmSync(src, { recursive: true, force: true });
  }
  // Remove the namespace parent (e.g. results/openrouter--codex/z-ai) and the experiment dir once empty.
  if (!dry) for (const ns of dirs(join(resultsDir, exp))) if (!dirs(join(resultsDir, exp, ns)).length) rmSync(join(resultsDir, exp, ns), { recursive: true, force: true });
  if (!dry && !dirs(join(resultsDir, exp)).length) rmSync(join(resultsDir, exp), { recursive: true, force: true });
}
console.log(`${moved} eval result(s) ${dry ? 'to merge (dry run)' : 'merged into opencode-go'}`);
