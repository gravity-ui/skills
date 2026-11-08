import { useCallback, useRef, useState } from 'react';
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
import {
    YfmStaticView,
    configure as configureEditor,
    type MarkdownEditorInstance,
} from '@gravity-ui/markdown-editor';

import { MarkdownField } from './components/MarkdownField';
import { renderMarkdown } from './components/MarkdownPreview';

// Русская локализация тулбара и подсказок редактора
configureUikit({ lang: 'ru' });
configureEditor({ lang: 'ru' });

// MarkdownEditorView показывает уведомления (например, об ошибке загрузки файла) через тостер
const toaster = new Toaster();

type Submitted = { title: string; description: string };

export function App() {
    return (
        <ToasterProvider toaster={toaster}>
            <NoteForm />
            <ToasterComponent />
        </ToasterProvider>
    );
}

function NoteForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
    const [submitted, setSubmitted] = useState<Submitted | null>(null);
    const editorRef = useRef<MarkdownEditorInstance | null>(null);

    const handleSubmit = useCallback(() => {
        const markup = editorRef.current?.getValue() ?? description;
        const nextErrors: typeof errors = {};
        if (!title.trim()) nextErrors.title = 'Введите заголовок';
        if (!markup.trim()) nextErrors.description = 'Введите описание';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length === 0) {
            setSubmitted({ title: title.trim(), description: markup });
        }
    }, [title, description]);

    const handleReset = () => {
        setTitle('');
        setDescription('');
        setErrors({});
        setSubmitted(null);
        editorRef.current?.clear();
    };

    const handleDescriptionChange = useCallback((value: string) => {
        setDescription(value);
        if (value.trim()) setErrors((e) => ({ ...e, description: undefined }));
    }, []);

    return (
        <Flex direction="column" gap={6} style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <Flex direction="column" gap={4}>
                    <Text variant="header-1">Новая заметка</Text>

                    <Flex direction="column" gap={1}>
                        <Text variant="subheader-1">Заголовок</Text>
                        <TextInput
                            size="l"
                            value={title}
                            onUpdate={(v) => {
                                setTitle(v);
                                if (v.trim()) setErrors((e) => ({ ...e, title: undefined }));
                            }}
                            placeholder="О чём заметка?"
                            validationState={errors.title ? 'invalid' : undefined}
                            errorMessage={errors.title}
                        />
                    </Flex>

                    <MarkdownField
                        label="Описание"
                        placeholder="Пишите с markdown: **жирный**, _курсив_, # заголовок, - список…"
                        error={errors.description}
                        onChange={handleDescriptionChange}
                        onSubmit={handleSubmit}
                        editorRef={editorRef}
                    />

                    <Flex gap={2}>
                        <Button type="submit" view="action" size="l">
                            Отправить
                        </Button>
                        <Button type="button" view="flat" size="l" onClick={handleReset}>
                            Очистить
                        </Button>
                    </Flex>
                </Flex>
            </form>

            {submitted && (
                <Card view="outlined" style={{ padding: 16 }}>
                    <Flex direction="column" gap={3}>
                        <Text variant="subheader-2">Отправлено: {submitted.title}</Text>
                        <Text variant="caption-2" color="secondary">
                            Markdown-исходник:
                        </Text>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{submitted.description}</pre>
                        <Text variant="caption-2" color="secondary">
                            Результат:
                        </Text>
                        <YfmStaticView html={renderMarkdown(submitted.description)} />
                    </Flex>
                </Card>
            )}
        </Flex>
    );
}
