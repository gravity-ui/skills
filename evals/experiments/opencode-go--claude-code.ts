import { gravityExperiment } from '../lib/gravity-evals.ts';

// claude-code routed through opencode-go (baseline, no skill).
//   npx agent-eval opencode-go--claude-code
export default gravityExperiment({ gateway: 'opencode-go', cli: 'claude-code' });
