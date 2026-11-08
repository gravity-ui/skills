// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * comp-actions-menu — Use the purpose-built DropdownMenu from @gravity-ui/uikit: `<DropdownMenu items={[...]} />`, which renders a switcher button that opens a menu of action items on click (items array carries the several action entries; a custom trigger goes via renderSwitcher/defaultSwitcherProps). Do NOT hand-roll a menu with raw <ul>/<div> + useState, and do NOT pull in a foreign menu lib (antd Dropdown, MUI Menu, Radix DropdownMenu).
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

// The correct answer must build on the installed Gravity uikit rather than a foreign UI library.
test("imports @gravity-ui/uikit", () => {
  expect(importsPackage(src, "@gravity-ui/uikit")).toBe(true);
});



// A raw <ul>/<li> list is the known wrong choice (hand-rolled menu instead of the Gravity component).
test("no raw HTML list menu", () => {
  expect(src).not.toMatch(new RegExp("<ul[\\s>]"));
});

// Ant Design's Dropdown/Menu is a foreign library that must not replace Gravity's DropdownMenu.
test("no antd dropdown", () => {
  expect(dependsOn(src, "antd")).toBe(false);
});

// MUI Menu/Button is a foreign library and an incorrect substitute for the Gravity component.
test("no MUI menu", () => {
  expect(dependsOn(src, "@mui/material")).toBe(false);
});

// Radix dropdown is a foreign primitive lib and an incorrect substitute for Gravity's DropdownMenu.
test("no Radix dropdown", () => {
  expect(dependsOn(src, "@radix-ui/react-dropdown-menu")).toBe(false);
});

// The named risk is a hand-rolled raw ul/li menu instead of DropdownMenu; <li means the list was built by hand.
test("no raw <li> list items", () => {
  expect(src).not.toMatch(new RegExp("<li[\\s>]"));
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The button opens its list of actions through @gravity-ui/uikit's DropdownMenu with the actions supplied as `items` (a custom trigger via renderSwitcher is fine). A menu assembled from raw lists/divs with useState, or a third-party menu library, fails."
  );
});
