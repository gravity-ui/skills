import { useCallback, useEffect } from 'react';
import { Text } from '@gravity-ui/uikit';
import {
    MarkdownEditorView,
    useMarkdownEditor,
    type MarkdownEditorInstance,
    type RenderPreview,
} from '@gravity-ui/markdown-editor';

import { MarkdownPreview } from './MarkdownPreview';
import './MarkdownField.css';

type Props = {
    label: string;
    initialValue?: string;
    placeholder?: string;
    error?: string;
    onChange?: (value: string) => void;
    /** Ctrl/Cmd+Enter внутри редактора */
    onSubmit?: () => void;
    /** Доступ к инстансу редактора (например, чтобы очистить поле) */
    editorRef?: React.MutableRefObject<MarkdownEditorInstance | null>;
};

/**
 * Поле формы с markdown-разметкой.
 * По умолчанию — WYSIWYG: форматирование видно сразу при вводе
 * (`**жирный**`, `# Заголовок`, `- список` превращаются в оформленный текст).
 * В режиме разметки (переключатель в настройках редактора) справа показывается превью.
 */
export function MarkdownField({
    label,
    initialValue = '',
    placeholder,
    error,
    onChange,
    onSubmit,
    editorRef,
}: Props) {
    const renderPreview = useCallback<RenderPreview>(
        ({ getValue }) => <MarkdownPreview getValue={getValue} />,
        [],
    );

    const editor = useMarkdownEditor({
        preset: 'default',
        md: { html: false, breaks: true, linkify: true },
        initial: { markup: initialValue, mode: 'wysiwyg', splitModeEnabled: true },
        markupConfig: { renderPreview, splitMode: 'horizontal', placeholder },
        wysiwygConfig: { placeholderOptions: { value: placeholder } },
    });

    useEffect(() => {
        if (editorRef) editorRef.current = editor;
    }, [editor, editorRef]);

    useEffect(() => {
        const handleChange = () => onChange?.(editor.getValue());
        const handleSubmit = () => onSubmit?.();
        editor.on('change', handleChange);
        editor.on('submit', handleSubmit);
        return () => {
            editor.off('change', handleChange);
            editor.off('submit', handleSubmit);
        };
    }, [editor, onChange, onSubmit]);

    return (
        <div className="markdown-field">
            <Text variant="subheader-1" as="div" className="markdown-field__label">
                {label}
            </Text>
            <div className={`markdown-field__box${error ? ' markdown-field__box_error' : ''}`}>
                <MarkdownEditorView editor={editor} stickyToolbar={false} />
            </div>
            {error && (
                <Text color="danger" variant="caption-2" as="div">
                    {error}
                </Text>
            )}
        </div>
    );
}
