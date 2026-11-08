import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MarkdownPreview } from './MarkdownPreview';

const render = (source: string) => renderToStaticMarkup(<MarkdownPreview source={source} />);

describe('MarkdownPreview', () => {
  it('рендерит основные элементы', () => {
    const html = render('# Заголовок\n\nАбзац с **жирным** и `кодом`\n\n- [x] пункт\n\n| a |\n|---|\n| 1 |');
    expect(html).toContain('<h1');
    expect(html).toContain('<strong>жирным</strong>');
    expect(html).toContain('<code');
    expect(html).toContain('<ul');
    expect(html).toContain('<table');
    expect(html).toContain('type="checkbox"');
  });

  it('не вставляет сырой HTML и экранирует текст', () => {
    const html = render('<script>alert(1)</script> <img src=x onerror=alert(1)>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });

  it('ссылки открываются в новой вкладке и защищены rel', () => {
    const html = render('[x](https://example.com)');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('опасные ссылки не попадают в href', () => {
    const html = render('[x](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('x');
  });

  it('пустой ввод рендерит пустой контейнер', () => {
    expect(render('')).toBe('<div class="md-preview"></div>');
  });
});
