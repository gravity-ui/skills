import { gravityExperiment } from '../lib/gravity-evals.ts';

// codex routed through opencode-go, with the gravity-ui skill installed.
//   npx agent-eval opencode-go--codex--gravity-ui-skill
export default gravityExperiment({ gateway: 'opencode-go', cli: 'codex', skill: true });
