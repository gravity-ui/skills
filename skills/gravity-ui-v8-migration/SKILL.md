---
name: gravity-ui-v8-migration
description: Upgrades @gravity-ui/uikit from v7 to v8 in an app or a library. Use when bumping uikit to 8, estimating or planning that upgrade, or finishing a half-done one (EN or RU: обнови uikit до 8, миграция на v8).
---

# Migrating @gravity-ui/uikit from v7 to v8

The guides shipped inside the v8 package describe every change and how to make
it; this skill does not repeat them. It adds what they leave to you: the checks
that stop a migration before it starts, an inventory of the affected code, the
decisions that belong to the user, and verification past `tsc`. Many v8 changes
compile cleanly and show only on screen, in tests, or at runtime.

The `gravity-ui` skill's rules and examples are written for v7 (`<Flex gap={4}>`,
`spacing()`). Where they or this skill disagree with the guides of the target
version, the guides win.

Three requests, three paths through the steps:

- **Upgrade**: every step.
- **Estimate**: Steps 1–3 without changing anything. What Step 1 would ask
  (blockers, the latest 7.x) becomes lines of the report; skip the branch.
  Stop after Step 3.
- **Finish a half-done upgrade**: stay on the current branch; the target is the
  installed 8.x; decisions already visible in `git diff <base>` (such as
  `/legacy` imports) count as answered.

## Step 1 — Preflight

1. **Versions**, from `node_modules/<pkg>/package.json`:
   - `@gravity-ui/uikit` is 7.x, or 8.x when finishing. Below 7, stop: this
     skill covers 7 → 8 only. Below the latest 7.x, upgrade to it as the first
     commit of the migration branch, so the v8 commits hold only v8 changes.
   - `react` and `react-dom` are 18 or 19, `@types/react` too if present. Below
     18, stop: the React upgrade is a migration of its own and goes first.
2. **Type coverage.** List the code `tsc` does not check: a plain JavaScript
   project, and in TypeScript the stories, tests and e2e outside the tsconfig
   `include`. There a removed prop is ignored without an error, so the Step 3
   searches are the only safety net.
3. **Workspaces.** Every workspace bundled into one app moves to v8 together:
   two uikit majors in one bundle are two sets of providers, and components of
   one copy do not see the theme of the other. Run 1.1–1.4 and Step 3 in each
   workspace that depends on uikit.
4. **Third-party dependencies that pin v7.** From each such workspace:

   ```bash
   node <this skill's directory>/scripts/check-uikit-peers.mjs
   ```

   Its first line names the target version: use it everywhere below. It skips
   `@gravity-ui/*` packages, which move to v8 together with uikit (Step 5), and
   sorts the rest:
   - *Upgrade before uikit*: a newer release accepts both majors. Upgrade it
     first, on its own.
   - *Upgrade in the same install*: a newer release accepts v8 only. It joins
     the Step 5 install.
   - *Local*: a package of this repo; it migrates in this same change.
   - *Not checked*: the registry did not answer (the npm error code is
     printed), or the package comes from git or a URL. Fix the registry access
     or compare by hand; until then it counts as blocking.
   - *Blocking*: no release accepts the target. For a `(dependency)` range that
     means a second copy of uikit inside the package. Report them and let the
     user choose to wait, to stop, or to force: npm `overrides`, pnpm
     `peerDependencyRules.allowedVersions`, yarn `packageExtensions`. Forced
     packages run against an API they were not built for. npm refuses a peer
     conflict unless `.npmrc` sets `legacy-peer-deps` or the install runs with
     `--force`; pnpm and yarn only warn, so a successful install proves nothing.

   Under Yarn Plug'n'Play the script cannot read the packages: compare the
   uikit ranges of the dependencies by hand.
5. **Git.** A clean tree on a new branch.

Done when: all five are recorded and nothing blocks, or the user has chosen how
to proceed past each blocker.

## Step 2 — Open the guides

Take the guides of the target version without touching the project:

```bash
D=/tmp/uikit-<target> && mkdir -p $D && npm pack @gravity-ui/uikit@<target> --pack-destination $D \
  && tar -xzf $D/gravity-ui-uikit-<target>.tgz -C $D
```

`$D/package/build/docs/` is the tree that lands in
`node_modules/@gravity-ui/uikit/build/docs/` after the install, relative links
included. Its `guides/`:

| Guide                                                 | Read                                                         |
| :---------------------------------------------------- | :----------------------------------------------------------- |
| `migration-to-v8.md`                                  | always, in full, before Step 3                               |
| `migration-layout-v8.md`                              | on any hit of the layout searches                            |
| `migration-select-v8.md`                              | on any `Select`                                              |
| `migration-from-legacy-list.md`                       | on any `unstable_List*` import, or when `List` is rewritten  |
| `migration-from-legacy-{breadcrumbs,popover,tabs}.md` | on any import of these from `@gravity-ui/uikit/legacy`       |

The guides of `@gravity-ui/table` and `@gravity-ui/normalized-list` live in
their repositories; `migration-to-v8.md` links them.

Done when: `migration-to-v8.md` is read in full.

## Step 3 — Inventory

1. List the source roots. `src` is rarely all of it: add stories, unit and e2e
   tests, Storybook config, every workspace, and stylesheets anywhere outside
   `node_modules` and build output.
2. Run every command of the guide's *Quick checklist* over those roots instead
   of `src`, then these, which cover what the checklist leaves out:

   ```bash
   # Selectors on renamed or removed classes, in styles and tests
   grep -rnE "\bg-(lab-menu|lab-list|menu|dropdown-menu|list|select|tree-select|tree-list|dialog_has-close|label_size_xx|flex_|row_|container_sr|box_overflow|radio__disc|toast)" <roots>
   # Responsive maps with an `s` key: noisy, and where the s → xs trap hides
   grep -rnE "(^|[{,])[[:space:]]*s[[:space:]]*:" --include='*.[jt]s' --include='*.[jt]sx' <roots>
   # A global border-box reset decides whether the Box/Flex sizing change matters at all
   grep -rnE "box-sizing|boxSizing" <roots>
   # Tests and selectors on Select roles and option counts
   grep -rnE "ByRole\(['\"](textbox|option|combobox)|role=[\"']?(option|textbox|combobox)" <roots>
   # Breakpoint-dependent code
   grep -rnE "useLayoutContext|isMediaActive|activeMediaQuery|LayoutProvider|fixBreakpoints|breakpoints" <roots>
   # Smaller sections the checklist does not search
   grep -rnE "getConfig\(|lab/Breadcrumbs|addLanguageKeysets|DefaultPropsProvider|defaultProps=\{|ActionsPanel|<Progress\b|accent-font-weight|button-reset" <roots>
   grep -rnE "(from |require\(|import\()['\"]lodash(/|['\"])" <roots>
   # Components that change look or behavior without an API change
   grep -rnE "<(Select|Checkbox|Radio|RadioGroup|Switch|Progress|Toast|Dialog|Modal|ActionsPanel|List|Menu)\b" <roots>
   ```

   No `box-sizing` hit can still mean a reset from a package (Tailwind
   preflight, a normalize stylesheet); when unsure, read
   `getComputedStyle(el).boxSizing` of a `Box` in the browser.
3. Attribute every hit to a section of `migration-to-v8.md` or a row of
   [Silent changes](#silent-changes), or dismiss it as a false positive. Build
   the plan: one line per section with hits, giving the hit count, the files,
   whether `tsc` reports it, and the Step 4 decision it needs.

Done when: every hit is attributed or dismissed. For an estimate, report the
plan and stop here.

## Step 4 — Decisions

Ask in one message, each question with the hits it affects and a recommended
default. Ask only what the inventory raised.

- **`List`, `Menu`, `DropdownMenu`**: keep them on `@gravity-ui/uikit/legacy`
  (an import change plus three optional peers; deprecated, no removal date) or
  rewrite them on the new components.
- **`Table`, `TableColumnSetup`**: `/legacy` or `@gravity-ui/table`. Its
  guide's "Stay with the old table if…" list is the criterion.
- **The `l` breakpoint**: accept its new width, or keep the v7 one through
  `config.breakpoints.l`. It also sets the width of `Container size="l"`.
- **`extraProps` keys that act at the root**: `type`, `disabled`, `className`,
  `onClickCapture`, `rel`, and `target="_blank"`. The component could override
  the first five inside `extraProps`; at the root they apply, so a button can
  start submitting a form or turn disabled. `target="_blank"` at the root adds
  `rel="noopener noreferrer"`, and the link stops sending the Referer header.
  List each and ask whether to keep it.
- **`spacing()` and `sp()`**: deprecated but working. Replace them now or
  leave them.

Done when: every decision the inventory raised has an answer.

## Step 5 — Edit

1. Install `@gravity-ui/uikit@<target>` with the project's package manager (the
   lockfile names it). The same install takes the other `@gravity-ui/*`
   dependencies at their releases for uikit v8, the script's *same install*
   entries, and `@types/react` in step with `react`.
2. Edit one guide section at a time, in this order:
   1. Providers and breakpoints: they change what every screen renders. Only
      the root `ThemeProvider` becomes `Provider`, taking the settings of its
      `MobileProvider`. Nested ones stay `ThemeProvider`, for theme and
      direction; a nested `Provider` takes `mobile` explicitly, or it resets the
      mobile mode of the whole page. In an app, put
      `<ListVirtualizer minItemsCount={50}>` next to `Provider`: it brings back
      the v7 virtualization of every `Select` from 50 options. A library
      rendered only by apps with that wrapper relies on it; any other library
      follows *Which Selects to virtualize*.
   2. Entry points: `/unstable`, `/legacy`, moved and removed components, per
      the decisions.
   3. Component props.
   4. Layout components, with `migration-layout-v8.md` open.
   5. Themes, CSS tokens and class selectors.
   6. Tests, last. Change an assertion only where a guide says the behavior
      changed; any other failing test is a migration bug.
3. Install the optional peers of the entry points the code imports after the
   edits (the guide's *Dependencies* table), and `lodash` if the code imports
   it.

A section is done when its searches return only the hits the decisions keep,
such as `/legacy` imports.

## Step 6 — Verify

1. Typecheck, lint, build, unit, e2e and screenshot tests run. New
   `no-deprecated` reports on `/legacy` imports and `spacing()` calls are
   expected where the user chose to keep them.
2. One copy of uikit: `npm ls @gravity-ui/uikit` (`pnpm why`, `yarn why`) shows
   only 8.x, and the install printed no unresolved peer warning for it beyond
   the packages the user chose to force.
3. Rerun every Step 3 search: each remaining hit is one a decision keeps.
4. Open the screens with `Select` and `List` in a development build and read
   the console: uikit reports duplicate option values, long lists without
   virtualization, options without text, and rows rendered empty, under
   `[Select]` and `[List]`.
5. Walk [Silent changes](#silent-changes) for every row whose section or
   component the project uses. Check what reading the code can settle; list the
   rest for the user with the screens and widths to look at.
6. Report: the target version; the dependencies changed and any overrides; each
   decision with its answer, and the defaults applied; per section, what
   changed and which silent changes were checked and how; the tests that did
   not run; what stays on `/legacy` and `spacing()`; what the user still has to
   look at.
7. After the report, update screenshot and snapshot baselines only once the
   user has seen the diffs: theme colors shift on purpose, a layout shift may
   be a bug.

Done when: 1–3 pass, the report is sent, and the baselines stay untouched until
the user answers.

## Silent changes

The sections of `migration-to-v8.md` whose changes pass `tsc` and show only on
screen, in tests, or at runtime. The guide gives the values; this table says
where to look.

Code that `tsc` does not check (Step 1.2) adds every removed prop and moved
import to this list. `Sheet visible` never opens, `Modal onClose` never closes,
`Popup anchorRef` is not positioned, `TextInput error` shows nothing, and a
number in `gap` or `space` becomes pixels: `gap={2}` is 2px instead of 8.
Imports that left the root fail the build under Rollup and Vite; webpack only
warns, and then `Table` and `DropdownMenu` are `undefined` (`withTable*` throws
already at import). `List` and `Menu` from the root are new components behind
old-looking props: `List` renders empty rows or throws, `Menu` without
`trigger` or `inline` renders nothing, and `Menu.Group` is `undefined`.

| Guide section                                                  | What `tsc` misses                                                                                                                                                 | How to catch it                                                                  |
| :------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| *Layout breakpoints and container gutters*                     | The active breakpoint on narrow screens, without a provider, on the server and in jsdom; the width of `l`                                                         | The `s`-key search; SSR HTML and Jest snapshots; screens at 375, 1000 and 1400px |
| *Layout components*, `migration-layout-v8.md`                  | Values TypeScript accepts and CSS drops; box sizing; `Flex space` wrappers; `Col` sizing; `style` against a prop on the same property                            | The box-sizing search; numeric strings on layout props; wrapper selectors        |
| *ThemeProvider is split into separate providers*               | Mobile settings of nested providers; `Modal` and `Dialog` under `mobile`; the shared tooltip delay                                                                | Every nested provider; dialogs in mobile mode                                    |
| *Select*, `migration-select-v8.md`                             | Virtualization and popup width without the root wrapper; popup position; duplicate and empty values; the control padding; mobile close timing; test roles and the accessible name; `text` dropped from options built by `.map`, where no type error flags it | `text:` in option objects; the test search; `Select` screens                     |
| *Row heights of List, Select and Menu*                         | How many rows fit a fixed height                                                                                                                                  | Fixed-height lists and popups                                                    |
| *List*, *Table and TableColumnSetup*, *Menu and DropdownMenu*  | Renamed CSS blocks; `.g-menu` now styles the new `Menu`                                                                                                           | The class search                                                                 |
| *Themer v2 color tokens*                                       | Removed tokens resolve to nothing; colors shift                                                                                                                   | The checklist's theme search; snapshot diffs                                     |
| *TextInput, PasswordInput, TextArea, and NumberInput `onKeyPress`* | `onKeyDown` fires on more keys than `onKeyPress` did                                                                                                          | Each handler checks `event.key`                                                  |
| *`configure` and `getConfig`*                                  | A saved config goes stale                                                                                                                                         | `getConfig(` hits                                                                |
| *Dialog layout*                                                | Spacing, footer buttons, a removed class                                                                                                                          | Dialogs on screen                                                                |
| *Everything else*                                              | Most rows: the look and CSS hooks of `Progress`, `Checkbox`, `Radio`, `Switch`, `ActionsPanel`, `Toast`, popups, hover and `button-reset`                         | Screens; the class search                                                        |

## Traps the guide does not spell out

- **Steps vs pixels.** v7 numbers on gaps, spacings and gutters were scale steps
  and become `"spacing-N"`; numbers on sizes were pixels and become `"Npx"`. The
  guides state it per component, and mixing the two up compiles.
- **`s` to `xs`** applies wherever v7 ran without `fixBreakpoints`, including
  inside every nested v7 `ThemeProvider` without its own `layout`, which reset
  it to off.
- **`outlined-contrast` and `flat-contrast`**: the guide's replacement class
  keeps the v7 look except the border, which v7 drew with
  `--g-color-line-light`, and the disabled state, which needs the guide's
  `:disabled` rule.
