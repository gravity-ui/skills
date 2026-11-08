const ESCAPE_HTML: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ESCAPE_HTML[character]);
}

function formatInline(value: string): string {
  let result = escapeHtml(value);

  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '<em>$1</em>');
  result = result.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  result = result.replace(
    /\[([^[\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
  );

  return result;
}

export function renderMarkdown(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((block) => {
      const trimmedBlock = block.trim();

      if (/^#{1,6}\s+/.test(trimmedBlock)) {
        const match = trimmedBlock.match(/^(#{1,6})\s+(.*)$/s);
        const headingLevel = match?.[1].length ?? 1;
        return `<h${headingLevel}>${formatInline(match?.[2] ?? '')}</h${headingLevel}>`;
      }

      if (/^(?:[-*]\s+.*(?:\n|$))+$/s.test(trimmedBlock)) {
        return `<ul>${trimmedBlock
          .split('\n')
          .map((line) => `<li>${formatInline(line.replace(/^[-*]\s+/, ''))}</li>`)
          .join('')}</ul>`;
      }

      if (/^(?:\d+[.)]\s+.*(?:\n|$))+$/s.test(trimmedBlock)) {
        return `<ol>${trimmedBlock
          .split('\n')
          .map((line) => `<li>${formatInline(line.replace(/^\d+[.)]\s+/, ''))}</li>`)
          .join('')}</ol>`;
      }

      return `<p>${trimmedBlock.split('\n').map((line) => formatInline(line)).join('<br />')}</p>`;
    })
    .join('');
}
