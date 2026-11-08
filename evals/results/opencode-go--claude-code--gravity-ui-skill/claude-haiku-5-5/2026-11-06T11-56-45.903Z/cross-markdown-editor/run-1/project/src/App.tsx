import {type FormEvent, useCallback, useState} from 'react';
import {Box, Button, Flex, Text, configure as configureUikit} from '@gravity-ui/uikit';
import {
    type MarkupString,
    type RenderPreview,
    MarkdownEditorView,
    configure as configureEditor,
    useMarkdownEditor,
} from '@gravity-ui/markdown-editor';

import {MarkdownPreview} from './MarkdownPreview';

configureUikit({lang: 'ru'});
configureEditor({lang: 'ru'});

export function App() {
    const renderPreview = useCallback<RenderPreview>(
        ({getValue}) => <MarkdownPreview getValue={getValue} />,
        [],
    );

    const editor = useMarkdownEditor({
        initial: {mode: 'markup', splitModeEnabled: true},
        markupConfig: {renderPreview, splitMode: 'horizontal'},
    });

    const [submitted, setSubmitted] = useState<MarkupString | null>(null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(editor.getValue());
    };

    return (
        <Box spacing={{p: 6}}>
            <form onSubmit={handleSubmit}>
                <Flex direction="column" gap={4}>
                    <Text variant="subheader-2">Текст в Markdown</Text>
                    <MarkdownEditorView editor={editor} stickyToolbar />
                    <Flex>
                        <Button type="submit" view="action">
                            Отправить
                        </Button>
                    </Flex>
                </Flex>
            </form>
            {submitted !== null && (
                <Box spacing={{mt: 6}}>
                    <Text variant="body-2" style={{whiteSpace: 'pre-wrap'}}>
                        {submitted}
                    </Text>
                </Box>
            )}
        </Box>
    );
}
