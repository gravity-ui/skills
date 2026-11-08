import { forwardRef, useCallback, useEffect, useId, useImperativeHandle } from 'react';
import {
  MarkdownEditorView,
  useMarkdownEditor,
  type MarkdownEditorMdOptions,
  type RenderPreview,
} from '@gravity-ui/markdown-editor';
import { Text } from '@gravity-ui/uikit';

import { MarkdownPreview } from './MarkdownPreview';
import './MarkdownField.css';

// Shared by the editor and the preview so both parse markdown the same way.
const MD_OPTIONS: MarkdownEditorMdOptions = {
  html: false,
  breaks: true,
  linkify: true,
};

export type MarkdownFieldHandle = {
  focus(): void;
  clear(): void;
};

type MarkdownFieldProps = {
  label: string;
  /** Initial markdown; later changes are ignored (the editor owns its state). */
  initialValue?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  onChange?: (value: string) => void;
};

/**
 * Form field for markdown text. Opens in markup mode with a live preview
 * pane beside the source; the user can switch to the visual (WYSIWYG) mode
 * from the editor's settings menu.
 */
export const MarkdownField = forwardRef<MarkdownFieldHandle, MarkdownFieldProps>(
  function MarkdownField({ label, initialValue = '', placeholder, hint, error, onChange }, ref) {
    const id = useId();
    const labelId = `${id}-label`;
    const messageId = `${id}-message`;

    const renderPreview = useCallback<RenderPreview>(
      ({ getValue, md }) => <MarkdownPreview getValue={getValue} md={md} />,
      [],
    );

    const editor = useMarkdownEditor({
      preset: 'default',
      md: MD_OPTIONS,
      initial: {
        markup: initialValue,
        mode: 'markup',
        splitModeEnabled: true,
      },
      markupConfig: {
        renderPreview,
        splitMode: 'horizontal',
        placeholder,
      },
      wysiwygConfig: {
        placeholderOptions: { value: placeholder },
        // Keep in sync with the preview: `{...}` is plain text, not attributes.
        disableMarkdownAttrs: true,
      },
    });

    useImperativeHandle(ref, () => ({
      focus: () => editor.focus(),
      clear: () => editor.clear(),
    }), [editor]);

    useEffect(() => {
      if (!onChange) return;
      const handleChange = () => onChange(editor.getValue());
      editor.on('change', handleChange);
      return () => editor.off('change', handleChange);
    }, [editor, onChange]);

    const message = error ?? hint;

    return (
      <div className="markdown-field">
        <Text
          as="div"
          id={labelId}
          variant="subheader-1"
          className="markdown-field__label"
          onClick={() => editor.focus()}
        >
          {label}
        </Text>
        <div
          role="group"
          aria-labelledby={labelId}
          aria-describedby={message ? messageId : undefined}
          aria-invalid={error ? true : undefined}
          className={`markdown-field__control${error ? ' markdown-field__control_invalid' : ''}`}
        >
          <MarkdownEditorView editor={editor} stickyToolbar={false} />
        </div>
        {message && (
          <Text
            as="div"
            id={messageId}
            variant="body-1"
            color={error ? 'danger' : 'secondary'}
            className="markdown-field__message"
          >
            {message}
          </Text>
        )}
      </div>
    );
  },
);
