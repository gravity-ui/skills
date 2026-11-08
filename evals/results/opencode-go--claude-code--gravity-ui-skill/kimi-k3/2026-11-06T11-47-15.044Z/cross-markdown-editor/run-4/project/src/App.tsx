import './app.css';

import React from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    Flex,
    Text,
    TextInput,
    configure as configureUikit,
} from '@gravity-ui/uikit';
import {
    MarkdownEditorView,
    YfmStaticView,
    configure as configureMdEditor,
    useMarkdownEditor,
} from '@gravity-ui/markdown-editor';
import type {
    MarkdownEditorMdOptions,
    MarkupString,
    RenderPreview,
} from '@gravity-ui/markdown-editor';
import transform from '@diplodoc/transform';

configureUikit({lang: 'ru'});
configureMdEditor({lang: 'ru'});

const INITIAL_MARKUP = `# Черновик публикации

Пишите текст с **markdown**-разметкой — результат виден сразу, справа.

- маркированные списки,
- *курсив* и \`код\`,
- [ссылки](https://gravity-ui.com).

> Панель сверху помогает вставлять разметку кнопками.
`;

function debounce<A extends unknown[]>(fn: (...args: A) => void, delay: number) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const debounced = (...args: A) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

type MarkupPreviewProps = {
    getValue: () => MarkupString;
    md: MarkdownEditorMdOptions;
};

function MarkupPreview({getValue, md}: MarkupPreviewProps) {
    const [html, setHtml] = React.useState('');

    const render = React.useMemo(
        () =>
            debounce(() => {
                const {result} = transform(getValue(), {
                    allowHTML: md.html,
                    breaks: md.breaks,
                    linkify: md.linkify,
                    linkifyTlds: md.linkifyTlds,
                    needToSanitizeHtml: true,
                });
                setHtml(result.html);
            }, 150),
        [getValue, md],
    );

    // The editor's split view re-renders the preview on every change,
    // so schedule a (debounced) re-transform on each render.
    React.useEffect(() => {
        render();
    });

    React.useEffect(() => () => render.cancel(), [render]);

    return <YfmStaticView html={html} className="md-field-preview" />;
}

export function App() {
    const [title, setTitle] = React.useState('');
    const [sent, setSent] = React.useState<MarkupString | null>(null);

    const renderPreview = React.useCallback<RenderPreview>(
        ({getValue, md}) => <MarkupPreview getValue={getValue} md={md} />,
        [],
    );

    const editor = useMarkdownEditor(
        {
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
        },
        [renderPreview],
    );

    const submit = React.useCallback(() => {
        setSent(editor.getValue());
    }, [editor]);

    // Ctrl/Cmd+Enter inside the editor submits the form, same as the button.
    React.useEffect(() => {
        editor.on('submit', submit);
        return () => {
            editor.off('submit', submit);
        };
    }, [editor, submit]);

    const handleSubmit: React.FormEventHandler = (event) => {
        event.preventDefault();
        submit();
    };

    return (
        <Box spacing={{p: 5}}>
            <Flex direction="column" gap={5} className="page">
                <Text variant="header-1">Новая публикация</Text>
                <Card type="container" view="outlined">
                    <Box spacing={{p: 5}}>
                        <form onSubmit={handleSubmit}>
                            <Flex direction="column" gap={4}>
                                <TextInput
                                    size="l"
                                    label="Заголовок"
                                    placeholder="Введите заголовок"
                                    value={title}
                                    onUpdate={setTitle}
                                />
                                <Flex direction="column" gap={2}>
                                    <Text variant="subheader-1">
                                        Текст с разметкой Markdown
                                    </Text>
                                    <div className="md-field">
                                        <MarkdownEditorView
                                            stickyToolbar
                                            autofocus
                                            editor={editor}
                                        />
                                    </div>
                                </Flex>
                                <Flex>
                                    <Button view="action" size="l" type="submit">
                                        Опубликовать
                                    </Button>
                                </Flex>
                            </Flex>
                        </form>
                    </Box>
                </Card>
                {sent !== null && (
                    <React.Fragment>
                        <Alert
                            theme="success"
                            title="Публикация сохранена"
                            message={`Содержимое поля сериализовано в markdown (${sent.length} символов).`}
                            onClose={() => setSent(null)}
                        />
                        <Card type="container" view="filled">
                            <Box spacing={{p: 4}}>
                                <Flex direction="column" gap={2}>
                                    <Text variant="subheader-1" color="secondary">
                                        Отправленная разметка
                                    </Text>
                                    <pre className="raw-markup">{sent}</pre>
                                </Flex>
                            </Box>
                        </Card>
                    </React.Fragment>
                )}
            </Flex>
        </Box>
    );
}
