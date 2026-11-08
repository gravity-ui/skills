import { useState, useMemo } from 'react';
import { Card, TextArea } from '@gravity-ui/uikit';
import { marked } from 'marked';

const mdStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
  height: '100vh',
  padding: 16,
  boxSizing: 'border-box',
};

const paneStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const previewStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: 16,
  lineHeight: 1.6,
};

const placeholder = `# Привет!\n\nПиши **Markdown** и сразу смотри результат.\n\n- списки\n- *курсив*\n- ~~зачёркнутый~~\n\n\`\`\`js\nconsole.log('code block');\n\`\`\``;

export function App() {
  const [text, setText] = useState(placeholder);

  const html = useMemo(() => {
    return marked.parse(text) as string;
  }, [text]);

  return (
    <div style={mdStyle}>
      <div style={paneStyle}>
        <TextArea
          value={text}
          onUpdate={setText}
          minRows={10}
          controlProps={{ style: { flex: 1, resize: 'none', fontFamily: 'monospace' } }}
        />
      </div>
      <div style={paneStyle}>
        <Card style={previewStyle}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </Card>
      </div>
    </div>
  );
}
