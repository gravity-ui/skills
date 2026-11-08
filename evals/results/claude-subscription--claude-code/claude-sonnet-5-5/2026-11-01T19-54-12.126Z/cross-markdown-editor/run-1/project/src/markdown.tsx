import React from 'react';

/**
 * Минимальный безопасный markdown → React.
 *
 * Результат строится из React-элементов (без dangerouslySetInnerHTML), поэтому
 * сырой HTML из текста выводится как обычный текст, а опасные URL отбрасываются.
 *
 * Поддерживается: заголовки, абзацы, **жирный**, *курсив*, ~~зачёркнутый~~,
 * `код`, блоки кода ```, цитаты, списки (в т.ч. вложенные и нумерованные),
 * чек-листы, разделитель, ссылки, картинки, автоссылки <https://…>.
 */

// ---------- URL ----------

function safeUrl(raw: string): string | null {
  const url = raw.trim();
  if (/^(https?:|mailto:)/i.test(url)) return url;
  // относительные ссылки и якоря, но не "javascript:" и не "//host"
  if (/^(#|\/(?!\/)|\.{1,2}\/)/.test(url)) return url;
  return null;
}

// ---------- inline ----------

const ESCAPABLE = /[\\`*_{}[\]()#+\-.!~>|<]/;

/** Индекс закрывающей `}` для открывающей скобки в позиции `open`, либо -1. */
function findBracketEnd(src: string, open: number): number {
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    const c = src[j];
    if (c === '\\') j++;
    else if (c === '[') depth++;
    else if (c === ']' && --depth === 0) return j;
  }
  return -1;
}

/**
 * Разбирает `(url "title")` в начале строки. URL может содержать сбалансированные
 * скобки или быть в <угловых скобках>. Возвращает url и длину разобранного фрагмента.
 */
function parseLinkTarget(s: string): { url: string; length: number } | null {
  if (s[0] !== '(') return null;
  let j = 1;
  while (/\s/.test(s[j] ?? '')) j++;

  let url: string;
  if (s[j] === '<') {
    const end = s.indexOf('>', j);
    if (end === -1 || s.slice(j, end).includes('\n')) return null;
    url = s.slice(j + 1, end);
    j = end + 1;
  } else {
    const start = j;
    let depth = 0;
    while (j < s.length && !/\s/.test(s[j])) {
      if (s[j] === '\\') j++;
      else if (s[j] === '(') depth++;
      else if (s[j] === ')' && depth-- === 0) break;
      j++;
    }
    if (depth > 0) return null;
    url = s.slice(start, j);
  }

  while (/\s/.test(s[j] ?? '')) j++;
  const title = /^"[^"]*"/.exec(s.slice(j));
  if (title) {
    j += title[0].length;
    while (/\s/.test(s[j] ?? '')) j++;
  }
  return s[j] === ')' ? { url, length: j + 1 } : null;
}

/** Закрывающий разделитель выделения; пропускает экранирование и код-спаны. */
function findClose(src: string, delim: string, from: number): number {
  for (let j = from; j < src.length; j++) {
    const c = src[j];
    if (c === '\\') {
      j++;
    } else if (c === '`') {
      let run = 1;
      while (src[j + run] === '`') run++;
      const end = src.indexOf('`'.repeat(run), j + run);
      if (end !== -1) j = end + run - 1;
      else j += run - 1;
    } else if (src.startsWith(delim, j)) {
      if (delim.length === 1 && src[j + 1] === delim) {
        j++; // часть более длинной последовательности (** внутри *…*)
        continue;
      }
      const prev = src[j - 1];
      if (j > from && prev !== undefined && !/\s/.test(prev)) {
        if (delim === '_' && /\w/.test(src[j + 1] ?? '')) continue; // snake_case
        return j;
      }
    }
  }
  return -1;
}

function parseInline(src: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let buf = '';
  let key = 0;

  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = '';
    }
  };
  const push = (el: React.ReactElement) => {
    flush();
    out.push(el);
  };

  let i = 0;
  while (i < src.length) {
    const ch = src[i];

    // экранирование
    if (ch === '\\' && i + 1 < src.length) {
      if (ESCAPABLE.test(src[i + 1])) {
        buf += src[i + 1];
        i += 2;
        continue;
      }
      if (src[i + 1] === '\n') {
        push(<br key={key++} />);
        i += 2;
        continue;
      }
    }

    // жёсткий перенос: два пробела + \n
    if (ch === ' ' && src[i + 1] === ' ' && /^ +\n/.test(src.slice(i))) {
      push(<br key={key++} />);
      i += src.slice(i).indexOf('\n') + 1;
      continue;
    }

    // код
    if (ch === '`') {
      let run = 1;
      while (src[i + run] === '`') run++;
      const fence = '`'.repeat(run);
      const end = src.indexOf(fence, i + run);
      if (end !== -1) {
        push(<code key={key++}>{src.slice(i + run, end).replace(/\n/g, ' ').trim()}</code>);
        i = end + run;
      } else {
        buf += fence;
        i += run;
      }
      continue;
    }

    // ссылка / картинка
    if (ch === '[' || (ch === '!' && src[i + 1] === '[')) {
      const isImage = ch === '!';
      const open = isImage ? i + 1 : i;
      const close = findBracketEnd(src, open);
      if (close !== -1 && src[close + 1] === '(') {
        const m = parseLinkTarget(src.slice(close + 1));
        if (m) {
          const label = src.slice(open + 1, close);
          const href = safeUrl(m.url);
          if (href) {
            if (isImage) {
              push(<img key={key++} src={href} alt={label} />);
            } else {
              push(
                <a key={key++} href={href} target="_blank" rel="noopener noreferrer">
                  {parseInline(label)}
                </a>,
              );
            }
          } else {
            // небезопасный URL — оставляем только текст
            push(<React.Fragment key={key++}>{parseInline(label)}</React.Fragment>);
          }
          i = close + 1 + m.length;
          continue;
        }
      }
    }

    // автоссылка <https://…>
    if (ch === '<') {
      const m = /^<((?:https?:\/\/|mailto:)[^\s<>]+)>/i.exec(src.slice(i));
      if (m) {
        push(
          <a key={key++} href={m[1]} target="_blank" rel="noopener noreferrer">
            {m[1]}
          </a>,
        );
        i += m[0].length;
        continue;
      }
    }

    // выделение
    if (ch === '*' || ch === '_' || ch === '~') {
      const candidates = src.startsWith(ch.repeat(3), i) && ch !== '~'
        ? [ch.repeat(3), ch.repeat(2), ch]
        : src.startsWith(ch.repeat(2), i)
          ? [ch.repeat(2), ch]
          : [ch];
      let matched = false;
      for (const delim of candidates) {
        if (ch === '~' && delim.length !== 2) continue; // только ~~
        const next = src[i + delim.length];
        if (next === undefined || /\s/.test(next)) continue;
        if (ch === '_' && i > 0 && /\w/.test(src[i - 1])) continue; // snake_case
        const close = findClose(src, delim, i + delim.length);
        if (close === -1) continue;
        const inner = parseInline(src.slice(i + delim.length, close));
        const el =
          delim === '~~' ? (
            <del key={key++}>{inner}</del>
          ) : delim.length === 3 ? (
            <strong key={key++}>
              <em>{inner}</em>
            </strong>
          ) : delim.length === 2 ? (
            <strong key={key++}>{inner}</strong>
          ) : (
            <em key={key++}>{inner}</em>
          );
        push(el);
        i = close + delim.length;
        matched = true;
        break;
      }
      if (matched) continue;
    }

    buf += ch;
    i++;
  }

  flush();
  return out;
}

// ---------- blocks ----------

const RE_FENCE = /^\s{0,3}(`{3,}|~{3,})\s*([\w+#-]*)[^`]*$/;
const RE_HEADING = /^\s{0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
const RE_HR = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const RE_QUOTE = /^\s{0,3}>\s?(.*)$/;
const RE_LIST = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;

function isBlockStart(line: string): boolean {
  return (
    RE_FENCE.test(line) ||
    RE_HEADING.test(line) ||
    RE_HR.test(line) ||
    RE_QUOTE.test(line) ||
    RE_LIST.test(line)
  );
}

function parseBlocks(src: string): React.ReactNode[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // блок кода
    const fence = RE_FENCE.exec(line);
    if (fence) {
      const marker = fence[1];
      const code: string[] = [];
      i++;
      while (i < lines.length && !new RegExp(`^\\s{0,3}${marker[0]}{${marker.length},}\\s*$`).test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      i++; // закрывающий забор (если есть)
      out.push(
        <pre key={key++}>
          <code data-lang={fence[2] || undefined}>{code.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // заголовок
    const heading = RE_HEADING.exec(line);
    if (heading) {
      const Tag = `h${heading[1].length}` as 'h1';
      out.push(<Tag key={key++}>{parseInline(heading[2])}</Tag>);
      i++;
      continue;
    }

    // разделитель
    if (RE_HR.test(line)) {
      out.push(<hr key={key++} />);
      i++;
      continue;
    }

    // цитата
    if (RE_QUOTE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length) {
        const q = RE_QUOTE.exec(lines[i]);
        if (q) inner.push(q[1]);
        else if (lines[i].trim() && !isBlockStart(lines[i])) inner.push(lines[i]); // ленивое продолжение
        else break;
        i++;
      }
      out.push(<blockquote key={key++}>{parseBlocks(inner.join('\n'))}</blockquote>);
      continue;
    }

    // список
    const list = RE_LIST.exec(line);
    if (list) {
      const baseIndent = list[1].length;
      const ordered = /\d/.test(list[2]);
      const items: string[][] = [];
      const itemStarts: number[] = [];

      while (i < lines.length) {
        const cur = lines[i];
        const m = RE_LIST.exec(cur);
        if (m && m[1].length <= baseIndent + 1) {
          if (/\d/.test(m[2]) !== ordered) break; // другой тип списка
          items.push([m[3]]);
          itemStarts.push(m[1].length + m[2].length + 1);
        } else if (cur.trim() === '') {
          // пустая строка внутри списка допустима, если дальше продолжение списка
          const next = lines.slice(i + 1).find((l) => l.trim() !== '');
          const nm = next === undefined ? null : RE_LIST.exec(next);
          const indented = next !== undefined && /^\s{2,}\S/.test(next);
          if (!(nm && nm[1].length <= baseIndent + 1 && /\d/.test(nm[2]) === ordered) && !indented) break;
          items[items.length - 1].push('');
        } else if (/^\s+\S/.test(cur) || !isBlockStart(cur)) {
          // вложенное содержимое / ленивое продолжение абзаца
          const strip = Math.min(/^\s*/.exec(cur)![0].length, itemStarts[items.length - 1]);
          items[items.length - 1].push(cur.slice(strip));
        } else {
          break;
        }
        i++;
      }

      const start = ordered ? parseInt(list[2], 10) : undefined;
      const Tag = ordered ? 'ol' : 'ul';
      out.push(
        <Tag key={key++} start={start !== undefined && start !== 1 ? start : undefined}>
          {items.map((item, idx) => {
            const task = /^\[([ xX])\]\s+/.exec(item[0]);
            const body = task ? [item[0].slice(task[0].length), ...item.slice(1)] : item;
            const blocks = parseBlocks(body.join('\n'));
            // «тугой» список: первый абзац без обёртки <p>
            const first = blocks[0];
            const tight =
              React.isValidElement(first) && first.type === 'p'
                ? [(first.props as { children: React.ReactNode }).children, ...blocks.slice(1)]
                : blocks;
            return (
              <li key={idx} className={task ? 'md-task' : undefined}>
                {task && <input type="checkbox" checked={task[1] !== ' '} disabled readOnly />}
                {tight}
              </li>
            );
          })}
        </Tag>,
      );
      continue;
    }

    // абзац
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && (para.length === 0 || !isBlockStart(lines[i]))) {
      para.push(lines[i].replace(/^\s+/, ''));
      i++;
    }
    out.push(<p key={key++}>{parseInline(para.join('\n'))}</p>);
  }

  return out;
}

export function renderMarkdown(src: string): React.ReactNode {
  return parseBlocks(src);
}
