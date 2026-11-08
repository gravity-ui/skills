/**
 * Небольшой парсер markdown в AST (без зависимостей, без HTML на выходе).
 *
 * Поддерживается подмножество CommonMark + GFM, которого достаточно для текстовых
 * полей форм: заголовки (ATX и setext), абзацы, жирный/курсив/зачёркнутый текст,
 * inline-код и блоки кода, ссылки, картинки, цитаты, списки (в том числе
 * вложенные и чеклисты), горизонтальные линии и таблицы.
 *
 * Сырой HTML намеренно не поддерживается: он выводится как обычный текст.
 */

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'em'; children: InlineNode[] }
  | { type: 'del'; children: InlineNode[] }
  | { type: 'link'; href: string; children: InlineNode[] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'break' };

export type TableAlign = 'left' | 'center' | 'right' | null;

export interface ListItem {
  /** `null` — обычный пункт, иначе чекбокс `[ ]` / `[x]` */
  checked: boolean | null;
  children: BlockNode[];
}

export type BlockNode =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'code'; lang: string | null; value: string }
  | { type: 'blockquote'; children: BlockNode[] }
  | { type: 'list'; ordered: boolean; start: number; tight: boolean; items: ListItem[] }
  | { type: 'hr' }
  | { type: 'table'; align: TableAlign[]; header: InlineNode[][]; rows: InlineNode[][][] };

/* ───────────────────────────── блоки ───────────────────────────── */

const FENCE_RE = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)\s*$/;
const ATX_RE = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const HR_RE = /^ {0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const SETEXT_RE = /^ {0,3}(=+|-+)[ \t]*$/;
const QUOTE_RE = /^ {0,3}>[ ]?(.*)$/;
const LIST_RE = /^( {0,3})([-*+]|\d{1,9}[.)])( +|$)(.*)$/;
const TASK_RE = /^\[([ xX])\] +/;
const TABLE_SEP_RE = /^ {0,3}\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

const isBlank = (line: string) => line.trim() === '';

/** Начинается ли на этой строке блок, который прерывает абзац. */
function startsBlock(line: string): boolean {
  return (
    FENCE_RE.test(line) ||
    ATX_RE.test(line) ||
    HR_RE.test(line) ||
    QUOTE_RE.test(line) ||
    LIST_RE.test(line)
  );
}

export function parseMarkdown(source: string): BlockNode[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  return parseBlocks(lines);
}

function parseBlocks(lines: string[]): BlockNode[] {
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    // ```code```
    const fence = FENCE_RE.exec(line);
    if (fence) {
      const marker = fence[1];
      const lang = fence[2] || null;
      const body: string[] = [];
      i += 1;
      while (i < lines.length) {
        const closing = FENCE_RE.exec(lines[i]);
        if (closing && closing[1][0] === marker[0] && closing[1].length >= marker.length && !closing[2]) {
          i += 1;
          break;
        }
        body.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: 'code', lang, value: body.join('\n') });
      continue;
    }

    // # Заголовок
    const atx = ATX_RE.exec(line);
    if (atx) {
      blocks.push({
        type: 'heading',
        level: atx[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        children: parseInline(atx[2] ?? ''),
      });
      i += 1;
      continue;
    }

    // ---
    if (HR_RE.test(line)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    // > цитата
    if (QUOTE_RE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length) {
        const m = QUOTE_RE.exec(lines[i]);
        if (m) {
          inner.push(m[1]);
        } else if (!isBlank(lines[i]) && inner.length > 0 && !startsBlock(lines[i]) && !isBlank(inner[inner.length - 1])) {
          // «ленивое» продолжение абзаца внутри цитаты
          inner.push(lines[i]);
        } else {
          break;
        }
        i += 1;
      }
      blocks.push({ type: 'blockquote', children: parseBlocks(inner) });
      continue;
    }

    // списки
    if (LIST_RE.test(line)) {
      const [list, next] = parseList(lines, i);
      blocks.push(list);
      i = next;
      continue;
    }

    // | таблица |
    if (line.includes('|') && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) {
      const header = splitRow(line);
      const align = splitRow(lines[i + 1]).map(parseAlign);
      if (header.length === align.length) {
        const rows: string[][] = [];
        i += 2;
        while (i < lines.length && !isBlank(lines[i]) && lines[i].includes('|')) {
          rows.push(splitRow(lines[i]));
          i += 1;
        }
        blocks.push({
          type: 'table',
          align,
          header: header.map(parseInline),
          rows: rows.map((row) =>
            Array.from({ length: header.length }, (_, col) => parseInline(row[col] ?? '')),
          ),
        });
        continue;
      }
    }

    // абзац (с возможным setext-заголовком под ним)
    const para: string[] = [line];
    i += 1;
    let setext: 1 | 2 | null = null;
    while (i < lines.length && !isBlank(lines[i])) {
      const s = SETEXT_RE.exec(lines[i]);
      if (s) {
        setext = s[1][0] === '=' ? 1 : 2;
        i += 1;
        break;
      }
      if (startsBlock(lines[i])) break;
      para.push(lines[i]);
      i += 1;
    }
    const text = para.map((l) => l.trim()).join('\n');
    if (setext) {
      blocks.push({ type: 'heading', level: setext, children: parseInline(text) });
    } else {
      blocks.push({ type: 'paragraph', children: parseInline(text) });
    }
  }

  return blocks;
}

function parseList(lines: string[], start: number): [BlockNode & { type: 'list' }, number] {
  const first = LIST_RE.exec(lines[start])!;
  const ordered = /\d/.test(first[2]);
  const startNumber = ordered ? parseInt(first[2], 10) : 1;
  const items: ListItem[] = [];
  let loose = false;
  let i = start;

  while (i < lines.length) {
    const m = LIST_RE.exec(lines[i]);
    if (!m || /\d/.test(m[2]) !== ordered) break;

    // отступ содержимого пункта: отступ + маркер + пробелы после него
    const contentIndent = m[1].length + m[2].length + Math.min(Math.max(m[3].length, 1), 4);
    const itemLines: string[] = [m[4]];
    i += 1;

    let sawBlank = false;
    while (i < lines.length) {
      const l = lines[i];
      const indent = l.length - l.trimStart().length;
      if (isBlank(l)) {
        itemLines.push('');
        sawBlank = true;
        i += 1;
        continue;
      }
      if (indent >= contentIndent) {
        itemLines.push(l.slice(contentIndent));
        i += 1;
        continue;
      }
      // «ленивое» продолжение абзаца без отступа
      const prev = itemLines[itemLines.length - 1];
      if (!sawBlank && prev !== undefined && !isBlank(prev) && !startsBlock(l)) {
        itemLines.push(l.trim());
        i += 1;
        continue;
      }
      break;
    }

    // хвостовые пустые строки не считаются частью пункта
    while (itemLines.length > 0 && isBlank(itemLines[itemLines.length - 1])) itemLines.pop();
    if (itemLines.some(isBlank)) loose = true;
    // пустая строка между пунктами делает список «рыхлым»
    if (sawBlank && i < lines.length) {
      const nextItem = LIST_RE.exec(lines[i]);
      if (nextItem && /\d/.test(nextItem[2]) === ordered) loose = true;
    }

    let checked: boolean | null = null;
    const task = TASK_RE.exec(itemLines[0]);
    if (task) {
      checked = task[1] !== ' ';
      itemLines[0] = itemLines[0].slice(task[0].length);
    }

    items.push({ checked, children: parseBlocks(itemLines) });
  }

  return [{ type: 'list', ordered, start: startNumber, tight: !loose, items }, i];
}

function splitRow(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inCode = false;
  const trimmed = line.trim();
  for (let k = 0; k < trimmed.length; k += 1) {
    const ch = trimmed[k];
    if (ch === '\\' && trimmed[k + 1] === '|') {
      cur += '|';
      k += 1;
    } else if (ch === '`') {
      inCode = !inCode;
      cur += ch;
    } else if (ch === '|' && !inCode) {
      cells.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  if (trimmed.startsWith('|')) cells.shift();
  if (trimmed.endsWith('|') && !trimmed.endsWith('\\|')) cells.pop();
  return cells.map((c) => c.trim());
}

function parseAlign(cell: string): TableAlign {
  const left = cell.startsWith(':');
  const right = cell.endsWith(':');
  if (left && right) return 'center';
  if (left) return 'left';
  if (right) return 'right';
  return null;
}

/* ───────────────────────────── инлайн ───────────────────────────── */

const SAFE_URL_RE = /^(?:https?:|mailto:|tel:|\/|\.\/|\.\.\/|#|[^:/?#]+(?:[/?#]|$))/i;
const SAFE_IMAGE_RE = /^(?:https?:|data:image\/(?:png|gif|jpeg|webp|svg\+xml);|\/|\.\/|\.\.\/)/i;
const BARE_URL_RE = /^(?:https?:\/\/|www\.)[^\s<]*[^\s<.,:;"')\]!?]/i;
const PUNCT_RE = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;

export function sanitizeUrl(url: string, image = false): string | null {
  const trimmed = url.trim().replace(/[\u0000-\u001f]/g, '');
  if (trimmed === '') return null;
  if (!(image ? SAFE_IMAGE_RE : SAFE_URL_RE).test(trimmed)) return null;
  if (/^www\./i.test(trimmed)) return `http://${trimmed}`;
  return trimmed;
}

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let buf = '';
  const flush = () => {
    if (buf) {
      nodes.push({ type: 'text', value: buf });
      buf = '';
    }
  };

  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    // экранирование: \*
    if (ch === '\\') {
      const next = text[i + 1];
      if (next === '\n') {
        flush();
        nodes.push({ type: 'break' });
        i += 2;
        continue;
      }
      if (next !== undefined && PUNCT_RE.test(next)) {
        buf += next;
        i += 2;
        continue;
      }
      buf += ch;
      i += 1;
      continue;
    }

    // перенос строки: два пробела перед \n — жёсткий, иначе тоже перенос
    // (поведение «как в комментариях на GitHub» — удобнее для полей формы)
    if (ch === '\n') {
      buf = buf.replace(/ +$/, '');
      flush();
      nodes.push({ type: 'break' });
      i += 1;
      continue;
    }

    // `код`
    if (ch === '`') {
      const run = countRun(text, i, '`');
      const close = findBacktickRun(text, i + run, run);
      if (close !== -1) {
        flush();
        let code = text.slice(i + run, close).replace(/\n/g, ' ');
        if (code.length > 2 && code.startsWith(' ') && code.endsWith(' ') && code.trim() !== '') {
          code = code.slice(1, -1);
        }
        nodes.push({ type: 'code', value: code });
        i = close + run;
        continue;
      }
      buf += text.slice(i, i + run);
      i += run;
      continue;
    }

    // ![alt](src)
    if (ch === '!' && text[i + 1] === '[') {
      const link = parseBracketLink(text, i + 1);
      if (link) {
        const src = sanitizeUrl(link.url, true);
        flush();
        if (src) {
          nodes.push({ type: 'image', src, alt: link.label });
        } else {
          nodes.push({ type: 'text', value: link.label });
        }
        i = link.end;
        continue;
      }
    }

    // [текст](url)
    if (ch === '[') {
      const link = parseBracketLink(text, i);
      if (link) {
        flush();
        const href = sanitizeUrl(link.url);
        const children = parseInline(link.label);
        if (href) {
          nodes.push({ type: 'link', href, children });
        } else {
          nodes.push(...children);
        }
        i = link.end;
        continue;
      }
    }

    // <https://example.com>
    if (ch === '<') {
      const m = /^<((?:https?|mailto):[^\s<>]+)>/i.exec(text.slice(i));
      if (m) {
        flush();
        const href = sanitizeUrl(m[1])!;
        nodes.push({ type: 'link', href, children: [{ type: 'text', value: m[1] }] });
        i += m[0].length;
        continue;
      }
    }

    // голые ссылки https://…
    if ((ch === 'h' || ch === 'H' || ch === 'w' || ch === 'W') && (i === 0 || /[\s(]/.test(text[i - 1]))) {
      const m = BARE_URL_RE.exec(text.slice(i));
      if (m) {
        const href = sanitizeUrl(m[0]);
        if (href) {
          flush();
          nodes.push({ type: 'link', href, children: [{ type: 'text', value: m[0] }] });
          i += m[0].length;
          continue;
        }
      }
    }

    // **жирный**, *курсив*, ~~зачёркнутый~~
    if (ch === '*' || ch === '_' || ch === '~') {
      const emphasis = parseEmphasis(text, i);
      if (emphasis) {
        flush();
        nodes.push(emphasis.node);
        i = emphasis.end;
        continue;
      }
      // не разметка — один символ в текст, остаток серии разбираем заново
      buf += ch;
      i += 1;
      continue;
    }

    buf += ch;
    i += 1;
  }

  flush();
  return mergeText(nodes);
}

function countRun(text: string, from: number, ch: string): number {
  let n = 0;
  while (text[from + n] === ch) n += 1;
  return n;
}

/** Ищет закрывающую серию backtick-ов ровно той же длины. */
function findBacktickRun(text: string, from: number, len: number): number {
  let i = from;
  while (i < text.length) {
    if (text[i] === '`') {
      const run = countRun(text, i, '`');
      if (run === len) return i;
      i += run;
    } else {
      i += 1;
    }
  }
  return -1;
}

interface EmphasisMatch {
  node: InlineNode;
  end: number;
}

/**
 * Разбирает `*курсив*`, `**жирный**`, `***жирный курсив***`, `~~зачёркнутый~~`
 * начиная с позиции `i`. Возвращает `null`, если серия в `i` не открывает разметку;
 * вызывающий код тогда кладёт один символ в текст и пробует снова со следующего.
 */
function parseEmphasis(text: string, i: number): EmphasisMatch | null {
  const ch = text[i];
  const run = countRun(text, i, ch);
  const underscore = ch === '_';
  const next = text[i + run];
  const canOpen =
    next !== undefined &&
    !/\s/.test(next) &&
    // `_` внутри слова (snake_case) не считается разметкой
    !(underscore && i > 0 && /[\p{L}\p{N}]/u.test(text[i - 1]));
  if (!canOpen) return null;

  const closerFrom = (from: number, minLen: number) => findCloser(text, from, ch, minLen, underscore);

  if (ch === '~') {
    if (run < 2) return null;
    const close = closerFrom(i + 2, 2);
    if (!close || close.index === i + 2) return null;
    return {
      node: { type: 'del', children: parseInline(text.slice(i + 2, close.index)) },
      end: close.index + 2,
    };
  }

  if (run === 1) {
    const close = closerFrom(i + 1, 1);
    if (!close || close.index === i + 1) return null;
    return {
      node: { type: 'em', children: parseInline(text.slice(i + 1, close.index)) },
      end: close.index + 1,
    };
  }

  if (run === 2) {
    const close = closerFrom(i + 2, 2);
    if (!close || close.index === i + 2) return null;
    return {
      node: { type: 'strong', children: parseInline(text.slice(i + 2, close.index)) },
      end: close.index + 2,
    };
  }

  // серия из 3+: внутренний элемент определяется ближайшим закрывающим разделителем
  if (run > 3) return null; // лишние символы уйдут в текст по одному
  const inner = closerFrom(i + 3, 1);
  if (!inner || inner.index === i + 3) return null;

  if (inner.run >= 2) {
    // ***a** b*  →  em( strong(a), " b" )
    const outer = closerFrom(inner.index + 2, 1);
    if (!outer) return null;
    return {
      node: {
        type: 'em',
        children: [
          { type: 'strong', children: parseInline(text.slice(i + 3, inner.index)) },
          ...parseInline(text.slice(inner.index + 2, outer.index)),
        ],
      },
      end: outer.index + 1,
    };
  }

  // ***a* b**  →  strong( em(a), " b" )
  const outer = closerFrom(inner.index + 1, 2);
  if (!outer) return null;
  return {
    node: {
      type: 'strong',
      children: [
        { type: 'em', children: parseInline(text.slice(i + 3, inner.index)) },
        ...parseInline(text.slice(inner.index + 1, outer.index)),
      ],
    },
    end: outer.index + 2,
  };
}

interface Closer {
  /** Позиция начала закрывающей серии */
  index: number;
  /** Длина закрывающей серии */
  run: number;
}

/**
 * Ищет закрывающую серию символа `ch` длиной не меньше `minLen`, пропуская
 * экранированные символы и inline-код. Закрывающая серия не может идти после
 * пробела, а для `_` — ещё и перед буквой/цифрой.
 */
function findCloser(text: string, from: number, ch: string, minLen: number, underscore: boolean): Closer | null {
  let i = from;
  while (i < text.length) {
    const c = text[i];
    if (c === '\\') {
      i += 2;
      continue;
    }
    if (c === '`') {
      const run = countRun(text, i, '`');
      const close = findBacktickRun(text, i + run, run);
      i = close === -1 ? i + run : close + run;
      continue;
    }
    if (c === ch) {
      const run = countRun(text, i, ch);
      const prev = text[i - 1];
      const after = text[i + run];
      const closes =
        run >= minLen &&
        prev !== undefined &&
        !/\s/.test(prev) &&
        !(underscore && after !== undefined && /[\p{L}\p{N}]/u.test(after));
      if (closes) return { index: i, run };
      i += run;
      continue;
    }
    i += 1;
  }
  return null;
}

interface BracketLink {
  label: string;
  url: string;
  end: number;
}

/** Разбирает `[label](url "title")` начиная с позиции открывающей скобки. */
function parseBracketLink(text: string, open: number): BracketLink | null {
  let depth = 0;
  let i = open;
  for (; i < text.length; i += 1) {
    const c = text[i];
    if (c === '\\') {
      i += 1;
      continue;
    }
    if (c === '[') depth += 1;
    if (c === ']') {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  if (i >= text.length || text[i + 1] !== '(') return null;
  const label = text.slice(open + 1, i);

  let j = i + 2;
  let parens = 0;
  let inAngle = text[j] === '<';
  if (inAngle) j += 1;
  const urlStart = j;
  for (; j < text.length; j += 1) {
    const c = text[j];
    if (c === '\\') {
      j += 1;
      continue;
    }
    if (inAngle) {
      if (c === '>') break;
      if (c === '\n') return null;
      continue;
    }
    if (c === '(') parens += 1;
    else if (c === ')') {
      if (parens === 0) break;
      parens -= 1;
    } else if (/\s/.test(c)) break;
  }
  if (j >= text.length) return null;
  const url = text.slice(urlStart, j).replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, '$1');
  if (inAngle) j += 1;

  // необязательный title в кавычках
  const rest = /^\s*(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')?\s*\)/.exec(text.slice(j));
  if (!rest) return null;
  return { label, url, end: j + rest[0].length };
}

function mergeText(nodes: InlineNode[]): InlineNode[] {
  const out: InlineNode[] = [];
  for (const node of nodes) {
    const last = out[out.length - 1];
    if (node.type === 'text' && last && last.type === 'text') {
      last.value += node.value;
    } else {
      out.push(node);
    }
  }
  return out;
}
