// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * app-dashboard — Left rail = @gravity-ui/navigation <AsideHeader> driven by a menuItems array with compact/onChangeCompact for collapse-to-icons; center = @gravity-ui/table's <Table> built with the useTable hook, using selectionColumn for row selection, <ColumnReorderingProvider> for drag-to-reorder columns, and TanStack grouping (via @gravity-ui/table, re-exported from @gravity-ui/table/tanstack) for grouping rows by status. Not raw @tanstack/react-table, not a hand-rolled <aside>, not the generic uikit Table, not @gravity-ui/react-data-table, not app code importing @dnd-kit directly (it is a peer dependency of @gravity-ui/table, so it may be installed).
 *
 * Binary eval (next-evals-oss style): the answer passes iff the project builds AND every test below
 * passes. Checks were derived by deep research + adversarial audit against the Gravity UI v7 API.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { test, expect } from 'vitest';
import { environment } from '@vercel/agent-eval/eval';

// The agent's answer may span several files; these checks look across all source + package.json deps.
function allSource(): string {
  const chunks: string[] = [];
  const walk = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(tsx?|jsx?|css|scss)$/.test(entry.name)) chunks.push(readFileSync(p, 'utf-8'));
    }
  };
  walk('src');
  walk('app');
  return chunks.join('\n\n');
}
function mergedDeps(): Record<string, string> {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    return { ...pkg.dependencies, ...pkg.devDependencies };
  } catch {
    return {};
  }
}
function importsPackage(source: string, name: string): boolean {
  const e = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (
    new RegExp(`from\\s*['"]${e}(['"/])`).test(source) ||
    new RegExp(`import\\s*['"]${e}['"]`).test(source) ||
    name in mergedDeps()
  );
}
function dependsOn(source: string, name: string): boolean {
  const e = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const deps = mergedDeps();
  const declared = Object.keys(deps).some((k) => k === name || k.startsWith(name + '/'));
  return declared || new RegExp(`['"]${e}(['"/])`).test(source);
}

const src = allSource();

// The collapsible admin sidebar must come from the navigation package; absence means the nav was hand-rolled or from the wrong lib.
test("imports @gravity-ui/navigation", () => {
  expect(importsPackage(src, "@gravity-ui/navigation")).toBe(true);
});


// Row selection + column DnD + grouping require the specialized table package, not the uikit Table or a bare grid.
test("imports @gravity-ui/table", () => {
  expect(importsPackage(src, "@gravity-ui/table")).toBe(true);
});




// Adding raw TanStack Table as a project dependency is the generic-instead-of-Gravity anti-pattern; @gravity-ui/table already wraps it.
test("no direct @tanstack/react-table dep", () => {
  expect(dependsOn(src, "@tanstack/react-table")).toBe(false);
});

// Importing straight from @tanstack/react-table (instead of @gravity-ui/table or @gravity-ui/table/tanstack) means bypassing the Gravity wrapper.
test("no direct @tanstack/react-table import", () => {
  expect(importsPackage(src, "@tanstack/react-table")).toBe(false);
});

// The legacy react-data-table package does not provide the requested column DnD/grouping and is the wrong Gravity table choice.
test("no @gravity-ui/react-data-table", () => {
  expect(importsPackage(src, "@gravity-ui/react-data-table")).toBe(false);
});

// A raw <aside> means a self-written nav instead of AsideHeader. `(?![\w])` so `<aside\n className=...>` (newline before attrs) and `<aside/>` are also caught, not only `<aside ` / `<aside>`.
test("no hand-rolled <aside> sidebar", () => {
  expect(src).not.toMatch(new RegExp("<aside(?![\\w])"));
});

// Named risk: hand-rolling column DnD with raw @dnd-kit instead of @gravity-ui/table ColumnReorderingProvider.
// @dnd-kit/core and @dnd-kit/sortable are required peerDependencies of @gravity-ui/table, so having them
// in package.json is correct; importing them from app code is the anti-pattern.
test("no direct @dnd-kit import", () => {
  expect(src).not.toMatch(/from\s+['"]@dnd-kit\//);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The admin dashboard is built on Gravity UI: the left navigation is @gravity-ui/navigation's AsideHeader driven by menu items and able to collapse to icons (compact mode), and the central table is @gravity-ui/table built with the useTable hook with checkbox row selection, drag-to-reorder columns (ColumnReorderingProvider) and row grouping. A hand-rolled sidebar or a different table library fails."
  );
});
