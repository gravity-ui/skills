import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {
  MarkdownEditorView,
  useMarkdownEditor,
  type MarkdownEditorInstance,
} from '@gravity-ui/markdown-editor';

export interface MarkdownFieldProps {
  label: string;
  /** Called with the serialized Markdown on every change. */
  onChange: (markup: string) => void;
  /** Receives the editor instance so the parent form can read/clear the value. */
  editorRef?: React.MutableRefObject<MarkdownEditorInstance | null>;
  invalid?: boolean;
  errorMessage?: string;
}

/**
 * Form field for Markdown text. The editor renders formatting as the user types
 * (WYSIWYG mode: `**bold**`, `# heading`, `- item` are converted on the fly) and
 * lets them switch to raw Markdown markup mode via the editor settings.
 */
export function MarkdownField({label, onChange, editorRef, invalid, errorMessage}: MarkdownFieldProps) {
  const editor = useMarkdownEditor({
    md: {html: false},
    initial: {mode: 'wysiwyg', toolbarVisible: true},
  });

  React.useEffect(() => {
    if (editorRef) editorRef.current = editor;
    return () => {
      if (editorRef) editorRef.current = null;
    };
  }, [editor, editorRef]);

  React.useEffect(() => {
    const handleChange = () => onChange(editor.getValue());
    editor.on('change', handleChange);
    return () => {
      editor.off('change', handleChange);
    };
  }, [editor, onChange]);

  return (
    <Flex direction="column" gap={1}>
      <Text variant="subheader-1">{label}</Text>
      <div
        style={{
          border: `1px solid ${
            invalid ? 'var(--g-color-line-danger)' : 'var(--g-color-line-generic)'
          }`,
          borderRadius: 'var(--g-border-radius-m)',
          minHeight: 240,
          overflow: 'hidden',
        }}
      >
        <MarkdownEditorView editor={editor} stickyToolbar={false} />
      </div>
      {invalid && errorMessage ? (
        <Text variant="caption-2" color="danger">
          {errorMessage}
        </Text>
      ) : null}
    </Flex>
  );
}
