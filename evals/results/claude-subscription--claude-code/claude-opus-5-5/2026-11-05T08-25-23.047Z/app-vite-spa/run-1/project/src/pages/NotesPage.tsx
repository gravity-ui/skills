import * as React from 'react';
import {TrashBin} from '@gravity-ui/icons';
import {Button, Icon, Text, TextInput} from '@gravity-ui/uikit';

export interface Note {
    id: number;
    text: string;
}

interface NotesPageProps {
    notes: Note[];
    onAdd: (text: string) => void;
    onRemove: (id: number) => void;
}

export function NotesPage({notes, onAdd, onRemove}: NotesPageProps) {
    const [draft, setDraft] = React.useState('');
    const trimmed = draft.trim();

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!trimmed) {
            return;
        }
        onAdd(trimmed);
        setDraft('');
    };

    return (
        <section className="page">
            <Text as="h1" variant="display-1">
                Заметки
            </Text>

            <form className="notes-form" onSubmit={handleSubmit}>
                <TextInput
                    size="l"
                    placeholder="Новая заметка"
                    value={draft}
                    onUpdate={setDraft}
                    controlProps={{'aria-label': 'Текст заметки'}}
                />
                <Button type="submit" view="action" size="l" disabled={!trimmed}>
                    Добавить
                </Button>
            </form>

            {notes.length === 0 ? (
                <Text as="p" color="secondary">
                    Пока пусто — добавьте первую заметку.
                </Text>
            ) : (
                <ul className="notes-list">
                    {notes.map((note) => (
                        <li key={note.id} className="notes-list__item">
                            <Text>{note.text}</Text>
                            <Button
                                view="flat"
                                size="m"
                                onClick={() => onRemove(note.id)}
                                extraProps={{'aria-label': `Удалить «${note.text}»`}}
                            >
                                <Icon data={TrashBin} />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
