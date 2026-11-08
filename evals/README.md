# gravity-ui skill evals

Does the [`gravity-ui`](../skills/gravity-ui) skill make coding agents build better Gravity UI code? This
directory answers with a benchmark: 17 realistic tasks, each solved by 10 models four times **without** the
skill and four times **with** it, graded by deterministic checks plus an LLM judge. Built on
[`@vercel/agent-eval`](https://www.npmjs.com/package/@vercel/agent-eval), the harness behind
[nextjs.org/evals](https://nextjs.org/evals).

## Results

Across all 10 models the skill lifts the pass rate from **49% to 89%** (334/679 → 606/680 runs).

| Model | Agent CLI | Served by | Without skill | With skill | Δ |
|---|---|---|---|---|---|
| Claude Sonnet 5.5 | Claude Code | Claude subscription | 65% (44/68) | 99% (67/68) | +34 pp |
| Claude Fable 5.1 | Claude Code | Claude subscription | 68% (46/68) | 96% (65/68) | +28 pp |
| Claude Opus 5.5 | Claude Code | Claude subscription | 72% (49/68) | 94% (64/68) | +22 pp |
| GPT-6 Astra | Codex | ChatGPT subscription | 28% (19/68) | 91% (62/68) | +63 pp |
| Claude Haiku 5.5 | Claude Code | OpenCode Go / OpenRouter | 66% (45/68) | 88% (60/68) | +22 pp |
| DeepSeek v4 Pro | Codex | OpenCode Go / OpenRouter | 56% (38/68) | 88% (60/68) | +32 pp |
| GLM 5.3 Flash | Codex | OpenCode Go / OpenRouter | 48% (32/67) +1 t/o | 85% (58/68) | +37 pp |
| GPT-6.1 Sol | Codex | ChatGPT subscription | 25% (17/68) | 85% (58/68) | +60 pp |
| GPT-6 Luna | Codex | ChatGPT subscription | 15% (10/68) | 85% (58/68) | +70 pp |
| Kimi K3 | Claude Code | OpenCode Go / OpenRouter | 50% (34/68) | 79% (54/68) | +29 pp |

Per task, all models pooled:

| Eval | What the prompt asks for | Without | With |
|---|---|---|---|
| app-dashboard | Admin dashboard: collapsible side navigation + orders table with selection, column drag, grouping | 2% | 87% |
| app-landing | Landing page for a small SaaS: hero, features, call to action | 0% | 95% |
| app-vite-spa | A 2–3 page app with navigation and a light/dark switch | 67% | 95% |
| comp-actions-menu | A button that opens a list of actions | 90% | 100% |
| comp-data-table | Data table with column sorting, pagination and checkbox selection | 62% | 92% |
| comp-modal-confirm | A button that opens a modal with confirm and cancel | 67% | 82% |
| comp-settings-form | Profile settings form: text fields, avatar upload, selects, toggle, checkboxes | 72% | 97% |
| comp-toast | A notification in the corner that hides by itself | 70% | 97% |
| cross-i18n | Switch the interface language between English and Russian | 50% | 90% |
| cross-markdown-editor | A form field with markdown and live formatted preview | 12% | 92% |
| cross-theme-persist | A theme switch remembered in localStorage | 95% | 95% |
| edge-calendar | A date-picking calendar | 65% | 100% |
| edge-stale-api | A light/dark switch on the current API of the installed major version | 90% | 95% |
| viz-chart-themed | A line chart that matches the current light/dark theme | 0% | 47% |
| viz-chartkit-mixed | One widget switching between a sales line chart and a dense monitoring series, engines lazy-loaded | 35% | 70% |
| viz-widgets-dashboard | A dashboard of widgets the user can freely arrange on a grid | 0% | 87% |
| viz-yagr-timeseries | Realtime CPU chart with tens of thousands of points | 56% | 90% |

What the numbers say:

- **Without the skill, models know `@gravity-ui/uikit` and little else.** Navigation shells, the table
  package, page-constructor, dashkit, charts, markdown-editor and date-components get hand-written instead.
  With the skill every model routes to them.
- **GPT-6 models gain the most.** Without the skill they often spend the time budget on side quests
  (downloading stock photos, installing Playwright to screenshot their own app) and often hit the 45-minute
  limit; with it they finish in 10–13 minutes.
- **Cheap models close most of the gap**: Haiku 5.5 and DeepSeek v4 Pro reach 88%.
- **What is left**: `viz-chart-themed` — models pick `@gravity-ui/charts` but still hand-build a palette
  per theme, which the chart already does; `viz-chartkit-mixed` — the skill's decision table steers weaker
  models away from `@gravity-ui/chartkit`, the package this task needs.

### Browse

- [`results-evals.html`](results-evals.html) — the nextjs.org/evals view: a row per model, expandable into
  per-eval pass counts, tokens, duration and cost. Open it from a local checkout.
- [`results-summary.md`](results-summary.md) — per experiment and model: pass rate, mean time, cost estimate.
- `results/<experiment>/<model>/<timestamp>/<eval>/` — the raw data, see [Layout](#layout).

## How it is measured

- **An eval** is a Vite + React fixture with `@gravity-ui/uikit` installed (`evals/<id>/`), a prompt written
  the way a user would (`PROMPT.md`, in Russian, naming the goal and never the API), and `EVAL.ts`:
  deterministic checks (the right package is imported, no foreign UI library, no hand-rolled replacement)
  plus one `toSatisfyCriterion` judge test describing the intended Gravity UI solution.
- **A run passes** when the project builds and every check, the judge included, passes. Each model makes
  4 independent attempts per eval and all 4 count (no early exit); the table shows passed / attempted.
- **Without vs with skill** is the only difference between the two arms: the "with" arm copies the skill
  into the sandbox (`.agents/skills/gravity-ui`, also `.claude/skills/gravity-ui` for Claude Code), points
  `AGENTS.md` / `CLAUDE.md` at it and adds one sentence to the prompt asking to follow it.
- **Sandboxes** are Docker containers (`node:24-slim`); the agent works with the stock Claude Code or Codex
  CLI at high reasoning effort. Time limit per run: 30 minutes on model gateways, 45 on vendor
  subscriptions. Runs that hit the limit or a gateway quota are infrastructure outcomes: excluded from the
  rate and shown as `+n t/o`.
- **The judge** is an LLM agent in the same sandbox that reads the finished project. It is pinned per
  gateway so grading does not depend on the model under test: Claude Sonnet 5.5 (Claude subscription),
  GPT-6 Luna (ChatGPT subscription), DeepSeek v4.1 Flash (open models through Claude Code), GLM 5.3 (open
  models through Codex).
- **Open models** were served by OpenCode Go and, after its monthly quota ran out, by an OpenRouter-compatible
  endpoint with the same models and the same judges. Per model and eval the better-served result is kept
  (`scripts/prune-results.ts --keep best`).
- **Two criteria were refined after the runs**: `comp-settings-form` accepts a native file input for the
  avatar (uikit's own `useFileInput` renders one), `edge-stale-api` accepts uikit's all-in-one `Provider` and
  grades against the installed version. Stored projects were re-graded under the new text without
  regenerating code (`scripts/rejudge-results.ts`); on the last pass 1 verdict in 77 moved against the
  direction of the change — the judge's own noise, about 1%.
- **The skill under test** is this repository at commit `5a361e3` plus [`skill-snapshot.diff`](skill-snapshot.diff)
  (efficiency guardrails, an install-when-absent rule, `.d.ts` inspection). Later skill changes (the spacing,
  theme-state and `Dialog` traps) are not in these numbers.

## Run it

Requires Node 24, pnpm 10 and Docker (OrbStack works; its socket is picked up automatically).

```bash
cd evals
pnpm install
cp .env.example .env.local   # fill in the credentials of the gateways you use
pnpm verify-evals            # golden solutions pass the deterministic checks
pnpm eval:run 'opencode-go--*'
```

**Experiments** are `experiments/<gateway>--<cli>[--gravity-ui-skill].ts`:

| Gateway | Credential | Models |
|---|---|---|
| `claude-subscription` | `CLAUDE_CODE_OAUTH_TOKEN` (`claude setup-token`) | Opus 5.5, Fable 5.1, Sonnet 5.5 |
| `codex-subscription` | `codex login` with a ChatGPT plan; `~/.codex/auth.json` is copied into each sandbox | GPT-6.1 Sol, GPT-6 Astra, GPT-6 Luna |
| `opencode-go` | `OPENCODE_API_KEY` | Kimi K3, Haiku 5.5, DeepSeek v4 Pro, GLM 5.3 Flash, more |
| `openrouter` | `OPENROUTER_API_KEY`, optional `OPENROUTER_BASE_URL` for a compatible proxy | the same open models under OpenRouter ids |

The `openrouter` gateway needs an endpoint that serves both Anthropic Messages (Claude Code) and OpenAI
Responses (Codex). Behind a private CA, build a sandbox image with the CA and set `AGENT_EVAL_DOCKER_IMAGE`
and `NODE_EXTRA_CA_CERTS`.

**Knobs** (environment variables): `TIER=all` runs every model of a gateway instead of the default tier
(`TIER_ONE` in `lib/gravity-evals.ts`); `MODEL_FILTER` and `EVAL_FILTER` take comma-separated names;
`RUNS=1` for a quick check; `EVAL_TIMEOUT_S` raises the gateway time limit; `GRAVITY_UI_SKILL_DIR` evaluates
another checkout of the skill (default `../skills/gravity-ui`).

**Scripts**:

| Command | What it does |
|---|---|
| `pnpm eval:run '<experiment glob>'` | Runs experiments one at a time, evals in batches of 4, then writes the reports |
| `pnpm verify-evals [id]` | Applies `solutions/<id>` to the fixture and runs the deterministic checks |
| `pnpm export-results` | Writes `results-summary.md` and `results-evals.html` |
| `pnpm rejudge-results <experiment> --evals a,b` | Re-grades stored runs against the current `EVAL.ts` without regenerating code |
| `pnpm drop-infra-results '<glob>'` | Removes results with too few real verdicts so the next run repeats them |
| `pnpm prune-results '<glob>' [--keep best]` | Keeps one result per model and eval: the newest, or the one with most passes |
| `pnpm merge-openrouter-results` | Folds `openrouter--*` results into the `opencode-go--*` directories under Go model ids |

The harness patches `@vercel/agent-eval` 2.6 (`patches/`, applied by pnpm): Codex can use a custom
Responses provider and take reasoning effort from options, the Docker sandbox can boot a custom image on a
chosen network and labels its containers, the judge can be any registered agent, the Codex runner keeps a
ChatGPT login, and housekeeping no longer deletes per-model result directories.

## Layout

```
evals/
  evals/<id>/          fixture: PROMPT.md, EVAL.ts, package.json, src/
  solutions/<id>/      reference implementation per eval (never shown to agents)
  experiments/         one file per gateway × CLI × treatment
  lib/                 experiment factory (gateways, judge, skill install), infra-outcome patterns
  scripts/             runner wrapper, reports, re-judge, result maintenance
  patches/             @vercel/agent-eval patch
  results/<experiment>/<model>/<timestamp>/<eval>/
    summary.json       pass rate, token usage, fingerprint
    run-N/result.json  status, duration, tokens, CLI version (rejudged runs record the previous status)
    run-N/outputs/     eval.txt (checks and the judge's reasoning), scripts/build.txt
    run-N/project/     the source files the agent wrote or changed
```

Agent transcripts, build output, lockfiles and binaries are not committed (`.gitignore`); a local run keeps them.

## Add an eval

Create `evals/<id>/` with `PROMPT.md` (the user's goal, never the API), `EVAL.ts` (deterministic checks and
one focused judge criterion), `package.json` with a `build` script and the starting `src/`; add
`solutions/<id>/`, then `pnpm verify-evals <id>` and `RUNS=1 EVAL_FILTER=<id> pnpm eval:run '<experiment>'`.
