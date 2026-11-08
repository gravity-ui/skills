import React from 'react';
import { Button, Card, Text, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';
import { renderMarkdown } from './markdown';

const INITIAL = `# Заголовок

Пишите **жирным**, *курсивом*, ~~зачёркнутым~~ и \`кодом\`.

- пункт списка
- ещё один
  - вложенный

1. первый
2. второй

> Цитата

[Ссылка](https://gravity-ui.com)
`;

export function App() {
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState(INITIAL);
  const [submitted, setSubmitted] = React.useState<{ title: string; body: string } | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted({ title: title.trim(), body });
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <Text variant="header-1">Новая заметка</Text>

        <TextInput
          label="Заголовок"
          name="title"
          value={title}
          onUpdate={setTitle}
          placeholder="Введите заголовок"
          size="l"
        />

        <MarkdownField
          label="Описание"
          name="body"
          value={body}
          onUpdate={setBody}
          placeholder="Введите текст в формате Markdown"
        />

        <div>
          <Button type="submit" view="action" size="l" disabled={!body.trim()}>
            Сохранить
          </Button>
        </div>
      </form>

      {submitted && (
        <Card
          type="container"
          view="outlined"
          style={{ marginTop: 24, padding: 16 }}
          data-testid="submitted"
        >
          <Text variant="subheader-2">Сохранено{submitted.title && `: ${submitted.title}`}</Text>
          <div className="md-preview" style={{ border: 0, padding: 0, marginTop: 8 }}>
            {renderMarkdown(submitted.body)}
          </div>
        </Card>
      )}
    </div>
  );
}
