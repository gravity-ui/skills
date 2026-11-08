import { gravityExperiment } from '../lib/gravity-evals.ts';

// claude-code on the developer's own Claude subscription, with the gravity-ui skill installed.
//   npx agent-eval run claude-subscription--claude-code--gravity-ui-skill
export default gravityExperiment({ gateway: 'claude-subscription', cli: 'claude-code', skill: true });
