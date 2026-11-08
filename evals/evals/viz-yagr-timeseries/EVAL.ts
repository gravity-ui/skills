// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * viz-yagr-timeseries - use Yagr directly for a dense, responsive, themed monitoring
 * time series with realtime updates and explicit React lifecycle cleanup.
 */
import {existsSync, readFileSync, readdirSync} from 'fs';
import {join} from 'path';
import {expect, test} from 'vitest';
import { environment } from '@vercel/agent-eval/eval';

type SourceFile = {path: string; text: string};

const sourceFiles: SourceFile[] = [];

function collectSource(dir: string) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) collectSource(path);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) sourceFiles.push({path, text: readFileSync(path, 'utf8')});
  }
}

function withoutComments(text: string) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function defaultImportAliases(packageName: string) {
  const packagePattern = escapeRegExp(packageName);
  const pattern = new RegExp(`import\\s+([A-Za-z_$][\\w$]*)\\s*from\\s*['"]${packagePattern}['"]`, 'g');
  return sourceFiles.flatMap((file) =>
    [...withoutComments(file.text).matchAll(pattern)].map((match) => match[1]),
  );
}

function mergedDependencies() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    return {...packageJson.dependencies, ...packageJson.devDependencies} as Record<string, string>;
  } catch {
    return {};
  }
}

collectSource('src');
collectSource('app');

const source = sourceFiles.map(({text}) => withoutComments(text)).join('\n\n');
const dependencies = mergedDependencies();
const yagrAliases = defaultImportAliases('@gravity-ui/yagr');
const yagrReactAliases = defaultImportAliases('@gravity-ui/yagr/react');

function rendersComponent(alias: string) {
  return new RegExp(`<${escapeRegExp(alias)}(?=[\\s/>])`).test(source);
}

const usesDirectYagr = yagrAliases.some((alias) =>
  new RegExp(`\\bnew\\s+${escapeRegExp(alias)}\\s*\\(`).test(source),
);
const usesYagrReact = yagrReactAliases.some(rendersComponent);

test('declares @gravity-ui/yagr as a dependency', () => {
  expect(Object.hasOwn(dependencies, '@gravity-ui/yagr')).toBe(true);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The CPU chart uses @gravity-ui/yagr (directly or through its official React wrapper) configured with a timeline and series data for tens of thousands of points, responsive (adaptive) sizing and the active Gravity theme; realtime updates mutate the existing chart (setConfig or the wrapper's data updates) instead of recreating it, and direct instances are disposed on unmount. A different charting library fails."
  );
});
