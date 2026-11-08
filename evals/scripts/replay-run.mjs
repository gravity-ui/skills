// In-sandbox runner for rejudge-results: no agent runs. The stored project files are already in the
// workspace (written by setup); this only hands the stored transcript back so validation and the
// judge see the same context the original run gave them. Same RunnerResult contract as the
// built-in run.mjs files: result file first, __AGENT_RESULT__ marker as the fallback channel.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const input = JSON.parse(process.argv[2]);
const stored = join(input.cwd, '.agent-eval-replay-transcript');
let transcript = null;
try {
  transcript = readFileSync(stored, 'utf8');
  rmSync(stored, { force: true });
} catch {}

const result = { ok: true, output: '(replay: stored run re-judged)', transcript, observedModel: input.model ?? null, error: null, agentExitCode: 0 };
try {
  mkdirSync(dirname(input.resultPath), { recursive: true });
  writeFileSync(input.resultPath, JSON.stringify(result));
} catch {}
process.stdout.write('__AGENT_RESULT__ ' + JSON.stringify({ ok: true, observedModel: result.observedModel, error: null, agentExitCode: 0 }) + '\n');
process.exit(0);
