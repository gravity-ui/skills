import React from 'react';
import { Card, Text, TextArea } from '@gravity-ui/uikit';

import { MarkdownView } from './markdown';
import './markdown.css';

const DEFAULT_VALUE = `# Привет, markdown!

Напишите что-нибудь **жирным**, *курсивом* или ~~зачёркнутым~~.

## Что поддерживается

- маркированные списки
- \`inline code\`
- [ссылки](https://gravity-ui.com)

> Цитаты тоже работают.

1. Первый пункт
2. Второй пункт

\`\`\`
const hello = "блок кода";
\`\`\`
`;

export function App() {
  const [value, setValue] = React.useState(DEFAULT_VALUE);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Text variant="header-1" as="div" style={{ marginBottom: 16 }}>
        Редактор с markdown-разметкой
      </Text>

      <form onSubmit={(e) => e.preventDefault()}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <div>
            <label htmlFor="markdown-input">
              <Text variant="subheader-2" as="div" style={{ marginBottom: 8 }}>
                Текст с markdown-разметкой
              </Text>
            </label>
            <TextArea
              id="markdown-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              minRows={16}
              placeholder="Начните печатать… Поддерживается markdown: **жирный**, *курсив*, # заголовки, списки, цитаты, код"
              style={{ width: '100%' }}
            />
          </div>

          <div aria-live="polite">
            <Text variant="subheader-2" as="div" style={{ marginBottom: 8 }}>
              Предпросмотр
            </Text>
            <Card style={{ padding: 16, minHeight: 120 }}>
              {value.trim() ? (
                <MarkdownView markdown={value} />
              ) : (
                <Text color="secondary" className="md-empty">
                  Здесь появится отформатированный текст
                </Text>
              )}
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
