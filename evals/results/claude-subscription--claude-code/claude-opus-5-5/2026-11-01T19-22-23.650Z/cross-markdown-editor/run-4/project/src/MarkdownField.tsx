import { useEffect, useId } from 'react';
import {
    MarkdownEditorView,
    useMarkdownEditor,
    type MarkdownEditorInstance,
} from '@gravity-ui/markdown-editor';
import { Text } from '@gravity-ui/uikit';

import { renderPreview } from './markdownPreview';

import '@diplodoc/transform/dist/css/yfm.css';
import './MarkdownField.css';

type UseMarkdownFieldEditorOptions = {
    initialValue?: string;
    placeholder?: string;
};

/**
 * Creates an editor preconfigured for a form field:
 * markup mode (user types markdown) with a live side-by-side preview.
 * The user can switch to WYSIWYG mode via the settings menu in the toolbar.
 */
export function useMarkdownFieldEditor({
    initialValue = '',
    placeholder,
}: UseMarkdownFieldEditorOptions = {}): MarkdownEditorInstance {
    return useMarkdownEditor({
        preset: 'default',
        md: { html: false, linkify: true, breaks: false },
        initial: {
            markup: initialValue,
            mode: 'markup',
            splitModeEnabled: true,
            toolbarVisible: true,
        },
        markupConfig: {
            renderPreview,
            splitMode: 'horizontal',
            placeholder,
        },
        wysiwygConfig: {
            placeholderOptions: { value: placeholder },
        },
    });
}

type MarkdownFieldProps = {
    editor: MarkdownEditorInstance;
    label: string;
    note?: string;
    errorMessage?: string;
    onChange?: (value: string) => void;
};

/**
 * Form field with a markdown editor and live preview.
 * Must be rendered inside uikit's `ToasterProvider` (MarkdownEditorView uses toasts).
 */
export function MarkdownField({ editor, label, note, errorMessage, onChange }: MarkdownFieldProps) {
    const labelId = useId();

    useEffect(() => {
        if (!onChange) return undefined;
        const handleChange = () => onChange(editor.getValue());
        editor.on('change', handleChange);
        return () => editor.off('change', handleChange);
    }, [editor, onChange]);

    return (
        <div className="markdown-field" role="group" aria-labelledby={labelId}>
            <Text as="div" id={labelId} variant="subheader-1" className="markdown-field__label">
                {label}
            </Text>
            <div className={`markdown-field__box${errorMessage ? ' markdown-field__box_invalid' : ''}`}>
                <MarkdownEditorView editor={editor} stickyToolbar={false} />
            </div>
            {errorMessage ? (
                <Text as="div" color="danger" variant="caption-2">
                    {errorMessage}
                </Text>
            ) : note ? (
                <Text as="div" color="secondary" variant="caption-2">
                    {note}
                </Text>
            ) : null}
        </div>
    );
}
