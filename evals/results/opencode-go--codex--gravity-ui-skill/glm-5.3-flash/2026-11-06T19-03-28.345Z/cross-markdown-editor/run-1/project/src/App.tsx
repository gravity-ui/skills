import { useCallback } from 'react';

import { MarkdownEditorView, useMarkdownEditor } from '@gravity-ui/markdown-editor';
import { Button, Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const editor = useMarkdownEditor({
    initial: {
      mode: 'wysiwyg',
    },
    md: {
      html: false,
      breaks: true,
      linkify: true,
    },
  });

  const handleSubmit = useCallback(() => {
    console.log(editor.getValue());
  }, [editor]);

  return (
    <Flex direction="column" gap={4} maxWidth={760} width="100%" spacing={{ px: 4, py: 5 }}>
      <Text variant="display-2" as="h1">
        Добавить сообщение
      </Text>

      <Flex direction="column" gap={3}>
        <Text variant="subheader-1" as="label">
          Текст сообщения
        </Text>
        <MarkdownEditorView editor={editor} stickyToolbar autofocus />
      </Flex>

      <Flex gap={3} justifyContent="flex-end">
        <Button view="action" size="l" onClick={handleSubmit}>
          Отправить
        </Button>
      </Flex>
    </Flex>
  );
}
