// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * comp-modal-confirm — Use @gravity-ui/uikit's Dialog (controlled by the `open` prop, with Dialog.Header/Dialog.Body/Dialog.Footer, footer wired via textButtonApply/textButtonCancel + onClickButtonApply/onClickButtonCancel or two Button children) triggered by a Button from the same package; @gravity-ui/components' ConfirmDialog (a wrapper over the same uikit Dialog) is equally acceptable — no foreign modal library, no raw HTML dialog element, and not the lower-level Modal primitive with hand-built buttons.
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

// The modal and trigger button must come from Gravity UI; absence means a foreign lib or raw HTML was used.
test("imports @gravity-ui/uikit", () => {
  expect(importsPackage(src, "@gravity-ui/uikit")).toBe(true);
});




// react-modal is the known wrong choice instead of Gravity Dialog.
test("no react-modal dependency", () => {
  expect(dependsOn(src, "react-modal")).toBe(false);
});

// Using MUI Dialog/Modal instead of Gravity's is a foreign-lib violation.
test("no MUI dependency", () => {
  expect(dependsOn(src, "@mui/material")).toBe(false);
});

// Using antd Modal instead of Gravity Dialog is a foreign-lib violation.
test("no antd dependency", () => {
  expect(dependsOn(src, "antd")).toBe(false);
});

// A hand-rolled native dialog element bypasses the Gravity Dialog component; case-sensitive so it won't match Gravity's Dialog.
test("no raw HTML dialog element", () => {
  expect(src).not.toMatch(new RegExp("<dialog[\\s/>]"));
});

// Radix Dialog is a foreign modal primitive instead of Gravity Dialog.
test("no @radix-ui/react-dialog dependency", () => {
  expect(dependsOn(src, "@radix-ui/react-dialog")).toBe(false);
});

// HeadlessUI Dialog is a foreign modal library instead of Gravity Dialog.
test("no @headlessui/react dependency", () => {
  expect(dependsOn(src, "@headlessui/react")).toBe(false);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "A Gravity Button opens @gravity-ui/uikit's Dialog, controlled through its `open` prop, showing text and two actions \u2014 confirm and cancel \u2014 wired through Dialog.Footer (textButtonApply/textButtonCancel with the click handlers) or two Button children. @gravity-ui/components' ConfirmDialog, which wraps that same uikit Dialog, passes too. No foreign modal library, no raw <dialog>, and not the bare uikit Modal primitive."
  );
});
