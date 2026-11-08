import {useCallback, useEffect, useState} from 'react';

import {Box, Button, Card, Flex, Text, TextInput, configure} from '@gravity-ui/uikit';
import {
    MarkdownEditorView,
    configure as configureMarkdownEditor,
    useMarkdownEditor,
} from '@gravity-ui/markdown-editor';
import type {RenderPreview} from '@gravity-ui/markdown-editor';

import {SplitModePreview} from './SplitModePreview';

import './App.css';

configure({lang: 'ru'});
configureMarkdownEditor({lang: 'ru'});

const INITIAL_MARKUP = [
    '## Черновик статьи',
    '',
    'Пишите разметку слева — справа сразу виден результат.',
    '',
    '- **Жирный** и *курсив*',
    '- `inline-код`',
    '- [Ссылка](https://gravity-ui.com)',
    '',
    '> Цитата оформляется автоматически.',
    '',
].join('\n');

export function App() {
    const [title, setTitle] = useState('');
    const [submitted, setSubmitted] = useState<{title: string; markup: string} | null>(null);

    const renderPreview = useCallback<RenderPreview>(
        ({getValue, md}) => <SplitModePreview getValue={getValue} md={md} />,
        [],
    );

    const editor = useMarkdownEditor({
        md: {html: false, breaks: true, linkify: true},
        initial: {
            markup: INITIAL_MARKUP,
            mode: 'markup',
            toolbarVisible: true,
            splitModeEnabled: true,
        },
        markupConfig: {
            renderPreview,
            splitMode: 'horizontal',
        },
    });

    const handleSubmit = useCallback(() => {
        setSubmitted({title, markup: editor.getValue()});
    }, [editor, title]);

    useEffect(() => {
        editor.on('submit', handleSubmit);
        return () => {
            editor.off('submit', handleSubmit);
        };
    }, [editor, handleSubmit]);

    return (
        <div className="app">
            <Box spacing={{p: 6}}>
                <Flex direction="column" gap={4}>
                    <Text variant="header-1">Новая статья</Text>

                    <TextInput
                        label="Заголовок"
                        size="l"
                        value={title}
                        onUpdate={setTitle}
                        placeholder="Введите заголовок"
                    />

                    <Flex direction="column" gap={1}>
                        <Text variant="subheader-1">Текст (Markdown)</Text>
                        <Text variant="body-2" color="secondary">
                            Пишите с markdown-разметкой — форматирование видно сразу в панели
                            предпросмотра.
                        </Text>
                        <div className="editor-field">
                            <MarkdownEditorView editor={editor} stickyToolbar autofocus />
                        </div>
                    </Flex>

                    <Flex>
                        <Button view="action" size="l" onClick={handleSubmit}>
                            Отправить
                        </Button>
                    </Flex>

                    {submitted && (
                        <Card view="outlined" className="result-card">
                            <Flex direction="column" gap={2}>
                                <Text variant="subheader-2">
                                    Отправлено: {submitted.title || 'без заголовка'}
                                </Text>
                                <Text variant="code-1" className="result-markup">
                                    {submitted.markup}
                                </Text>
                            </Flex>
                        </Card>
                    )}
                </Flex>
            </Box>
        </div>
    );
}
