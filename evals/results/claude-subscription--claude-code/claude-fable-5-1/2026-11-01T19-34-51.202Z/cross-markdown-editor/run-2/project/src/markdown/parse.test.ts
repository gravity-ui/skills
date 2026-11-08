import { describe, expect, it } from 'vitest';

import { parseInline, parseMarkdown, sanitizeUrl } from './parse';

describe('parseInline', () => {
  it('разбирает жирный, курсив и зачёркнутый текст', () => {
    expect(parseInline('**жирный** *курсив* ~~нет~~ __b__ _i_')).toEqual([
      { type: 'strong', children: [{ type: 'text', value: 'жирный' }] },
      { type: 'text', value: ' ' },
      { type: 'em', children: [{ type: 'text', value: 'курсив' }] },
      { type: 'text', value: ' ' },
      { type: 'del', children: [{ type: 'text', value: 'нет' }] },
      { type: 'text', value: ' ' },
      { type: 'strong', children: [{ type: 'text', value: 'b' }] },
      { type: 'text', value: ' ' },
      { type: 'em', children: [{ type: 'text', value: 'i' }] },
    ]);
  });

  it('вкладывает курсив в жирный', () => {
    expect(parseInline('***a** b*')).toEqual([
      {
        type: 'em',
        children: [
          { type: 'strong', children: [{ type: 'text', value: 'a' }] },
          { type: 'text', value: ' b' },
        ],
      },
    ]);
  });

  it('граничные случаи эмфазиса', () => {
    expect(parseInline('***a***')).toEqual([
      { type: 'em', children: [{ type: 'strong', children: [{ type: 'text', value: 'a' }] }] },
    ]);
    expect(parseInline('***a* b**')).toEqual([
      {
        type: 'strong',
        children: [
          { type: 'em', children: [{ type: 'text', value: 'a' }] },
          { type: 'text', value: ' b' },
        ],
      },
    ]);
    expect(parseInline('**a*')).toEqual([
      { type: 'text', value: '*' },
      { type: 'em', children: [{ type: 'text', value: 'a' }] },
    ]);
    expect(parseInline('****')).toEqual([{ type: 'text', value: '****' }]);
    expect(parseInline('** не жирный **')).toEqual([{ type: 'text', value: '** не жирный **' }]);
    expect(parseInline('~одна~ ~~две~~')).toEqual([
      { type: 'text', value: '~одна~ ' },
      { type: 'del', children: [{ type: 'text', value: 'две' }] },
    ]);
  });

  it('не трогает одиночные звёздочки и snake_case', () => {
    expect(parseInline('2 * 3 = 6, snake_case_name')).toEqual([
      { type: 'text', value: '2 * 3 = 6, snake_case_name' },
    ]);
  });

  it('inline-код имеет приоритет над разметкой внутри', () => {
    expect(parseInline('`**не жирный**` и ``a`b``')).toEqual([
      { type: 'code', value: '**не жирный**' },
      { type: 'text', value: ' и ' },
      { type: 'code', value: 'a`b' },
    ]);
  });

  it('эмфазис не захватывает разделитель внутри кода', () => {
    expect(parseInline('*a `*` b*')).toEqual([
      {
        type: 'em',
        children: [
          { type: 'text', value: 'a ' },
          { type: 'code', value: '*' },
          { type: 'text', value: ' b' },
        ],
      },
    ]);
  });

  it('разбирает ссылки, автоссылки и картинки', () => {
    expect(parseInline('[текст](https://a.b/c "t") <https://x.y> ![alt](/img.png) https://bare.url/p.')).toEqual([
      { type: 'link', href: 'https://a.b/c', children: [{ type: 'text', value: 'текст' }] },
      { type: 'text', value: ' ' },
      { type: 'link', href: 'https://x.y', children: [{ type: 'text', value: 'https://x.y' }] },
      { type: 'text', value: ' ' },
      { type: 'image', src: '/img.png', alt: 'alt' },
      { type: 'text', value: ' ' },
      { type: 'link', href: 'https://bare.url/p', children: [{ type: 'text', value: 'https://bare.url/p' }] },
      { type: 'text', value: '.' },
    ]);
  });

  it('вырезает опасные ссылки, оставляя текст', () => {
    expect(parseInline('[xss](javascript:alert(1))')).toEqual([{ type: 'text', value: 'xss' }]);
    expect(parseInline('![x](javascript:alert(1))')).toEqual([{ type: 'text', value: 'x' }]);
  });

  it('экранирование и переносы строк', () => {
    expect(parseInline('\\*не курсив\\*\nновая строка')).toEqual([
      { type: 'text', value: '*не курсив*' },
      { type: 'break' },
      { type: 'text', value: 'новая строка' },
    ]);
  });

  it('HTML выводится как текст', () => {
    expect(parseInline('<b>x</b>')).toEqual([{ type: 'text', value: '<b>x</b>' }]);
  });
});

describe('sanitizeUrl', () => {
  it('пропускает безопасные схемы и относительные пути', () => {
    expect(sanitizeUrl('https://a.b')).toBe('https://a.b');
    expect(sanitizeUrl('mailto:a@b.c')).toBe('mailto:a@b.c');
    expect(sanitizeUrl('/docs')).toBe('/docs');
    expect(sanitizeUrl('docs/page')).toBe('docs/page');
    expect(sanitizeUrl('www.example.com')).toBe('http://www.example.com');
  });

  it('блокирует javascript:, data: и vbscript:', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('JavaScript:alert(1)')).toBeNull();
    expect(sanitizeUrl('java\u0000script:alert(1)')).toBeNull();
    expect(sanitizeUrl('data:text/html,<b>')).toBeNull();
    expect(sanitizeUrl('vbscript:x')).toBeNull();
    expect(sanitizeUrl('data:text/html,x', true)).toBeNull();
    expect(sanitizeUrl('data:image/png;base64,AAA', true)).toBe('data:image/png;base64,AAA');
  });
});

describe('parseMarkdown', () => {
  it('заголовки ATX и setext', () => {
    expect(parseMarkdown('# H1\n### H3 ###\nТекст\n===\nЕщё\n---')).toEqual([
      { type: 'heading', level: 1, children: [{ type: 'text', value: 'H1' }] },
      { type: 'heading', level: 3, children: [{ type: 'text', value: 'H3' }] },
      { type: 'heading', level: 1, children: [{ type: 'text', value: 'Текст' }] },
      { type: 'heading', level: 2, children: [{ type: 'text', value: 'Ещё' }] },
    ]);
  });

  it('абзацы, линии и блоки кода', () => {
    expect(parseMarkdown('a\nb\n\n---\n\n```js\nconst x = 1;\n```\n~~~\nraw **text**\n~~~')).toEqual([
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'a' }, { type: 'break' }, { type: 'text', value: 'b' }],
      },
      { type: 'hr' },
      { type: 'code', lang: 'js', value: 'const x = 1;' },
      { type: 'code', lang: null, value: 'raw **text**' },
    ]);
  });

  it('незакрытый блок кода тянется до конца', () => {
    expect(parseMarkdown('```\nx\ny')).toEqual([{ type: 'code', lang: null, value: 'x\ny' }]);
  });

  it('цитаты, в том числе с ленивым продолжением', () => {
    expect(parseMarkdown('> a\nb\n>\n> # h')).toEqual([
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'a' }, { type: 'break' }, { type: 'text', value: 'b' }],
          },
          { type: 'heading', level: 1, children: [{ type: 'text', value: 'h' }] },
        ],
      },
    ]);
  });

  it('списки: маркированные, нумерованные, вложенные, чеклисты', () => {
    const [list] = parseMarkdown('- a\n- [x] b\n  - c\n- [ ] d\n\n3. one\n4. two');
    expect(list).toEqual({
      type: 'list',
      ordered: false,
      start: 1,
      tight: true,
      items: [
        { checked: null, children: [{ type: 'paragraph', children: [{ type: 'text', value: 'a' }] }] },
        {
          checked: true,
          children: [
            { type: 'paragraph', children: [{ type: 'text', value: 'b' }] },
            {
              type: 'list',
              ordered: false,
              start: 1,
              tight: true,
              items: [
                { checked: null, children: [{ type: 'paragraph', children: [{ type: 'text', value: 'c' }] }] },
              ],
            },
          ],
        },
        { checked: false, children: [{ type: 'paragraph', children: [{ type: 'text', value: 'd' }] }] },
      ],
    });
    const ordered = parseMarkdown('3. one\n4. two')[0];
    expect(ordered).toMatchObject({ type: 'list', ordered: true, start: 3, tight: true });
    expect((ordered as { items: unknown[] }).items).toHaveLength(2);
  });

  it('рыхлый список и ленивое продолжение пункта', () => {
    const [list] = parseMarkdown('- a\nстрока\n\n- b');
    expect(list).toMatchObject({ type: 'list', tight: false });
    expect((list as { items: { children: unknown[] }[] }).items[0].children).toEqual([
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'a' }, { type: 'break' }, { type: 'text', value: 'строка' }],
      },
    ]);
  });

  it('список прерывает абзац', () => {
    expect(parseMarkdown('текст\n- пункт')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', value: 'текст' }] },
      {
        type: 'list',
        ordered: false,
        start: 1,
        tight: true,
        items: [{ checked: null, children: [{ type: 'paragraph', children: [{ type: 'text', value: 'пункт' }] }] }],
      },
    ]);
  });

  it('таблицы с выравниванием и экранированным |', () => {
    expect(parseMarkdown('| a | b |\n|:--|--:|\n| 1 | x\\|y |\n| 2 |')).toEqual([
      {
        type: 'table',
        align: ['left', 'right'],
        header: [[{ type: 'text', value: 'a' }], [{ type: 'text', value: 'b' }]],
        rows: [
          [[{ type: 'text', value: '1' }], [{ type: 'text', value: 'x|y' }]],
          [[{ type: 'text', value: '2' }], []],
        ],
      },
    ]);
  });

  it('строка с | без разделителя — обычный абзац', () => {
    expect(parseMarkdown('a | b')).toEqual([{ type: 'paragraph', children: [{ type: 'text', value: 'a | b' }] }]);
  });

  it('пустой ввод и CRLF', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown('a\r\n\r\nb')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', value: 'a' }] },
      { type: 'paragraph', children: [{ type: 'text', value: 'b' }] },
    ]);
  });
});
