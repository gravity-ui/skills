import { describe, expect, it } from 'vitest';

import { renderMarkdown } from './renderMarkdown';

describe('renderMarkdown', () => {
    it('renders basic markdown formatting', () => {
        const html = renderMarkdown('# Title\n\n**bold** _italic_ ~~strike~~\n\n- one\n- two');
        expect(html).toContain('<h1');
        expect(html).toContain('<strong>bold</strong>');
        expect(html).toContain('<em>italic</em>');
        expect(html).toContain('<s>strike</s>');
        expect(html).toContain('<li');
    });

    it('marks block elements with source lines for split-view scroll sync', () => {
        const html = renderMarkdown('first\n\nsecond');
        expect(html).toContain('<p class="line" data-line="0">first</p>');
        expect(html).toContain('<p class="line" data-line="2">second</p>');
    });

    it('escapes raw HTML instead of rendering it', () => {
        const html = renderMarkdown('<img src=x onerror=alert(1)>');
        expect(html).not.toContain('<img');
        expect(html).toContain('&lt;img');
    });

    it('does not produce javascript: links', () => {
        const html = renderMarkdown('[click](javascript:alert(1))');
        expect(html).not.toContain('href="javascript:');
    });
});
