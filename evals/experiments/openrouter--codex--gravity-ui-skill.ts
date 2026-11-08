import { gravityExperiment } from '../lib/gravity-evals.ts';

// codex routed through openrouter, with the gravity-ui skill installed.
//   npx agent-eval openrouter--codex--gravity-ui-skill
export default gravityExperiment({ gateway: 'openrouter', cli: 'codex', skill: true });
