import React from 'react';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import {MarkdownEditorView, type MarkupString, useMarkdownEditor} from '@gravity-ui/markdown-editor';

export function App() {
  // WYSIWYG mode (the default): markdown syntax is rendered as formatting while typing.
  const editor = useMarkdownEditor({md: {html: false}});
  const [submitted, setSubmitted] = React.useState<MarkupString | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(editor.getValue());
  }

  return (
    <form onSubmit={handleSubmit} style={{padding: 24}}>
      <Flex direction="column" gap={4}>
        <Text variant="subheader-1">Текст</Text>
        <MarkdownEditorView stickyToolbar editor={editor} />
        <Flex gap={2}>
          <Button type="submit" view="action">
            Отправить
          </Button>
        </Flex>
        {submitted !== null && (
          <Text variant="body-1" style={{whiteSpace: 'pre-wrap'}}>
            {submitted}
          </Text>
        )}
      </Flex>
    </form>
  );
}
