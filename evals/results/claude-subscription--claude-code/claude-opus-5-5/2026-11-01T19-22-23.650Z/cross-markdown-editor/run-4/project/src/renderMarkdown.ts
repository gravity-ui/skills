import MarkdownIt from 'markdown-it';

/**
 * Renders markdown into HTML for the live preview.
 *
 * - `html: false` — raw HTML in user input is escaped, not executed;
 *   markdown-it also rejects `javascript:`/`vbscript:` links by default.
 * - Block tokens get `class="line"` + `data-line` so the editor's split view
 *   can sync scroll between the source and the preview.
 */
const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

md.core.ruler.push('source_line_markers', (state) => {
    for (const token of state.tokens) {
        if (token.map && token.nesting !== -1 && token.block) {
            token.attrJoin('class', 'line');
            token.attrSet('data-line', String(token.map[0]));
        }
    }
});

export function renderMarkdown(markup: string): string {
    return md.render(markup);
}
