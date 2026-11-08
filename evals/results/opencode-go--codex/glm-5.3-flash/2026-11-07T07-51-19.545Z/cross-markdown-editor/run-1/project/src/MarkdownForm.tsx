import { useMemo, useState } from 'react';
import { Card, TextArea } from '@gravity-ui/uikit';

import { renderMarkdown } from './markdown';

export function MarkdownForm() {
  const [markdown, setMarkdown] = useState('');
  const preview = useMemo(() => renderMarkdown(markdown), [markdown]);

  return (
    <form className="markdown-form" onSubmit={(event) => event.preventDefault()}>
      <Card className="markdown-form__panel">
        <h1 className="markdown-form__title">Markdown</h1>
        <TextArea
          controlProps={{ 'aria-label': 'Markdown текст' }}
          minRows={12}
          onUpdate={setMarkdown}
          placeholder={'# Заголовок\nВведите текст с **жирным** и *курсивом*'}
          value={markdown}
        />
      </Card>

      <Card className="markdown-form__panel">
        <h2 className="markdown-form__title">Предпросмотр</h2>
        <div
          className="markdown-preview"
          aria-live="polite"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </Card>
    </form>
  );
}
