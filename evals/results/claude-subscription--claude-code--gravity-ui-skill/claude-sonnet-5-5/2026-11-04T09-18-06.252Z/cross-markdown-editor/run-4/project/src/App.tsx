import React from 'react';
import {Button, Card, Flex, Text, TextInput} from '@gravity-ui/uikit';
import {MarkdownField, type MarkdownFieldHandle} from './MarkdownField';

export function App() {
  const [title, setTitle] = React.useState('');
  const [error, setError] = React.useState<string>();
  const [submitted, setSubmitted] = React.useState<{title: string; body: string}>();
  const bodyRef = React.useRef<MarkdownFieldHandle>(null);

  const handleBodyChange = React.useCallback((value: string) => {
    if (value.trim()) setError(undefined);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const body = bodyRef.current?.getValue() ?? '';
    if (!body.trim()) {
      setError('Введите текст');
      return;
    }
    setSubmitted({title, body});
  };

  return (
    <form onSubmit={handleSubmit} style={{padding: 24, maxWidth: 800, margin: '0 auto'}}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">Новая заметка</Text>
        <TextInput
          label="Заголовок"
          placeholder="Заголовок"
          value={title}
          onUpdate={setTitle}
        />
        <MarkdownField
          ref={bodyRef}
          label="Текст (markdown)"
          onChange={handleBodyChange}
          error={error}
        />
        <Flex>
          <Button type="submit" view="action" size="l">
            Отправить
          </Button>
        </Flex>
        {submitted ? (
          <Card view="outlined" type="container" style={{padding: 16}}>
            <Flex direction="column" gap={2}>
              <Text variant="subheader-1">{submitted.title || 'Без заголовка'}</Text>
              <Text variant="code-2" style={{whiteSpace: 'pre-wrap'}}>
                {submitted.body}
              </Text>
            </Flex>
          </Card>
        ) : null}
      </Flex>
    </form>
  );
}
