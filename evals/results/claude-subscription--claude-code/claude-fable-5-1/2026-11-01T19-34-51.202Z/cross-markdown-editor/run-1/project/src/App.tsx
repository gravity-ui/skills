import { useState } from 'react';
import { Button, Flex, Text, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';

const INITIAL_DESCRIPTION = `# Заголовок

Обычный абзац с **жирным**, _курсивом_, ~~зачёркнутым~~ и \`inline-кодом\`.

- Пункт списка
- Ещё один пункт
  - Вложенный пункт

1. Первый шаг
2. Второй шаг

> Цитата с [ссылкой](https://gravity-ui.com)

\`\`\`ts
const answer = 42;
\`\`\`
`;

const DESCRIPTION_MAX_LENGTH = 5000;

export function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(INITIAL_DESCRIPTION);
  const [submitted, setSubmitted] = useState<{ title: string; description: string } | null>(null);

  const descriptionTooLong = description.length > DESCRIPTION_MAX_LENGTH;
  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !descriptionTooLong;

  return (
    <form
      style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        setSubmitted({ title: title.trim(), description });
      }}
    >
      <Flex direction="column" gap={5}>
        <Text as="h1" variant="header-2">
          Новая запись
        </Text>

        <Flex direction="column" gap={2}>
          <Text as="label" htmlFor="title" variant="subheader-1">
            Название
          </Text>
          <TextInput
            id="title"
            name="title"
            size="l"
            value={title}
            onUpdate={setTitle}
            placeholder="Коротко о чём запись"
            hasClear
          />
        </Flex>

        <MarkdownField
          label="Описание"
          name="description"
          value={description}
          onUpdate={setDescription}
          maxLength={DESCRIPTION_MAX_LENGTH}
          note="Форматирование применяется сразу при вводе."
        />

        <Flex gap={2} alignItems="center">
          <Button type="submit" view="action" size="l" disabled={!canSubmit}>
            Сохранить
          </Button>
          {submitted ? (
            <Text variant="body-1" color="positive">
              Сохранено: «{submitted.title}», {submitted.description.length} символов описания
            </Text>
          ) : null}
        </Flex>
      </Flex>
    </form>
  );
}
