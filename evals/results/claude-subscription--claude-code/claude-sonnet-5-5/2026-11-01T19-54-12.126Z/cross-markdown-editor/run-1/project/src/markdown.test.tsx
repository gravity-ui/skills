import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { renderMarkdown } from './markdown';

const html = (md: string) => renderToStaticMarkup(<>{renderMarkdown(md)}</>);

describe('renderMarkdown', () => {
  it('inline formatting', () => {
    expect(html('**b** *i* ~~s~~ `c`')).toBe(
      '<p><strong>b</strong> <em>i</em> <del>s</del> <code>c</code></p>',
    );
    expect(html('***bi***')).toBe('<p><strong><em>bi</em></strong></p>');
    expect(html('a *b **c** d* e')).toBe('<p>a <em>b <strong>c</strong> d</em> e</p>');
  });

  it('does not treat snake_case or lone markers as emphasis', () => {
    expect(html('snake_case_name')).toBe('<p>snake_case_name</p>');
    expect(html('2 * 3 * 4')).toBe('<p>2 * 3 * 4</p>');
    expect(html('**не закрыто')).toBe('<p>**не закрыто</p>');
  });

  it('headings, hr, quote', () => {
    expect(html('# A\n## B ##\n---\n> q')).toBe(
      '<h1>A</h1><h2>B</h2><hr/><blockquote><p>q</p></blockquote>',
    );
  });

  it('lists, nested and ordered', () => {
    expect(html('- a\n- b\n  - c\n\n3. x\n4. y')).toBe(
      '<ul><li>a</li><li>b<ul><li>c</li></ul></li></ul><ol start="3"><li>x</li><li>y</li></ol>',
    );
  });

  it('task list', () => {
    expect(html('- [x] done\n- [ ] todo')).toContain('checked=""');
  });

  it('fenced code is not parsed', () => {
    expect(html('```ts\n**x** <b>\n```')).toBe(
      '<pre><code data-lang="ts">**x** &lt;b&gt;</code></pre>',
    );
  });

  it('links and images', () => {
    expect(html('[t](https://a.b "title")')).toBe(
      '<p><a href="https://a.b" target="_blank" rel="noopener noreferrer">t</a></p>',
    );
    expect(html('![alt](https://a.b/i.png)')).toBe('<p><img src="https://a.b/i.png" alt="alt"/></p>');
  });

  it('supports balanced parentheses in URLs', () => {
    expect(html('[w](https://en.wikipedia.org/wiki/A_(b))')).toBe(
      '<p><a href="https://en.wikipedia.org/wiki/A_(b)" target="_blank" rel="noopener noreferrer">w</a></p>',
    );
  });

  it('is safe against HTML and dangerous URLs', () => {
    expect(html('<script>alert(1)</script>')).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
    expect(html('[x](javascript:alert(1))')).toBe('<p>x</p>');
    expect(html('[x](JaVaScRiPt:alert(1))')).toBe('<p>x</p>');
    expect(html('[x](data:text/html;base64,AAAA)')).toBe('<p>x</p>');
    expect(html('![x](javascript:alert(1))')).toBe('<p>x</p>');
    expect(html('[x](//evil.com)')).toBe('<p>x</p>');
    expect(html('<img src=x onerror=alert(1)>')).not.toContain('<img');
  });

  it('escapes', () => {
    expect(html('\\*not em\\*')).toBe('<p>*not em*</p>');
  });

  it('does not hang on pathological input', () => {
    const t = Date.now();
    html('*'.repeat(3000) + '\n' + '['.repeat(3000) + '\n' + '`'.repeat(3000));
    expect(Date.now() - t).toBeLessThan(2000);
  });
});
