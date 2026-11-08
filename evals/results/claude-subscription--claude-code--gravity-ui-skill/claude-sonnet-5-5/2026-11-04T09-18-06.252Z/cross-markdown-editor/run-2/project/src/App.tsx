import React from 'react';
import {Button, Flex, Text, TextInput} from '@gravity-ui/uikit';
import type {MarkdownEditorInstance} from '@gravity-ui/markdown-editor';

import {MarkdownField} from './MarkdownField';

export function App() {
  const editorRef = React.useRef<MarkdownEditorInstance | null>(null);
  const [title, setTitle] = React.useState('');
  const [markup, setMarkup] = React.useState('');
  const [submitted, setSubmitted] = React.useState<{title: string; markup: string} | null>(null);
  const [touched, setTouched] = React.useState(false);

  const titleInvalid = touched && title.trim() === '';
  const bodyInvalid = touched && markup.trim() === '';

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (title.trim() === '' || markup.trim() === '') return;
    setSubmitted({title: title.trim(), markup});
  };

  const handleReset = () => {
    setTitle('');
    setMarkup('');
    setTouched(false);
    setSubmitted(null);
    editorRef.current?.clear();
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{padding: 24, maxWidth: 800, margin: '0 auto'}}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">Новая заметка</Text>

        <TextInput
          size="l"
          label="Заголовок: "
          placeholder="Введите заголовок"
          value={title}
          onUpdate={setTitle}
          validationState={titleInvalid ? 'invalid' : undefined}
          errorMessage={titleInvalid ? 'Укажите заголовок' : undefined}
        />

        <MarkdownField
          label="Текст (Markdown)"
          onChange={setMarkup}
          editorRef={editorRef}
          invalid={bodyInvalid}
          errorMessage="Введите текст"
        />

        <Flex gap={2}>
          <Button type="submit" view="action" size="l">
            Сохранить
          </Button>
          <Button type="button" view="flat" size="l" onClick={handleReset}>
            Сбросить
          </Button>
        </Flex>

        {submitted ? (
          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">Отправлено: {submitted.title}</Text>
            <pre
              style={{
                margin: 0,
                padding: 12,
                whiteSpace: 'pre-wrap',
                background: 'var(--g-color-base-generic)',
                borderRadius: 'var(--g-border-radius-m)',
              }}
            >
              {submitted.markup}
            </pre>
          </Flex>
        ) : null}
      </Flex>
    </form>
  );
}
