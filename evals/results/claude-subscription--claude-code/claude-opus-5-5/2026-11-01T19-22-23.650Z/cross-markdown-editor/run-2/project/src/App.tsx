import { useCallback, useState, type FormEvent } from 'react';
import { Button, Text, TextInput, useToaster } from '@gravity-ui/uikit';

import { MarkdownField, useMarkdownFieldEditor } from './MarkdownField';

export type FormValues = {
    title: string;
    /** Markdown markup. */
    description: string;
};

const MAX_DESCRIPTION_LENGTH = 10_000;

export function App() {
    const toaster = useToaster();
    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState<string>();
    const [descriptionError, setDescriptionError] = useState<string>();

    const editor = useMarkdownFieldEditor({
        placeholder: 'Опишите задачу. Поддерживается markdown: **жирный**, _курсив_, # заголовок, - список',
    });

    const handleDescriptionChange = useCallback(() => setDescriptionError(undefined), []);

    const handleSubmit = useCallback(
        (event?: FormEvent) => {
            event?.preventDefault();

            const description = editor.getValue().trim();
            const nextTitleError = title.trim() ? undefined : 'Введите заголовок';
            let nextDescriptionError: string | undefined;
            if (!description) {
                nextDescriptionError = 'Введите описание';
            } else if (description.length > MAX_DESCRIPTION_LENGTH) {
                nextDescriptionError = `Описание длиннее ${MAX_DESCRIPTION_LENGTH} символов`;
            }

            setTitleError(nextTitleError);
            setDescriptionError(nextDescriptionError);
            if (nextTitleError || nextDescriptionError) return;

            const values: FormValues = { title: title.trim(), description };
            console.log('Form submitted', values);
            toaster.add({
                name: 'form-submitted',
                theme: 'success',
                title: 'Форма отправлена',
                content: values.title,
                autoHiding: 3000,
            });
        },
        [editor, title, toaster],
    );

    return (
        <form
            noValidate
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800, padding: 24 }}
        >
            <Text as="h1" variant="header-1">
                Новая задача
            </Text>

            <div>
                <Text as="label" htmlFor="form-title" variant="subheader-1" style={{ display: 'block', marginBottom: 6 }}>
                    Заголовок
                </Text>
                <TextInput
                    id="form-title"
                    size="l"
                    value={title}
                    onUpdate={(value) => {
                        setTitle(value);
                        setTitleError(undefined);
                    }}
                    validationState={titleError ? 'invalid' : undefined}
                    errorMessage={titleError}
                />
            </div>

            <MarkdownField
                editor={editor}
                label="Описание"
                hint="Форматирование применяется сразу при вводе. Режим «разметка» с предпросмотром — в меню настроек редактора. Ctrl/⌘+Enter — отправить."
                errorMessage={descriptionError}
                onChange={handleDescriptionChange}
                onSubmit={handleSubmit}
            />

            <div>
                <Button type="submit" view="action" size="l">
                    Отправить
                </Button>
            </div>
        </form>
    );
}
