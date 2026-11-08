import React, { useState } from 'react';
import { TextArea, Card, Text, Flex } from '@gravity-ui/uikit';
import { marked } from 'marked';
import './markdown.css';

const renderMarkdown = (raw: string): string => {
  if (!raw.trim()) return '';
  return marked.parse(raw, { breaks: true }) as string;
};

export function MarkdownEditor() {
  const [text, setText] = useState(
    '# Hello, Markdown!\n\nType **markdown** here and see the *live preview*.\n\n- item 1\n- item 2\n\n> A blockquote\n\n```js\nconsole.log("code block");\n```',
  );

  return (
    <Flex gap={4} style={{ height: 'calc(100vh - 48px)' }}>
      <Card style={{ flex: 1, padding: 16 }} view="outlined" type="container">
        <Text variant="subheader-2" style={{ marginBottom: 8 }}>
          Markdown
        </Text>
        <TextArea
          value={text}
          onUpdate={setText}
          minRows={20}
          controlProps={{
            style: {
              fontFamily: 'monospace',
              height: '100%',
              resize: 'none',
            },
          }}
        />
      </Card>

      <Card style={{ flex: 1, padding: 16, overflow: 'auto' }} view="outlined" type="container">
        <Text variant="subheader-2" style={{ marginBottom: 8 }}>
          Preview
        </Text>
        <div
          className="markdown-preview"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
        />
      </Card>
    </Flex>
  );
}
