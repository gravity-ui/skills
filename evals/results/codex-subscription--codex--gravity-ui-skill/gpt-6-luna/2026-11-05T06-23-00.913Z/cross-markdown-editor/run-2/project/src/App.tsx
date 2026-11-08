import { useState } from 'react';
import { Button, Text } from '@gravity-ui/uikit';
import { MarkdownEditorView, useMarkdownEditor } from '@gravity-ui/markdown-editor';

import './App.css';
import '@gravity-ui/markdown-editor/styles/styles.css';

export function App() {
  const [submittedText, setSubmittedText] = useState('');
  const editor = useMarkdownEditor({
    md: { html: false },
    initial: { markup: '' },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedText(editor.getValue());
  }

  return (
    <main className="markdown-form">
      <Text variant="header-1">Новое сообщение</Text>
      <form className="markdown-form__form" onSubmit={handleSubmit}>
        <label className="markdown-form__label" htmlFor="markdown-editor">
          <Text variant="subheader-2">Текст сообщения</Text>
        </label>
        <div id="markdown-editor" className="markdown-form__editor">
          <MarkdownEditorView editor={editor} stickyToolbar />
        </div>
        <Text variant="caption-1" color="secondary">
          Используйте панель инструментов или переключитесь в режим Markdown. Форматирование видно сразу.
        </Text>
        <div className="markdown-form__actions">
          <Button type="submit" view="action">Сохранить</Button>
        </div>
      </form>
      {submittedText && (
        <section className="markdown-form__result" aria-live="polite">
          <Text variant="subheader-2">Сохранённый Markdown</Text>
          <pre>{submittedText}</pre>
        </section>
      )}
    </main>
  );
}
