import { useState } from 'react';

import { MarkdownField } from './MarkdownField';

export function App() {
  const [content, setContent] = useState('');

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <form>
        <MarkdownField
          name="content"
          label="Текст (поддерживается Markdown)"
          value={content}
          onUpdate={setContent}
          placeholder={'# Заголовок\n\n**жирный**, *курсив*, `код`\n\n- пункт списка\n- [ссылка](https://example.com)'}
        />
      </form>
    </div>
  );
}
