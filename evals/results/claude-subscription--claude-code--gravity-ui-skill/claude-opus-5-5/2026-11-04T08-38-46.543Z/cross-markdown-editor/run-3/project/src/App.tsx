import { useCallback, useState, type FormEvent } from 'react';
import {
  configure as configureMarkdownEditor,
  useMarkdownEditor,
} from '@gravity-ui/markdown-editor';
import {
  Button,
  Card,
  Flex,
  Text,
  TextInput,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  configure as configureUikit,
  useToaster,
} from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';
import './App.css';

configureUikit({ lang: 'ru' });
configureMarkdownEditor({ lang: 'ru' });

// MarkdownEditorView shows notifications via uikit's toaster, so it needs a ToasterProvider.
const toaster = new Toaster();

interface Submitted {
  title: string;
  description: string;
}

function PostForm() {
  const { add: addToast } = useToaster();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  const editor = useMarkdownEditor({
    preset: 'default',
    md: { html: false, linkify: true, breaks: true },
    initial: { mode: 'wysiwyg' },
    wysiwygConfig: {
      placeholderOptions: {
        value: 'Пишите текст — **жирный**, _курсив_, # заголовок, - список…',
      },
    },
    markupConfig: {
      placeholder: 'Markdown-разметка',
    },
  });

  const titleError = showErrors && !title.trim() ? 'Укажите заголовок' : undefined;
  const descriptionError =
    showErrors && !description.trim() ? 'Добавьте описание' : undefined;

  const submit = useCallback(() => {
    const markup = editor.getValue();
    if (!title.trim() || !markup.trim()) {
      setShowErrors(true);
      return;
    }
    setSubmitted({ title: title.trim(), description: markup });
    setShowErrors(false);
    addToast({
      name: 'post-submitted',
      title: 'Форма отправлена',
      theme: 'success',
      autoHiding: 3000,
    });
  }, [editor, title, addToast]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setShowErrors(false);
    setSubmitted(null);
    editor.clear();
  };

  return (
    <Flex direction="column" gap={6} className="app">
      <Card view="outlined" className="app__card">
        <form noValidate onSubmit={handleSubmit}>
          <Flex direction="column" gap={5}>
            <Text variant="header-1">Новая публикация</Text>

            <TextInput
              label="Заголовок"
              size="l"
              value={title}
              onUpdate={setTitle}
              validationState={titleError ? 'invalid' : undefined}
              errorMessage={titleError}
              autoComplete="off"
            />

            <MarkdownField
              editor={editor}
              label="Описание"
              note="Поддерживается Markdown: форматирование применяется сразу. Режим разметки — в настройках редактора. Ctrl/⌘+Enter — отправить."
              errorMessage={descriptionError}
              onUpdate={setDescription}
              onSubmit={submit}
            />

            <Flex gap={2} justifyContent="flex-end" wrap>
              <Button view="flat" size="l" type="button" onClick={handleReset}>
                Сбросить
              </Button>
              <Button view="action" size="l" type="submit">
                Отправить
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>

      {submitted && (
        <Card view="filled" className="app__card">
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Отправленные данные</Text>
            <Text variant="body-1">
              <Text color="secondary">Заголовок:</Text> {submitted.title}
            </Text>
            <Text color="secondary">Описание (Markdown):</Text>
            <Text as="pre" variant="code-1" whiteSpace="break-spaces" className="app__markup">
              {submitted.description}
            </Text>
          </Flex>
        </Card>
      )}
    </Flex>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <PostForm />
      <ToasterComponent />
    </ToasterProvider>
  );
}
