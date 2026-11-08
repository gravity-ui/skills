import { useCallback, useRef, useState, type FormEvent } from 'react';
import { configure as configureMarkdownEditor, type MarkdownEditorInstance } from '@gravity-ui/markdown-editor';
import { Alert, Button, Card, Flex, Text, TextInput, configure as configureUikit } from '@gravity-ui/uikit';

import { MD_OPTIONS, MarkdownField } from './MarkdownField';
import { MarkdownPreview } from './MarkdownPreview';
import './App.css';

configureUikit({ lang: 'ru' });
configureMarkdownEditor({ lang: 'ru' });

type Submitted = { title: string; body: string };

export function App() {
  const editorRef = useRef<MarkdownEditorInstance | null>(null);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState<string>();
  const [bodyError, setBodyError] = useState<string>();
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  const handleEditorReady = useCallback((editor: MarkdownEditorInstance) => {
    editorRef.current = editor;
  }, []);

  const handleBodyChange = useCallback((markup: string) => {
    if (markup.trim()) setBodyError(undefined);
  }, []);

  const submit = useCallback(() => {
    const body = editorRef.current?.getValue() ?? '';
    const nextTitleError = title.trim() ? undefined : 'Введите заголовок';
    const nextBodyError = body.trim() ? undefined : 'Введите текст';
    setTitleError(nextTitleError);
    setBodyError(nextBodyError);
    if (nextTitleError || nextBodyError) return;

    setSubmitted({ title: title.trim(), body });
    setTitle('');
    editorRef.current?.clear();
  }, [title]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <div className="app">
      <Flex direction="column" gap={6} className="app__content">
        <Text variant="header-1">Новая публикация</Text>

        <form onSubmit={handleSubmit} noValidate>
          <Flex direction="column" gap={5}>
            <TextInput
              label="Заголовок"
              size="l"
              value={title}
              onUpdate={(value) => {
                setTitle(value);
                if (value.trim()) setTitleError(undefined);
              }}
              validationState={titleError ? 'invalid' : undefined}
              errorMessage={titleError}
            />

            <MarkdownField
              label="Текст"
              hint="Поддерживается Markdown: **жирный**, _курсив_, # заголовки, списки, `код`, ссылки. Справа — результат форматирования."
              placeholder="Начните писать…"
              errorMessage={bodyError}
              onChange={handleBodyChange}
              onSubmitShortcut={submit}
              onEditorReady={handleEditorReady}
            />

            <Flex gap={2} alignItems="center" wrap>
              <Button type="submit" view="action" size="l">
                Опубликовать
              </Button>
              <Text variant="body-1" color="secondary">
                или Ctrl/⌘ + Enter в редакторе
              </Text>
            </Flex>
          </Flex>
        </form>

        {submitted && (
          <Flex direction="column" gap={3}>
            <Alert
              theme="success"
              title="Публикация отправлена"
              onClose={() => setSubmitted(null)}
            />
            <Card view="outlined" className="app__result">
              <Flex direction="column" gap={3}>
                <Text variant="header-2">{submitted.title}</Text>
                <MarkdownPreview markup={submitted.body} md={MD_OPTIONS} />
              </Flex>
            </Card>
          </Flex>
        )}
      </Flex>
    </div>
  );
}
