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

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
