import {useCallback, useState, type FormEvent} from 'react';
import transform from '@diplodoc/transform';
import {MarkdownEditorView, YfmStaticView, configure as configureMarkdownEditor, useMarkdownEditor, type RenderPreview} from '@gravity-ui/markdown-editor';
import {Button, Text, configure as configureUIKit} from '@gravity-ui/uikit';

import './App.css';

configureUIKit({lang: 'ru'});
configureMarkdownEditor({lang: 'ru'});

const initialText = `## Новая заметка

Напишите текст и добавьте **форматирование** с помощью Markdown.

- Список задач
- Ссылки и выделение`;

export function App() {
  const [savedText, setSavedText] = useState('');
  const renderPreview = useCallback<RenderPreview>(({getValue, md}) => {
    const {result} = transform(getValue(), {
      allowHTML: md.html,
      breaks: md.breaks,
      linkify: md.linkify,
      linkifyTlds: md.linkifyTlds,
    });

    return <YfmStaticView html={result.html} className="markdown-form__preview-content" />;
  }, []);

  const editor = useMarkdownEditor({
    preset: 'commonmark',
    initial: {markup: initialText, mode: 'markup', splitModeEnabled: true, toolbarVisible: true},
    markupConfig: {renderPreview, splitMode: 'vertical', placeholder: 'Введите текст в формате Markdown…'},
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedText(editor.getValue());
  };

  return (
    <main className="page-shell">
      <form className="markdown-form" onSubmit={handleSubmit}>
        <header className="markdown-form__header">
          <div>
            <Text variant="header-1">Создать заметку</Text>
            <Text className="markdown-form__description" color="secondary">
              Пишите в Markdown и сразу смотрите, как будет выглядеть текст.
            </Text>
          </div>
          <span className="markdown-form__format">MARKDOWN</span>
        </header>

        <label className="markdown-form__label">Текст заметки</label>
        <section className="markdown-form__editor" aria-label="Редактор Markdown">
          <MarkdownEditorView editor={editor} stickyToolbar />
        </section>

        <footer className="markdown-form__footer">
          <Text variant="caption-1" color="secondary">Изменения сохраняются после нажатия кнопки</Text>
          <Button type="submit" view="action" size="l">Сохранить заметку</Button>
        </footer>

        {savedText && (
          <div className="markdown-form__saved" role="status">
            <Text variant="subheader-2">Заметка сохранена</Text>
            <Text color="secondary">Сохранён исходный текст Markdown ({savedText.length} символов).</Text>
          </div>
        )}
      </form>
    </main>
  );
}
