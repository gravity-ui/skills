import { useCallback, useId, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, Flex, Text, TextInput, sp } from '@gravity-ui/uikit';

import { MarkdownField, type MarkdownFieldHandle } from './MarkdownField';

type Submitted = { title: string; description: string };

export function App() {
  const formRef = useRef<HTMLFormElement>(null);
  const descriptionRef = useRef<MarkdownFieldHandle>(null);
  const titleId = useId();

  const [title, setTitle] = useState('');
  const [descriptionEmpty, setDescriptionEmpty] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  const titleError = showErrors && !title.trim() ? 'Введите заголовок' : undefined;
  const descriptionError = showErrors && descriptionEmpty ? 'Введите описание' : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const description = descriptionRef.current?.getValue().trim() ?? '';

    if (!title.trim() || !description) {
      setDescriptionEmpty(!description);
      setShowErrors(true);
      return;
    }

    setSubmitted({ title: title.trim(), description });
    setShowErrors(false);
  };

  const handleReset = () => {
    setTitle('');
    descriptionRef.current?.clear();
    setDescriptionEmpty(true);
    setShowErrors(false);
    setSubmitted(null);
  };

  // Ctrl/Cmd + Enter in the editor submits the form.
  const handleEditorSubmit = useCallback(() => formRef.current?.requestSubmit(), []);

  return (
    <Flex direction="column" gap={6} className={sp({ p: 6 })} style={{ maxWidth: 840, margin: '0 auto' }}>
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <Flex direction="column" gap={5}>
          <Text variant="header-1">Новая заметка</Text>

          <Flex direction="column" gap={1}>
            <Text as="label" htmlFor={titleId} variant="subheader-1">
              Заголовок
            </Text>
            <TextInput
              id={titleId}
              size="l"
              placeholder="Коротко о главном"
              value={title}
              onUpdate={setTitle}
              validationState={titleError ? 'invalid' : undefined}
              errorMessage={titleError}
            />
          </Flex>

          <MarkdownField
            ref={descriptionRef}
            label="Описание"
            placeholder="Пишите с Markdown: **жирный**, _курсив_, # Заголовок, - список, > цитата"
            note="Разметка сразу превращается в форматирование. Ctrl/⌘ + Enter — отправить."
            errorMessage={descriptionError}
            onEmptyChange={setDescriptionEmpty}
            onSubmit={handleEditorSubmit}
          />

          <Flex gap={2}>
            <Button type="submit" view="action" size="l">
              Сохранить
            </Button>
            <Button type="button" view="flat" size="l" onClick={handleReset}>
              Очистить
            </Button>
          </Flex>
        </Flex>
      </form>

      {submitted && (
        <Alert
          theme="success"
          title={`Сохранено: ${submitted.title}`}
          message={
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {submitted.description}
            </pre>
          }
        />
      )}
    </Flex>
  );
}
