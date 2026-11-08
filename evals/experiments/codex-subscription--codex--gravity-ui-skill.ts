import { gravityExperiment } from '../lib/gravity-evals.ts';

// codex on the developer's own ChatGPT subscription, with the gravity-ui skill installed.
//   npx agent-eval run codex-subscription--codex--gravity-ui-skill
export default gravityExperiment({ gateway: 'codex-subscription', cli: 'codex', skill: true });
