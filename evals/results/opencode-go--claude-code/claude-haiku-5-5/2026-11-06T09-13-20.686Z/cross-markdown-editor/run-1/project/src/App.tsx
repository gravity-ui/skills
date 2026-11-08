import { useState, type FormEvent } from 'react';
import { Button, Text } from '@gravity-ui/uikit';

import { MarkdownField } from './MarkdownField';

export function App() {
  const [text, setText] = useState('');
  const [savedLength, setSavedLength] = useState<number | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedLength(text.length);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <MarkdownField
          label="Текст (Markdown)"
          value={text}
          onChange={setText}
          placeholder={'# Заголовок\n\nТекст с **жирным** и *курсивом*.\n\n- пункт списка\n- `код`'}
        />
        <div>
          <Button type="submit" view="action" size="l">
            Отправить
          </Button>
        </div>
      </form>

      {savedLength !== null && (
        <Text as="p" variant="body-1" style={{ marginTop: 16 }}>
          Отправлено символов: {savedLength}
        </Text>
      )}
    </div>
  );
}
