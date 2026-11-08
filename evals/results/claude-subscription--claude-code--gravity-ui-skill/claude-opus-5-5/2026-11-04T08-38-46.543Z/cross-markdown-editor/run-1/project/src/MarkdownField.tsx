import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {
    MarkdownEditorView,
    type MarkupString,
    useMarkdownEditor,
} from '@gravity-ui/markdown-editor';

import './MarkdownField.css';

export interface MarkdownFieldProps {
    label: string;
    initialValue?: MarkupString;
    placeholder?: string;
    errorMessage?: string;
    onChange?: (value: MarkupString) => void;
    /** Called on Cmd/Ctrl+Enter inside the editor. */
    onSubmit?: () => void;
}

export interface MarkdownFieldHandle {
    getValue: () => MarkupString;
    clear: () => void;
}

/**
 * Form field with Markdown support.
 * Uses the WYSIWYG mode of @gravity-ui/markdown-editor: Markdown syntax typed by the user
 * (`**bold**`, `# Heading`, `- list`, …) is formatted immediately, and the value is
 * serialized back to Markdown markup via `getValue()`.
 */
export const MarkdownField = React.forwardRef<MarkdownFieldHandle, MarkdownFieldProps>(
    function MarkdownField({label, initialValue, placeholder, errorMessage, onChange, onSubmit}, ref) {
        const labelId = React.useId();
        const errorId = React.useId();

        const editor = useMarkdownEditor({
            preset: 'default',
            md: {html: false, linkify: true, breaks: true},
            initial: {mode: 'wysiwyg', markup: initialValue},
            wysiwygConfig: {placeholderOptions: {value: placeholder}},
            markupConfig: {placeholder},
        });

        React.useImperativeHandle(
            ref,
            () => ({getValue: () => editor.getValue(), clear: () => editor.clear()}),
            [editor],
        );

        // Keep the latest callbacks in refs so the editor subscriptions are set up only once.
        const onChangeRef = React.useRef(onChange);
        const onSubmitRef = React.useRef(onSubmit);
        onChangeRef.current = onChange;
        onSubmitRef.current = onSubmit;

        React.useEffect(() => {
            const handleChange = () => onChangeRef.current?.(editor.getValue());
            const handleSubmit = () => onSubmitRef.current?.();

            editor.on('change', handleChange);
            editor.on('submit', handleSubmit);
            return () => {
                editor.off('change', handleChange);
                editor.off('submit', handleSubmit);
            };
        }, [editor]);

        const invalid = Boolean(errorMessage);

        return (
            <div className="markdown-field">
                <Text as="div" variant="subheader-1" id={labelId}>
                    {label}
                </Text>
                <div
                    className={`markdown-field__control${invalid ? ' markdown-field__control_invalid' : ''}`}
                    role="group"
                    aria-labelledby={labelId}
                    aria-invalid={invalid || undefined}
                    aria-describedby={invalid ? errorId : undefined}
                >
                    <MarkdownEditorView
                        className="markdown-field__editor"
                        editor={editor}
                        stickyToolbar={false}
                        settingsVisible
                    />
                </div>
                {invalid ? (
                    <Text as="div" variant="caption-2" color="danger" id={errorId}>
                        {errorMessage}
                    </Text>
                ) : (
                    <Text as="div" variant="caption-2" color="secondary">
                        Markdown форматируется сразу при вводе. Переключиться на исходную
                        разметку можно через настройки редактора.
                    </Text>
                )}
            </div>
        );
    },
);
