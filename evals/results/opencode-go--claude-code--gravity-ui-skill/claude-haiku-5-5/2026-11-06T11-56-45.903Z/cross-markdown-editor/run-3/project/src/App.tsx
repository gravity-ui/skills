import {useCallback, useState, type FormEvent} from 'react';
import {configure as configureMarkdownEditor, type MarkupString} from '@gravity-ui/markdown-editor';
import {Box, Button, Flex, Text, configure as configureUIKit} from '@gravity-ui/uikit';

import {MarkdownField} from './MarkdownField';

configureUIKit({lang: 'ru'});
configureMarkdownEditor({lang: 'ru'});

export function App() {
  const [markdown, setMarkdown] = useState<MarkupString>('' as MarkupString);
  const [submitted, setSubmitted] = useState<MarkupString | null>(null);

  const handleMarkdownChange = useCallback((value: MarkupString) => {
    setMarkdown(value);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(markdown);
  };

  return (
    <Box spacing={{p: 6}} style={{maxWidth: 1200}}>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={4}>
          <MarkdownField label="Текст (Markdown)" onChange={handleMarkdownChange} />

          <Flex gap={2}>
            <Button type="submit" view="action" size="l">
              Отправить
            </Button>
          </Flex>
        </Flex>
      </form>

      {submitted !== null && (
        <Box spacing={{mt: 6}}>
          <Text variant="subheader-1" as="div" style={{marginBottom: 8}}>
            Отправлено
          </Text>
          <pre style={{whiteSpace: 'pre-wrap', margin: 0}}>{submitted}</pre>
        </Box>
      )}
    </Box>
  );
}
