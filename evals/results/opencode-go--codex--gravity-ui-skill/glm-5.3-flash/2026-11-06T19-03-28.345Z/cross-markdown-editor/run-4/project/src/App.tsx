import React from 'react';

import {
  configure,
  useMarkdownEditor,
  MarkdownEditorView,
  type RenderPreview,
  type MarkupString,
} from '@gravity-ui/markdown-editor';
import {Button, Card, Text} from '@gravity-ui/uikit';

import './App.css';
import {MarkdownPreview} from './MarkdownPreview';

configure({lang: 'ru'});

const initialMarkdown = `# Описание\n\nПоддерживается **жирный текст**, *курсив*, [ссылки](https://example.com) и списки:\n\n- первый пункт\n- второй пункт\n`;

export function App() {
  const [submittedMarkdown, setSubmittedMarkdown] = React.useState<MarkupString>();

  const renderPreview = React.useCallback<RenderPreview>(
    (previewParams) => <MarkdownPreview {...previewParams} />,
    [],
  );

  const editor = useMarkdownEditor({
    initial: {mode: 'wysiwyg', splitModeEnabled: true, markup: initialMarkdown},
    md: {html: false},
    markupConfig: {renderPreview, splitMode: 'horizontal'},
  });

  const handleSubmit = React.useCallback(() => {
    setSubmittedMarkdown(editor.getValue());
  }, [editor]);

  React.useEffect(() => {
    const handleSubmitEvent = () => setSubmittedMarkdown(editor.getValue());

    editor.on('submit', handleSubmitEvent);

    return () => {
      editor.off('submit', handleSubmitEvent);
    };
  }, [editor]);

  return (
    <div className="app">
      <Card className="app-card" type="container" view="outlined">
        <Text as="h1" variant="header-2">
          Статья
        </Text>

        <form onSubmit={handleSubmit}>
          <MarkdownEditorView editor={editor} stickyToolbar autofocus />

          <div className="app-actions">
            <Button type="submit" view="action">
              Сохранить
            </Button>
          </div>
        </form>

        {submittedMarkdown !== undefined && (
          <Text color="secondary" variant="body-2">
            Markdown сохранён ({String(submittedMarkdown).length} символов)
          </Text>
        )}
      </Card>
    </div>
  );
}
