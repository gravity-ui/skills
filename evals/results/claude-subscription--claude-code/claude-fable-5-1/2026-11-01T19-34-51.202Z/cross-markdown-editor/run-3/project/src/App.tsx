import { useState, type FormEvent } from 'react';
import { Alert, Button, Flex, Text, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';

const DESCRIPTION_MAX_LENGTH = 5000;

const INITIAL_DESCRIPTION = `## О проекте

Этот текст **форматируется на лету** — попробуйте что-нибудь изменить.

- Поддерживаются списки, *курсив* и \`код\`
- [Ссылки](https://gravity-ui.com) открываются в новой вкладке

> Цитаты и таблицы тоже работают.
`;

export function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(INITIAL_DESCRIPTION);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [submitted, setSubmitted] = useState<{ title: string; description: string } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    if (!title.trim()) {
      nextErrors.title = 'Введите заголовок';
    }
    if (!description.trim()) {
      nextErrors.description = 'Введите описание';
    } else if (description.length > DESCRIPTION_MAX_LENGTH) {
      nextErrors.description = `Описание не должно превышать ${DESCRIPTION_MAX_LENGTH} символов`;
    }
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitted({ title: title.trim(), description });
    } else {
      setSubmitted(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <Flex direction="column" gap={5}>
        <Text variant="header-1">Новая публикация</Text>

        <Flex direction="column" gap={2}>
          <Text as="label" variant="subheader-1" {...{ htmlFor: 'post-title' }}>
            Заголовок
          </Text>
          <TextInput
            id="post-title"
            name="title"
            size="l"
            value={title}
            onUpdate={(next) => {
              setTitle(next);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="Коротко о чём публикация"
            validationState={errors.title ? 'invalid' : undefined}
            errorMessage={errors.title}
          />
        </Flex>

        <MarkdownField
          label="Описание"
          name="description"
          value={description}
          onChange={(next) => {
            setDescription(next);
            if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          maxLength={DESCRIPTION_MAX_LENGTH}
          error={errors.description}
        />

        {submitted && (
          <Alert
            theme="success"
            title="Форма отправлена"
            message={`Публикация «${submitted.title}» сохранена (${submitted.description.length} символов описания).`}
            onClose={() => setSubmitted(null)}
          />
        )}

        <Flex gap={2}>
          <Button type="submit" view="action" size="l">
            Опубликовать
          </Button>
          <Button
            type="button"
            view="flat"
            size="l"
            onClick={() => {
              setTitle('');
              setDescription('');
              setErrors({});
              setSubmitted(null);
            }}
          >
            Очистить
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
