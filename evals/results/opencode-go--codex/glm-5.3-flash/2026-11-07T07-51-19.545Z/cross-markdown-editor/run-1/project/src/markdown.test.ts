import { describe, expect, it } from 'vitest';

import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders headings and lists', () => {
    const result = renderMarkdown('# Title\n\n- first\n- second\n\n1. one\n2. two');

    expect(result).toBe(
      '<h1>Title</h1><ul><li>first</li><li>second</li></ul><ol><li>one</li><li>two</li></ol>',
    );
  });

  it('escapes HTML and renders inline formatting', () => {
    const result = renderMarkdown('<script>alert("xss")</script> **bold**');

    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('<strong>bold</strong>');
  });
});
