import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { MarkdownView } from './markdown';

const render = (md: string) => renderToStaticMarkup(<MarkdownView markdown={md} />);

describe('MarkdownView', () => {
  it('renders headings and paragraphs', () => {
    const html = render('# Title\n\nHello world');
    expect(html).toContain('<h1');
    expect(html).toContain('Title');
    expect(html).toContain('Hello world');
  });

  it('renders inline formatting', () => {
    const html = render('**bold** *italic* ~~strike~~ `code` [link](https://example.com)');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<s>strike</s>');
    expect(html).toContain('<code');
    expect(html).toContain('href="https://example.com"');
  });

  it('renders lists, quotes and code blocks', () => {
    const html = render('- a\n- b\n\n> quote\n\n```\nconst x = 1;\n```');
    expect(html).toContain('<ul');
    expect(html).toContain('<li>');
    expect(html).toContain('<blockquote');
    expect(html).toContain('<pre');
    expect(html).toContain('const x = 1;');
  });

  it('renders ordered lists', () => {
    const html = render('1. one\n2. two');
    expect(html).toContain('<ol');
  });

  it('does not treat list-looking text inside a paragraph as a list', () => {
    const html = render('some text\n- item');
    expect(html).toContain('<ul');
    expect(html).toContain('some text');
  });

  it('escapes raw html as text', () => {
    const html = render('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
  });
});
