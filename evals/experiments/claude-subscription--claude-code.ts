import { gravityExperiment } from '../lib/gravity-evals.ts';

// claude-code on the developer's own Claude subscription (baseline, no skill).
//   npx agent-eval run claude-subscription--claude-code
export default gravityExperiment({ gateway: 'claude-subscription', cli: 'claude-code' });
