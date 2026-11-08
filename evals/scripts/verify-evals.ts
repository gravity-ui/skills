// Self-test: every eval must be passable. Applies the golden solution from solutions/<id>/ onto a copy of
// evals/<id>/, installs, builds and runs EVAL.ts on the host. Judge tests (named `judge: …`) need an agent
// in a sandbox, so they are skipped here; the deterministic checks and the build must be green.
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const only = process.argv.slice(2);
const evals = readdirSync(join(root, 'evals')).filter((id) => existsSync(join(root, 'evals', id, 'EVAL.ts')) && (!only.length || only.includes(id)));
const run = (cmd: string, args: string[], cwd: string) => spawnSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

let failed = 0;
for (const id of evals) {
  const solution = join(root, 'solutions', id);
  if (!existsSync(join(solution, 'src'))) { console.log(`✗ ${id}: no golden solution`); failed++; continue; }
  const work = mkdtempSync(join(tmpdir(), `verify-${id}-`));
  cpSync(join(root, 'evals', id), work, { recursive: true });
  cpSync(join(solution, 'src'), join(work, 'src'), { recursive: true });
  if (existsSync(join(solution, 'package.json'))) cpSync(join(solution, 'package.json'), join(work, 'package.json'));
  // `@vercel/agent-eval/eval` only exists inside an agent-eval sandbox; the judge tests are skipped here,
  // so a stub that satisfies the import is enough.
  writeFileSync(join(work, 'judge-stub.mjs'), 'export const environment = {};\nexport const transcript = {};\n');
  writeFileSync(join(work, 'vitest.config.ts'), [
    "import { defineConfig } from 'vitest/config';",
    "export default defineConfig({ resolve: { alias: { '@vercel/agent-eval/eval': './judge-stub.mjs' } }, test: { include: ['EVAL.ts'] } });",
    '',
  ].join('\n'));
  const steps: [string, string[]][] = [
    ['pnpm', ['install', '--no-frozen-lockfile', '--dangerously-allow-all-builds', '--config.minimum-release-age=0']],
    ['pnpm', ['run', 'build']],
    ['pnpm', ['exec', 'vitest', 'run', '--testNamePattern', '^(?!judge:)']],
  ];
  let ok = true;
  for (const [cmd, args] of steps) {
    const r = run(cmd, args, work);
    if (r.status !== 0) { ok = false; console.log(`✗ ${id}: ${cmd} ${args[0]} failed\n${(r.stdout + r.stderr).split('\n').slice(-15).join('\n')}`); break; }
  }
  if (ok) console.log(`✓ ${id}`);
  else failed++;
  rmSync(work, { recursive: true, force: true });
}
console.log(`\n${evals.length - failed}/${evals.length} evals verified`);
process.exitCode = failed ? 1 : 0;
