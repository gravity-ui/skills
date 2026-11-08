import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Renders markdown source into sanitized HTML, safe to inject into the DOM.
 */
export function renderMarkdown(source: string): string {
  const rawHtml = marked.parse(source, { async: false });
  return DOMPurify.sanitize(rawHtml);
}
