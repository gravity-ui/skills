import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, Flex, Text, TextInput } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';

import './App.css';

const INITIAL_MARKUP = `## Описание

Пишите текст с markdown-разметкой — **полужирный**, *курсив*, \`код\`, списки:

1. форматирование применяется сразу при вводе;
2. режим разметки доступен в настройках редактора.
`;

export function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(INITIAL_MARKUP);
  const [saved, setSaved] = useState(false);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
    setSaved(false);
  }, []);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  }, []);

  return (
    <form className="md-form" onSubmit={handleSubmit}>
      <Text variant="header-1">Новая запись</Text>

      <Flex direction="column" gap={2}>
        <Text variant="subheader-1">Заголовок</Text>
        <TextInput
          size="l"
          value={title}
          onUpdate={setTitle}
          placeholder="Введите заголовок"
        />
      </Flex>

      <Flex direction="column" gap={2}>
        <Text variant="subheader-1">Описание</Text>
        <div className="md-form__editor">
          <MarkdownField
            initialValue={INITIAL_MARKUP}
            onChange={handleDescriptionChange}
            className="md-form__editor-view"
          />
        </div>
        <Text variant="body-1" color="secondary">
          Символов в разметке: {description.length}
        </Text>
      </Flex>

      {saved ? <Alert theme="success" message="Форма сохранена" /> : null}

      <Flex gap={2}>
        <Button type="submit" view="action" size="l">
          Сохранить
        </Button>
      </Flex>
    </form>
  );
}
