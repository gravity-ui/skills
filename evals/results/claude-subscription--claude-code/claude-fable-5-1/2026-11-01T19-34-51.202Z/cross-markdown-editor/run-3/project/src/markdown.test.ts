import { describe, expect, it } from 'vitest';

import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('returns empty string for blank input', () => {
    expect(renderMarkdown('')).toBe('');
    expect(renderMarkdown('   \n ')).toBe('');
  });

  it('renders inline formatting and headings', () => {
    const html = renderMarkdown('# Заголовок\n\n**жирный** *курсив* `код`');
    expect(html).toContain('<h1>Заголовок</h1>');
    expect(html).toContain('<strong>жирный</strong>');
    expect(html).toContain('<em>курсив</em>');
    expect(html).toContain('<code>код</code>');
  });

  it('renders lists, tables and line breaks', () => {
    const html = renderMarkdown('- один\n- два\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\nстрока\nещё');
    expect(html).toContain('<li>один</li>');
    expect(html).toContain('<table>');
    expect(html).toContain('<br>');
  });

  it('opens links in a new tab with safe rel', () => {
    const html = renderMarkdown('[сайт](https://example.com)');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('strips scripts, event handlers and javascript: urls', () => {
    const html = renderMarkdown(
      '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n[x](javascript:alert(1))',
    );
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('javascript:');
  });
});
