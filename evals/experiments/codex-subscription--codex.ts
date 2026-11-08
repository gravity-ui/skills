import { gravityExperiment } from '../lib/gravity-evals.ts';

// codex on the developer's own ChatGPT subscription (baseline, no skill).
//   npx agent-eval run codex-subscription--codex
export default gravityExperiment({ gateway: 'codex-subscription', cli: 'codex' });
