// Aggregate agent-eval results into results-summary.md: one block per gateway/CLI/model, baseline vs
// skill, with pass@k, mean duration, tokens and an API-equivalent cost estimate from pricing.json.
// Reads the newest results/<experiment>/<model>/<timestamp>/<eval>/summary.json per (experiment, model).
import { INFRA } from '../lib/infra.ts';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const resultsDir = join(root, 'results');
const SKILL = '--gravity-ui-skill';

type Summary = { totalRuns: number; passedRuns: number; meanDuration?: number; usage?: Record<string, number>; valid?: boolean };
type Price = { input: number; output: number; cacheRead?: number; cacheWrite?: number };
const pricing: Record<string, Price> = JSON.parse(readFileSync(join(root, 'pricing.json'), 'utf8'));

const dirs = (p: string) => (existsSync(p) ? readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()) : []);

// results/<experiment>/[<model path…>/]<timestamp>/<eval>/summary.json — agent-eval adds the model
// directory only for multi-model runs (and it may contain '/'), so the model is read from the first
// run's result.json and the path is the fallback.
function modelOf(runDir: string, fromPath: string): string {
  for (const evalName of dirs(runDir)) {
    const file = join(runDir, evalName, 'run-1', 'result.json');
    if (!existsSync(file)) continue;
    const r = JSON.parse(readFileSync(file, 'utf8'));
    const model = r.requestedModel ?? r.observedModel ?? r.model;
    if (typeof model === 'string' && model) return model.split('?')[0];
  }
  return fromPath.split('?')[0] || '(native default)';
}

function* walkRuns(dir: string, model: string[] = []): Generator<{ model: string; timestamp: string; dir: string }> {
  for (const entry of dirs(dir)) {
    if (/^\d{4}-\d{2}-\d{2}T/.test(entry)) yield { model: modelOf(join(dir, entry), model.join('/')), timestamp: entry, dir: join(dir, entry) };
    else yield* walkRuns(join(dir, entry), [...model, entry]);
  }
}

// Per model, the newest result of every eval — runs with EVAL_FILTER only refresh the evals they touched.
function latestRuns(experiment: string): Map<string, Map<string, string>> {
  // Compared by timestamp, not path: a single-model run (flat `<experiment>/<timestamp>/`) and a
  // multi-model run (`<experiment>/<model>/<timestamp>/`) of the same model must order by time.
  const latest = new Map<string, Map<string, { timestamp: string; dir: string }>>();
  for (const run of walkRuns(join(resultsDir, experiment))) {
    const evals = latest.get(run.model) ?? new Map<string, { timestamp: string; dir: string }>();
    for (const evalName of dirs(run.dir)) {
      if (!existsSync(join(run.dir, evalName, 'summary.json'))) continue;
      const prev = evals.get(evalName);
      if (!prev || prev.timestamp < run.timestamp) evals.set(evalName, { timestamp: run.timestamp, dir: join(run.dir, evalName) });
    }
    if (evals.size) latest.set(run.model, evals);
  }
  return new Map([...latest].map(([model, evals]) => [model, new Map([...evals].map(([e, v]) => [e, v.dir]))]));
}

function costUsd(model: string, usage?: Record<string, number>): number | null {
  const price = pricing[model.replace(/^[^/]+\//, '')] ?? pricing[model];
  if (!price || !usage) return null;
  const input = usage.inputTokens ?? 0, cached = usage.cacheReadTokens ?? 0, write = usage.cacheWriteTokens ?? 0, output = usage.outputTokens ?? 0;
  return (input * price.input + cached * (price.cacheRead ?? price.input * 0.1) + write * (price.cacheWrite ?? price.input) + output * price.output) / 1e6;
}

type Cell = { passed: number; total: number; timeouts: number; evals: number; seconds: number; tokens: number; cost: number | null };

// agent-eval's failure classifier needs the Vercel AI Gateway, so timeouts are not auto-classified
// here; they are an infrastructure outcome (sleep, throttling, a leaked sandbox), not a model one, and
// are reported beside the pass rate instead of inside it.
function runStatuses(evalDir: string): { passed: number; failed: number; timeouts: number; seconds: number } {
  const out = { passed: 0, failed: 0, timeouts: 0, seconds: 0 };
  for (const run of dirs(evalDir).filter((d) => d.startsWith('run-'))) {
    const file = join(evalDir, run, 'result.json');
    if (!existsSync(file)) continue;
    const r = JSON.parse(readFileSync(file, 'utf8'));
    // Timeouts, killed runners (exit 137 = OOM / SIGKILL, 143 = SIGTERM) and gateway rate limits / usage
    // caps (429) are infrastructure outcomes, not model ones.
    if (INFRA.test(String(r.error ?? ''))) { out.timeouts++; continue; }
    if (r.status === 'passed') out.passed++;
    else out.failed++;
    out.seconds += r.duration ?? 0;
  }
  return out;
}

function aggregate(evalDirs: Map<string, string>, model: string): Cell {
  const cell: Cell = { passed: 0, total: 0, timeouts: 0, evals: 0, seconds: 0, tokens: 0, cost: 0 };
  for (const evalDir of evalDirs.values()) {
    const s: Summary = JSON.parse(readFileSync(join(evalDir, 'summary.json'), 'utf8'));
    if (s.valid === false) continue; // infra failure, not a model observation
    cell.evals++;
    const runs = runStatuses(evalDir);
    cell.passed += runs.passed;
    cell.total += runs.passed + runs.failed;
    cell.timeouts += runs.timeouts;
    cell.seconds += runs.passed + runs.failed ? runs.seconds / (runs.passed + runs.failed) : 0; // mean of real runs
    cell.tokens += s.usage?.totalTokens ?? 0;
    const c = costUsd(model, s.usage);
    cell.cost = cell.cost === null || c === null ? null : cell.cost + c;
  }
  return cell;
}

const pct = (c: Cell) => (c.total ? `${Math.round((100 * c.passed) / c.total)}% (${c.passed}/${c.total})` : 'n/a') + (c.timeouts ? ` +${c.timeouts} t/o` : '');
const money = (v: number | null) => (v === null ? 'n/a' : `$${v.toFixed(2)}`);
const secs = (c: Cell) => (c.evals ? `${Math.round(c.seconds / c.evals)}s` : 'n/a');

const experiments = dirs(resultsDir).filter((e) => !e.endsWith(SKILL)).sort();
const lines = [
  '# Results',
  '',
  'pass@k over the latest run of every experiment (`runs` per eval, all counted — no early exit). Runs that hit the',
  'harness timeout or whose runner was killed (OOM) are excluded from the rate and shown as `+n t/o`. Cost is an',
  'API-equivalent estimate from the tokens the CLI reported and `pricing.json`; n/a when a model has no price.',
  '',
];
for (const experiment of experiments) {
  const base = latestRuns(experiment);
  const withSkill = latestRuns(experiment + SKILL);
  lines.push(`## ${experiment}`, '', '| Model | Baseline | + gravity-ui skill | Δ | Mean eval time (base → skill) | Est. cost (base → skill) |', '| --- | --- | --- | --- | --- | --- |');
  for (const model of [...new Set([...base.keys(), ...withSkill.keys()])].sort()) {
    const b = base.has(model) ? aggregate(base.get(model)!, model) : null;
    const s = withSkill.has(model) ? aggregate(withSkill.get(model)!, model) : null;
    const delta = b?.total && s?.total ? `${Math.round((100 * s.passed) / s.total) - Math.round((100 * b.passed) / b.total)} pp` : '';
    lines.push(`| ${model} | ${b ? pct(b) : '—'} | ${s ? pct(s) : '—'} | ${delta} | ${b ? secs(b) : '—'} → ${s ? secs(s) : '—'} | ${b ? money(b.cost) : '—'} → ${s ? money(s.cost) : '—'} |`);
  }
  lines.push('');
}
writeFileSync(join(root, 'results-summary.md'), lines.join('\n'));
console.log(`Wrote results-summary.md (${experiments.length} experiment pair(s)).`);

// results-evals.html — the nextjs.org/evals layout: one row per model (agent, mean duration, mean cost,
// success rate without and with the skill), expandable into one row per eval with the pass counts, mean
// input tokens, duration and cost of that eval.
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const fmtPct = (p: number, n: number) => (n ? `${Math.round((100 * p) / n)}%` : '—');
const fmtSec = (s: number) => `${s.toFixed(0)}s`;
const fmtUsd = (v: number | null) => (v === null ? '—' : `$${v.toFixed(3)}`);
const fmtTok = (t: number) => (t >= 1e6 ? `${(t / 1e6).toFixed(1)}M` : t >= 1e3 ? `${(t / 1e3).toFixed(1)}K` : String(t));
const PRETTY: Record<string, string> = { 'claude-subscription': 'Claude subscription', 'codex-subscription': 'ChatGPT subscription', 'opencode-go': 'OpenCode Go', openrouter: 'OpenRouter' };
type EvalRow = { name: string; base?: { passed: number; total: number; timeouts: number }; skill?: { passed: number; total: number; timeouts: number }; tokens: number[]; seconds: number[]; costs: (number | null)[] };
const sections: string[] = [];
for (const experiment of experiments) {
  const [gateway, cli] = experiment.split('--');
  const base = latestRuns(experiment);
  const withSkill = latestRuns(experiment + SKILL);
  for (const model of [...new Set([...base.keys(), ...withSkill.keys()])].sort()) {
    const rows = new Map<string, EvalRow>();
    const row = (name: string) => rows.get(name) ?? rows.set(name, { name, tokens: [], seconds: [], costs: [] }).get(name)!;
    for (const [skill, evals] of [[false, base.get(model)], [true, withSkill.get(model)]] as const) {
      for (const [name, dir] of evals ?? []) {
        const s: Summary = JSON.parse(readFileSync(join(dir, 'summary.json'), 'utf8'));
        if (s.valid === false) continue;
        const st = runStatuses(dir);
        const r = row(name);
        r[skill ? 'skill' : 'base'] = { passed: st.passed, total: st.passed + st.failed, timeouts: st.timeouts };
        if (st.passed + st.failed) r.seconds.push(st.seconds / (st.passed + st.failed));
        if (s.usage?.runsWithUsage) { r.tokens.push(((s.usage.inputTokens ?? 0) + (s.usage.cacheReadTokens ?? 0)) / s.usage.runsWithUsage); const c = costUsd(model, s.usage); r.costs.push(c === null ? null : c / s.usage.runsWithUsage); }
      }
    }
    if (!rows.size) continue;
    const all = [...rows.values()].sort((a, b) => a.name.localeCompare(b.name));
    const sum = (k: 'base' | 'skill') => all.reduce((acc, r) => (r[k] ? { p: acc.p + r[k]!.passed, n: acc.n + r[k]!.total, t: acc.t + r[k]!.timeouts } : acc), { p: 0, n: 0, t: 0 });
    const b = sum('base'), s = sum('skill');
    const mean = (xs: number[]) => (xs.length ? xs.reduce((a, x) => a + x, 0) / xs.length : 0);
    const secs = mean(all.flatMap((r) => r.seconds));
    const costs = all.flatMap((r) => r.costs);
    const cost = costs.length && costs.every((c) => c !== null) ? mean(costs as number[]) : null;
    const tok = mean(all.flatMap((r) => r.tokens));
    const detail = all.map((r) => {
      const cell = (x?: { passed: number; total: number; timeouts: number }) => (x ? `${x.passed}/${x.total}${x.timeouts ? `<small> +${x.timeouts} t/o</small>` : ''}` : '—');
      return `<tr><td class="ev">${esc(r.name)}</td><td>${cell(r.base)}</td><td>${cell(r.skill)}</td><td>${fmtTok(mean(r.tokens))}</td><td>${fmtSec(mean(r.seconds))}</td><td>${fmtUsd(r.costs.length && r.costs.every((c) => c !== null) ? mean(r.costs as number[]) : null)}</td></tr>`;
    }).join('');
    sections.push(`<details><summary><span class="model">${esc(model)}</span><span>${esc(PRETTY[gateway] ?? gateway)}</span><span>${esc(cli)}</span><span>${fmtSec(secs)}</span><span>${fmtUsd(cost)}</span><span class="rate">${fmtPct(b.p, b.n)}${b.t ? `<small> +${b.t} t/o</small>` : ''}</span><span class="rate skill">${fmtPct(s.p, s.n)}${s.t ? `<small> +${s.t} t/o</small>` : ''}</span></summary>
<p class="note">Model avg input tokens: ${fmtTok(tok)} (cached reads included). Runs per eval: 4; a cell is passed/run; t/o are timeouts and gateway limits, excluded from the rate.</p>
<table><thead><tr><th>Evaluation</th><th>Base</th><th>+ skill</th><th>Avg input tokens</th><th>Avg duration</th><th>Avg cost</th></tr></thead><tbody>${detail}</tbody></table></details>`);
  }
}
writeFileSync(join(root, 'results-evals.html'), `<!doctype html><meta charset="utf-8"><title>gravity-ui skill — evals</title>
<style>
body{font:15px/1.45 -apple-system,Inter,system-ui,sans-serif;color:#1a1a1a;margin:40px auto;max-width:1240px;padding:0 24px}
h1{font-size:34px;font-weight:600;margin:0 0 6px}p.sub{color:#666;margin:0 0 24px}
.head,summary{display:grid;grid-template-columns:2.6fr 1.3fr .9fr .9fr .8fr 1fr 1fr;gap:12px;align-items:center;padding:12px 16px}
.head{color:#666;font-size:14px;border:1px solid #e5e5e5;border-radius:10px 10px 0 0;background:#fafafa}
details{border:1px solid #e5e5e5;border-top:0}details:last-of-type{border-radius:0 0 10px 10px}
summary{cursor:pointer;list-style:none}summary::-webkit-details-marker{display:none}
summary .model{font-weight:600}summary .model::before{content:"›";display:inline-block;width:18px;color:#888;transition:transform .15s}
details[open] summary .model::before{transform:rotate(90deg)}
.rate{text-align:right}.rate.skill{font-weight:600}small{color:#888;font-weight:400}
p.note{margin:0 16px 10px;color:#666;font-size:13px}
table{width:calc(100% - 32px);margin:0 16px 16px;border:1px solid #e5e5e5;border-radius:10px;border-spacing:0;font-size:14px}
th{text-align:left;color:#666;font-weight:500;padding:10px 12px;background:#fafafa;border-bottom:1px solid #e5e5e5}
td{padding:9px 12px;border-bottom:1px solid #eee;white-space:nowrap}tr:last-child td{border-bottom:0}td.ev{font-family:ui-monospace,Menlo,monospace;font-size:13px}
</style>
<h1>Current evals</h1><p class="sub">Latest result of every model and eval; base vs the gravity-ui skill. 17 evals × 4 runs, judged in the sandbox.</p>
<div class="head"><span>Model</span><span>Gateway</span><span>Agent</span><span>Avg duration</span><span>Avg cost</span><span style="text-align:right">Success rate</span><span style="text-align:right">With skill</span></div>
${sections.join('\n')}
`);
console.log(`Wrote results-evals.html (${sections.length} model row(s)).`);
