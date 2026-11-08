// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * cross-theme-persist — Wrap the app in `<ThemeProvider theme={theme}>` from @gravity-ui/uikit (prop is `theme`, values 'system'|'light'|'light-hc'|'dark'|'dark-hc'), hold the theme in React state initialized from `localStorage.getItem(...)`, write every change back with `localStorage.setItem(...)`, and drive it with a Gravity control (Switch / SegmentedRadioGroup / RadioGroup / Button). ThemeProvider exposes no setter and useTheme/useThemeValue only read, so persistence is app-managed.
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

// The whole theming stack (ThemeProvider) lives here; absence means a foreign UI/theme kit was used instead of Gravity.
test("imports @gravity-ui/uikit", () => {
  expect(importsPackage(src, "@gravity-ui/uikit")).toBe(true);
});





// Anchored to the ThemeProvider tag so it only flags genuinely-wrong props on ThemeProvider (mode/value/themeName/…), not an ordinary local `const themeName = ...` in a correct answer.
test("no wrong ThemeProvider prop", () => {
  expect(src).not.toMatch(new RegExp("<ThemeProvider[^>]*\\b(themeName|defaultTheme|colorScheme|mode|value)\\s*="));
});

// next-themes is the common non-Gravity way to persist theme; using it bypasses ThemeProvider entirely.
test("no foreign theme-persistence lib", () => {
  expect(dependsOn(src, "next-themes")).toBe(false);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The theme is applied through @gravity-ui/uikit's ThemeProvider `theme` prop driven by React state, switched with a Gravity control, and persisted: the initial state is read from localStorage and every change is written back, so the choice survives a page reload."
  );
});
