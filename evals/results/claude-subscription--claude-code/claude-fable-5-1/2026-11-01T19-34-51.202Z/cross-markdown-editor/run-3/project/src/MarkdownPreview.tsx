import { useMemo } from 'react';
import { Text } from '@gravity-ui/uikit';

import { renderMarkdown } from './markdown';
import './MarkdownPreview.css';

interface MarkdownPreviewProps {
  source: string;
  className?: string;
}

export function MarkdownPreview({ source, className }: MarkdownPreviewProps) {
  const html = useMemo(() => renderMarkdown(source), [source]);

  if (!html) {
    return (
      <Text as="div" color="hint" className={className}>
        Здесь появится отформатированный текст
      </Text>
    );
  }

  // HTML уже очищен DOMPurify в renderMarkdown.
  return (
    <div
      className={['md-preview', className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
