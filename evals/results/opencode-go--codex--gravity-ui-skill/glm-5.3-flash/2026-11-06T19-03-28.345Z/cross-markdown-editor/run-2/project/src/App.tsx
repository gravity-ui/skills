import '@gravity-ui/markdown-editor/styles/styles.css';
import '@diplodoc/transform/dist/css/yfm.css';

import React from 'react';
import {Button, Flex} from '@gravity-ui/uikit';
import transform from '@diplodoc/transform';
import {
  MarkdownEditorView,
  useMarkdownEditor,
} from '@gravity-ui/markdown-editor';

import './App.css';

const initialMarkup = `## Краткое описание\n\nВыделите **важное**, добавьте \`код\` или список:\n\n- первый пункт\n- второй пункт\n`;

export function App() {
  const [submittedValue, setSubmittedValue] = React.useState<string>();

  const editor = useMarkdownEditor({
    md: {breaks: true, linkify: true},
    initial: {markup: initialMarkup, mode: 'wysiwyg', splitModeEnabled: true},
    markupConfig: {
      splitMode: 'vertical',
      renderPreview: ({getValue}) => {
        const {result: {html}} = transform(getValue(), {breaks: true, linkify: true});

        return <div className="markdown-preview" dangerouslySetInnerHTML={{__html: html}} />;
      },
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedValue(editor.getValue());
  }

  return (
    <main className="page">
      <form className="form" onSubmit={handleSubmit}>
        <h1 className="title">Новая запись</h1>

        <div className="field">
          <label className="field-label" htmlFor="markdown-content">
            Текст записи
          </label>
          <MarkdownEditorView stickyToolbar editor={editor} autofocus />
        </div>

        <Flex justifyContent="space-between" alignItems="center" gap="4">
          {submittedValue ? (
            <span className="submitted-hint">
              Сохранено {submittedValue.length} символов
            </span>
          ) : (
            <span className="submitted-hint">
              Markdown доступен в разметке и визуальном режиме
            </span>
          )}
          <Button type="submit" view="action">
            Сохранить
          </Button>
        </Flex>
      </form>
    </main>
  );
}
