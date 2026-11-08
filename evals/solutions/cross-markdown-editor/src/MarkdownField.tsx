// Markdown form field built on the official Gravity UI editor:
// the instance is created with the useMarkdownEditor() hook and rendered
// with <MarkdownEditorView/> (WYSIWYG by default — formatting is applied
// live as the user types markdown; the markup mode stays available via
// the editor settings menu).
import { useEffect } from 'react';
import { MarkdownEditorView, useMarkdownEditor } from '@gravity-ui/markdown-editor';

import '@gravity-ui/markdown-editor/styles/styles.css';

export interface MarkdownFieldProps {
  /** Initial markdown markup (uncontrolled field). */
  initialValue?: string;
  /** Fires on every content change with the current markdown markup. */
  onChange?: (value: string) => void;
  /** Fires when the user submits the editor (Cmd/Ctrl+Enter). */
  onSubmit?: (value: string) => void;
  className?: string;
}

export function MarkdownField({ initialValue = '', onChange, onSubmit, className }: MarkdownFieldProps) {
  const editor = useMarkdownEditor({
    md: { breaks: true },
    initial: { markup: initialValue, mode: 'wysiwyg', toolbarVisible: true },
  });

  useEffect(() => {
    function handleChange() {
      onChange?.(editor.getValue());
    }
    function handleSubmit() {
      onSubmit?.(editor.getValue());
    }

    editor.on('change', handleChange);
    editor.on('submit', handleSubmit);
    return () => {
      editor.off('change', handleChange);
      editor.off('submit', handleSubmit);
    };
  }, [editor, onChange, onSubmit]);

  return <MarkdownEditorView editor={editor} stickyToolbar autofocus className={className} />;
}
