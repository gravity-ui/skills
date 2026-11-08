import {type FormEvent, useCallback, useState} from 'react';
import {configure as configureMarkdownEditor, type MarkupString} from '@gravity-ui/markdown-editor';
import {
    Button,
    Flex,
    Text,
    TextInput,
    Toaster,
    ToasterComponent,
    ToasterProvider,
    configure as configureUikit,
    useToaster,
} from '@gravity-ui/uikit';

import {MarkdownField} from './MarkdownField';

configureUikit({lang: 'ru'});
configureMarkdownEditor({lang: 'ru'});

const toaster = new Toaster();

const INITIAL_DESCRIPTION: MarkupString = `# Описание

Напишите текст с **markdown**-разметкой — форматирование применяется сразу.

- пункт списка
- ещё один пункт`;

interface FormValues {
    title: string;
    description: MarkupString;
}

function ArticleForm() {
    const {add} = useToaster();
    const [values, setValues] = useState<FormValues>({title: '', description: INITIAL_DESCRIPTION});

    const handleDescriptionUpdate = useCallback((description: MarkupString) => {
        setValues((prev) => ({...prev, description}));
    }, []);

    const handleSubmit = useCallback(
        (event?: FormEvent<HTMLFormElement>) => {
            event?.preventDefault();
            add({
                name: 'form-submitted',
                title: 'Форма отправлена',
                content: `Заголовок: ${values.title || '—'}, описание: ${values.description.length} символов`,
                theme: 'success',
            });
        },
        [add, values],
    );

    const titleInvalid = values.title.trim() === '';

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Flex direction="column" gap={4}>
                <Text variant="header-1">Новая статья</Text>

                <TextInput
                    label="Заголовок"
                    placeholder="Введите заголовок"
                    value={values.title}
                    onUpdate={(title) => setValues((prev) => ({...prev, title}))}
                    validationState={titleInvalid ? 'invalid' : undefined}
                    errorMessage={titleInvalid ? 'Обязательное поле' : undefined}
                />

                <MarkdownField
                    label="Описание"
                    defaultValue={INITIAL_DESCRIPTION}
                    onUpdate={handleDescriptionUpdate}
                    onSubmit={() => handleSubmit()}
                />

                <Flex gap={2}>
                    <Button type="submit" view="action" size="l" disabled={titleInvalid}>
                        Сохранить
                    </Button>
                    <Button type="reset" view="flat" size="l" onClick={() => setValues({title: '', description: ''})}>
                        Очистить
                    </Button>
                </Flex>
            </Flex>
        </form>
    );
}

export function App() {
    return (
        <ToasterProvider toaster={toaster}>
            <ToasterComponent />
            <div style={{maxWidth: 960, margin: '0 auto', padding: 'var(--g-spacing-6)'}}>
                <ArticleForm />
            </div>
        </ToasterProvider>
    );
}
