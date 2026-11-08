import { useMemo, useState } from 'react';
import { Button, Card, Text, TextArea, TextInput } from '@gravity-ui/uikit';

import { renderMarkdown } from './markdown';
import './App.css';

const DEFAULT_MARKDOWN = `# Описание задачи

Напишите здесь текст с **markdown**-разметкой — справа сразу появится результат.

## Что поддерживается

- *курсив* и **жирный** текст
- \`встроенный код\` и блоки кода
- [ссылки](https://gravity-ui.com), списки, таблицы

\`\`\`ts
const hello: string = 'мир';
\`\`\`

> Цитата тоже отобразится сразу.
`;

export function App() {
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [submitted, setSubmitted] = useState(false);

  const previewHtml = useMemo(() => renderMarkdown(markdown), [markdown]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="app">
      <div className="app__header">
        <Text variant="header-1">Новая задача</Text>
      </div>

      <Card view="raised" style={{ padding: 24 }}>
        <form className="app__form" onSubmit={handleSubmit}>
          <TextInput
            label="Название"
            placeholder="Краткое название задачи"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            size="l"
          />

          <div className="md-field">
            <Text variant="subheader-2">Описание (Markdown)</Text>
            <div className="md-field__panes">
              <TextArea
                className="md-field__editor"
                aria-label="Описание в формате Markdown"
                placeholder="Введите текст с markdown-разметкой…"
                value={markdown}
                onChange={(event) => {
                  setMarkdown(event.target.value);
                  setSubmitted(false);
                }}
              />
              <div className="md-field__preview" aria-live="polite">
                {markdown.trim() ? (
                  <div
                    className="md-body"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <Text color="secondary" className="md-field__preview-placeholder">
                    Здесь появится отформатированный текст
                  </Text>
                )}
              </div>
            </div>
          </div>

          <div>
            <Button view="action" size="l" type="submit">
              Создать задачу
            </Button>
          </div>

          {submitted && (
            <Text color="positive">
              Задача «{title.trim() || 'Без названия'}» сохранена с описанием в {markdown.length}{' '}
              символов.
            </Text>
          )}
        </form>
      </Card>
    </div>
  );
}
