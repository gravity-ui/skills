import { gravityExperiment } from '../lib/gravity-evals.ts';

// codex routed through opencode-go (baseline, no skill).
//   npx agent-eval opencode-go--codex
export default gravityExperiment({ gateway: 'opencode-go', cli: 'codex' });
