import { gravityExperiment } from '../lib/gravity-evals.ts';

// claude-code routed through openrouter, with the gravity-ui skill installed.
//   npx agent-eval openrouter--claude-code--gravity-ui-skill
export default gravityExperiment({ gateway: 'openrouter', cli: 'claude-code', skill: true });
