// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * comp-settings-form — Build the profile-settings form entirely from @gravity-ui/uikit controls: TextInput for name and email, Select for interface language and timezone (single-select), Switch for the two-factor-auth toggle, Checkbox for each of the three email-notification options, and two Button elements for Save/Cancel. No raw HTML <input type=text>/<select>, no hand-rolled div toggle, and no foreign UI library (MUI/AntD/Chakra/react-select). The avatar upload may use a native <input type="file"> (uikit has no visible file control; its useFileInput hook renders exactly that, triggered by a Gravity Button).
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

// The whole form must be built from the installed Gravity uikit; absence means a foreign or raw-HTML approach.
test("imports @gravity-ui/uikit", () => {
  expect(importsPackage(src, "@gravity-ui/uikit")).toBe(true);
});






// A raw <select> means the model skipped the Gravity Select component.
test("no raw HTML select", () => {
  expect(src).not.toMatch(new RegExp("<select[\\s>]"));
});

// A raw <input type="text"> means TextInput was bypassed. Anchored on a lowercase <input ...> so it does NOT false-fail on a legitimate <TextInput type="text"> (Gravity's TextInput accepts a type prop); file inputs use type=file and are still allowed.
test("no raw text input", () => {
  expect(src).not.toMatch(new RegExp("<input[^>]*type=[\"']text"));
});

// Toggle is the wrong/nonexistent name; the correct toggle control in uikit is Switch.
test("no Toggle component", () => {
  expect(src).not.toMatch(new RegExp("<Toggle(?![\\w])"));
});

// MUI/AntD/Chakra/react-select would replace the required Gravity controls with a foreign library.
test("no foreign UI libs", () => {
  expect(src).not.toMatch(new RegExp("@mui/|antd|@chakra-ui|react-select"));
});

// Named risk: using a hallucinated <Dropdown> (does not exist in uikit v7 — only DropdownMenu) instead of Select. `<Dropdown(?![\w])` does not match <DropdownMenu.
test("no Dropdown component", () => {
  expect(src).not.toMatch(new RegExp("<Dropdown(?![\\w])"));
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The profile settings form is built from @gravity-ui/uikit controls: TextInput for name and email, Select for interface language and timezone, Switch for the two-factor toggle, Checkbox for each email-notification option, and Button for Save and Cancel. Raw HTML text inputs/selects or hand-rolled toggles fail. The avatar upload is the exception: a native file input (ideally hidden behind uikit's useFileInput and a Gravity Button) is the documented way and passes."
  );
});
