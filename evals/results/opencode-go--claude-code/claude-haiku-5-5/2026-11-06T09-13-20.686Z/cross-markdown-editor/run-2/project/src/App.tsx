import { useState, type FormEvent } from 'react';
import { Button, Flex, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';

export function App() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState<{ title: string; body: string } | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted({ title: title.trim(), body });
  }

  function handleReset() {
    setTitle('');
    setBody('');
    setSubmitted(null);
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, maxWidth: 1100 }}>
      <Flex direction="column" gap={4}>
        <TextInput
          label="Заголовок"
          placeholder="Введите заголовок"
          value={title}
          onUpdate={setTitle}
          size="l"
        />

        <MarkdownField
          label="Текст (Markdown)"
          placeholder={'# Заголовок\n\n**Жирный**, *курсив*, `код`, [ссылка](https://example.com)\n\n- пункт списка'}
          value={body}
          onChange={setBody}
          minRows={10}
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
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(submitted, null, 2)}
          </pre>
        )}
      </Flex>
    </form>
  );
}
