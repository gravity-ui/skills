import { gravityExperiment } from '../lib/gravity-evals.ts';

// codex routed through openrouter (baseline, no skill).
//   npx agent-eval openrouter--codex
export default gravityExperiment({ gateway: 'openrouter', cli: 'codex' });
