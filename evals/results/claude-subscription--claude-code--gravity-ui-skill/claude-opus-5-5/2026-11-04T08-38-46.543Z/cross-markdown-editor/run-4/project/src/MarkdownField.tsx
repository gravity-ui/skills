import { forwardRef, useEffect, useImperativeHandle, useId } from 'react';
import { MarkdownEditorView, useMarkdownEditor } from '@gravity-ui/markdown-editor';
import { Flex, Text } from '@gravity-ui/uikit';

import './MarkdownField.css';

export type MarkdownFieldHandle = {
  /** Current content serialized to Markdown. */
  getValue: () => string;
  clear: () => void;
  focus: () => void;
};

export type MarkdownFieldProps = {
  label: string;
  placeholder?: string;
  initialValue?: string;
  note?: string;
  errorMessage?: string;
  /** Called on every edit with the info whether the field is empty. */
  onEmptyChange?: (isEmpty: boolean) => void;
  /** Ctrl/Cmd + Enter inside the editor. */
  onSubmit?: () => void;
};

/**
 * Form field with a WYSIWYG Markdown editor: Markdown syntax typed by the user
 * (`**bold**`, `# Heading`, `- list`, `> quote`, `` `code` ``…) is formatted right away.
 * The value is still stored and returned as Markdown markup.
 */
export const MarkdownField = forwardRef<MarkdownFieldHandle, MarkdownFieldProps>(
  function MarkdownField(
    { label, placeholder, initialValue, note, errorMessage, onEmptyChange, onSubmit },
    ref,
  ) {
    const labelId = useId();
    const messageId = useId();

    const editor = useMarkdownEditor({
      preset: 'default',
      initial: { mode: 'wysiwyg', markup: initialValue },
      wysiwygConfig: {
        placeholderOptions: { value: placeholder, behavior: 'empty-doc' },
      },
      markupConfig: { placeholder },
    });

    useImperativeHandle(
      ref,
      () => ({
        getValue: () => editor.getValue(),
        clear: () => editor.clear(),
        focus: () => editor.focus(),
      }),
      [editor],
    );

    useEffect(() => {
      if (!onEmptyChange) return undefined;
      const handleChange = () => onEmptyChange(editor.isEmpty());
      editor.on('change', handleChange);
      return () => editor.off('change', handleChange);
    }, [editor, onEmptyChange]);

    useEffect(() => {
      if (!onSubmit) return undefined;
      editor.on('submit', onSubmit);
      return () => editor.off('submit', onSubmit);
    }, [editor, onSubmit]);

    const invalid = Boolean(errorMessage);

    return (
      <Flex direction="column" gap={1}>
        <Text as="div" id={labelId} variant="subheader-1">
          {label}
        </Text>
        <div
          role="group"
          aria-labelledby={labelId}
          aria-describedby={errorMessage || note ? messageId : undefined}
          aria-invalid={invalid || undefined}
          className={`markdown-field${invalid ? ' markdown-field_invalid' : ''}`}
        >
          <MarkdownEditorView editor={editor} stickyToolbar settingsVisible />
        </div>
        {errorMessage ? (
          <Text id={messageId} variant="caption-2" color="danger">
            {errorMessage}
          </Text>
        ) : note ? (
          <Text id={messageId} variant="caption-2" color="secondary">
            {note}
          </Text>
        ) : null}
      </Flex>
    );
  },
);
