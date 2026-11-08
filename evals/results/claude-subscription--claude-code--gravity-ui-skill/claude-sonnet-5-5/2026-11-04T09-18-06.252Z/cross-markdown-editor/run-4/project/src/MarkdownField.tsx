import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {MarkdownEditorView, useMarkdownEditor} from '@gravity-ui/markdown-editor';

export type MarkdownFieldHandle = {
  getValue: () => string;
  clear: () => void;
};

type MarkdownFieldProps = {
  label: string;
  /** Called on every document change with the current markdown markup. */
  onChange?: (value: string) => void;
  error?: string;
  minHeight?: number;
};

/**
 * Markdown field: the user types markdown syntax (`**bold**`, `# Heading`, `- list`)
 * and sees the formatting immediately (WYSIWYG mode). The toolbar/settings allow switching
 * to the raw markup mode.
 */
export const MarkdownField = React.forwardRef<MarkdownFieldHandle, MarkdownFieldProps>(
  function MarkdownField({label, onChange, error, minHeight = 200}, ref) {
    const editor = useMarkdownEditor({
      md: {html: false},
      initial: {mode: 'wysiwyg', toolbarVisible: true},
    });

    React.useImperativeHandle(
      ref,
      () => ({getValue: () => editor.getValue(), clear: () => editor.clear()}),
      [editor],
    );

    React.useEffect(() => {
      if (!onChange) return undefined;
      const handler = () => onChange(editor.getValue());
      editor.on('change', handler);
      return () => {
        editor.off('change', handler);
      };
    }, [editor, onChange]);

    return (
      <Flex direction="column" gap={1}>
        <Text variant="subheader-1">{label}</Text>
        <div
          style={{
            minHeight,
            border: '1px solid var(--g-color-line-generic)',
            borderRadius: 'var(--g-border-radius-m)',
            overflow: 'auto',
          }}
        >
          <MarkdownEditorView stickyToolbar={false} editor={editor} />
        </div>
        {error ? (
          <Text variant="caption-2" color="danger">
            {error}
          </Text>
        ) : null}
      </Flex>
    );
  },
);
