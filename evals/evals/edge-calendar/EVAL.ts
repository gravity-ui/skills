// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * edge-calendar — Render the inline `Calendar` (or `RangeCalendar`) component from `@gravity-ui/date-components` — `import {Calendar} from '@gravity-ui/date-components'` (peer dep `@gravity-ui/date-utils`); Calendar does NOT exist in @gravity-ui/uikit.
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

// The only Gravity library that provides a calendar; must be added to package.json rather than a foreign date lib.
test("deps @gravity-ui/date-components", () => {
  expect(dependsOn(src, "@gravity-ui/date-components")).toBe(true);
});

// Source must actually import from the correct package, not just list it as a dependency.
test("imports @gravity-ui/date-components", () => {
  expect(importsPackage(src, "@gravity-ui/date-components")).toBe(true);
});


// Catches the common hallucination of importing Calendar from uikit, where it does not exist.
test("no Calendar imported from @gravity-ui/uikit", () => {
  expect(src).not.toMatch(new RegExp("import\\s*\\{[^}]*\\bCalendar\\b[^}]*\\}\\s*from\\s*['\"]@gravity-ui/uikit['\"]"));
});

// Foreign date-picker library used instead of the Gravity date-components calendar.
test("no react-datepicker dep", () => {
  expect(dependsOn(src, "react-datepicker")).toBe(false);
});

// Foreign calendar library used instead of the Gravity solution.
test("no react-calendar dep", () => {
  expect(dependsOn(src, "react-calendar")).toBe(false);
});

// Another foreign calendar/date library that would replace the canonical Gravity Calendar.
test("no react-day-picker dep", () => {
  expect(dependsOn(src, "react-day-picker")).toBe(false);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The date is picked with a calendar component from @gravity-ui/date-components (Calendar, RangeCalendar or a DatePicker from that package). A Calendar imported from @gravity-ui/uikit does not exist and fails; third-party date pickers fail."
  );
});
