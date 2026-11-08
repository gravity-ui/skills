// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * edge-stale-api — Wrap the app in <ThemeProvider theme={theme}> or the all-in-one <Provider theme={theme}> newer uikit adds on top of it, from the @gravity-ui/uikit installed in the project (the version pin is the fixture's, not graded), drive the `theme` prop ('light'|'dark') from React state and optionally read the current theme with useTheme/useThemeValue/useThemeType — do NOT use a foreign theming lib (next-themes / @mui / styled-components ThemeProvider), a deprecated/hallucinated `mode` or `themeName` prop, or manual data-theme DOM toggling.
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

// The theme switcher must use the installed Gravity design system, not a foreign UI/theming library.
test("imports @gravity-ui/uikit", () => {
  expect(importsPackage(src, "@gravity-ui/uikit")).toBe(true);
});




// A `mode="dark"` style prop is the MUI/deprecated theming API, not Gravity's `theme` prop, so it signals the wrong/stale API.
test("no deprecated/foreign 'mode' theme prop", () => {
  expect(src).not.toMatch(new RegExp("mode=[\"'](dark|light)"));
});

// themeName is a deprecated/hallucinated ThemeProvider prop. Matching the JSX string-prop form `themeName="..."` avoids false-failing a correct answer that merely has a local variable named themeName.
test("no themeName prop", () => {
  expect(src).not.toMatch(new RegExp("themeName=[\"']"));
});

// next-themes is a foreign theming library; the task requires the design system's own current API.
test("no next-themes dependency", () => {
  expect(dependsOn(src, "next-themes")).toBe(false);
});

// Pulling in a foreign design system for theming instead of Gravity's ThemeProvider is the wrong approach.
test("no MUI dependency", () => {
  expect(dependsOn(src, "@mui/material")).toBe(false);
});

// Gravity applies the theme via ThemeProvider's root className; manual data-theme attribute manipulation bypasses the current DS API.
test("no manual data-theme DOM toggling", () => {
  expect(src).not.toMatch(new RegExp("data-theme"));
});

// A foreign theming lib instead of the design system's own current API.
test("no styled-components dependency", () => {
  expect(dependsOn(src, "styled-components")).toBe(false);
});

// Emotion theming instead of Gravity ThemeProvider is the wrong approach.
test("no @emotion/react dependency", () => {
  expect(dependsOn(src, "@emotion/react")).toBe(false);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The light/dark switch uses the theming API of the @gravity-ui/uikit version installed in the project (grade against that installed version; the version pin in package.json comes from the fixture and is not graded): ThemeProvider, or the all-in-one Provider that newer uikit versions add on top of it, with its `theme` prop ('light' | 'dark') driven by React state. Reading the active theme back through a uikit hook (useTheme, useThemeValue or useThemeType) is optional; showing it from local state is fine. Deprecated or invented props (mode, themeName), manual data-theme toggling or a foreign theming library fail."
  );
});
