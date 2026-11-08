import React, { useState, useMemo } from 'react';
import { TextArea, Flex, Card, Box, Text, Divider } from '@gravity-ui/uikit';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './MarkdownEditor.css';

const DEFAULT_MD = `# 👋 Привет!

Это **живой** редактор markdown.

## Что можно делать:

- Писать **жирный** и *курсивный* текст
- Вставлять \`код\`
- Создавать списки

> Цитаты тоже работают

\`\`\`js
console.log('Hello, world!');
\`\`\`
`;

const renderMarkdown = (raw: string): string => {
  const html = marked.parse(raw, { async: false }) as string;
  return DOMPurify.sanitize(html);
};

export function MarkdownEditor() {
  const [md, setMd] = useState(DEFAULT_MD);

  const previewHtml = useMemo(() => renderMarkdown(md), [md]);

  return (
    <Box style={{ height: '100vh' }}>
      <Flex direction="column" style={{ height: '100vh', padding: 16 }} gap={4}>
        <Text variant="header-2">📝 Markdown Editor</Text>
        <Flex grow style={{ minHeight: 0 }} gap={4}>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }} view="outlined">
            <Box spacing={{ p: 3 }}>
              <Text variant="subheader-2">✏️ Редактор</Text>
            </Box>
            <Divider />
            <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <TextArea
                value={md}
                onUpdate={(v) => setMd(v)}
                minRows={10}
                controlProps={{
                  style: {
                    height: '100%',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    minHeight: 200,
                  },
                }}
              />
            </Box>
          </Card>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }} view="outlined">
            <Box spacing={{ p: 3 }}>
              <Text variant="subheader-2">👁️ Превью</Text>
            </Box>
            <Divider />
            <Box
              className="markdown-preview"
              style={{
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                padding: 16,
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </Card>
        </Flex>
      </Flex>
    </Box>
  );
}
