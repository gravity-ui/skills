// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * cross-markdown-editor — Use @gravity-ui/markdown-editor: create the instance with the useMarkdownEditor() hook and render it with the <MarkdownEditorView editor={editor} /> component (WYSIWYG + markup with live formatting). Do NOT use a foreign md editor (@uiw/react-md-editor, react-markdown) or a raw <textarea> + custom markdown parser.
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

// The canonical Gravity markdown-with-live-preview widget must be declared as a project dependency.
test("depends on @gravity-ui/markdown-editor", () => {
  expect(dependsOn(src, "@gravity-ui/markdown-editor")).toBe(true);
});

// Confirms the code actually pulls the editor from the correct Gravity package rather than only listing it in package.json.
test("imports @gravity-ui/markdown-editor", () => {
  expect(importsPackage(src, "@gravity-ui/markdown-editor")).toBe(true);
});



// A foreign markdown editor library is the wrong choice when Gravity ships its own.
test("no @uiw/react-md-editor", () => {
  expect(dependsOn(src, "@uiw/react-md-editor")).toBe(false);
});

// Pulling react-markdown signals a DIY textarea+preview build instead of the specialized Gravity editor.
test("no react-markdown DIY preview", () => {
  expect(dependsOn(src, "react-markdown")).toBe(false);
});

// A hand-rolled <textarea> as the markdown input is the forbidden raw-HTML DIY approach the task must avoid.
test("no raw textarea input", () => {
  expect(src).not.toMatch(new RegExp("<textarea[\\s/>]"));
});

// Injecting a self-parsed markdown string via dangerouslySetInnerHTML indicates a custom parser instead of MarkdownEditorView.
test("no dangerouslySetInnerHTML preview", () => {
  expect(src).not.toMatch(new RegExp("dangerouslySetInnerHTML"));
});

// A foreign markdown editor instead of Gravity markdown-editor.
test("no @mdxeditor/editor dependency", () => {
  expect(dependsOn(src, "@mdxeditor/editor")).toBe(false);
});

// SimpleMDE/EasyMDE is another foreign markdown editor that should not replace the Gravity one.
test("no react-simplemde-editor dependency", () => {
  expect(dependsOn(src, "react-simplemde-editor")).toBe(false);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The markdown field is @gravity-ui/markdown-editor: an editor created with the useMarkdownEditor hook and rendered with MarkdownEditorView, giving live formatting as the user types. A raw textarea with a custom preview or a foreign markdown editor fails."
  );
});
