import React from 'react';
import { Button, Text, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';

const INITIAL_TEXT = `# Заголовок

Текст с **жирным**, *курсивом* и \`кодом\`.

- пункт списка
- [ ] задача из GFM

> Цитата

[Ссылка](https://example.com)
`;

export function App() {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState(INITIAL_TEXT);
  const [saved, setSaved] = React.useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: 24, maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <Text variant="header-1">Новая запись</Text>

      <TextInput
        name="title"
        label="Название: "
        value={title}
        onUpdate={(value) => {
          setTitle(value);
          setSaved(false);
        }}
      />

      <MarkdownField
        name="description"
        value={description}
        onUpdate={(value) => {
          setDescription(value);
          setSaved(false);
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button type="submit" view="action" size="l">
          Сохранить
        </Button>
        {saved && <Text color="positive">Сохранено</Text>}
      </div>
    </form>
  );
}
