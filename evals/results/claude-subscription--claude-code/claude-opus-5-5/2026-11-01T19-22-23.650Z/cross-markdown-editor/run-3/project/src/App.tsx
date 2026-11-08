import { useCallback, useRef, useState, type FormEvent } from 'react';
import { configure as configureEditor } from '@gravity-ui/markdown-editor';
import {
  Button,
  Card,
  Text,
  TextInput,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  configure as configureUikit,
} from '@gravity-ui/uikit';

import { MarkdownField, type MarkdownFieldHandle } from './MarkdownField';
import { MarkdownPreview } from './MarkdownPreview';

// Interface language for UIKit and the markdown editor (toolbar, tooltips).
configureUikit({ lang: 'ru' });
configureEditor({ lang: 'ru' });

// The markdown editor shows toasts (e.g. on copy) and requires a toaster context.
const toaster = new Toaster();

type Submitted = { title: string; description: string };

const PREVIEW_MD = { html: false, breaks: true, linkify: true } as const;

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <NoteForm />
      <ToasterComponent />
    </ToasterProvider>
  );
}

function NoteForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const descriptionRef = useRef<MarkdownFieldHandle>(null);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
    setErrors((prev) => (prev.description ? { ...prev, description: undefined } : prev));
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = {
      title: title.trim() ? undefined : 'Введите заголовок',
      description: description.trim() ? undefined : 'Добавьте описание',
    };
    setErrors(nextErrors);
    if (nextErrors.title) return;
    if (nextErrors.description) {
      descriptionRef.current?.focus();
      return;
    }

    setSubmitted({ title: title.trim(), description });
    setTitle('');
    setDescription('');
    descriptionRef.current?.clear();
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <form
        noValidate
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <Text as="h1" variant="header-1">
          Новая заметка
        </Text>

        <TextInput
          size="l"
          label="Заголовок"
          value={title}
          onUpdate={(value) => {
            setTitle(value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          validationState={errors.title ? 'invalid' : undefined}
          errorMessage={errors.title}
        />

        <MarkdownField
          ref={descriptionRef}
          label="Описание"
          placeholder="Поддерживается Markdown: **жирный**, _курсив_, # заголовки, списки, ссылки…"
          hint="Слева — разметка, справа — результат. Режим можно сменить в меню настроек редактора."
          error={errors.description}
          onChange={handleDescriptionChange}
        />

        <div>
          <Button type="submit" view="action" size="l">
            Сохранить
          </Button>
        </div>
      </form>

      {submitted && (
        <Card view="outlined" style={{ marginTop: 32, padding: 20 }}>
          <Text as="div" variant="caption-2" color="secondary">
            Отправлено
          </Text>
          <Text as="h2" variant="header-1" style={{ margin: '4px 0 12px' }}>
            {submitted.title}
          </Text>
          <MarkdownPreview getValue={() => submitted.description} md={PREVIEW_MD} />
        </Card>
      )}
    </div>
  );
}
