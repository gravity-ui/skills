// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * app-vite-spa — Wrap the app in `ThemeProvider` from @gravity-ui/uikit with its `theme` prop driven by React state (light/dark), toggle it with a Gravity component (Button/Switch, optionally reading `useTheme`), and switch between the 2-3 pages via navigation built from Gravity components (Tabs/Button/Link/AsideHeader); any routing approach (react-router, hash or state) is acceptable since the prompt does not ask for URL routing - not raw &lt;button&gt;.
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

// App must actually use Gravity UIKit rather than raw HTML/CSS; absence means the model ignored the installed design system.
test("imports @gravity-ui/uikit", () => {
  expect(importsPackage(src, "@gravity-ui/uikit")).toBe(true);
});





// The theme switcher (and other controls) must use Gravity components; a raw <button> is the named wrong choice for the theme toggle.
test("no raw HTML button", () => {
  expect(src).not.toMatch(new RegExp("<button[\\s>]"));
});

// Pulling in a competing component library instead of Gravity UIKit defeats the purpose of the benchmark.
test("no foreign UI kit (MUI)", () => {
  expect(dependsOn(src, "@mui/material")).toBe(false);
});

// The single "no MUI" check only blocked @mui/material; block the other competing kits too.
test("no other foreign UI kit", () => {
  expect(src).not.toMatch(new RegExp("antd|@chakra-ui/|@mantine/core|react-bootstrap|@mui/joy"));
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The app is wrapped in @gravity-ui/uikit's ThemeProvider whose `theme` prop is driven by React state and toggled through a Gravity control (Button, Switch, SegmentedRadioGroup or similar), and navigation between the 2\u20133 pages is built from Gravity components (Tabs, Button, Link, AsideHeader or similar), not raw <button>/<a>. Any routing approach (react-router, hash or state) is acceptable."
  );
});
