/**
 * Shared experiment factory. An experiment is (gateway × CLI × treatment); everything
 * else — models, auth, judge, skill install — follows from those three choices.
 *
 * Gateways route the stock Codex / Claude Code CLIs to a model provider:
 *   - opencode-go:         OpenCode Go subscription (open models + a few vendor ones), one key.
 *   - openrouter:          any OpenRouter-compatible endpoint (openrouter.ai by default; set
 *                          OPENROUTER_BASE_URL for a self-hosted proxy). OPENROUTER_API_KEY.
 *   - claude-subscription: the developer's own Claude subscription (frontier Claude models).
 *                          `claude setup-token` → CLAUDE_CODE_OAUTH_TOKEN in .env.local.
 *   - codex-subscription:  the developer's own ChatGPT subscription. `codex login` (ChatGPT) on
 *                          the host; its auth.json is copied into each sandbox.
 *
 * Both are implemented as agent-eval custom agents wrapping the built-in direct
 * `claude-code` / `codex` agents: the codegen run gets the routing env through
 * `agentEnv`, and the wrapped definition's `authEnv` carries the same routing to the
 * in-sandbox LLM judge. Codex's provider table travels in `agentOptions`, so gateways can share
 * one agent-eval process (a custom sandbox image, if any, is process env and must agree).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { homedir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { getAgent, registerAgent, type Agent, type ExperimentConfig } from '@vercel/agent-eval';

export type Gateway = 'opencode-go' | 'openrouter' | 'claude-subscription' | 'codex-subscription';
export type Cli = 'claude-code' | 'codex';

const ROOT = resolve(import.meta.dirname, '..');

// Every sandbox runs on the host network, so it reaches whatever the host reaches (VPN, proxy, IPv6-only
// DNS), and one shared setting lets experiments for different gateways load into one agent-eval process.
const HOST_NETWORK = { AGENT_EVAL_DOCKER_NETWORK: 'host' } as const;

const OPENROUTER_BASE_URL = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api').replace(/\/+$/, '');

const GATEWAYS = {
  'opencode-go': {
    keyEnv: 'OPENCODE_API_KEY',
    anthropicBaseUrl: 'https://opencode.ai/zen/go',
    openaiBaseUrl: 'https://opencode.ai/zen/go/v1',
    // Plain Go ids: curl -H 'Authorization: Bearer …' https://opencode.ai/zen/go/v1/models
    // Claude Code speaks the Anthropic Messages protocol, which Go serves only for some models
    // (not GLM, Kimi K2.7 or MiMo); Codex uses Responses, which every Go model accepts.
    models: {
      'claude-code': ['kimi-k3', 'qwen3.8-max', 'deepseek-v4-pro', 'deepseek-v4.1-flash', 'minimax-m3', 'claude-haiku-5-5'],
      codex: ['kimi-k3', 'glm-5.3', 'glm-5.3-flash', 'qwen3.8-max', 'deepseek-v4-pro', 'kimi-k2.7-code', 'gpt-5.6-luna'],
    },
    judgeModel: { 'claude-code': 'deepseek-v4.1-flash', codex: 'glm-5.3' },
    docker: HOST_NETWORK,
    env: {} as Record<string, string>,
  },
  openrouter: {
    keyEnv: 'OPENROUTER_API_KEY',
    // Any OpenRouter-compatible endpoint that serves both Anthropic Messages (Claude Code) and OpenAI
    // Responses (Codex). Default: openrouter.ai; a proxy sets OPENROUTER_BASE_URL (without /v1).
    anthropicBaseUrl: OPENROUTER_BASE_URL,
    openaiBaseUrl: `${OPENROUTER_BASE_URL}/v1`,
    // OpenRouter-namespaced ids: the same four open/cheap models and the same two judges as the Go
    // tier, so the two gateways' numbers can be pooled (scripts/merge-openrouter-results.ts).
    models: {
      'claude-code': ['moonshotai/kimi-k3', 'anthropic/claude-haiku-5.5', 'anthropic/claude-opus-5', 'anthropic/claude-sonnet-5'],
      codex: ['deepseek/deepseek-v4-pro', 'z-ai/glm-5.3-flash', 'moonshotai/kimi-k3', 'openai/gpt-6.1-sol', 'qwen/qwen3.8-max'],
    },
    judgeModel: { 'claude-code': 'deepseek/deepseek-v4.1-flash', codex: 'z-ai/glm-5.3' },
    // A proxy behind a private CA: build a sandbox image with the CA and set AGENT_EVAL_DOCKER_IMAGE, and
    // NODE_EXTRA_CA_CERTS to the CA path inside it; both are passed through when set.
    docker: { ...HOST_NETWORK, ...(process.env.AGENT_EVAL_DOCKER_IMAGE ? { AGENT_EVAL_DOCKER_IMAGE: process.env.AGENT_EVAL_DOCKER_IMAGE } : {}) },
    env: (process.env.NODE_EXTRA_CA_CERTS ? { NODE_EXTRA_CA_CERTS: process.env.NODE_EXTRA_CA_CERTS } : {}) as Record<string, string>,
  },
} as const;

/** Vendor subscriptions: the built-in direct agents, unrouted. Models are the vendor's own ids. */
const SUBSCRIPTIONS = {
  'claude-subscription': {
    cli: 'claude-code' as const,
    keyEnv: 'CLAUDE_CODE_OAUTH_TOKEN',
    models: ['claude-opus-5-5', 'claude-fable-5-1', 'claude-sonnet-5-5'],
    judgeModel: 'claude-sonnet-5-5',
    docker: HOST_NETWORK,
  },
  'codex-subscription': {
    cli: 'codex' as const,
    keyEnv: 'OPENAI_API_KEY', // placeholder only: the sandbox authenticates with the copied ChatGPT auth.json
    // ChatGPT accounts get the current lineup only (`gpt-5.x` ids are rejected with model_not_found).
    models: ['gpt-6.1-sol', 'gpt-6-astra', 'gpt-6-luna'],
    judgeModel: 'gpt-6-luna', // the fast line: the judge runs once per eval on top of the codegen budget
    docker: HOST_NETWORK,
  },
} as const;
const isSubscription = (gateway: Gateway): gateway is keyof typeof SUBSCRIPTIONS => gateway in SUBSCRIPTIONS;
type RoutedGateway = keyof typeof GATEWAYS;

/**
 * Tier one: the configurations run regularly (same idea as next-evals-oss's TIER_ONE_EXPERIMENTS).
 * One frontier model per vendor subscription, two open models per CLI on OpenCode Go, and a cheap vendor
 * control. Everything else is tier two: TIER=all (or MODEL_FILTER) widens a run to the full lists.
 */
export const TIER_ONE: ReadonlyArray<{ gateway: Gateway; cli: Cli; model: string }> = [
  { gateway: 'claude-subscription', cli: 'claude-code', model: 'claude-opus-5-5' },
  { gateway: 'codex-subscription', cli: 'codex', model: 'gpt-6.1-sol' },
  { gateway: 'opencode-go', cli: 'claude-code', model: 'kimi-k3' },
  { gateway: 'opencode-go', cli: 'claude-code', model: 'claude-haiku-5-5' },
  { gateway: 'opencode-go', cli: 'codex', model: 'glm-5.3-flash' },
  { gateway: 'opencode-go', cli: 'codex', model: 'deepseek-v4-pro' },
  // The same four through an OpenRouter-compatible endpoint: finishes the Go tier when Go's monthly cap is spent.
  { gateway: 'openrouter', cli: 'claude-code', model: 'moonshotai/kimi-k3' },
  { gateway: 'openrouter', cli: 'claude-code', model: 'anthropic/claude-haiku-5.5' },
  { gateway: 'openrouter', cli: 'codex', model: 'z-ai/glm-5.3-flash' },
  { gateway: 'openrouter', cli: 'codex', model: 'deepseek/deepseek-v4-pro' },
];

export const CLI_EFFORT = 'high';
// Per-run budget covers install, codegen, build, tests and the judge. Vendor subscriptions throttle a
// 4-way concurrent matrix noticeably (gpt-6.1-sol: ~8 min alone, 13–20 min in a batch), hence the margin.
const TIMEOUT_S = Number(process.env.EVAL_TIMEOUT_S) || 1800; // EVAL_TIMEOUT_S: e.g. 2700 for a slow gateway route
const SUBSCRIPTION_TIMEOUT_S = 2700;
// Default: this repository's skill. The published results used a snapshot of it — see skill-snapshot.diff.
const SKILL_DIR = process.env.GRAVITY_UI_SKILL_DIR || join(ROOT, '..', 'skills', 'gravity-ui');
const SKILL_MOUNT = '.agents/skills/gravity-ui';
const CLAUDE_SKILL_MOUNT = '.claude/skills/gravity-ui';
const SKILL_ACTIVATION =
  '# Gravity UI\n\nThis project uses the Gravity UI design system (`@gravity-ui/*`). Before writing or modifying ' +
  `Gravity UI component code, you MUST read and follow the \`gravity-ui\` skill at \`${SKILL_MOUNT}/SKILL.md\`, ` +
  'including every referenced file relevant to the task.\n';

// ── gateway routing ───────────────────────────────────────────────────────────

function routingEnv(gateway: RoutedGateway, cli: Cli): Record<string, string> {
  const g = GATEWAYS[gateway];
  return cli === 'claude-code'
    ? { ANTHROPIC_BASE_URL: g.anthropicBaseUrl, ...g.env } // the CLI appends /v1/messages
    : { ...g.env };
}

// Codex reaches a custom provider only through a `[model_providers.*]` table in config.toml; the
// patched agent-eval takes it from `agentOptions.modelProvider`. The built-in direct mode hands the
// key over as OPENAI_API_KEY, so the table reads that variable.
function codexModelProvider(gateway: RoutedGateway): { name: string; toml: string } {
  const g = GATEWAYS[gateway];
  return {
    name: 'gateway',
    toml: [
      '[model_providers.gateway]',
      `name = "${gateway}"`,
      `base_url = "${g.openaiBaseUrl}"`,
      'env_key = "OPENAI_API_KEY"',
      'wire_api = "responses"', // codex ≥0.162 dropped chat/completions; both gateways serve Responses
      'stream_idle_timeout_ms = 120000',
      'stream_max_retries = 3',
    ].join('\n'),
  };
}

// agent-eval talks to Docker through dockerode, which only knows DOCKER_HOST or /var/run/docker.sock;
// OrbStack keeps its socket under the home directory, so point dockerode at it when nothing else is set.
const ORBSTACK_SOCKET = join(homedir(), '.orbstack', 'run', 'docker.sock');
if (!process.env.DOCKER_HOST && !existsSync('/var/run/docker.sock') && existsSync(ORBSTACK_SOCKET)) {
  process.env.DOCKER_HOST = `unix://${ORBSTACK_SOCKET}`;
}

/** Docker image/network are process env; experiments may share a process only when they agree on them. */
function claimDocker(gateway: Gateway, docker: Record<string, string>): void {
  const wanted = JSON.stringify(docker);
  const active = process.env.GRAVITY_EVALS_DOCKER;
  if (active && active !== wanted) {
    throw new Error(`${gateway} needs a different Docker image/network than experiments already loaded in this process: run it separately`);
  }
  process.env.GRAVITY_EVALS_DOCKER = wanted;
  Object.assign(process.env, docker);
}

function activateGateway(gateway: RoutedGateway, cli: Cli): void {
  const g = GATEWAYS[gateway];
  claimDocker(gateway, g.docker);
  if (cli === 'claude-code') claimClaudeAuth('gateway');
}

/**
 * The built-in claude-code agent authenticates with CLAUDE_CODE_OAUTH_TOKEN whenever the host has it, so
 * a gateway run must not see it and a subscription run needs it: one mode per agent-eval process.
 */
function claimClaudeAuth(mode: 'gateway' | 'subscription'): void {
  const active = process.env.GRAVITY_EVALS_CLAUDE_AUTH;
  if (active && active !== mode) throw new Error(`Claude ${mode} experiments cannot share an agent-eval process with Claude ${active} ones: run them separately`);
  process.env.GRAVITY_EVALS_CLAUDE_AUTH = mode;
  if (mode === 'gateway' && process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    console.warn('CLAUDE_CODE_OAUTH_TOKEN is set on the host; ignoring it so Claude Code authenticates against the gateway');
    delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
  }
}

// ── Codex ChatGPT subscription auth ──────────────────────────────────────────
//
// The ChatGPT login is a refresh-token pair, and a refresh token is single-use. If every sandbox gets a
// stale copy, the first one to refresh invalidates it for the others — and for the host login, which
// then needs `codex login` again. So the host file is refreshed ONCE, under a lock, before any sandbox
// copies it, and copies only go out with an access token that outlives a run.
const CODEX_AUTH_FILE = join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'auth.json');
const CODEX_OAUTH_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann'; // Codex CLI's public OAuth client (codex-rs login)
const MIN_TOKEN_LIFE_S = 2 * 3600;

function readCodexAuth(): string {
  let serialized = '';
  try { serialized = readFileSync(CODEX_AUTH_FILE, 'utf8'); } catch { throw new Error(`Codex ChatGPT login not found at ${CODEX_AUTH_FILE}: run \`codex login\` and choose ChatGPT`); }
  if (JSON.parse(serialized).auth_mode !== 'chatgpt') throw new Error(`${CODEX_AUTH_FILE} is not a ChatGPT subscription login (auth_mode)`);
  return serialized;
}

function accessTokenLifeS(serialized: string): number {
  const token: string = JSON.parse(serialized).tokens?.access_token ?? '';
  const payload = token.split('.')[1];
  if (!payload) return 0;
  const exp = JSON.parse(Buffer.from(payload, 'base64url').toString()).exp ?? 0;
  return exp - Date.now() / 1000;
}

/**
 * Refresh the host login with the same OAuth refresh grant Codex itself uses, and write it back so the
 * host stays logged in. Codex only refreshes on a 401 at request time, so a probe request does not
 * renew a token that is merely close to expiry — and a refresh token is single-use, so the sandboxes
 * must never race for it: this runs once, under the lock, before any auth is copied out.
 */
export async function refreshCodexAuthOnHost(): Promise<void> {
  const auth = JSON.parse(readFileSync(CODEX_AUTH_FILE, 'utf8'));
  const res = await fetch('https://auth.openai.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ client_id: CODEX_OAUTH_CLIENT_ID, grant_type: 'refresh_token', refresh_token: auth.tokens.refresh_token, scope: 'openid profile email offline_access' }),
  });
  if (!res.ok) throw new Error(`Codex did not refresh the ChatGPT token: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  const fresh = (await res.json()) as { id_token?: string; access_token: string; refresh_token?: string };
  auth.tokens = { ...auth.tokens, id_token: fresh.id_token ?? auth.tokens.id_token, access_token: fresh.access_token, refresh_token: fresh.refresh_token ?? auth.tokens.refresh_token };
  auth.last_refresh = new Date().toISOString();
  writeFileSync(CODEX_AUTH_FILE, JSON.stringify(auth, null, 2) + '\n', { mode: 0o600 });
  if (accessTokenLifeS(readFileSync(CODEX_AUTH_FILE, 'utf8')) < MIN_TOKEN_LIFE_S) throw new Error('Codex did not refresh the ChatGPT token');
}

/** Fresh ChatGPT auth for one sandbox: refreshes the host file first when it would expire mid-run. */
async function codexChatGptAuth(): Promise<string> {
  const lock = join(tmpdir(), 'gravity-evals-codex-auth.lock');
  const started = Date.now();
  while (true) {
    try { mkdirSync(lock); break; } catch { if (Date.now() - started > 240_000) throw new Error(`stale lock ${lock}`); }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  }
  try {
    const serialized = readCodexAuth();
    if (accessTokenLifeS(serialized) >= MIN_TOKEN_LIFE_S) return serialized;
    await refreshCodexAuthOnHost();
    return readCodexAuth();
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

/**
 * The skill's content hash must invalidate cached results, but agent-eval carries plain config changes
 * (agentOptions included) forward onto old results as "benign". `definition.fingerprintExtra` is the
 * one hook that enters both the result fingerprint and the reuse-compatibility fingerprint.
 */
const skillFingerprintExtra = (config: { agentOptions?: Record<string, unknown> }) =>
  config.agentOptions?.skillFingerprint ? { skill: config.agentOptions.skillFingerprint } : undefined;

/**
 * The built-in direct agent re-registered under its own name with the skill hash in its fingerprint.
 * Keeping the name keeps every baseline result's fingerprint intact (the agent name is part of it).
 */
function subscriptionAgent(cli: Cli): Agent {
  const base = getAgent(cli);
  return { ...base, definition: { ...base.definition, fingerprintExtra: skillFingerprintExtra } };
}

/** `<gateway>/<cli>`: the built-in direct agent, authenticated with the gateway key and routed to it. */
function gatewayAgent(gateway: RoutedGateway, cli: Cli): Agent {
  const base = getAgent(cli);
  const name = `${gateway}/${cli}`;
  const g = GATEWAYS[gateway];
  const routing = routingEnv(gateway, cli);
  const provider = cli === 'codex' ? codexModelProvider(gateway) : undefined;
  type Options = Parameters<Agent['definition']['authEnv']>[0];
  // Judge runs get no agentOptions, so the wrapped definition injects Codex's provider table itself.
  const withProvider = (options: Options): Options => (provider ? { ...options, agentOptions: { ...options.agentOptions, modelProvider: provider } } : options);
  const definition = {
    ...base.definition,
    name,
    displayName: `${base.displayName} via ${gateway}`,
    getApiKeyEnvVar: () => g.keyEnv,
    authEnv: (options: Options) => ({ ...base.definition.authEnv(options), ...routing }),
    configFiles: (options: Options) => base.definition.configFiles(withProvider(options)),
    fingerprintExtra: skillFingerprintExtra,
  };
  return {
    ...base,
    name,
    displayName: definition.displayName,
    getApiKeyEnvVar: definition.getApiKeyEnvVar,
    definition,
    run: (fixturePath, options) => base.run(fixturePath, { ...options, agentEnv: { ...options.agentEnv, ...routing } }),
  };
}

// ── skill treatment ───────────────────────────────────────────────────────────

function readTree(dir: string, base = dir): Record<string, string> {
  const files: Record<string, string> = {};
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) Object.assign(files, readTree(path, base));
    else files[relative(base, path)] = readFileSync(path, 'utf8');
  }
  return files;
}

/**
 * Install the skill into the workspace and point AGENTS.md / CLAUDE.md at it — the only difference from baseline.
 * `.agents/skills` is Codex's native repo-skill location; Claude Code discovers skills only in `.claude/skills`,
 * so for it the same tree is mirrored there too. Without that the skill is just a file CLAUDE.md mentions,
 * while Claude Code's bundled skills (a generic charting one among them) are real, invocable skills that win
 * on overlapping tasks. Added 2026-11-07; only the chart evals were re-run under it (see README.md).
 */
function skillTreatment(cli: Cli): Pick<ExperimentConfig, 'setup' | 'editPrompt'> & { skillFingerprint: string } {
  if (!existsSync(join(SKILL_DIR, 'SKILL.md'))) throw new Error(`Skill not found: ${SKILL_DIR} (set GRAVITY_UI_SKILL_DIR)`);
  const tree = readTree(SKILL_DIR);
  const mounts = cli === 'claude-code' ? [SKILL_MOUNT, CLAUDE_SKILL_MOUNT] : [SKILL_MOUNT];
  const skillFiles = Object.fromEntries(mounts.flatMap((mount) => Object.entries(tree).map(([rel, text]) => [`${mount}/${rel}`, text])));
  // agent-eval fingerprints the config, not the files setup() uploads; a hash of the skill goes into
  // agentOptions so editing the skill invalidates (and re-runs) every skill result.
  const hash = createHash('sha256');
  for (const rel of Object.keys(tree).sort()) hash.update(rel).update('\0').update(tree[rel]).update('\0');
  return {
    skillFingerprint: hash.digest('hex').slice(0, 16),
    setup: async (sandbox) => {
      await sandbox.writeFiles({ ...skillFiles, 'AGENTS.md': SKILL_ACTIVATION, 'CLAUDE.md': SKILL_ACTIVATION });
    },
    editPrompt: (prompt) => `${prompt}\n\nBefore implementing, read and follow the gravity-ui skill at ${SKILL_MOUNT}/SKILL.md. Read its referenced files as required by the skill.`,
  };
}

// ── experiment factory ────────────────────────────────────────────────────────

const filterList = (value: string | undefined) => (value ? value.split(',').map((s) => s.trim()).filter(Boolean) : undefined);

export function gravityExperiment({ gateway, cli, skill = false }: { gateway: Gateway; cli: Cli; skill?: boolean }): ExperimentConfig {
  let agentName: string;
  let allModels: readonly string[];
  let judgeModel: string;
  let agentOptions: Record<string, unknown>;
  let subscriptionSetup: ExperimentConfig['setup'];
  if (isSubscription(gateway)) {
    const sub = SUBSCRIPTIONS[gateway];
    if (cli !== sub.cli) throw new Error(`${gateway} drives ${sub.cli}, not ${cli}`);
    claimDocker(gateway, sub.docker);
    const agent = subscriptionAgent(cli); // the stock direct agent, judged by itself
    registerAgent(agent);
    agentName = agent.name;
    allModels = sub.models;
    judgeModel = sub.judgeModel;
    agentOptions = cli === 'claude-code' ? { effort: CLI_EFFORT } : { reasoningEffort: CLI_EFFORT };
    if (cli === 'claude-code') {
      claimClaudeAuth('subscription');
      if (!process.env.CLAUDE_CODE_OAUTH_TOKEN) throw new Error('claude-subscription needs CLAUDE_CODE_OAUTH_TOKEN: run `claude setup-token` and put it in .env.local');
    } else {
      readCodexAuth(); // fail at load time when there is no ChatGPT login at all
      // agent-eval insists on a key env var for the agent; the patched runner drops it when it finds
      // a ChatGPT auth.json in the sandbox home, so a placeholder satisfies the check without leaking.
      process.env.OPENAI_API_KEY ||= 'chatgpt-subscription-placeholder';
      subscriptionSetup = async (sandbox) => {
        const auth = await codexChatGptAuth(); // per run, so a long matrix never hands out a token about to expire
        // runShell exists on both sandbox backends but is not part of the published Sandbox type.
        await (sandbox as unknown as { runShell(script: string): Promise<unknown> }).runShell(`mkdir -p ~/.codex && umask 077 && cat > ~/.codex/auth.json <<'AUTH_JSON'\n${auth}\nAUTH_JSON`);
      };
    }
  } else {
    activateGateway(gateway, cli);
    const agent = gatewayAgent(gateway, cli);
    registerAgent(agent);
    const g = GATEWAYS[gateway];
    agentName = agent.name;
    allModels = g.models[cli];
    judgeModel = g.judgeModel[cli];
    agentOptions = cli === 'claude-code' ? { effort: CLI_EFFORT } : { modelProvider: codexModelProvider(gateway), reasoningEffort: CLI_EFFORT };
  }
  // Default: tier one only. TIER=all → every model of the list; MODEL_FILTER (comma-separated) picks
  // explicit models from the full list. EVAL_FILTER narrows evals the same way (next-evals-oss's idiom).
  const modelFilter = filterList(process.env.MODEL_FILTER);
  const tierOne = TIER_ONE.filter((t) => t.gateway === gateway && t.cli === cli).map((t) => t.model);
  const models = allModels.filter((m) => modelFilter
    ? modelFilter.some((f) => m === f || m.endsWith(`/${f}`))
    : process.env.TIER === 'all' || tierOne.includes(m));
  if (!models.length) throw new Error(`no models selected for ${gateway}/${cli}: not in TIER_ONE — set TIER=all or MODEL_FILTER`);
  const evalFilter = filterList(process.env.EVAL_FILTER);
  const treatment = skill ? skillTreatment(cli) : ({} as Partial<ReturnType<typeof skillTreatment>>);
  if (treatment.skillFingerprint) agentOptions = { ...agentOptions, skillFingerprint: treatment.skillFingerprint };
  const setup: ExperimentConfig['setup'] = subscriptionSetup || treatment.setup
    ? async (sandbox) => { await subscriptionSetup?.(sandbox); await treatment.setup?.(sandbox); }
    : undefined;
  return {
    agent: agentName,
    // Effort goes through agentOptions for both CLIs (Codex's native `?reasoningEffort=` suffix would put a
    // `?` into result directory names, which some VCSs reject; the patched agent-eval reads it from options).
    model: models,
    agentOptions,
    evals: evalFilter ?? '*',
    scripts: ['build'],
    runs: Number(process.env.RUNS) || 4, // pass@4, like the Next.js board; RUNS=1 for a quick check
    earlyExit: false,  // record the real pass rate, not "stop at first success"
    timeout: isSubscription(gateway) ? SUBSCRIPTION_TIMEOUT_S : TIMEOUT_S,
    sandbox: 'docker',
    copyFiles: 'changed',
    // Pin the judge to one model per gateway so grading does not vary with the model under test.
    judge: { agent: agentName, model: judgeModel },
    ...(treatment.editPrompt ? { editPrompt: treatment.editPrompt } : {}),
    ...(setup ? { setup } : {}),
  };
}
