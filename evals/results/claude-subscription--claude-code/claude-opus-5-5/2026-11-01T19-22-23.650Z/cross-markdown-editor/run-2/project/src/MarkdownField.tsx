import { useCallback, useEffect, useId } from 'react';
import {
    MarkdownEditorView,
    useMarkdownEditor,
    type MarkdownEditorInstance,
    type MarkupString,
    type RenderPreview,
} from '@gravity-ui/markdown-editor';
import { Text } from '@gravity-ui/uikit';

import { MarkdownPreview } from './MarkdownPreview';
import './MarkdownField.css';

type UseMarkdownFieldEditorOptions = {
    initialValue?: MarkupString;
    placeholder?: string;
};

/**
 * Creates an editor instance for a markdown form field.
 *
 * By default the editor works in WYSIWYG mode: markdown syntax typed by the user
 * (`**bold**`, `# Heading`, `- item`, `` `code` ``…) is formatted right away.
 * The user can switch to the markup mode in the settings menu, where the raw
 * markdown is shown next to a live preview (split view).
 */
export function useMarkdownFieldEditor({ initialValue = '', placeholder }: UseMarkdownFieldEditorOptions = {}) {
    const renderPreview = useCallback<RenderPreview>(
        ({ getValue, md }) => <MarkdownPreview getValue={getValue} md={md} />,
        [],
    );

    return useMarkdownEditor({
        // CommonMark + strikethrough + tables, without YFM-specific blocks.
        preset: 'default',
        md: { html: false, linkify: true, breaks: true },
        initial: { markup: initialValue, mode: 'wysiwyg', splitModeEnabled: true },
        markupConfig: { renderPreview, splitMode: 'horizontal', placeholder },
        wysiwygConfig: { placeholderOptions: { value: placeholder } },
    });
}

type MarkdownFieldProps = {
    editor: MarkdownEditorInstance;
    label: string;
    hint?: string;
    errorMessage?: string;
    /** Called on every content change. */
    onChange?: () => void;
    /** Called on Cmd/Ctrl+Enter inside the editor. */
    onSubmit?: () => void;
};

export function MarkdownField({ editor, label, hint, errorMessage, onChange, onSubmit }: MarkdownFieldProps) {
    const labelId = useId();
    const invalid = Boolean(errorMessage);

    useEffect(() => {
        if (!onChange) return undefined;
        editor.on('change', onChange);
        return () => editor.off('change', onChange);
    }, [editor, onChange]);

    useEffect(() => {
        if (!onSubmit) return undefined;
        editor.on('submit', onSubmit);
        return () => editor.off('submit', onSubmit);
    }, [editor, onSubmit]);

    return (
        <div className="markdown-field">
            <Text as="div" id={labelId} variant="subheader-1" className="markdown-field__label">
                {label}
            </Text>
            <div
                className={`markdown-field__control${invalid ? ' markdown-field__control_invalid' : ''}`}
                role="group"
                aria-labelledby={labelId}
                aria-invalid={invalid || undefined}
            >
                <MarkdownEditorView editor={editor} stickyToolbar={false} settingsVisible />
            </div>
            {errorMessage ? (
                <Text as="div" color="danger" variant="caption-2" className="markdown-field__note">
                    {errorMessage}
                </Text>
            ) : (
                hint && (
                    <Text as="div" color="secondary" variant="caption-2" className="markdown-field__note">
                        {hint}
                    </Text>
                )
            )}
        </div>
    );
}
