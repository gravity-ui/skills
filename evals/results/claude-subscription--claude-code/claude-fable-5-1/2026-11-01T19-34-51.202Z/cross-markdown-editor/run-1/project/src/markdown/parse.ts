/**
 * Небольшой markdown-парсер, покрывающий привычное подмножество CommonMark:
 * заголовки, абзацы, списки (вложенные), цитаты, блоки кода, разделители,
 * жирный / курсив / зачёркнутый, inline-код, ссылки, изображения, экранирование.
 *
 * Результат — дерево узлов, которое рендерится в React-элементы без innerHTML,
 * поэтому пользовательский ввод не может внедрить разметку или скрипты.
 */

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'em'; children: InlineNode[] }
  | { type: 'del'; children: InlineNode[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; title?: string; children: InlineNode[] }
  | { type: 'image'; src: string; alt: string; title?: string }
  | { type: 'br' };

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type BlockNode =
  | { type: 'heading'; level: HeadingLevel; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[]; tight?: boolean }
  | { type: 'code'; lang?: string; value: string }
  | { type: 'blockquote'; children: BlockNode[] }
  | { type: 'list'; ordered: boolean; start: number; items: BlockNode[][] }
  | { type: 'hr' };

/* ───────────────────────────── helpers ───────────────────────────── */

const SAFE_PROTOCOL = /^(https?|mailto|tel):/i;
const RELATIVE_URL = /^(\/|\.\.?\/|#)/;

/** Возвращает URL, если он безопасен для href/src, иначе пустую строку. */
export function sanitizeUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return '';
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(url);
  if (!hasScheme) {
    // Без схемы: относительные пути, якоря и голые домены вроде example.com
    return RELATIVE_URL.test(url) || !/[\s<>"']/.test(url) ? url : '';
  }
  return SAFE_PROTOCOL.test(url) ? url : '';
}

const FENCE_RE = /^ {0,3}(`{3,}|~{3,})([^`]*)$/;
const HEADING_RE = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?[ \t]*#*[ \t]*$/;
const HR_RE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const QUOTE_RE = /^ {0,3}> ?(.*)$/;
const BULLET_RE = /^( {0,3})([-+*])[ \t]+(.*)$/;
const ORDERED_RE = /^( {0,3})(\d{1,9})[.)][ \t]+(.*)$/;
const BLANK_RE = /^[ \t]*$/;

function listItemMatch(line: string) {
  const bullet = BULLET_RE.exec(line);
  if (bullet) {
    return { indent: bullet[1].length, ordered: false, start: 1, content: bullet[3], marker: bullet[2] };
  }
  const ordered = ORDERED_RE.exec(line);
  if (ordered) {
    return {
      indent: ordered[1].length,
      ordered: true,
      start: Number(ordered[2]),
      content: ordered[3],
      marker: ordered[2],
    };
  }
  return null;
}

function stripIndent(line: string, width: number): string {
  let i = 0;
  let removed = 0;
  while (i < line.length && removed < width) {
    if (line[i] === ' ') removed += 1;
    else if (line[i] === '\t') removed += 4;
    else break;
    i += 1;
  }
  return line.slice(i);
}

function leadingSpaces(line: string): number {
  let n = 0;
  for (const ch of line) {
    if (ch === ' ') n += 1;
    else if (ch === '\t') n += 4;
    else break;
  }
  return n;
}

/* ───────────────────────────── blocks ───────────────────────────── */

export function parseMarkdown(source: string): BlockNode[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  return parseBlocks(lines);
}

function parseBlocks(lines: string[]): BlockNode[] {
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (BLANK_RE.test(line)) {
      i += 1;
      continue;
    }

    // ``` fenced code
    const fence = FENCE_RE.exec(line);
    if (fence) {
      const marker = fence[1];
      const lang = fence[2].trim() || undefined;
      const body: string[] = [];
      i += 1;
      while (i < lines.length) {
        const closing = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(lines[i]);
        if (closing && closing[1][0] === marker[0] && closing[1].length >= marker.length) {
          i += 1;
          break;
        }
        body.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: 'code', lang, value: body.join('\n') });
      continue;
    }

    // --- horizontal rule (проверяем до списков: "* * *" не список)
    if (HR_RE.test(line)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    // # heading
    const heading = HEADING_RE.exec(line);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length as HeadingLevel,
        children: parseInline(heading[2] ?? ''),
      });
      i += 1;
      continue;
    }

    // > blockquote
    if (QUOTE_RE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length) {
        const q = QUOTE_RE.exec(lines[i]);
        if (q) {
          inner.push(q[1]);
        } else if (!BLANK_RE.test(lines[i]) && inner.length && !BLANK_RE.test(inner[inner.length - 1])) {
          // lazy continuation
          inner.push(lines[i]);
        } else {
          break;
        }
        i += 1;
      }
      blocks.push({ type: 'blockquote', children: parseBlocks(inner) });
      continue;
    }

    // - list / 1. list
    const item = listItemMatch(line);
    if (item) {
      const { block, next } = parseList(lines, i, item.ordered);
      blocks.push(block);
      i = next;
      continue;
    }

    // Setext heading: текст + подчёркивание === или ---
    if (i + 1 < lines.length && /^ {0,3}(=+|-+)[ \t]*$/.test(lines[i + 1])) {
      const level = lines[i + 1].trim()[0] === '=' ? 1 : 2;
      blocks.push({ type: 'heading', level, children: parseInline(line.trim()) });
      i += 2;
      continue;
    }

    // paragraph: до пустой строки или начала другого блока
    const para: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const next = lines[i];
      if (
        BLANK_RE.test(next) ||
        FENCE_RE.test(next) ||
        HEADING_RE.test(next) ||
        HR_RE.test(next) ||
        QUOTE_RE.test(next) ||
        listItemMatch(next)
      ) {
        break;
      }
      para.push(next);
      i += 1;
    }
    blocks.push({ type: 'paragraph', children: parseInline(para.join('\n')) });
  }

  return blocks;
}

function parseList(lines: string[], from: number, ordered: boolean): { block: BlockNode; next: number } {
  const first = listItemMatch(lines[from])!;
  const items: BlockNode[][] = [];
  let i = from;
  let hasBlankBetween = false;

  while (i < lines.length) {
    const m = listItemMatch(lines[i]);
    if (!m || m.ordered !== ordered || m.indent > first.indent + 3) break;
    if (m.indent < first.indent) break;

    // Содержимое пункта: первая строка + все строки с отступом >= contentIndent
    const markerWidth = m.indent + m.marker.length + 1;
    const contentIndent = markerWidth;
    const itemLines: string[] = [m.content];
    i += 1;

    while (i < lines.length) {
      const l = lines[i];
      if (BLANK_RE.test(l)) {
        // пустая строка: продолжаем, только если следующая непустая строка всё ещё с отступом
        let j = i + 1;
        while (j < lines.length && BLANK_RE.test(lines[j])) j += 1;
        if (j < lines.length && leadingSpaces(lines[j]) >= contentIndent) {
          itemLines.push('');
          hasBlankBetween = true;
          i += 1;
          continue;
        }
        break;
      }
      if (leadingSpaces(l) >= contentIndent) {
        itemLines.push(stripIndent(l, contentIndent));
        i += 1;
        continue;
      }
      // lazy continuation для абзаца внутри пункта
      if (!listItemMatch(l) && !HEADING_RE.test(l) && !FENCE_RE.test(l) && !QUOTE_RE.test(l) && !HR_RE.test(l)) {
        if (itemLines.length && !BLANK_RE.test(itemLines[itemLines.length - 1])) {
          itemLines.push(l.trim());
          i += 1;
          continue;
        }
      }
      break;
    }

    items.push(parseBlocks(itemLines));

    // Пропускаем пустые строки между пунктами одного списка
    let j = i;
    while (j < lines.length && BLANK_RE.test(lines[j])) j += 1;
    const nextItem = j < lines.length ? listItemMatch(lines[j]) : null;
    if (nextItem && nextItem.ordered === ordered && nextItem.indent >= first.indent && nextItem.indent <= first.indent + 3) {
      if (j > i) hasBlankBetween = true;
      i = j;
    } else {
      break;
    }
  }

  // «Плотный» список (без пустых строк): первый абзац пункта рендерится без отступов <p>
  if (!hasBlankBetween) {
    for (const item of items) {
      const firstBlock = item[0];
      if (firstBlock && firstBlock.type === 'paragraph') {
        firstBlock.tight = true;
      }
    }
  }

  return { block: { type: 'list', ordered, start: first.start, items }, next: i };
}

/* ───────────────────────────── inline ───────────────────────────── */

const ESCAPABLE = /[\\`*_{}[\]()#+\-.!~<>|"']/;

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let buf = '';
  let i = 0;

  const flush = () => {
    if (buf) {
      nodes.push({ type: 'text', value: buf });
      buf = '';
    }
  };

  while (i < text.length) {
    const ch = text[i];

    // \* экранирование
    if (ch === '\\' && i + 1 < text.length && ESCAPABLE.test(text[i + 1])) {
      buf += text[i + 1];
      i += 2;
      continue;
    }

    // жёсткий перенос: два пробела или обратный слэш перед \n
    if (ch === '\n') {
      if (buf.endsWith('  ')) {
        buf = buf.replace(/ +$/, '');
        flush();
        nodes.push({ type: 'br' });
      } else if (buf.endsWith('\\')) {
        buf = buf.slice(0, -1);
        flush();
        nodes.push({ type: 'br' });
      } else {
        buf = buf.replace(/ +$/, '') + ' ';
      }
      i += 1;
      // пропускаем ведущие пробелы следующей строки
      while (i < text.length && (text[i] === ' ' || text[i] === '\t')) i += 1;
      continue;
    }

    // `code`
    if (ch === '`') {
      let run = 0;
      while (text[i + run] === '`') run += 1;
      const open = '`'.repeat(run);
      const close = text.indexOf(open, i + run);
      if (close !== -1 && text[close + run] !== '`') {
        flush();
        let code = text.slice(i + run, close).replace(/\n/g, ' ');
        if (code.length > 2 && code.startsWith(' ') && code.endsWith(' ') && code.trim()) {
          code = code.slice(1, -1);
        }
        nodes.push({ type: 'code', value: code });
        i = close + run;
        continue;
      }
      buf += open;
      i += run;
      continue;
    }

    // ![alt](src "title")
    if (ch === '!' && text[i + 1] === '[') {
      const link = readLink(text, i + 1);
      if (link) {
        flush();
        nodes.push({ type: 'image', src: sanitizeUrl(link.url), alt: link.label, title: link.title });
        i = link.end;
        continue;
      }
    }

    // [text](url "title")
    if (ch === '[') {
      const link = readLink(text, i);
      if (link) {
        flush();
        nodes.push({
          type: 'link',
          href: sanitizeUrl(link.url),
          title: link.title,
          children: parseInline(link.label),
        });
        i = link.end;
        continue;
      }
    }

    // <https://autolink>
    if (ch === '<') {
      const m = /^<((?:https?|mailto):[^\s<>]+)>/i.exec(text.slice(i));
      if (m) {
        flush();
        nodes.push({ type: 'link', href: sanitizeUrl(m[1]), children: [{ type: 'text', value: m[1] }] });
        i += m[0].length;
        continue;
      }
    }

    // **strong** / __strong__ / *em* / _em_ / ~~del~~
    if (ch === '*' || ch === '_' || ch === '~') {
      const emph = readEmphasis(text, i);
      if (emph) {
        flush();
        nodes.push(emph.node);
        i = emph.end;
        continue;
      }
    }

    buf += ch;
    i += 1;
  }

  flush();
  return mergeText(nodes);
}

function mergeText(nodes: InlineNode[]): InlineNode[] {
  const out: InlineNode[] = [];
  for (const n of nodes) {
    const last = out[out.length - 1];
    if (n.type === 'text' && last && last.type === 'text') {
      last.value += n.value;
    } else {
      out.push(n);
    }
  }
  return out;
}

function readLink(text: string, start: number): { label: string; url: string; title?: string; end: number } | null {
  // start указывает на '['
  let depth = 0;
  let i = start;
  for (; i < text.length; i += 1) {
    const c = text[i];
    if (c === '\\') {
      i += 1;
      continue;
    }
    if (c === '[') depth += 1;
    else if (c === ']') {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  if (i >= text.length || text[i + 1] !== '(') return null;
  const label = text.slice(start + 1, i);

  let j = i + 2;
  let parens = 0;
  for (; j < text.length; j += 1) {
    const c = text[j];
    if (c === '\\') {
      j += 1;
      continue;
    }
    if (c === '(') parens += 1;
    else if (c === ')') {
      if (parens === 0) break;
      parens -= 1;
    } else if (c === '\n') {
      return null;
    }
  }
  if (j >= text.length) return null;

  const inner = text.slice(i + 2, j).trim();
  const titled = /^(\S+)\s+"([^"]*)"$/.exec(inner) ?? /^(\S+)\s+'([^']*)'$/.exec(inner);
  const url = (titled ? titled[1] : inner).replace(/^<(.*)>$/, '$1');
  const title = titled ? titled[2] : undefined;
  return { label, url, title, end: j + 1 };
}

function readEmphasis(text: string, start: number): { node: InlineNode; end: number } | null {
  const ch = text[start];
  let run = 0;
  while (text[start + run] === ch) run += 1;

  // Левофланговый разделитель: после него не должно быть пробела
  const after = text[start + run];
  if (after === undefined || /\s/.test(after)) return null;
  // Для _ и ~ требуем границу слова слева (чтобы snake_case не ломался)
  const before = start > 0 ? text[start - 1] : '';
  if ((ch === '_' || ch === '~') && before && /[\p{L}\p{N}]/u.test(before)) return null;

  const candidates: number[] = [];
  if (ch === '~') {
    if (run >= 2) candidates.push(2);
  } else {
    if (run >= 2) candidates.push(2);
    if (run >= 1) candidates.push(1);
  }

  for (const len of candidates) {
    const marker = ch.repeat(len);
    const contentStart = start + len;
    const close = findClosing(text, contentStart, marker, ch);
    if (close === -1) continue;
    const content = text.slice(contentStart, close);
    if (!content.trim()) continue;
    const children = parseInline(content);
    const node: InlineNode =
      ch === '~' ? { type: 'del', children } : len === 2 ? { type: 'strong', children } : { type: 'em', children };
    return { node, end: close + len };
  }
  return null;
}

function findClosing(text: string, from: number, marker: string, ch: string): number {
  let i = from;
  while (i < text.length) {
    const c = text[i];
    if (c === '\\') {
      i += 2;
      continue;
    }
    if (c === '`') {
      // пропускаем inline-код
      let run = 0;
      while (text[i + run] === '`') run += 1;
      const close = text.indexOf('`'.repeat(run), i + run);
      if (close !== -1) {
        i = close + run;
        continue;
      }
      i += run;
      continue;
    }
    if (c === ch && text.startsWith(marker, i)) {
      let run = 0;
      while (text[i + run] === ch) run += 1;
      const prev = text[i - 1];
      const next = text[i + run];
      const rightFlanking = prev !== undefined && !/\s/.test(prev);
      const wordAfter = next !== undefined && /[\p{L}\p{N}]/u.test(next);
      if (run === marker.length && rightFlanking && !((ch === '_' || ch === '~') && wordAfter)) {
        return i;
      }
      if (run > marker.length && rightFlanking) {
        // например **bold *and em*** — закрываемся на последних символах
        return i + run - marker.length;
      }
      i += run;
      continue;
    }
    i += 1;
  }
  return -1;
}
