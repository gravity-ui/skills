import {useCallback, useState, type FormEvent} from 'react';
import {Button, Flex, Text, TextInput} from '@gravity-ui/uikit';
import type {MarkupString} from '@gravity-ui/markdown-editor';

import './i18n';
import {MarkdownField} from './MarkdownField';

const INITIAL_DESCRIPTION: MarkupString = `## Описание задачи

Напишите текст с **markdown**-разметкой — форматирование видно сразу справа.

- список
- \`код\`
- [ссылка](https://gravity-ui.com)
`;

interface FormValues {
  title: string;
  description: MarkupString;
}

export function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<MarkupString>(INITIAL_DESCRIPTION);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const handleDescriptionChange = useCallback((value: MarkupString) => {
    setDescription(value);
    setErrors((prev) => (prev.description ? {...prev, description: undefined} : prev));
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = 'Укажите заголовок';
    if (!description.trim()) nextErrors.description = 'Добавьте описание';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmitted(null);
      return;
    }
    setSubmitted({title: title.trim(), description});
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{padding: 'var(--g-spacing-6)', maxWidth: 960}}>
      <Flex direction="column" gap={5}>
        <Text variant="header-1">Новая задача</Text>

        <TextInput
          size="l"
          label="Заголовок"
          placeholder="Коротко о задаче"
          value={title}
          onUpdate={(value) => {
            setTitle(value);
            if (errors.title) setErrors((prev) => ({...prev, title: undefined}));
          }}
          validationState={errors.title ? 'invalid' : undefined}
          errorMessage={errors.title}
          hasClear
        />

        <MarkdownField
          label="Описание"
          initialValue={INITIAL_DESCRIPTION}
          onChange={handleDescriptionChange}
          placeholder="Текст с markdown-разметкой…"
          note="Поддерживается Markdown. Режим редактора переключается в меню настроек справа на панели."
          errorMessage={errors.description}
        />

        <Flex gap={2}>
          <Button type="submit" view="action" size="l">
            Сохранить
          </Button>
        </Flex>

        {submitted ? (
          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">Отправленные данные</Text>
            <Text variant="body-1">
              Заголовок: <Text variant="body-1" color="secondary">{submitted.title}</Text>
            </Text>
            <Text variant="code-1" as="pre" style={{margin: 0, whiteSpace: 'pre-wrap'}}>
              {submitted.description}
            </Text>
          </Flex>
        ) : null}
      </Flex>
    </form>
  );
}
