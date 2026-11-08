import {useState, type FormEvent} from 'react';
import {MarkdownEditorView, useMarkdownEditor} from '@gravity-ui/markdown-editor';
import {Button, Text, TextInput} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [title, setTitle] = useState('');
  const editor = useMarkdownEditor({
    md: {html: false},
    initial: {markup: ''},
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <main className="page-shell">
      <div className="editor-page">
        <header className="page-heading">
          <Text variant="subheader-2" color="complementary">
            БЛОГ · НОВАЯ ПУБЛИКАЦИЯ
          </Text>
          <Text variant="display-2" as="h1">
            Создать публикацию
          </Text>
          <Text variant="body-2" color="secondary">
            Напишите текст в Markdown — форматирование будет видно сразу.
          </Text>
        </header>

        <form className="editor-form" onSubmit={handleSubmit}>
          <section className="form-section title-section">
            <label className="field-label" htmlFor="article-title">
              Заголовок
            </label>
            <TextInput
              id="article-title"
              size="xl"
              placeholder="Например, заметки о новом проекте"
              value={title}
              onUpdate={setTitle}
            />
          </section>

          <section className="form-section">
            <div className="field-heading">
              <label className="field-label">Текст публикации</label>
              <Text variant="body-1" color="secondary">
                Markdown
              </Text>
            </div>
            <div className="markdown-field">
              <MarkdownEditorView editor={editor} stickyToolbar />
            </div>
            <Text variant="body-1" color="secondary">
              Можно писать обычный Markdown или использовать панель форматирования.
            </Text>
          </section>

          <footer className="form-footer">
            <Text variant="body-1" color="secondary">
              Изменения сохраняются после публикации.
            </Text>
            <Button type="submit" view="action" size="l">
              Опубликовать
            </Button>
          </footer>
        </form>
      </div>
    </main>
  );
}
