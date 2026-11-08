import { gravityExperiment } from '../lib/gravity-evals.ts';

// claude-code routed through opencode-go, with the gravity-ui skill installed.
//   npx agent-eval opencode-go--claude-code--gravity-ui-skill
export default gravityExperiment({ gateway: 'opencode-go', cli: 'claude-code', skill: true });
