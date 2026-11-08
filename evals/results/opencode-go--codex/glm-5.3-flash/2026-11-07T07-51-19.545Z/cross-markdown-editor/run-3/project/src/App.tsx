import { marked } from 'marked';
import { Card, Flex, TextArea, Text } from '@gravity-ui/uikit';
import { useMemo, useState } from 'react';
import './MarkdownPreview.css';

const initialMarkdown = `# Заголовок

Пишите текст с **жирным**, *курсивом* и \`кодом\`.

## Список

- Первый пункт
- Второй пункт

[Ссылка](https://example.com) и цитата:

> Markdown рендерится сразу.
`;

export function App() {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const html = useMemo(() => marked.parse(markdown, { async: false }), [markdown]);

  return (
    <Flex direction="column" gap="4" style={{ padding: 24, maxWidth: 720 }}>
      <Text variant="header-2">Markdown-редактор</Text>

      <Card view="outlined">
        <Flex direction="column" gap="3" style={{ padding: 16 }}>
          <Text variant="subheader-2">Текст</Text>
          <TextArea
            value={markdown}
            placeholder="Введите Markdown"
            minRows={8}
            onUpdate={setMarkdown}
          />
        </Flex>
      </Card>

      <Card view="filled">
        <Flex direction="column" gap="2" style={{ padding: 16 }}>
          <Text variant="subheader-2">Предпросмотр</Text>
          <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: html }} />
        </Flex>
      </Card>
    </Flex>
  );
}
