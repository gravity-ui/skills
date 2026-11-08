// @ts-nocheck: `@vercel/agent-eval/eval` is a vitest alias the fixture's tsc cannot resolve.
/**
 * app-landing — Build a compact Gravity UI landing with @gravity-ui/page-constructor. The expected
 * architecture follows the package's documented quick start, while the assertions deliberately accept
 * import aliases, extracted config variables, string/enum block types, and mapped feature collections.
 *
 * Binary eval (next-evals-oss style): the answer passes iff the project builds AND every test below passes.
 */
import {existsSync, readFileSync, readdirSync} from 'fs';
import {join} from 'path';
import {expect, test} from 'vitest';
import { environment } from '@vercel/agent-eval/eval';

type SourceFile = {path: string; text: string};

const PAGE_CONSTRUCTOR = '@gravity-ui/page-constructor';
const sourceFiles: SourceFile[] = [];

function collectSource(dir: string) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) collectSource(path);
    else if (/\.(tsx?|jsx?|css|scss|json|ya?ml)$/.test(entry.name)) {
      sourceFiles.push({path, text: readFileSync(path, 'utf8')});
    }
  }
}

collectSource('src');
collectSource('app');

function readPackageJson() {
  try {
    return JSON.parse(readFileSync('package.json', 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
  } catch {
    return {};
  }
}

const packageJson = readPackageJson();
const dependencies = {...packageJson.dependencies, ...packageJson.devDependencies};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function importedSpecifiers(text: string) {
  text = withoutComments(text);
  const result = new Set<string>();
  const patterns = [
    /\b(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\b(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /@import\s+(?:url\(\s*)?['"]~?([^'"]+)['"]/g,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) result.add(match[1]);
  }
  return result;
}

function importsPackage(text: string, packageName: string) {
  return [...importedSpecifiers(text)].some(
    (specifier) => specifier === packageName || specifier.startsWith(`${packageName}/`),
  );
}

function namedImportAliases(text: string, exportedName: string) {
  text = withoutComments(text);
  const aliases: string[] = [];
  const packageName = escapeRegExp(PAGE_CONSTRUCTOR);
  const pattern = new RegExp(`import\\s*\\{([\\s\\S]*?)\\}\\s*from\\s*['"]${packageName}['"]`, 'g');
  for (const match of text.matchAll(pattern)) {
    for (const rawItem of match[1].split(',')) {
      const item = rawItem.trim().replace(/^type\s+/, '');
      const parts = item.split(/\s+as\s+/);
      if (parts[0]?.trim() === exportedName) aliases.push((parts[1] || parts[0]).trim());
    }
  }
  return aliases;
}

function namespaceImportAliases(text: string) {
  text = withoutComments(text);
  const packageName = escapeRegExp(PAGE_CONSTRUCTOR);
  const pattern = new RegExp(`import\\s*\\*\\s*as\\s*([A-Za-z_$][\\w$]*)\\s*from\\s*['"]${packageName}['"]`, 'g');
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

function usesImportedComponent(file: SourceFile, exportedName: string) {
  const code = withoutComments(file.text);
  const localNames = namedImportAliases(file.text, exportedName);
  const qualifiedNames = namespaceImportAliases(file.text).map((alias) => `${alias}.${exportedName}`);
  return [...localNames, ...qualifiedNames].some((name) => {
    const escapedName = escapeRegExp(name);
    return (
      new RegExp(`<${escapedName}(?=[\\s/>])`).test(code) ||
      new RegExp(`\\bcreateElement\\(\\s*${escapedName}(?=[\\s,)])`).test(code)
    );
  });
}

function withoutComments(text: string) {
  let result = '';
  let quote = '';
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    const next = text[index + 1];

    if (lineComment) {
      if (char === '\n') {
        lineComment = false;
        result += '\n';
      } else {
        result += ' ';
      }
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        result += '  ';
        index++;
      } else {
        result += char === '\n' ? '\n' : ' ';
      }
      continue;
    }
    if (quote) {
      result += char;
      if (char === '\\') {
        result += next || '';
        index++;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      result += '  ';
      index++;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      result += '  ';
      index++;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') quote = char;
    result += char;
  }
  return result;
}

function findMatchingBracket(text: string, start: number) {
  const opening = text[start];
  const closing = opening === '[' ? ']' : opening === '{' ? '}' : opening === '(' ? ')' : '';
  if (!closing) return -1;

  let depth = 0;
  let quote = '';
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < text.length; index++) {
    const char = text[index];
    const next = text[index + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index++;
      }
      continue;
    }
    if (quote) {
      if (char === '\\') index++;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      index++;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      index++;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === opening) depth++;
    else if (char === closing && --depth === 0) return index;
  }
  return -1;
}

function splitTopLevelItems(value: string) {
  const items: string[] = [];
  let start = 0;
  let depth = 0;
  let quote = '';
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    const next = value[index + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index++;
      }
      continue;
    }
    if (quote) {
      if (char === '\\') index++;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      index++;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      index++;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '[' || char === '{' || char === '(') depth++;
    else if (char === ']' || char === '}' || char === ')') depth--;
    else if (char === ',' && depth === 0) {
      const item = value.slice(start, index).trim();
      if (item) items.push(item);
      start = index + 1;
    }
  }

  const lastItem = value.slice(start).trim();
  if (lastItem) items.push(lastItem);
  return items;
}

function arrayItemsAt(text: string, arrayStart: number) {
  const end = findMatchingBracket(text, arrayStart);
  return end < 0 ? [] : splitTopLevelItems(text.slice(arrayStart + 1, end));
}

function findInitializer(name: string) {
  const escapedName = escapeRegExp(name);
  const pattern = new RegExp(`\\b(?:const|let|var)\\s+${escapedName}\\b[^;=]*=\\s*`, 'g');
  for (const file of sourceFiles) {
    const match = pattern.exec(file.text);
    if (!match) continue;
    const start = match.index + match[0].length;
    const opening = file.text[start];
    if (opening !== '[' && opening !== '{') return file.text.slice(start).split(/[;,\n]/, 1)[0].trim();
    const end = findMatchingBracket(file.text, start);
    if (end >= 0) return file.text.slice(start, end + 1);
  }
  return '';
}

function resolveExpression(expression: string) {
  const value = expression.trim().replace(/^\.\.\./, '');
  return /^[A-Za-z_$][\w$]*$/.test(value) ? findInitializer(value) || value : value;
}

function findLandingBlocks() {
  const candidates: string[][] = [];
  const propertyPattern = /(?:['"]?blocks['"]?)\s*:\s*\[/g;
  const declarationPattern = /\b(?:const|let|var)\s+[A-Za-z_$][\w$]*blocks[\w$]*\b[^;=]*=\s*\[/gi;

  for (const file of sourceFiles) {
    for (const pattern of [propertyPattern, declarationPattern]) {
      pattern.lastIndex = 0;
      for (const match of file.text.matchAll(pattern)) {
        const arrayStart = match.index + match[0].lastIndexOf('[');
        const items = arrayItemsAt(file.text, arrayStart);
        if (items.length) candidates.push(items.map(resolveExpression));
      }
    }
  }

  return candidates.sort((left, right) => right.length - left.length)[0] || [];
}

const landingBlocks = findLandingBlocks();

function hasBlockType(expression: string, stringNames: RegExp, enumNames: RegExp) {
  expression = withoutComments(expression);
  const stringType = expression.match(/\btype\s*:\s*['"]([^'"]+)['"]/i)?.[1] || '';
  const enumType = expression.match(/\.([A-Za-z_$][\w$]*Block)\b/)?.[1] || '';
  return stringNames.test(stringType) || enumNames.test(enumType);
}

function isHeroBlock(expression: string) {
  return hasBlockType(expression, /(?:^|-)(?:hero|header)-block$/i, /^(?:Hero|Header)Block$/i);
}

function isFeatureBlock(expression: string) {
  return hasBlockType(
    expression,
    /(?:feature|benefit|advantage|card-layout)/i,
    /(?:Feature|Benefit|Advantage|CardLayout)Block/i,
  );
}

function isCtaBlock(expression: string) {
  expression = withoutComments(expression);
  return (
    hasBlockType(expression, /(?:banner|cta|call-to-action|promo)/i, /(?:Banner|Cta|CallToAction|Promo)Block/i) ||
    (/\btitle\s*:/.test(expression) && /\bbuttons?\s*:/.test(expression))
  );
}

function hasThreeItemArray(text: string) {
  const propertyPattern = /\b(?:children|items|features|advantages|benefits|cards)\s*:\s*\[/gi;
  for (const match of text.matchAll(propertyPattern)) {
    const arrayStart = match.index + match[0].lastIndexOf('[');
    if (arrayItemsAt(text, arrayStart).length === 3) return true;
  }
  return false;
}

function hasThreeAdvantages() {
  if (!landingBlocks.some(isFeatureBlock)) return false;
  if (landingBlocks.some((block) => isFeatureBlock(block) && hasThreeItemArray(block))) return true;

  const namedArray = /\b(?:const|let|var)\s+((?:features?|advantages?|benefits?|cards))\b[^;=]*=\s*\[/gi;
  for (const file of sourceFiles) {
    for (const match of file.text.matchAll(namedArray)) {
      const arrayStart = match.index + match[0].lastIndexOf('[');
      const referencedByFeatureBlock = landingBlocks.some(
        (block) => isFeatureBlock(block) && new RegExp(`\\b${escapeRegExp(match[1])}\\b`).test(block),
      );
      if (referencedByFeatureBlock && arrayItemsAt(file.text, arrayStart).length === 3) return true;
    }
  }
  return false;
}

test('declares @gravity-ui/page-constructor as a dependency', () => {
  expect(Object.hasOwn(dependencies, PAGE_CONSTRUCTOR)).toBe(true);
});



test('imports page-constructor styles', () => {
  const stylesPattern = /^@gravity-ui\/page-constructor\/styles\/.+\.(?:css|scss)$/;
  expect(sourceFiles.some((file) => [...importedSpecifiers(file.text)].some((specifier) => stylesPattern.test(specifier)))).toBe(true);
});




test('does not import a foreign landing or UI kit', () => {
  const bannedPackages = [
    'react-bootstrap',
    '@mui',
    'antd',
    '@chakra-ui',
    '@mantine',
    '@nextui-org',
    'flowbite',
    'daisyui',
    'semantic-ui-react',
    'tailwindcss',
  ];
  const usedPackages = new Set(sourceFiles.flatMap((file) => [...importedSpecifiers(file.text)]));
  const usesBannedPackage = [...usedPackages].some((specifier) =>
    bannedPackages.some((name) => specifier === name || specifier.startsWith(`${name}/`)),
  );
  expect(usesBannedPackage).toBe(false);
});

// Semantic check: an agentic judge reads the final project instead of pattern-matching the source,
// so correct-but-differently-spelled solutions pass and an unused import does not. Deterministic
// checks above still guard dependencies and foreign libraries.
test('judge: implements the task with the intended Gravity UI API', async () => {
  await expect(environment).toSatisfyCriterion(
    "The landing page is rendered by @gravity-ui/page-constructor: a PageConstructor wrapped in PageConstructorProvider, driven by a content config whose first block is a hero, which contains exactly three advantages/features, and whose last block is a call to action. Any block-type spelling, aliases or extracted config variables are fine; a hand-written page or another landing kit fails."
  );
});
