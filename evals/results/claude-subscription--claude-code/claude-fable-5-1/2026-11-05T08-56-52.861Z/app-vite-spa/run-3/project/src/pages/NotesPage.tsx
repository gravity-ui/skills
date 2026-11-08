import * as React from 'react';
import { Button, Card, Flex, Text, TextInput } from '@gravity-ui/uikit';

interface Note {
  id: number;
  text: string;
}

export function NotesPage() {
  const [draft, setDraft] = React.useState('');
  const [notes, setNotes] = React.useState<Note[]>([
    { id: 1, text: 'Проверить тёмную тему' },
    { id: 2, text: 'Открыть страницу «О приложении»' },
  ]);

  const addNote = (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [...prev, { id: Date.now(), text }]);
    setDraft('');
  };

  const removeNote = (id: number) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <Flex direction="column" gap={4}>
      <Text as="h1" variant="display-1">
        Заметки
      </Text>
      <Text as="p" variant="body-2" color="secondary">
        Простой список: добавляйте и удаляйте записи. Данные живут только в памяти страницы.
      </Text>

      <form onSubmit={addNote}>
        <Flex gap={2}>
          <TextInput
            value={draft}
            onUpdate={setDraft}
            placeholder="Новая заметка"
            hasClear
            size="l"
            style={{ flex: 1 }}
          />
          <Button type="submit" view="action" size="l" disabled={!draft.trim()}>
            Добавить
          </Button>
        </Flex>
      </form>

      {notes.length === 0 ? (
        <Text variant="body-1" color="secondary">
          Заметок пока нет.
        </Text>
      ) : (
        <Flex direction="column" gap={2}>
          {notes.map((note) => (
            <Card key={note.id} view="outlined" style={{ padding: '8px 12px' }}>
              <Flex alignItems="center" justifyContent="space-between" gap={2}>
                <Text variant="body-1">{note.text}</Text>
                <Button view="flat-danger" size="s" onClick={() => removeNote(note.id)}>
                  Удалить
                </Button>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
