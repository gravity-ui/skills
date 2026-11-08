import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MarkdownPreview } from './MarkdownPreview';

describe('MarkdownPreview', () => {
  it('renders placeholder for empty source', () => {
    const html = renderToStaticMarkup(<MarkdownPreview source="   " emptyText="Пусто" />);
    expect(html).toContain('md-preview_empty');
    expect(html).toContain('Пусто');
  });

  it('renders blocks and inline formatting as elements', () => {
    const html = renderToStaticMarkup(
      <MarkdownPreview source={'# Hi\n\nSome **bold** and `code`\n\n- one\n- two\n\n> q\n\n```js\nx()\n```\n\n---'} />,
    );
    expect(html).toContain('<h1');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<code');
    expect(html).toContain('<ul');
    expect(html).toContain('<li');
    expect(html).toContain('<blockquote');
    expect(html).toContain('<pre');
    expect(html).toContain('<hr');
  });

  it('escapes raw html and strips unsafe links', () => {
    const html = renderToStaticMarkup(
      <MarkdownPreview source={'<script>alert(1)</script> [x](javascript:alert(1))'} />,
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('<a ');
  });

  it('renders safe links with rel=noopener', () => {
    const html = renderToStaticMarkup(<MarkdownPreview source="[site](https://example.com)" />);
    expect(html).toMatch(/<a [^>]*href="https:\/\/example.com"/);
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('renders ordered list start attribute', () => {
    const html = renderToStaticMarkup(<MarkdownPreview source={'3. a\n4. b'} />);
    expect(html).toMatch(/<ol [^>]*start="3"/);
  });
});
