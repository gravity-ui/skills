import { useEffect, useState } from 'react';
import transform from '@diplodoc/transform';
import { YfmStaticView } from '@gravity-ui/markdown-editor';
import '@diplodoc/transform/dist/css/yfm.css';

/** Markdown → безопасный HTML. Сырой HTML в исходнике запрещён и санитизируется. */
export function renderMarkdown(markup: string): string {
    return transform(markup, {
        allowHTML: false,
        needToSanitizeHtml: true,
        breaks: true,
        linkify: true,
    }).result.html;
}

type Props = {
    getValue: () => string;
};

/** Превью markdown для split-режима редактора. */
export function MarkdownPreview({ getValue }: Props) {
    const [html, setHtml] = useState('');
    const markup = getValue();

    useEffect(() => {
        // Небольшой debounce, чтобы не пересчитывать HTML на каждое нажатие клавиши
        const timer = setTimeout(() => setHtml(renderMarkdown(markup)), 150);
        return () => clearTimeout(timer);
    }, [markup]);

    return <YfmStaticView html={html} mods={{ 'no-list-reset': true }} />;
}
