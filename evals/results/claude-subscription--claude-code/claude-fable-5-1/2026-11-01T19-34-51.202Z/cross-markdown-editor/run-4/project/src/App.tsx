import React, { useState } from 'react';
import { Button, Flex, Text, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';

const INITIAL_DESCRIPTION = `# Заголовок

Обычный текст с **жирным**, *курсивом*, ~~зачёркнутым~~ и \`inline code\`.

- Пункт списка
- Ещё пункт
  - Вложенный пункт

1. Первый
2. Второй

> Цитата с [ссылкой](https://gravity-ui.com)

\`\`\`ts
const answer = 42;
\`\`\`

| Колонка | Значение |
| ------- | -------- |
| A       | 1        |
| B       | 2        |

- [x] Сделано
- [ ] Не сделано
`;

export function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(INITIAL_DESCRIPTION);
  const [submitted, setSubmitted] = useState<{ title: string; description: string } | null>(null);

  const titleError = submitted !== null && !title.trim() ? 'Укажите название' : undefined;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted({ title, description });
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Flex direction="column" gap={5}>
        <Text as="h1" variant="header-2">
          Новая запись
        </Text>

        <Flex direction="column" gap={2}>
          <Text as="label" variant="subheader-1" htmlFor="entry-title">
            Название
          </Text>
          <TextInput
            id="entry-title"
            name="title"
            size="l"
            value={title}
            onUpdate={setTitle}
            placeholder="Например, Заметки о релизе"
            validationState={titleError ? 'invalid' : undefined}
            errorMessage={titleError}
            hasClear
          />
        </Flex>

        <MarkdownField
          label="Описание"
          name="description"
          hint="Поддерживается Markdown: заголовки, списки, ссылки, код, таблицы."
          value={description}
          onUpdate={setDescription}
        />

        <Flex gap={2}>
          <Button type="submit" view="action" size="l">
            Сохранить
          </Button>
          <Button
            type="button"
            view="flat"
            size="l"
            onClick={() => {
              setTitle('');
              setDescription('');
              setSubmitted(null);
            }}
          >
            Очистить
          </Button>
        </Flex>

        {submitted && title.trim() && (
          <Text variant="body-1" color="positive">
            Сохранено: «{submitted.title}», {submitted.description.length} символов описания.
          </Text>
        )}
      </Flex>
    </form>
  );
}
