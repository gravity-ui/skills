// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * comp-toast — Use @gravity-ui/uikit's Toaster system: create a Toaster instance (or import the pre-made `@gravity-ui/uikit/toaster-singleton`), wrap the app in <ToasterProvider toaster={...}> and render <ToasterComponent/>, then in a component get `add` from `useToaster()` and call `add({name, title, theme, autoHiding})` on a Gravity <Button> click. autoHiding (default 5000ms) makes the toast disappear by itself. Do NOT pull in react-toastify / react-hot-toast / sonner / notistack or hand-roll a fixed-position div + setTimeout toast.
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

// The Toaster, ToasterProvider, ToasterComponent and useToaster all come from @gravity-ui/uikit; without this import the answer isn't using Gravity at all.
test("imports @gravity-ui/uikit", () => {
  expect(importsPackage(src, "@gravity-ui/uikit")).toBe(true);
});




// react-toastify is the canonical wrong choice - a foreign toast library instead of the built-in Gravity Toaster.
test("no react-toastify", () => {
  expect(dependsOn(src, "react-toastify")).toBe(false);
});

// react-hot-toast is another foreign toast library that should not be added when Gravity already ships a Toaster.
test("no react-hot-toast", () => {
  expect(dependsOn(src, "react-hot-toast")).toBe(false);
});

// sonner is a popular third-party toast lib; using it means ignoring the Gravity Toaster.
test("no sonner", () => {
  expect(dependsOn(src, "sonner")).toBe(false);
});

// notistack (MUI snackbar ecosystem) is a foreign notification lib that should not replace the Gravity Toaster.
test("no notistack", () => {
  expect(dependsOn(src, "notistack")).toBe(false);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "Clicking a Gravity Button shows a notification through @gravity-ui/uikit's Toaster system: a Toaster instance or the toaster singleton provided via ToasterProvider, a mounted ToasterComponent, and the toast added with add() from useToaster() or called directly on the Toaster instance / singleton that was passed to ToasterProvider (the hook only returns that same instance), so it hides by itself (autoHiding). A hand-rolled fixed div with setTimeout, or a third-party toast library, fails."
  );
});
