import React from 'react';
import {Button, Flex, Text, TextInput, configure as configureUikit} from '@gravity-ui/uikit';
import {
    MarkdownEditorView,
    configure as configureEditor,
    useMarkdownEditor,
    type MarkupString,
} from '@gravity-ui/markdown-editor';

configureUikit({lang: 'ru'});
configureEditor({lang: 'ru'});

type FormErrors = {title?: string; content?: string};

type Submitted = {title: string; markup: MarkupString};

export function App() {
    const editor = useMarkdownEditor({md: {html: false}});
    const [title, setTitle] = React.useState('');
    const [errors, setErrors] = React.useState<FormErrors>({});
    const [submitted, setSubmitted] = React.useState<Submitted | null>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors: FormErrors = {
            title: title.trim() === '' ? 'Введите заголовок' : undefined,
            content: editor.isEmpty() ? 'Введите текст' : undefined,
        };
        setErrors(nextErrors);

        if (nextErrors.title || nextErrors.content) {
            return;
        }

        setSubmitted({title: title.trim(), markup: editor.getValue()});
    };

    return (
        <div style={{padding: 24, maxWidth: 800}}>
            <form onSubmit={handleSubmit}>
                <Flex direction="column" gap={4}>
                    <Flex direction="column" gap={2}>
                        <Text variant="subheader-1">Заголовок</Text>
                        <TextInput
                            value={title}
                            onUpdate={setTitle}
                            placeholder="Например, «Заметки о релизе»"
                            controlProps={{'aria-label': 'Заголовок'}}
                            validationState={errors.title ? 'invalid' : undefined}
                            errorMessage={errors.title}
                        />
                    </Flex>

                    <Flex direction="column" gap={2}>
                        <Text variant="subheader-1">Текст в Markdown</Text>
                        <MarkdownEditorView stickyToolbar editor={editor} />
                        {errors.content && (
                            <Text variant="caption-2" color="danger">
                                {errors.content}
                            </Text>
                        )}
                    </Flex>

                    <Flex>
                        <Button type="submit" view="action" size="l">
                            Отправить
                        </Button>
                    </Flex>

                    {submitted && (
                        <Flex direction="column" gap={2}>
                            <Text variant="subheader-1">Отправлено: {submitted.title}</Text>
                            <Text variant="body-2" style={{whiteSpace: 'pre-wrap'}}>
                                {submitted.markup}
                            </Text>
                        </Flex>
                    )}
                </Flex>
            </form>
        </div>
    );
}
