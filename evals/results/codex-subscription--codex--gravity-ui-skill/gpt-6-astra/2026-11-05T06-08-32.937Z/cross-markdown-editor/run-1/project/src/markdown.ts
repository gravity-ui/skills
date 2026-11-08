import MarkdownIt from "markdown-it";

// Match the editor's CommonMark preset. HTML is escaped and unsafe link
// protocols are rejected by markdown-it before the preview is rendered.
const parser = new MarkdownIt("commonmark", { html: false, linkify: false });

export function renderMarkdown(markdown: string): string {
  return parser.render(markdown);
}
