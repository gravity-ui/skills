import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {MarkdownEditorView, useMarkdownEditor} from '@gravity-ui/markdown-editor';
import type {MarkupString} from '@gravity-ui/markdown-editor';

import './MarkdownField.css';

export interface MarkdownFieldProps {
  label: string;
  /** Initial markdown. The editor owns its state afterwards (uncontrolled). */
  defaultValue?: MarkupString;
  onChange?: (value: MarkupString) => void;
  /** Called on the editor's own submit hotkey (Ctrl/Cmd+Enter). */
  onSubmit?: () => void;
  /** Exposes the serializer so the parent form can read the value on submit. */
  getValueRef?: React.MutableRefObject<(() => MarkupString) | null>;
}

/**
 * Form field for Markdown text. Opens in WYSIWYG mode, so the formatting is
 * rendered while the user types; the markup mode stays available via the
 * editor's mode switcher.
 */
export const MarkdownField: React.FC<MarkdownFieldProps> = ({
  label,
  defaultValue = '',
  onChange,
  onSubmit,
  getValueRef,
}) => {
  const editor = useMarkdownEditor({
    md: {html: false},
    initial: {markup: defaultValue, mode: 'wysiwyg'},
  });

  React.useEffect(() => {
    if (getValueRef) {
      getValueRef.current = () => editor.getValue();
    }
    return () => {
      if (getValueRef) {
        getValueRef.current = null;
      }
    };
  }, [editor, getValueRef]);

  React.useEffect(() => {
    const changeHandler = () => onChange?.(editor.getValue());
    const submitHandler = () => onSubmit?.();

    editor.on('change', changeHandler);
    editor.on('submit', submitHandler);
    return () => {
      editor.off('change', changeHandler);
      editor.off('submit', submitHandler);
    };
  }, [editor, onChange, onSubmit]);

  return (
    <div className="markdown-field">
      <Text variant="subheader-1" as="div" className="markdown-field__label">
        {label}
      </Text>
      <div className="markdown-field__editor">
        <MarkdownEditorView editor={editor} stickyToolbar={false} />
      </div>
    </div>
  );
};
