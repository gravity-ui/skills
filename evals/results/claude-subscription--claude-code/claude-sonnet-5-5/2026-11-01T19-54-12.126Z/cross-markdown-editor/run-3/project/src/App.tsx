import { useState } from 'react';
import { Button, Text, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';

const INITIAL_MARKDOWN = `## Заголовок

Обычный текст, **жирный**, *курсив*, ~~зачёркнутый~~ и \`код\`.

- Пункт списка
- [Ссылка](https://gravity-ui.com)

> Цитата
`;

export function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(INITIAL_MARKDOWN);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Replace with a real submit handler.
    console.log({ title, description });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: 24, maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <Text variant="header-1">Новая запись</Text>
      <TextInput label="Название" value={title} onUpdate={setTitle} />
      <MarkdownField value={description} onUpdate={setDescription} />
      <div>
        <Button type="submit" view="action" size="l">
          Сохранить
        </Button>
      </div>
    </form>
  );
}
