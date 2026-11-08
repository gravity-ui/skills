import {useCallback, useEffect, useState} from 'react';

import {
    MarkdownEditorView,
    configure as configureMarkdownEditor,
    useMarkdownEditor,
    type MarkupString,
    type RenderPreview,
} from '@gravity-ui/markdown-editor';
import {
    Box,
    Button,
    Card,
    Flex,
    Text,
    TextInput,
    configure as configureUikit,
} from '@gravity-ui/uikit';

import {MarkdownPreview, SplitModePreview} from './SplitModePreview';

configureUikit({lang: 'ru'});
configureMarkdownEditor({lang: 'ru'});

const INITIAL_MARKUP = [
    'Напишите текст с **markdown**-разметкой — форматирование применится сразу.',
    '',
    '- списки,',
    '- `код`,',
    '- [ссылки](https://gravity-ui.com),',
    '',
    '> цитаты и многое другое.',
    '',
].join('\n');

export function App() {
    const [title, setTitle] = useState('');
    const [submitted, setSubmitted] = useState<{title: string; body: MarkupString} | null>(null);

    const renderPreview = useCallback<RenderPreview>(
        (params) => <SplitModePreview {...params} />,
        [],
    );

    const editor = useMarkdownEditor(
        {
            md: {html: false, breaks: true, linkify: true},
            initial: {
                markup: INITIAL_MARKUP,
                // WYSIWYG по умолчанию: markdown-синтаксис превращается
                // в форматирование прямо при вводе.
                mode: 'wysiwyg',
                toolbarVisible: true,
                splitModeEnabled: true,
            },
            markupConfig: {
                // В режиме разметки — живой предпросмотр рядом с текстом.
                renderPreview,
                splitMode: 'horizontal',
            },
        },
        [],
    );

    const handleSubmit = useCallback(() => {
        setSubmitted({title: title.trim(), body: editor.getValue()});
    }, [editor, title]);

    useEffect(() => {
        function submitHandler() {
            handleSubmit();
        }

        editor.on('submit', submitHandler);
        return () => {
            editor.off('submit', submitHandler);
        };
    }, [editor, handleSubmit]);

    return (
        <Box spacing={{p: 5}} style={{maxWidth: 1080, margin: '0 auto'}}>
            <Flex direction="column" gap={5}>
                <Text variant="header-1">Новая статья</Text>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSubmit();
                    }}
                >
                    <Flex direction="column" gap={4}>
                        <TextInput
                            label="Название"
                            size="l"
                            placeholder="Введите название статьи"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                        <Flex direction="column" gap={1}>
                            <Text variant="subheader-2">Текст статьи</Text>
                            <Text variant="body-2" color="secondary">
                                Пишите с markdown-разметкой — форматирование видно сразу. В режиме
                                разметки можно открыть предпросмотр рядом с текстом.
                            </Text>
                            <div style={{minHeight: 320}}>
                                <MarkdownEditorView stickyToolbar autofocus editor={editor} />
                            </div>
                        </Flex>
                        <Flex>
                            <Button view="action" size="l" type="submit">
                                Опубликовать
                            </Button>
                        </Flex>
                    </Flex>
                </form>
                {submitted ? (
                    <Card view="outlined" type="container">
                        <Box spacing={{p: 4}}>
                            <Flex direction="column" gap={3}>
                                <Text variant="subheader-2" color="secondary">
                                    Опубликовано
                                </Text>
                                <Text variant="header-2">{submitted.title || 'Без названия'}</Text>
                                <MarkdownPreview markup={submitted.body} />
                            </Flex>
                        </Box>
                    </Card>
                ) : null}
            </Flex>
        </Box>
    );
}
