import React from 'react';

/**
 * Minimal markdown renderer (no external deps).
 * Supports: headings, bold/italic/strikethrough, inline code, code fences,
 * links, blockquotes, unordered/ordered lists, horizontal rules.
 */

const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*\n]+\*)|(_[^_\n]+_)|(~~[^~]+~~)|(\[[^\]]+\]\((?:https?:\/\/|mailto:|\/|#)[^)\s]*\))/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const key = `${keyPrefix}-${i++}`;
    const [raw, code, boldA, boldB, italicA, italicB, strike, link] = match;
    if (code) {
      nodes.push(
        <code key={key} className="md-inline-code">
          {code.slice(1, -1)}
        </code>,
      );
    } else if (boldA || boldB) {
      nodes.push(<strong key={key}>{raw.slice(2, -2)}</strong>);
    } else if (italicA || italicB) {
      nodes.push(<em key={key}>{raw.slice(1, -1)}</em>);
    } else if (strike) {
      nodes.push(<s key={key}>{raw.slice(2, -2)}</s>);
    } else if (link) {
      const closeBracket = link.indexOf('](');
      const label = link.slice(1, closeBracket);
      const href = link.slice(closeBracket + 2, -1);
      nodes.push(
        <a key={key} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>,
      );
    }
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

const UL_RE = /^\s*[-*+]\s+/;
const OL_RE = /^\s*\d+[.)]\s+/;
const HR_RE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const FENCE_RE = /^```(.*)$/;

export function renderMarkdown(markdown: string): React.ReactNode[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockIndex = 0;
  const key = () => `b${blockIndex++}`;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    // Fenced code block
    const fence = FENCE_RE.exec(line);
    if (fence) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !FENCE_RE.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence (or end of input)
      blocks.push(
        <pre key={key()} className="md-code-block">
          <code>{buf.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Heading
    const heading = HEADING_RE.exec(line);
    if (heading) {
      const level = heading[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const Tag = `h${level}` as 'h1';
      blocks.push(
        <Tag key={key()} className="md-heading">
          {renderInline(heading[2], key())}
        </Tag>,
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (HR_RE.test(line)) {
      blocks.push(<hr key={key()} className="md-hr" />);
      i++;
      continue;
    }

    // Blockquote
    if (/^\s*>/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote key={key()} className="md-quote">
          {renderInline(buf.join(' '), key())}
        </blockquote>,
      );
      continue;
    }

    // Lists
    if (UL_RE.test(line) || OL_RE.test(line)) {
      const ordered = OL_RE.test(line);
      const itemRe = ordered ? OL_RE : UL_RE;
      const items: string[] = [];
      while (i < lines.length && itemRe.test(lines[i])) {
        items.push(lines[i].replace(itemRe, ''));
        i++;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(
        <ListTag key={key()} className="md-list">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item, `${key()}-${j}`)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    // Paragraph: consume until blank line or another block starter
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !FENCE_RE.test(lines[i]) &&
      !HEADING_RE.test(lines[i]) &&
      !HR_RE.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !UL_RE.test(lines[i]) &&
      !OL_RE.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key()} className="md-paragraph">
        {buf.map((l, j) => (
          <React.Fragment key={j}>
            {j > 0 && <br />}
            {renderInline(l, `${key()}-${j}`)}
          </React.Fragment>
        ))}
      </p>,
    );
  }

  return blocks;
}

export function MarkdownView({ markdown }: { markdown: string }) {
  return <div className="md-view">{renderMarkdown(markdown)}</div>;
}
