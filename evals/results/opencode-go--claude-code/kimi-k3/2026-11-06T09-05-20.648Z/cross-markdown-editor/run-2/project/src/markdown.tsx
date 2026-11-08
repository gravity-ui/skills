import React from 'react';

/**
 * Minimal, dependency-free Markdown renderer.
 * Produces React elements directly (no dangerouslySetInnerHTML), so user input
 * can never inject markup. Supports: headings, bold/italic/strikethrough,
 * inline code, fenced code blocks, links, lists, blockquotes, hr, paragraphs.
 */

function isSafeUrl(url: string): boolean {
  return /^(https?:\/\/|mailto:|#|\/)/i.test(url.trim());
}

const INLINE_SOURCE =
  '(`[^`]+`)|(\\*\\*[^*]+\\*\\*)|(__[^_]+__)|(\\*[^*]+\\*)|(_[^_]+_)|(~~[^~]+~~)|(\\[[^\\]]+\\]\\([^)\\s]+\\))';

export function renderInline(text: string): React.ReactNode[] {
  // Fresh regex per call: renderInline recurses (bold/italic contents), and a
  // shared global regex's lastIndex would be clobbered by the inner scan.
  const re = new RegExp(INLINE_SOURCE, 'g');
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('`')) {
      nodes.push(
        <code key={key++} className="md-inline-code">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith('**') || tok.startsWith('__')) {
      nodes.push(<strong key={key++}>{renderInline(tok.slice(2, -2))}</strong>);
    } else if (tok.startsWith('~~')) {
      nodes.push(<s key={key++}>{renderInline(tok.slice(2, -2))}</s>);
    } else if (tok.startsWith('*') || tok.startsWith('_')) {
      nodes.push(<em key={key++}>{renderInline(tok.slice(1, -1))}</em>);
    } else {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      if (lm && isSafeUrl(lm[2])) {
        nodes.push(
          <a key={key++} href={lm[2]} target="_blank" rel="noreferrer noopener">
            {renderInline(lm[1])}
          </a>,
        );
      } else {
        nodes.push(tok);
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const BLOCK_START_RE =
  /^(#{1,6}\s|```|>\s?|\s*[-*+]\s|\s*\d+[.)]\s|\s*(?:-{3,}|\*{3,}|_{3,})\s*$)/;

export function renderMarkdown(source: string): React.ReactNode[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    // Fenced code block
    if (/^```\w*\s*$/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence (or run off EOF)
      blocks.push(
        <pre key={key++} className="md-code-block">
          <code>{buf.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      blocks.push(
        React.createElement(
          `h${level}`,
          { key: key++, className: 'md-heading' },
          renderInline(h[2].trim()),
        ),
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key++} className="md-hr" />);
      i++;
      continue;
    }

    // Blockquote (consecutive '>' lines, rendered recursively)
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="md-quote">
          {renderMarkdown(buf.join('\n'))}
        </blockquote>,
      );
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={key++} className="md-list">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={key++} className="md-list">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph (until blank line or next block construct)
    const buf: string[] = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !BLOCK_START_RE.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    const para: React.ReactNode[] = [];
    buf.forEach((l, idx) => {
      if (idx > 0) para.push(<br key={`br-${idx}`} />);
      para.push(...renderInline(l));
    });
    blocks.push(
      <p key={key++} className="md-p">
        {para}
      </p>,
    );
  }

  return blocks;
}
