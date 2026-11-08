// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * viz-widgets-dashboard — Build the freely-rearrangeable widget grid with @gravity-ui/dashkit: render a single <DashKit> component driven by a `config`, register widgets via DashKit.registerPlugins or DashKit.reloadPlugins (e.g. pluginTitle/pluginText/custom), and enable dragging/resizing/free placement with the `editMode` prop — do NOT hand-roll a grid or pull in react-grid-layout directly.
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

// DashKit is the canonical Gravity library for a configurable, drag-and-drop widget dashboard grid; without importing it the solution can't be canonical.
test("imports @gravity-ui/dashkit", () => {
  expect(importsPackage(src, "@gravity-ui/dashkit")).toBe(true);
});

// The dashboard-grid dependency must be declared, confirming the model chose the specialized Gravity package rather than a foreign or hand-built grid.
test("@gravity-ui/dashkit in package.json", () => {
  expect(dependsOn(src, "@gravity-ui/dashkit")).toBe(true);
});




// Directly importing react-grid-layout signals a self-made grid instead of DashKit (which wraps it internally); the generated code should never import it directly.
test("no direct react-grid-layout import", () => {
  expect(importsPackage(src, "react-grid-layout")).toBe(false);
});

// Declaring react-grid-layout as a direct dependency indicates the model built the draggable grid itself rather than using @gravity-ui/dashkit.
test("react-grid-layout not a direct dep", () => {
  expect(dependsOn(src, "react-grid-layout")).toBe(false);
});

// A CSS grid-template layout is the fingerprint of a самописная сетка — but only when DashKit is absent:
// a canonical DashKit answer may still legitimately use CSS grid for incidental page chrome (KPI rows, sidebars),
// so the ban is conditional on the widget grid itself not being DashKit.
const usesDashKit = /<DashKit(?![\w])/.test(src);

test("no hand-rolled CSS grid layout", () => {
  expect(usesDashKit || !new RegExp("gridTemplate(Columns|Rows|Areas)?\\s*[:=]").test(src)).toBe(true);
});

// The camelCase check only catches JS inline styles; a самописная сетка often puts hyphenated grid-template-columns in a .css/.scss file. This closes that gap (same DashKit condition).
test("no hand-rolled CSS-file grid", () => {
  expect(usesDashKit || !new RegExp("grid-template-(columns|rows|areas)\\s*:").test(src)).toBe(true);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The widget grid is a single @gravity-ui/dashkit DashKit driven by a config, with widgets registered through DashKit.registerPlugins or DashKit.reloadPlugins and free dragging/resizing enabled through its editMode prop. A hand-rolled grid or a direct react-grid-layout fails."
  );
});
