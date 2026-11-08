import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { renderMarkdown } from './markdown';

function html(source: string): string {
  return renderToStaticMarkup(<>{renderMarkdown(source)}</>);
}

describe('renderMarkdown', () => {
  it('renders headings and inline formatting', () => {
    const out = html('# Title\n\n**bold** *em* ~~strike~~ `code`');
    expect(out).toContain('<h1');
    expect(out).toContain('Title');
    expect(out).toContain('<strong>bold</strong>');
    expect(out).toContain('<em>em</em>');
    expect(out).toContain('<s>strike</s>');
    expect(out).toContain('<code');
  });

  it('renders lists, quote and fenced code', () => {
    const out = html('- a\n- b\n\n1. one\n\n> quote\n\n```\nx = 1\n```');
    expect(out).toContain('<ul');
    expect(out).toContain('<li>a</li>');
    expect(out).toContain('<ol');
    expect(out).toContain('<blockquote');
    expect(out).toContain('<pre');
    expect(out).toContain('x = 1');
  });

  it('renders safe links and escapes raw HTML', () => {
    const out = html('[ok](https://example.com) <script>alert(1)</script>');
    expect(out).toContain('href="https://example.com"');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('renders horizontal rule and soft line breaks', () => {
    const out = html('line1\nline2\n\n---');
    expect(out).toContain('<br/>');
    expect(out).toContain('<hr');
  });
});
