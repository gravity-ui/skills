// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * viz-chartkit-mixed - use ChartKit as the single lazy plugin dispatcher for both the
 * gravity-charts and Yagr engines.
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

function importedSpecifiers(text: string) {
  const result = new Set<string>();
  for (const match of withoutComments(text).matchAll(/\bimport\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g)) {
    result.add(match[1]);
  }
  return result;
}

function importClauses(packageName: string) {
  const clauses: string[] = [];
  const packagePattern = escapeRegExp(packageName);
  const pattern = new RegExp(`\\bimport\\s+([^;]+?)\\s+from\\s*['"]${packagePattern}['"]`, 'g');
  for (const file of sourceFiles) {
    for (const match of withoutComments(file.text).matchAll(pattern)) clauses.push(match[1].trim());
  }
  return clauses;
}

function namedImportAliases(packageName: string, exportedName: string) {
  const aliases: string[] = [];
  for (const clause of importClauses(packageName)) {
    const namedImports = clause.match(/\{([\s\S]*?)\}/)?.[1];
    if (!namedImports) continue;
    for (const rawItem of namedImports.split(',')) {
      const parts = rawItem.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
      if (parts[0]?.trim() === exportedName) aliases.push((parts[1] || parts[0]).trim());
    }
  }
  return aliases;
}

function defaultImportAliases(packageName: string) {
  return importClauses(packageName)
    .map((clause) => clause.split(',', 1)[0].trim())
    .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));
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
const chartKitAliases = defaultImportAliases('@gravity-ui/chartkit');
const settingsAliases = namedImportAliases('@gravity-ui/chartkit', 'settings');
const gravityChartsPluginAliases = namedImportAliases(
  '@gravity-ui/chartkit/gravity-charts',
  'GravityChartsPlugin',
);
const yagrPluginAliases = namedImportAliases('@gravity-ui/chartkit/yagr', 'YagrPlugin');

function importsExactly(packageName: string) {
  return sourceFiles.some((file) => importedSpecifiers(file.text).has(packageName));
}

function identifierIsUsed(alias: string) {
  const codeWithoutImports = source.replace(/^\s*import[\s\S]*?;\s*$/gm, '');
  return new RegExp(`\\b${escapeRegExp(alias)}\\b`).test(codeWithoutImports);
}

test('declares @gravity-ui/chartkit as a dependency', () => {
  expect(Object.hasOwn(dependencies, '@gravity-ui/chartkit')).toBe(true);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "One @gravity-ui/chartkit ChartKit widget dispatches both modes: the gravity-charts and Yagr plugins are registered through ChartKit's settings plugin registry, and the switch between the sales line chart and the dense monitoring time series selects the engine through ChartKit's `type` prop with matching data. Separate hand-wired charts or a foreign chart library fail."
  );
});
