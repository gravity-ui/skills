import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Ссылки из предпросмотра открываем в новой вкладке, без доступа к window.opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/** Превращает markdown-строку в безопасный HTML для предпросмотра. */
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false, gfm: true, breaks: true });
  return DOMPurify.sanitize(html);
}
