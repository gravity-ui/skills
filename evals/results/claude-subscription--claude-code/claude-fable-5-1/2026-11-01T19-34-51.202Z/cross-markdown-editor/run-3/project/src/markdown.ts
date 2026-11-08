import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.use({ gfm: true, breaks: true });

// Внешние ссылки открываем в новой вкладке и защищаем от доступа к window.opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Преобразует markdown в безопасный HTML.
 * Скрипты, обработчики событий и javascript:-ссылки вырезаются.
 */
export function renderMarkdown(source: string): string {
  if (!source.trim()) {
    return '';
  }
  const html = marked.parse(source, { async: false });
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'],
  });
}
