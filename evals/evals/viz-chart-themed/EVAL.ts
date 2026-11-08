// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * viz-chart-themed — Use @gravity-ui/charts: render `<Chart data={...} />` (imported from '@gravity-ui/charts') with a series of `type: 'line'`; theming is automatic because the component reads the active Gravity theme from the already-wired @gravity-ui/uikit ThemeProvider (light/dark), so no manual color wiring is needed.
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

// The canonical themed-chart library must be imported; without it the answer can't be using Gravity's theme-aware Chart.
test("imports @gravity-ui/charts", () => {
  expect(importsPackage(src, "@gravity-ui/charts")).toBe(true);
});

// package.json must declare the correct charting library, confirming it was actually added rather than faked.
test("depends on @gravity-ui/charts", () => {
  expect(dependsOn(src, "@gravity-ui/charts")).toBe(true);
});



// ChartKit is the older plugin-based lib and not the canonical direct themed-chart approach for this task.
test("no @gravity-ui/chartkit", () => {
  expect(importsPackage(src, "@gravity-ui/chartkit")).toBe(false);
});

// Recharts is a foreign library that does not follow the Gravity light/dark theme automatically.
test("no recharts", () => {
  expect(dependsOn(src, "recharts")).toBe(false);
});

// chart.js is a foreign non-Gravity charting lib that won't match the app theme out of the box.
test("no chart.js", () => {
  expect(dependsOn(src, "chart.js")).toBe(false);
});

// Hand-drawing on a raw canvas bypasses Gravity and cannot track the theme. `[\s/>]` also catches a self-closing <canvas/>.
test("no raw <canvas>", () => {
  expect(src).not.toMatch(new RegExp("<canvas[\\s/>]"));
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The line chart is @gravity-ui/charts' Chart component with a series of type 'line'; it follows the app theme because it reads the active Gravity theme from the surrounding ThemeProvider, with no manual color wiring. Chartkit, recharts, chart.js or a raw canvas fail."
  );
});
