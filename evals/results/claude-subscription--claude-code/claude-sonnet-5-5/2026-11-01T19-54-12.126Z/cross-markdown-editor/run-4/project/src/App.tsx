import React from 'react';
import { Button, Text, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';

const INITIAL_TEXT = `# Заголовок

Текст с **жирным**, *курсивом*, ~~зачёркнутым~~ и \`кодом\`.

- пункт списка
- ещё один

> Цитата

[Ссылка](https://gravity-ui.com)
`;

export function App() {
  const [title, setTitle] = React.useState('');
  const [text, setText] = React.useState(INITIAL_TEXT);
  const [submitted, setSubmitted] = React.useState<{ title: string; text: string } | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted({ title, text });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: 24, maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <Text variant="header-1">Новая заметка</Text>

      <TextInput
        name="title"
        size="l"
        label="Название"
        value={title}
        onUpdate={setTitle}
      />

      <MarkdownField
        name="text"
        label="Текст (Markdown)"
        value={text}
        onChange={setText}
        placeholder="Пишите в Markdown…"
      />

      <div>
        <Button type="submit" view="action" size="l">
          Сохранить
        </Button>
      </div>

      {submitted && (
        <Text color="secondary">
          Отправлено: «{submitted.title || 'без названия'}», {submitted.text.length} символов
        </Text>
      )}
    </form>
  );
}
