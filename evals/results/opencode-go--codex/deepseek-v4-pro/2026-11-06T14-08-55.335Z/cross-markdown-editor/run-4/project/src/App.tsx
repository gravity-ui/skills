import './App.css';

import { useMemo, useState } from 'react';
import { Card, Flex, Text, TextArea } from '@gravity-ui/uikit';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const initialMarkdown = `# Заголовок

Текст с **жирным**, *курсивом* и ~~зачёркиванием~~.

- пункт списка
- [ссылка](https://gravity-ui.com)

\`\`\`ts
const message = 'Hello, world!';
\`\`\`

> Цитата`;

export function App() {
    const [value, setValue] = useState(initialMarkdown);

    const isEmpty = value.trim().length === 0;

    const preview = useMemo(
        () =>
            isEmpty ? (
                <Text as="p" color="secondary">
                    Начните вводить текст с markdown-разметкой — здесь сразу появится форматирование.
                </Text>
            ) : (
                <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
            ),
        [isEmpty, value],
    );

    return (
        <main className="markdown-editor">
            <Flex direction="column" gap={5} width="100%">
                <div>
                    <Text as="h1" variant="display-3">
                        Markdown-редактор
                    </Text>
                    <Text as="p" variant="body-1" color="secondary">
                        Введите текст в поле и сразу увидите результат форматирования.
                    </Text>
                </div>

                <Card view="outlined" type="container">
                    <Flex gap={5} wrap>
                        <Flex direction="column" gap={2} grow={1} className="markdown-editor__column">
                            <Text as="label" variant="subheader-2" htmlFor="markdown-input">
                                Markdown
                            </Text>
                            <TextArea
                                id="markdown-input"
                                name="markdown"
                                value={value}
                                onUpdate={setValue}
                                minRows={14}
                                placeholder="Введите текст с markdown-разметкой…"
                                aria-label="Текст с markdown-разметкой"
                                className="markdown-editor__textarea"
                            />
                        </Flex>

                        <Flex direction="column" gap={2} grow={1} className="markdown-editor__column">
                            <Text as="p" variant="subheader-2">
                                Превью
                            </Text>
                            <div className="markdown-preview">{preview}</div>
                        </Flex>
                    </Flex>
                </Card>
            </Flex>
        </main>
    );
}
