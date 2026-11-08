import { useCallback, useEffect, useState } from 'react';
import {
  MarkdownEditorView,
  useMarkdownEditor,
  type MarkdownEditorInstance,
  type MarkdownEditorMdOptions,
  type MarkdownEditorSplitMode,
  type RenderPreview,
} from '@gravity-ui/markdown-editor';
import { Flex, Text } from '@gravity-ui/uikit';

import { MarkdownPreview } from './MarkdownPreview';

export const MD_OPTIONS: MarkdownEditorMdOptions = { html: false, breaks: true, linkify: true };

const NARROW_VIEWPORT_QUERY = '(max-width: 768px)';

type MarkdownFieldProps = {
  label: string;
  hint?: string;
  placeholder?: string;
  errorMessage?: string;
  /** Called on every content change with the current markdown. */
  onChange?: (markup: string) => void;
  /** Called on Ctrl/Cmd+Enter inside the editor. */
  onSubmitShortcut?: () => void;
  /** Receives the editor instance so the parent can read / clear the value. */
  onEditorReady?: (editor: MarkdownEditorInstance) => void;
};

/**
 * Markdown input with a live side-by-side preview:
 * the user types markup on the left and immediately sees the formatted result on the right
 * (stacked vertically on narrow screens). WYSIWYG mode is available from the editor settings.
 */
export function MarkdownField({
  label,
  hint,
  placeholder,
  errorMessage,
  onChange,
  onSubmitShortcut,
  onEditorReady,
}: MarkdownFieldProps) {
  const [splitMode] = useState<MarkdownEditorSplitMode>(() =>
    window.matchMedia(NARROW_VIEWPORT_QUERY).matches ? 'vertical' : 'horizontal',
  );

  const renderPreview = useCallback<RenderPreview>(
    ({ getValue, md }) => <MarkdownPreview markup={getValue()} md={md} />,
    [],
  );

  const editor = useMarkdownEditor({
    md: MD_OPTIONS,
    initial: { mode: 'markup', splitModeEnabled: true, toolbarVisible: true },
    markupConfig: { renderPreview, splitMode, placeholder },
  });

  useEffect(() => {
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    const handleChange = () => onChange?.(editor.getValue());
    const handleSubmit = () => onSubmitShortcut?.();
    editor.on('change', handleChange);
    editor.on('submit', handleSubmit);
    return () => {
      editor.off('change', handleChange);
      editor.off('submit', handleSubmit);
    };
  }, [editor, onChange, onSubmitShortcut]);

  const invalid = Boolean(errorMessage);

  return (
    <Flex direction="column" gap={1}>
      <Text variant="subheader-1">{label}</Text>
      {hint && (
        <Text variant="body-1" color="secondary">
          {hint}
        </Text>
      )}
      <div className={`markdown-field${invalid ? ' markdown-field_invalid' : ''}`}>
        <MarkdownEditorView editor={editor} stickyToolbar={false} />
      </div>
      {invalid && (
        <Text variant="body-1" color="danger">
          {errorMessage}
        </Text>
      )}
    </Flex>
  );
}
