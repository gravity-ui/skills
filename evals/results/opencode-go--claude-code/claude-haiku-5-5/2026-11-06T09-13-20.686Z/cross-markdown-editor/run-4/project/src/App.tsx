import { useState, type FormEvent } from 'react';
import { Button, Card, Text, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';
import { renderMarkdown } from './markdown';

type Submitted = { title: string; body: string };

export function App() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted({ title: title.trim(), body });
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <TextInput
          label="Заголовок"
          name="title"
          value={title}
          onUpdate={setTitle}
          placeholder="Введите заголовок"
        />

        <MarkdownField
          label="Текст (поддерживается markdown)"
          name="body"
          value={body}
          onUpdate={setBody}
          placeholder={'# Заголовок\n\n**жирный**, *курсив*, `код`\n\n- пункт списка\n- ещё пункт'}
        />

        <div>
          <Button type="submit" view="action" size="l" disabled={!body.trim()}>
            Отправить
          </Button>
        </div>
      </form>

      {submitted && (
        <Card view="outlined" style={{ marginTop: 24, padding: 16 }}>
          <Text variant="subheader-2" as="h2">
            {submitted.title || 'Без заголовка'}
          </Text>
          <div
            className="md-preview"
            style={{ marginTop: 12 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(submitted.body) }}
          />
        </Card>
      )}
    </div>
  );
}
