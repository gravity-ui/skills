# Gravity UI skills for AI Agents

Agent Skills for building with [Gravity UI](https://gravity-ui.com) ecosystem. Compatible with other agents as well via [skills.sh](https://skills.sh/).

## Install

```bash
npx skills add gravity-ui/skills
```

## Available skills

### `gravity-ui`

Builds, fixes, styles, and composes UI with Gravity UI. Gravity UI is a 30+-package design system. AI agents get three things wrong:

1. **Pick the wrong package** — `charts` vs `chartkit`, uikit `Table` vs `@gravity-ui/table`, `date-components` vs `date-utils`.
2. **Use outdated APIs** — training data lags the installed version; the agent writes props that don't exist (anymore, or yet).
3. **Invent component APIs / icon names** — `Button variant=`, `Icon name=`, guessed `@gravity-ui/icons` names, `Text variant="header-3"`.

This skill fixes all three.

**Use when:**

- Working with `@gravity-ui/*` imports, `uikit`, `ThemeProvider`, or `--g-` CSS tokens.
- Building dashboards, tables, charts, forms, navigation shells, or landing pages on Gravity UI.
- Any prompt (EN or RU) mentioning gravity-ui, гравити, дизайн-система, компоненты, дашборд, таблица, график, or форма.

### `gravity-ui-v8-migration`

Upgrades `@gravity-ui/uikit` from v7 to v8 in an app or a library. The migration guides ship inside the v8 package; the skill adds what they leave to the agent:

1. **Preflight** — React 18+, and the third-party dependencies that still pin uikit v7 (`scripts/check-uikit-peers.mjs`).
2. **Inventory and decisions** — the affected code grouped by guide section, and the choices that belong to the user: `/legacy` or a rewrite, the `l` breakpoint.
3. **Verification past `tsc`** — many v8 changes compile cleanly and show only on screen or in tests.

**Use when:** bumping uikit to 8, estimating that upgrade, or finishing a half-done one.

## Activation tip

Skill auto-activation across agents sits around ~50% in public evals — the skill exists, the agent just doesn't always invoke it.

Paste this into your `AGENTS.md`:

```markdown
<!-- BEGIN:gravity-ui-agent-rules -->
# Gravity UI

This project uses the Gravity UI design system (`@gravity-ui/*`). Before writing
or modifying Gravity UI component code, you **MUST invoke the `gravity-ui`
skill** — it routes you to the correct package and prevents invented APIs. Run
it on any UI task here.
<!-- END:gravity-ui-agent-rules -->
```

For Claude Code, also add `@AGENTS.md` to `CLAUDE.md` (it reads `CLAUDE.md`
natively, not `AGENTS.md`).

## Evaluation

Does the skill help? Ten models solved 18 Gravity UI tasks four times each without the skill and four times
with it. A run passes when the project builds, deterministic checks pass (the right `@gravity-ui/*` package,
no hand-rolled replacement) and an LLM judge confirms the intended Gravity UI solution.

| Model | Agent CLI | Without skill | With skill |
|---|---|---|---|
| Claude Sonnet 5.5 | Claude Code | 67% | 99% |
| Claude Fable 5.1 | Claude Code | 69% | 96% |
| Claude Opus 5.5 | Claude Code | 74% | 94% |
| GPT-6 Astra | Codex | 32% | 92% |
| Claude Haiku 5.5 | Claude Code | 68% | 89% |
| DeepSeek v4 Pro | Codex | 53% | 89% |
| GPT-6.1 Sol | Codex | 29% | 86% |
| GPT-6 Luna | Codex | 15% | 86% |
| GLM 5.3 Flash | Codex | 45% | 81% |
| Kimi K3 | Claude Code | 51% | 79% |

All models together: **50% → 89%**. Without the skill agents know `@gravity-ui/uikit` and hand-write the rest
(navigation, tables, charts, dashboards, landing pages, the markdown editor, the date picker); with it they
route to the right package. Method, per-task numbers, the code and transcript of every run and the harness to
re-run it are in [gravity-ui/skills-evals](https://github.com/gravity-ui/skills-evals).

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
