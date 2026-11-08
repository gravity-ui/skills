import {useEffect, useState} from 'react';

import {
  MarkdownEditorView,
  useMarkdownEditor,
} from '@gravity-ui/markdown-editor';
import {Button, Flex, Text} from '@gravity-ui/uikit';

const initialDescription = '## Описание\n\nНапишите текст с **markdown-разметкой**.';

export function App() {
  const [description, setDescription] = useState(initialDescription);
  const [savedDescription, setSavedDescription] = useState<string | null>(null);

  const editor = useMarkdownEditor({
    initial: {markup: initialDescription, mode: 'wysiwyg'},
  });

  useEffect(() => {
    const updateDescription = () => setDescription(editor.getValue());
    editor.on('change', updateDescription);
    return () => {
      editor.off('change', updateDescription);
    };
  }, [editor]);

  const handleSubmit = () => {
    setSavedDescription(editor.getValue());
  };

  return (
    <Flex direction="column" gapRow={4} as="form" onSubmit={handleSubmit} className="form">
      <Text variant="header-2">Новая запись</Text>
      <MarkdownEditorView editor={editor} autofocus stickyToolbar />
      <Flex gap={2}>
        <Button type="submit" view="action">
          Сохранить
        </Button>
        {savedDescription !== null && <Text>Сохранено {savedDescription.length} символов</Text>}
      </Flex>
    </Flex>
  );
}
