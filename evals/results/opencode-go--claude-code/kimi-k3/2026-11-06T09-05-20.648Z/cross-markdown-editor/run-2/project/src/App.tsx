import { useMemo, useState } from 'react';
import { Card, Text, TextArea } from '@gravity-ui/uikit';

import { renderMarkdown } from './markdown';
import './app.css';

const INITIAL_VALUE = `# Привет, Markdown!

Пишите текст слева — **форматирование** появится справа *сразу*.

## Что поддерживается

- **Жирный** и *курсивный* текст
- ~~Зачёркнутый~~ текст и \`inline-код\`
- Списки, цитаты и [ссылки](https://gravity-ui.com)

> Цитата оформляется автоматически.

\`\`\`
// И блоки кода тоже
const hello = 'world';
\`\`\`
`;

export function App() {
  const [value, setValue] = useState(INITIAL_VALUE);

  const preview = useMemo(() => renderMarkdown(value), [value]);

  return (
    <div className="page">
      <Card className="form-card" view="raised">
        <h1 className="form-title">
          <Text variant="header-1">Новая заметка</Text>
        </h1>
        <div className="form-subtitle">
          <Text variant="body-1" color="secondary">
            Текст с markdown-разметкой форматируется на лету
          </Text>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="editor-grid">
            <div>
              <label className="field-label" htmlFor="md-field">
                <Text variant="subheader-2">Текст</Text>
              </label>
              <TextArea
                id="md-field"
                value={value}
                onUpdate={setValue}
                rows={16}
                size="l"
                placeholder="Введите текст с markdown-разметкой…"
              />
              <Text className="field-hint" variant="caption-1" color="secondary">
                # заголовок, **жирный**, *курсив*, `код`, - список, &gt; цитата
              </Text>
            </div>

            <div>
              <Text className="field-label" variant="subheader-2">
                Предпросмотр
              </Text>
              <div className="preview-pane" aria-live="polite">
                {value.trim() ? (
                  preview
                ) : (
                  <span className="preview-empty">Здесь появится форматированный текст…</span>
                )}
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
