import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, Flex, Text, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';
import { MarkdownPreview } from './markdown/MarkdownPreview';

const INITIAL_DESCRIPTION = `## Описание задачи

Поле поддерживает **жирный**, *курсив*, ~~зачёркнутый~~ текст и \`inline-код\`.

- пункты списка
- [x] чеклисты
  - вложенные списки

1. нумерованные
2. списки

> Цитата с [ссылкой](https://gravity-ui.com)

\`\`\`ts
const answer = 42;
\`\`\`
`;

interface FormValues {
  title: string;
  description: string;
}

export function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(INITIAL_DESCRIPTION);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (title.trim() === '') nextErrors.title = 'Укажите название';
    if (description.trim() === '') nextErrors.description = 'Описание не может быть пустым';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(null);
      return;
    }
    setSubmitted({ title: title.trim(), description });
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setErrors({});
    setSubmitted(null);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <form onSubmit={handleSubmit} noValidate>
        <Flex direction="column" gap={5}>
          <Text as="h1" variant="header-2">
            Новая задача
          </Text>

          <div>
            <label htmlFor="task-title" style={{ display: 'block', marginBottom: 4 }}>
              <Text variant="subheader-1">Название</Text>
            </label>
            <TextInput
              id="task-title"
              name="title"
              value={title}
              onUpdate={(next) => {
                setTitle(next);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Коротко о задаче"
              errorMessage={errors.title}
              validationState={errors.title ? 'invalid' : undefined}
              hasClear
            />
          </div>

          <MarkdownField
            id="task-description"
            name="description"
            label="Описание"
            value={description}
            onUpdate={(next) => {
              setDescription(next);
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            errorMessage={errors.description}
            minRows={12}
          />

          <Flex gap={2}>
            <Button type="submit" view="action" size="l">
              Отправить
            </Button>
            <Button type="button" view="flat" size="l" onClick={handleReset}>
              Очистить
            </Button>
          </Flex>

          {submitted && (
            <Alert
              theme="success"
              title={`Задача «${submitted.title}» сохранена`}
              message={<MarkdownPreview source={submitted.description} />}
              onClose={() => setSubmitted(null)}
            />
          )}
        </Flex>
      </form>
    </div>
  );
}
