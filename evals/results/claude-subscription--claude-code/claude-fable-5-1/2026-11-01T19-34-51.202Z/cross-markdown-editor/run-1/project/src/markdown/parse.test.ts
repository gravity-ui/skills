import { describe, expect, it } from 'vitest';

import { parseInline, parseMarkdown, sanitizeUrl } from './parse';

describe('parseInline', () => {
  it('parses strong, em and del', () => {
    expect(parseInline('a **b** _c_ ~~d~~')).toEqual([
      { type: 'text', value: 'a ' },
      { type: 'strong', children: [{ type: 'text', value: 'b' }] },
      { type: 'text', value: ' ' },
      { type: 'em', children: [{ type: 'text', value: 'c' }] },
      { type: 'text', value: ' ' },
      { type: 'del', children: [{ type: 'text', value: 'd' }] },
    ]);
  });

  it('nests emphasis', () => {
    expect(parseInline('**bold *and em***')).toEqual([
      {
        type: 'strong',
        children: [
          { type: 'text', value: 'bold ' },
          { type: 'em', children: [{ type: 'text', value: 'and em' }] },
        ],
      },
    ]);
  });

  it('does not treat snake_case as emphasis', () => {
    expect(parseInline('foo_bar_baz')).toEqual([{ type: 'text', value: 'foo_bar_baz' }]);
  });

  it('leaves unmatched markers as text', () => {
    expect(parseInline('2 * 3 = 6 and **open')).toEqual([{ type: 'text', value: '2 * 3 = 6 and **open' }]);
  });

  it('parses inline code and ignores markup inside', () => {
    expect(parseInline('use `a **b** c` here')).toEqual([
      { type: 'text', value: 'use ' },
      { type: 'code', value: 'a **b** c' },
      { type: 'text', value: ' here' },
    ]);
    expect(parseInline('`` a ` b ``')).toEqual([{ type: 'code', value: 'a ` b' }]);
  });

  it('parses links with titles and images', () => {
    expect(parseInline('[site](https://example.com "Title")')).toEqual([
      { type: 'link', href: 'https://example.com', title: 'Title', children: [{ type: 'text', value: 'site' }] },
    ]);
    expect(parseInline('![alt](https://example.com/a.png)')).toEqual([
      { type: 'image', src: 'https://example.com/a.png', alt: 'alt', title: undefined },
    ]);
    expect(parseInline('<https://example.com>')).toEqual([
      { type: 'link', href: 'https://example.com', children: [{ type: 'text', value: 'https://example.com' }] },
    ]);
  });

  it('drops unsafe urls', () => {
    // eslint-disable-next-line no-script-url
    expect(parseInline('[x](javascript:alert(1))')).toEqual([
      { type: 'link', href: '', title: undefined, children: [{ type: 'text', value: 'x' }] },
    ]);
  });

  it('handles escapes and hard breaks', () => {
    expect(parseInline('\\*not em\\*')).toEqual([{ type: 'text', value: '*not em*' }]);
    expect(parseInline('line one  \nline two')).toEqual([
      { type: 'text', value: 'line one' },
      { type: 'br' },
      { type: 'text', value: 'line two' },
    ]);
    expect(parseInline('soft\nbreak')).toEqual([{ type: 'text', value: 'soft break' }]);
  });
});

describe('sanitizeUrl', () => {
  it('allows http(s), mailto, relative and anchors', () => {
    expect(sanitizeUrl('https://a.b/c')).toBe('https://a.b/c');
    expect(sanitizeUrl('mailto:me@a.b')).toBe('mailto:me@a.b');
    expect(sanitizeUrl('/docs')).toBe('/docs');
    expect(sanitizeUrl('#top')).toBe('#top');
    expect(sanitizeUrl('example.com')).toBe('example.com');
  });

  it('rejects javascript:, data: and vbscript:', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('JavaScript:alert(1)')).toBe('');
    expect(sanitizeUrl('data:text/html,<b>')).toBe('');
    expect(sanitizeUrl('vbscript:x')).toBe('');
  });
});

describe('parseMarkdown', () => {
  it('returns no blocks for blank input', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown('  \n\n \t')).toEqual([]);
  });

  it('parses headings (ATX and setext)', () => {
    expect(parseMarkdown('# One\n## Two ##\nThree\n===\nFour\n---')).toEqual([
      { type: 'heading', level: 1, children: [{ type: 'text', value: 'One' }] },
      { type: 'heading', level: 2, children: [{ type: 'text', value: 'Two' }] },
      { type: 'heading', level: 1, children: [{ type: 'text', value: 'Three' }] },
      { type: 'heading', level: 2, children: [{ type: 'text', value: 'Four' }] },
    ]);
    expect(parseMarkdown('#notaheading')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', value: '#notaheading' }] },
    ]);
  });

  it('joins paragraph lines and splits on blank lines', () => {
    expect(parseMarkdown('a\nb\n\nc')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', value: 'a b' }] },
      { type: 'paragraph', children: [{ type: 'text', value: 'c' }] },
    ]);
  });

  it('parses fenced code blocks verbatim', () => {
    expect(parseMarkdown('```ts\nconst a = **1**;\n\n# not heading\n```\nafter')).toEqual([
      { type: 'code', lang: 'ts', value: 'const a = **1**;\n\n# not heading' },
      { type: 'paragraph', children: [{ type: 'text', value: 'after' }] },
    ]);
    // Незакрытый блок тянется до конца
    expect(parseMarkdown('~~~\nx')).toEqual([{ type: 'code', lang: undefined, value: 'x' }]);
  });

  it('parses horizontal rules but not confuse them with lists', () => {
    expect(parseMarkdown('---\n* * *\n___')).toEqual([{ type: 'hr' }, { type: 'hr' }, { type: 'hr' }]);
  });

  it('parses blockquotes with nested content', () => {
    expect(parseMarkdown('> # Title\n> text\ncontinued\n\nout')).toEqual([
      {
        type: 'blockquote',
        children: [
          { type: 'heading', level: 1, children: [{ type: 'text', value: 'Title' }] },
          { type: 'paragraph', children: [{ type: 'text', value: 'text continued' }] },
        ],
      },
      { type: 'paragraph', children: [{ type: 'text', value: 'out' }] },
    ]);
  });

  it('parses tight bullet lists with nesting', () => {
    expect(parseMarkdown('- a\n- b\n  - b1\n  - b2\n- c')).toEqual([
      {
        type: 'list',
        ordered: false,
        start: 1,
        items: [
          [{ type: 'paragraph', tight: true, children: [{ type: 'text', value: 'a' }] }],
          [
            { type: 'paragraph', tight: true, children: [{ type: 'text', value: 'b' }] },
            {
              type: 'list',
              ordered: false,
              start: 1,
              items: [
                [{ type: 'paragraph', tight: true, children: [{ type: 'text', value: 'b1' }] }],
                [{ type: 'paragraph', tight: true, children: [{ type: 'text', value: 'b2' }] }],
              ],
            },
          ],
          [{ type: 'paragraph', tight: true, children: [{ type: 'text', value: 'c' }] }],
        ],
      },
    ]);
  });

  it('parses ordered lists with a custom start and loose items', () => {
    const [list] = parseMarkdown('3. three\n\n4. four\n   more');
    expect(list).toMatchObject({ type: 'list', ordered: true, start: 3 });
    if (list.type !== 'list') throw new Error('expected list');
    expect(list.items).toHaveLength(2);
    expect(list.items[0][0]).toEqual({ type: 'paragraph', children: [{ type: 'text', value: 'three' }] });
    expect(list.items[1][0]).toEqual({ type: 'paragraph', children: [{ type: 'text', value: 'four more' }] });
  });

  it('separates bullet and ordered lists and ends list on unindented paragraph', () => {
    const blocks = parseMarkdown('- a\n1. b\n\npara');
    expect(blocks.map((b) => b.type)).toEqual(['list', 'list', 'paragraph']);
  });

  it('normalises CRLF', () => {
    expect(parseMarkdown('a\r\n\r\nb')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', value: 'a' }] },
      { type: 'paragraph', children: [{ type: 'text', value: 'b' }] },
    ]);
  });
});
