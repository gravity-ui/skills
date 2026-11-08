// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * comp-data-table — Use @gravity-ui/uikit Table composed with the withTableSorting and withTableSelection HOCs (withTableSelection renders the checkbox row-selection column via selectedIds/onSelectionChange; withTableSorting enables per-column sorting via columns meta.sort), plus the separate @gravity-ui/uikit Pagination component (page/pageSize/total/onUpdate) driving a sliced data array. E.g. const MyTable = withTableSorting(withTableSelection(Table)).
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

// The whole canonical solution (Table, HOCs, Pagination) lives in this package; missing it means a foreign or hand-rolled implementation.
test("imports @gravity-ui/uikit", () => {
  expect(importsPackage(src, "@gravity-ui/uikit")).toBe(true);
});




// Pulling in TanStack Table (or @gravity-ui/table under it) is the wrong choice when a uikit-only solution is expected.
test("no @tanstack/react-table dependency", () => {
  expect(dependsOn(src, "@tanstack/react-table")).toBe(false);
});

// A hand-built lowercase <table> means sorting/selection/pagination were reimplemented instead of using the Gravity Table. `[\s>]` (any whitespace) also catches `<table\n className=...>`.
test("no raw HTML <table>", () => {
  expect(src).not.toMatch(new RegExp("<table[\\s>]"));
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The data table is @gravity-ui/uikit's Table with column sorting (withTableSorting or an equivalent uikit mechanism), checkbox row selection (withTableSelection with selectedIds/onSelectionChange or equivalent) and pagination through uikit's Pagination component driving the displayed slice of rows."
  );
});
