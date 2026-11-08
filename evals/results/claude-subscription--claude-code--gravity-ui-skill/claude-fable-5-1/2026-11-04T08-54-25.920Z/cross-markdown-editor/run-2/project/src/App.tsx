import {useCallback, useState, type FormEvent} from 'react';
import {Button, Flex, Text, TextInput, Toaster, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';
import type {MarkupString} from '@gravity-ui/markdown-editor';

import {MarkdownField} from './MarkdownField';

const toaster = new Toaster();

const INITIAL_DESCRIPTION: MarkupString = `## Описание

Напишите текст с **markdown**-разметкой — справа сразу появится результат.

- список
- [ссылка](https://gravity-ui.com)
- \`код\`
`;

function PostForm() {
  const {add} = useToaster();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<MarkupString>(INITIAL_DESCRIPTION);

  const handleDescriptionChange = useCallback((value: MarkupString) => setDescription(value), []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    add({
      name: 'post-form-submitted',
      title: 'Форма отправлена',
      content: `Заголовок: ${title || '—'}, описание: ${description.length} символов`,
      theme: 'success',
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth: 960}}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">Новая запись</Text>
        <TextInput
          size="l"
          label="Заголовок"
          placeholder="Введите заголовок"
          value={title}
          onUpdate={setTitle}
        />
        <MarkdownField
          label="Описание"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Текст с markdown-разметкой"
        />
        <Button type="submit" view="action" size="l" style={{alignSelf: 'flex-start'}}>
          Сохранить
        </Button>
      </Flex>
    </form>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <div style={{padding: 'var(--g-spacing-6)'}}>
        <PostForm />
      </div>
      <ToasterComponent />
    </ToasterProvider>
  );
}
