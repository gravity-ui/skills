import React from 'react';
import {Button, Card, Flex, Text, TextInput} from '@gravity-ui/uikit';
import type {MarkupString} from '@gravity-ui/markdown-editor';

import {MarkdownField} from './MarkdownField';

const INITIAL_MARKDOWN = '## Заголовок\n\nПишите **жирный**, _курсив_ или `код`.\n\n- пункт списка\n- ещё пункт\n';

export function App() {
  const [title, setTitle] = React.useState('');
  const [submitted, setSubmitted] = React.useState<{title: string; body: MarkupString} | null>(
    null,
  );
  const getBodyRef = React.useRef<(() => MarkupString) | null>(null);

  const submit = React.useCallback(() => {
    setSubmitted({title, body: getBodyRef.current?.() ?? ''});
  }, [title]);

  return (
    <Flex justifyContent="center" style={{padding: 24}}>
      <form
        style={{width: '100%', maxWidth: 800, minWidth: 0}}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Flex direction="column" gap={4}>
          <Text variant="header-1">Новая запись</Text>

          <TextInput
            size="l"
            label="Название"
            placeholder="Введите название"
            value={title}
            onUpdate={setTitle}
          />

          <MarkdownField
            label="Описание (Markdown)"
            defaultValue={INITIAL_MARKDOWN}
            getValueRef={getBodyRef}
            onSubmit={submit}
          />

          <Flex>
            <Button type="submit" view="action" size="l">
              Сохранить
            </Button>
          </Flex>

          {submitted && (
            <Card view="outlined" type="container" style={{padding: 16}}>
              <Flex direction="column" gap={2}>
                <Text variant="subheader-1">Отправлено: {submitted.title || '—'}</Text>
                <pre style={{margin: 0, whiteSpace: 'pre-wrap', minWidth: 0}}>{submitted.body}</pre>
              </Flex>
            </Card>
          )}
        </Flex>
      </form>
    </Flex>
  );
}
