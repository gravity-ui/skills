import { useEffect, useId } from 'react';
import {
  MarkdownEditorView,
  type MarkdownEditorInstance,
} from '@gravity-ui/markdown-editor';
import { Flex, Text } from '@gravity-ui/uikit';

import './MarkdownField.css';

export interface MarkdownFieldProps {
  /** Editor instance created by `useMarkdownEditor` in the parent form. */
  editor: MarkdownEditorInstance;
  label: string;
  note?: string;
  errorMessage?: string;
  /** Called with the current markdown markup on every edit. */
  onUpdate?: (markup: string) => void;
  /** Called on Cmd/Ctrl+Enter inside the editor. */
  onSubmit?: () => void;
}

/**
 * Form field with a live-formatted markdown editor:
 * markdown syntax (`**bold**`, `# heading`, `- list`, …) is rendered as you type
 * (WYSIWYG mode); the raw markup mode is available from the editor settings.
 */
export function MarkdownField({
  editor,
  label,
  note,
  errorMessage,
  onUpdate,
  onSubmit,
}: MarkdownFieldProps) {
  const labelId = useId();
  const invalid = Boolean(errorMessage);

  useEffect(() => {
    if (!onUpdate) return undefined;
    const handleChange = () => onUpdate(editor.getValue());
    editor.on('change', handleChange);
    return () => editor.off('change', handleChange);
  }, [editor, onUpdate]);

  useEffect(() => {
    if (!onSubmit) return undefined;
    editor.on('submit', onSubmit);
    return () => editor.off('submit', onSubmit);
  }, [editor, onSubmit]);

  return (
    <Flex direction="column" gap={1}>
      <Text as="div" id={labelId} variant="subheader-1">
        {label}
      </Text>
      <div
        role="group"
        aria-labelledby={labelId}
        aria-invalid={invalid || undefined}
        className={`markdown-field${invalid ? ' markdown-field_invalid' : ''}`}
      >
        <MarkdownEditorView
          editor={editor}
          stickyToolbar={false}
          className="markdown-field__editor"
        />
      </div>
      {invalid ? (
        <Text variant="caption-2" color="danger">
          {errorMessage}
        </Text>
      ) : note ? (
        <Text variant="caption-2" color="secondary">
          {note}
        </Text>
      ) : null}
    </Flex>
  );
}
