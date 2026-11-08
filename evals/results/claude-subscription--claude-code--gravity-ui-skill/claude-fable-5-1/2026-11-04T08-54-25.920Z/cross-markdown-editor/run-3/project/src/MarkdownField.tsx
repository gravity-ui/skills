import {useCallback, useEffect, useId, useState} from 'react';
import transform from '@diplodoc/transform';
import {
    MarkdownEditorView,
    YfmStaticView,
    useMarkdownEditor,
    type MarkupString,
    type RenderPreview,
} from '@gravity-ui/markdown-editor';
import {Text} from '@gravity-ui/uikit';

export interface MarkdownFieldProps {
    label: string;
    /** Начальное значение в markdown-разметке */
    defaultValue?: MarkupString;
    /** Вызывается при каждом изменении содержимого; передаёт актуальную markdown-разметку */
    onUpdate?: (value: MarkupString) => void;
    /** Вызывается по Ctrl/Cmd+Enter внутри редактора */
    onSubmit?: (value: MarkupString) => void;
    autofocus?: boolean;
}

/**
 * Поле формы для ввода текста с markdown-разметкой.
 *
 * По умолчанию открывается в WYSIWYG-режиме: пользователь набирает текст с markdown-синтаксисом
 * (`# заголовок`, `**жирный**`, `- список`) и сразу видит результат форматирования.
 * В режиме разметки (переключатель в тулбаре) доступен split-view с живым превью.
 */
export function MarkdownField({
    label,
    defaultValue = '',
    onUpdate,
    onSubmit,
    autofocus,
}: MarkdownFieldProps) {
    const labelId = useId();

    const renderPreview = useCallback<RenderPreview>(
        ({getValue, md}) => <MarkdownPreview getValue={getValue} md={md} />,
        [],
    );

    const editor = useMarkdownEditor({
        md: {html: false, linkify: true, breaks: true},
        initial: {markup: defaultValue, mode: 'wysiwyg', splitModeEnabled: true},
        markupConfig: {renderPreview, splitMode: 'horizontal'},
    });

    useEffect(() => {
        const changeHandler = () => onUpdate?.(editor.getValue());
        const submitHandler = () => onSubmit?.(editor.getValue());

        editor.on('change', changeHandler);
        editor.on('submit', submitHandler);
        return () => {
            editor.off('change', changeHandler);
            editor.off('submit', submitHandler);
        };
    }, [editor, onUpdate, onSubmit]);

    return (
        <div>
            <Text as="div" id={labelId} variant="body-1" color="secondary" style={{marginBottom: 'var(--g-spacing-1)'}}>
                {label}
            </Text>
            <div
                role="group"
                aria-labelledby={labelId}
                style={{
                    minHeight: 320,
                    border: '1px solid var(--g-color-line-generic)',
                    borderRadius: 'var(--g-border-radius-m)',
                    overflow: 'hidden',
                }}
            >
                <MarkdownEditorView editor={editor} stickyToolbar autofocus={autofocus} />
            </div>
        </div>
    );
}

interface MarkdownPreviewProps {
    getValue: () => MarkupString;
    md: Parameters<RenderPreview>[0]['md'];
}

const PREVIEW_DEBOUNCE_MS = 200;

/** Превью для режима разметки: рендерит текущий markdown в HTML с небольшой задержкой */
function MarkdownPreview({getValue, md}: MarkdownPreviewProps) {
    const [html, setHtml] = useState('');

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const {result} = transform(getValue(), {
                allowHTML: md.html,
                breaks: md.breaks,
                linkify: md.linkify,
                linkifyTlds: md.linkifyTlds,
                needToSanitizeHtml: true,
            });
            setHtml(result.html);
        }, PREVIEW_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    });

    return <YfmStaticView html={html} mods={{'no-list-reset': true}} />;
}
