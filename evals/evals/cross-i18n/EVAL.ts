// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * cross-i18n — Use Gravity's built-in i18n: call configure({lang}) from @gravity-ui/uikit to switch UIKit interface language between 'en' and 'ru', driven from a Gravity switcher control (SegmentedRadioGroup/RadioButton or Select) via value/onUpdate; for app strings use the Gravity-native @gravity-ui/i18n (I18N class with registerKeysets/setLang/i18n). Do NOT add foreign i18n libs (react-i18next, i18next, react-intl) or a raw HTML <select>.
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


// The language switch and configure() come from Gravity UIKit; ensures the solution is built on Gravity rather than an entirely foreign stack.
test("imports configure/Lang from @gravity-ui/uikit", () => {
  expect(importsPackage(src, "@gravity-ui/uikit")).toBe(true);
});


// A native <select> instead of Gravity's Select/SegmentedRadioGroup is the wrong, non-Gravity way to build the switcher.
test("no raw HTML <select> switcher", () => {
  expect(src).not.toMatch(new RegExp("<select[\\s>]"));
});

// i18next is a foreign i18n runtime; the Gravity-native path (configure / @gravity-ui/i18n) makes it unnecessary.
test("no i18next dependency", () => {
  expect(dependsOn(src, "i18next")).toBe(false);
});

// react-i18next is the known wrong choice replacing Gravity's built-in i18n.
test("no react-i18next dependency", () => {
  expect(dependsOn(src, "react-i18next")).toBe(false);
});

// react-intl is another foreign i18n library that should not be pulled in when Gravity's i18n is available.
test("no react-intl / FormatJS dependency", () => {
  expect(dependsOn(src, "react-intl")).toBe(false);
});

// Catches source-level use of the foreign i18n binding even if package.json was left untouched.
test("no react-i18next import in source", () => {
  expect(importsPackage(src, "react-i18next")).toBe(false);
});

// Catches a foreign i18n runtime used at the JSX level (react-i18next Trans, react-intl IntlProvider/FormattedMessage) even if package.json was left untouched.
test("no foreign i18n provider/component in JSX", () => {
  expect(src).not.toMatch(new RegExp("<(I18nextProvider|IntlProvider|Trans|FormattedMessage)[\\s/><]"));
});

// FormatJS/react-intl is another foreign i18n stack that should not replace Gravity i18n.
test("no @formatjs/intl dependency", () => {
  expect(dependsOn(src, "@formatjs/intl")).toBe(false);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "Interface language switches between English and Russian using Gravity's built-in i18n: @gravity-ui/uikit's configure({lang}) is called when the user changes the language through a Gravity control (SegmentedRadioGroup, RadioGroup, Select or similar). Foreign i18n libraries fail."
  );
});
