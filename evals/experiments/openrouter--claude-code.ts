import { gravityExperiment } from '../lib/gravity-evals.ts';

// claude-code routed through openrouter (baseline, no skill).
//   npx agent-eval openrouter--claude-code
export default gravityExperiment({ gateway: 'openrouter', cli: 'claude-code' });
