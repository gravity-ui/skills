import { useCallback, useState, type FormEvent } from 'react';
import { configure as configureMarkdownEditor } from '@gravity-ui/markdown-editor';
import {
    Button,
    Card,
    Flex,
    Text,
    TextInput,
    Toaster,
    ToasterComponent,
    ToasterProvider,
    configure as configureUikit,
} from '@gravity-ui/uikit';

import { MarkdownField, useMarkdownFieldEditor } from './MarkdownField';
import { MarkdownPreview } from './markdownPreview';

configureUikit({ lang: 'ru' });
configureMarkdownEditor({ lang: 'ru' });

// MarkdownEditorView uses toasts (e.g. for upload/paste errors), so it needs a ToasterProvider.
const toaster = new Toaster();

type Submitted = { title: string; description: string };

export function App() {
    return (
        <ToasterProvider toaster={toaster}>
            <TaskForm />
            <ToasterComponent />
        </ToasterProvider>
    );
}

function TaskForm() {
    const editor = useMarkdownFieldEditor({
        placeholder: 'Опишите задачу. Поддерживается markdown: **жирный**, _курсив_, списки, ссылки…',
    });

    const [title, setTitle] = useState('');
    const [descriptionError, setDescriptionError] = useState<string>();
    const [titleError, setTitleError] = useState<string>();
    const [submitted, setSubmitted] = useState<Submitted>();

    const handleDescriptionChange = useCallback((value: string) => {
        if (value.trim()) setDescriptionError(undefined);
    }, []);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        const description = editor.getValue();

        const nextTitleError = title.trim() ? undefined : 'Укажите заголовок';
        const nextDescriptionError = description.trim() ? undefined : 'Добавьте описание';
        setTitleError(nextTitleError);
        setDescriptionError(nextDescriptionError);
        if (nextTitleError || nextDescriptionError) return;

        setSubmitted({ title: title.trim(), description });
    };

    const handleReset = () => {
        setTitle('');
        editor.clear();
        setTitleError(undefined);
        setDescriptionError(undefined);
        setSubmitted(undefined);
    };

    return (
        <Flex direction="column" gap={6} style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
            <form onSubmit={handleSubmit} onReset={handleReset} noValidate>
                <Flex direction="column" gap={5}>
                    <Text variant="header-2">Новая задача</Text>

                    <Flex direction="column" gap={1}>
                        <Text as="label" htmlFor="task-title" variant="subheader-1">
                            Заголовок
                        </Text>
                        <TextInput
                            id="task-title"
                            size="l"
                            value={title}
                            onUpdate={(value) => {
                                setTitle(value);
                                if (value.trim()) setTitleError(undefined);
                            }}
                            validationState={titleError ? 'invalid' : undefined}
                            errorMessage={titleError}
                        />
                    </Flex>

                    <MarkdownField
                        editor={editor}
                        label="Описание"
                        note="Слева — markdown, справа — результат. Режим редактора можно сменить в меню настроек на панели инструментов."
                        errorMessage={descriptionError}
                        onChange={handleDescriptionChange}
                    />

                    <Flex gap={2}>
                        <Button type="submit" view="action" size="l">
                            Отправить
                        </Button>
                        <Button type="reset" view="flat" size="l">
                            Очистить
                        </Button>
                    </Flex>
                </Flex>
            </form>

            {submitted && (
                <Card view="outlined" style={{ padding: 16 }}>
                    <Flex direction="column" gap={3}>
                        <Text variant="subheader-3">Отправлено: {submitted.title}</Text>
                        <MarkdownPreview markup={submitted.description} />
                        <Text variant="caption-2" color="secondary">
                            Markdown-исходник:
                        </Text>
                        <Text as="pre" variant="code-1" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {submitted.description}
                        </Text>
                    </Flex>
                </Card>
            )}
        </Flex>
    );
}
