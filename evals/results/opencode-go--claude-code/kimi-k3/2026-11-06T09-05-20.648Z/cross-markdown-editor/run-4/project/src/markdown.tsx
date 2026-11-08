import React from 'react';

/**
 * Лёгкий рендерер подмножества Markdown в React-ноды.
 * HTML не интерполируется (никакого dangerouslySetInnerHTML),
 * поэтому произвольный ввод пользователя безопасен.
 *
 * Поддерживается:
 *  - заголовки # .. ######
 *  - **жирный**, __жирный__, *курсив*, _курсив_, ~~зачёркнутый~~
 *  - `inline code` и fenced-блоки ```
 *  - [ссылки](url)
 *  - маркированные и нумерованные списки
 *  - цитаты >
 *  - горизонтальные линии ---, ***, ___
 */

const INLINE_RE =
  /(\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\))|(`([^`]+)`)|(\*\*([\s\S]+?)\*\*)|(__([\s\S]+?)__)|(~~([\s\S]+?)~~)|(\*([^*\n]+?)\*)|(_([^_\n]+?)_)/;

function safeHref(url: string): string {
  const trimmed = url.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(trimmed)) return trimmed;
  return '#';
}

export function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let rest = text;
  let key = 0;

  while (rest.length > 0) {
    const m = INLINE_RE.exec(rest);
    if (!m) {
      nodes.push(rest);
      break;
    }
    if (m.index > 0) {
      nodes.push(rest.slice(0, m.index));
    }

    if (m[2] !== undefined) {
      // [text](url)
      nodes.push(
        <a key={key++} href={safeHref(m[3])} target="_blank" rel="noreferrer">
          {renderInline(m[2])}
        </a>,
      );
    } else if (m[5] !== undefined) {
      // `code`
      nodes.push(<code key={key++}>{m[5]}</code>);
    } else if (m[7] !== undefined) {
      // **bold**
      nodes.push(<strong key={key++}>{renderInline(m[7])}</strong>);
    } else if (m[9] !== undefined) {
      // __bold__
      nodes.push(<strong key={key++}>{renderInline(m[9])}</strong>);
    } else if (m[11] !== undefined) {
      // ~~strike~~
      nodes.push(<s key={key++}>{renderInline(m[11])}</s>);
    } else if (m[13] !== undefined) {
      // *italic*
      nodes.push(<em key={key++}>{renderInline(m[13])}</em>);
    } else if (m[15] !== undefined) {
      // _italic_
      nodes.push(<em key={key++}>{renderInline(m[15])}</em>);
    }

    rest = rest.slice(m.index + m[0].length);
  }

  return nodes;
}

function renderLinesWithBreaks(lines: string[]): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  lines.forEach((line, idx) => {
    if (idx > 0) out.push(<br key={`br-${idx}`} />);
    out.push(...renderInline(line));
  });
  return out;
}

const FENCE_RE = /^```/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const HR_RE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const QUOTE_RE = /^>\s?/;
const UL_RE = /^\s*[-*+]\s+/;
const OL_RE = /^\s*\d+[.)]\s+/;

function isBlockStart(line: string): boolean {
  return (
    FENCE_RE.test(line) ||
    HEADING_RE.test(line) ||
    HR_RE.test(line) ||
    QUOTE_RE.test(line) ||
    UL_RE.test(line) ||
    OL_RE.test(line)
  );
}

export function renderMarkdown(source: string): React.ReactNode[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    // Fenced code block
    if (FENCE_RE.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // закрывающий ```
      blocks.push(
        <pre key={key++}>
          <code>{buf.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Heading
    const heading = HEADING_RE.exec(line);
    if (heading) {
      blocks.push(
        React.createElement(
          `h${heading[1].length}`,
          { key: key++ },
          renderInline(heading[2]),
        ),
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (HR_RE.test(line)) {
      blocks.push(<hr key={key++} />);
      i++;
      continue;
    }

    // Blockquote
    if (QUOTE_RE.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        buf.push(lines[i].replace(QUOTE_RE, ''));
        i++;
      }
      blocks.push(<blockquote key={key++}>{renderLinesWithBreaks(buf)}</blockquote>);
      continue;
    }

    // Unordered list
    if (UL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && UL_RE.test(lines[i])) {
        items.push(lines[i].replace(UL_RE, ''));
        i++;
      }
      blocks.push(
        <ul key={key++}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (OL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && OL_RE.test(lines[i])) {
        items.push(lines[i].replace(OL_RE, ''));
        i++;
      }
      blocks.push(
        <ol key={key++}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push(<p key={key++}>{renderLinesWithBreaks(buf)}</p>);
  }

  return blocks;
}
