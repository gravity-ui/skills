import React from 'react';
import {FormRow} from '@gravity-ui/components';
import {Button, Flex, Text, TextInput, configure} from '@gravity-ui/uikit';

import {MarkdownField, useMarkdownField} from './MarkdownField';

configure({lang: 'ru'});

export function App() {
  const [title, setTitle] = React.useState('');
  const [submitted, setSubmitted] = React.useState<{title: string; markdown: string} | null>(null);
  const editor = useMarkdownField('## Привет!\n\nПопробуйте **жирный**, *курсив* и списки:\n\n- первый пункт\n- второй пункт\n');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted({title, markdown: editor.getValue()});
  };

  return (
    <form onSubmit={handleSubmit} style={{padding: 24, maxWidth: 800, margin: '0 auto'}}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">Новая заметка</Text>

        <FormRow label="Заголовок" fieldId="note-title" direction="column">
          <TextInput id="note-title" value={title} onUpdate={setTitle} placeholder="Введите заголовок" />
        </FormRow>

        <FormRow label="Текст (Markdown)" direction="column">
          <MarkdownField editor={editor} />
          <FormRow.FieldDescription>
            Разметка применяется сразу при вводе: «# » — заголовок, «**текст**» — жирный, «- » — список.
          </FormRow.FieldDescription>
        </FormRow>

        <Flex>
          <Button type="submit" view="action" size="l">
            Сохранить
          </Button>
        </Flex>

        {submitted && (
          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">Результат: {submitted.title || 'без заголовка'}</Text>
            <pre
              style={{
                margin: 0,
                padding: 'var(--g-spacing-3)',
                overflow: 'auto',
                borderRadius: 'var(--g-border-radius-m)',
                background: 'var(--g-color-base-generic)',
              }}
            >
              {submitted.markdown}
            </pre>
          </Flex>
        )}
      </Flex>
    </form>
  );
}
