import { useCallback, useState, type FormEvent } from 'react';
import { Button, Card, Flex, Text, TextInput } from '@gravity-ui/uikit';
import type { MarkupString } from '@gravity-ui/markdown-editor';

import { MarkdownField } from './MarkdownField';
import './App.css';

const INITIAL_BODY: MarkupString = `## Заголовок

Обычный текст с **жирным**, _курсивом_ и \`кодом\`.

- пункт списка
- ещё пункт

> Цитата

[Ссылка](https://gravity-ui.com)
`;

interface FormValues {
  title: string;
  body: MarkupString;
}

interface FormErrors {
  title?: string;
  body?: string;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) {
    errors.title = 'Введите заголовок';
  }
  if (!values.body.trim()) {
    errors.body = 'Введите текст';
  }
  return errors;
}

export function App() {
  const [values, setValues] = useState<FormValues>({ title: '', body: INITIAL_BODY });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const handleTitleChange = useCallback((title: string) => {
    setValues((prev) => ({ ...prev, title }));
    setErrors((prev) => ({ ...prev, title: undefined }));
  }, []);

  const handleBodyChange = useCallback((body: MarkupString) => {
    setValues((prev) => ({ ...prev, body }));
    setErrors((prev) => ({ ...prev, body: undefined }));
  }, []);

  const submit = useCallback((next: FormValues) => {
    const nextErrors = validate(next);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(next);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(values);
  };

  // Ctrl/Cmd+Enter inside the editor submits the whole form with the freshest markup.
  const handleEditorSubmit = useCallback(
    (body: MarkupString) => {
      setValues((prev) => {
        const next = { ...prev, body };
        submit(next);
        return next;
      });
    },
    [submit],
  );

  return (
    <form className="post-form" onSubmit={handleSubmit} noValidate>
      <Flex direction="column" gap={5}>
        <Text variant="header-1">Новая запись</Text>

        <TextInput
          size="l"
          label="Заголовок"
          placeholder="О чём запись?"
          value={values.title}
          onUpdate={handleTitleChange}
          validationState={errors.title ? 'invalid' : undefined}
          errorMessage={errors.title}
          hasClear
        />

        <MarkdownField
          label="Текст"
          initialValue={INITIAL_BODY}
          onChange={handleBodyChange}
          onSubmit={handleEditorSubmit}
          note="Слева — Markdown-разметка, справа — как это будет выглядеть. Ctrl+Enter отправляет форму."
          errorMessage={errors.body}
        />

        <Flex gap={2}>
          <Button type="submit" view="action" size="l">
            Опубликовать
          </Button>
          <Button type="reset" view="flat" size="l" onClick={() => setSubmitted(null)}>
            Сбросить результат
          </Button>
        </Flex>

        {submitted ? (
          <Card view="filled" theme="success" type="container">
            <Flex direction="column" gap={2} className="post-form__submitted">
              <Text variant="subheader-2">Отправлено: {submitted.title}</Text>
              <Text variant="caption-2" color="secondary">
                Markdown, который уйдёт на сервер:
              </Text>
              <pre className="post-form__result">{submitted.body}</pre>
            </Flex>
          </Card>
        ) : null}
      </Flex>
    </form>
  );
}
