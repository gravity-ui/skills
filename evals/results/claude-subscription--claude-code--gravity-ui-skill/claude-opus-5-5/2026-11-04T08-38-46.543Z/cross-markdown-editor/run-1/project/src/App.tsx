import React from 'react';
import {configure as configureUikit, Button, Card, Flex, Text, TextInput, sp} from '@gravity-ui/uikit';
import {configure as configureEditor, type MarkupString} from '@gravity-ui/markdown-editor';

import {MarkdownField, type MarkdownFieldHandle} from './MarkdownField';

// Editor toolbar/tooltips are localized through both packages.
configureUikit({lang: 'ru'});
configureEditor({lang: 'ru'});

interface SubmittedData {
    title: string;
    description: MarkupString;
}

export function App() {
    const formRef = React.useRef<HTMLFormElement>(null);
    const descriptionRef = React.useRef<MarkdownFieldHandle>(null);

    const [title, setTitle] = React.useState('');
    const [titleError, setTitleError] = React.useState<string>();
    const [descriptionError, setDescriptionError] = React.useState<string>();
    const [submitted, setSubmitted] = React.useState<SubmittedData>();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const description = descriptionRef.current?.getValue() ?? '';
        const nextTitleError = title.trim() ? undefined : 'Введите заголовок';
        const nextDescriptionError = description.trim() ? undefined : 'Добавьте описание';

        setTitleError(nextTitleError);
        setDescriptionError(nextDescriptionError);

        if (!nextTitleError && !nextDescriptionError) {
            setSubmitted({title: title.trim(), description});
        }
    };

    const handleReset = () => {
        setTitle('');
        setTitleError(undefined);
        setDescriptionError(undefined);
        setSubmitted(undefined);
        descriptionRef.current?.clear();
    };

    return (
        <Flex direction="column" gap={6} className={sp({p: 6})} style={{maxWidth: 800, marginInline: 'auto'}}>
            <Text variant="header-1">Новая заметка</Text>

            <form ref={formRef} onSubmit={handleSubmit} noValidate>
                <Flex direction="column" gap={5}>
                    <TextInput
                        label="Заголовок"
                        size="l"
                        value={title}
                        onUpdate={(value) => {
                            setTitle(value);
                            if (titleError) setTitleError(undefined);
                        }}
                        validationState={titleError ? 'invalid' : undefined}
                        errorMessage={titleError}
                    />

                    <MarkdownField
                        ref={descriptionRef}
                        label="Описание"
                        placeholder="Пишите текст с Markdown: **жирный**, _курсив_, # заголовок, - список…"
                        errorMessage={descriptionError}
                        onChange={() => {
                            if (descriptionError) setDescriptionError(undefined);
                        }}
                        onSubmit={() => formRef.current?.requestSubmit()}
                    />

                    <Flex gap={2}>
                        <Button type="submit" view="action" size="l">
                            Сохранить
                        </Button>
                        <Button type="button" view="flat" size="l" onClick={handleReset}>
                            Очистить
                        </Button>
                    </Flex>
                </Flex>
            </form>

            {submitted && (
                <Card view="outlined" className={sp({p: 4})}>
                    <Flex direction="column" gap={2}>
                        <Text variant="subheader-2">Отправлено: {submitted.title}</Text>
                        <Text variant="caption-2" color="secondary">
                            Значение поля «Описание» в Markdown:
                        </Text>
                        <Text as="pre" variant="code-1" whiteSpace="break-spaces" wordBreak="break-word" style={{margin: 0}}>
                            {submitted.description}
                        </Text>
                    </Flex>
                </Card>
            )}
        </Flex>
    );
}
