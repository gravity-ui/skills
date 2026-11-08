import { useState } from 'react';
import { Button, Card, Flex, Text, TextArea, TextInput } from '@gravity-ui/uikit';

import { renderMarkdown } from './markdown';
import './markdown-editor.css';

const EXAMPLE = [
  '# Привет, Markdown!',
  '',
  'Это поле поддерживает **жирный**, *курсив*, ~~зачёркнутый~~ и `код`.',
  '',
  '## Списки',
  '',
  '- первый пункт',
  '- второй пункт',
  '',
  '1. раз',
  '2. два',
  '',
  '> Цитата с [ссылкой](https://gravity-ui.com).',
  '',
  '```',
  'const hello = "code block";',
  '```',
  '',
  '---',
].join('\n');

interface FormData {
  title: string;
  markdown: string;
}

export function App() {
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [saved, setSaved] = useState<FormData | null>(null);

  const hasMarkdown = markdown.trim().length > 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <Text variant="header-1">Новая заметка</Text>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved({ title, markdown });
        }}
      >
        <Flex direction="column" gap={4} style={{ marginTop: 16 }}>
          <div>
            <Text variant="subheader-1" as="div">
              Заголовок
            </Text>
            <TextInput
              value={title}
              onUpdate={setTitle}
              placeholder="Введите заголовок"
              size="l"
            />
          </div>

          <div>
            <Text variant="subheader-1" as="div">
              Текст (Markdown) — форматирование видно сразу справа
            </Text>
            <div className="markdown-editor">
              <TextArea
                value={markdown}
                onUpdate={setMarkdown}
                placeholder={'## Заголовок\n\nПишите текст с **markdown**-разметкой…'}
                size="l"
              />
              <Card className="markdown-preview" view="outlined">
                {hasMarkdown ? (
                  renderMarkdown(markdown)
                ) : (
                  <Text color="secondary">
                    Предпросмотр появится здесь, как только вы начнёте печатать.
                  </Text>
                )}
              </Card>
            </div>
          </div>

          <Flex gap={2}>
            <Button view="action" type="submit" size="l">
              Сохранить
            </Button>
            <Button type="button" size="l" onClick={() => setMarkdown(EXAMPLE)}>
              Вставить пример
            </Button>
            <Button
              type="button"
              size="l"
              view="flat"
              onClick={() => {
                setMarkdown('');
                setSaved(null);
              }}
            >
              Очистить
            </Button>
          </Flex>
        </Flex>
      </form>

      {saved && (
        <Card view="filled" style={{ marginTop: 24, padding: 16 }}>
          <Text variant="subheader-2" as="div">
            Сохранено: {saved.title || '(без заголовка)'}
          </Text>
          <div className="markdown-preview" style={{ minHeight: 0, padding: '8px 0 0' }}>
            {renderMarkdown(saved.markdown)}
          </div>
        </Card>
      )}
    </div>
  );
}
