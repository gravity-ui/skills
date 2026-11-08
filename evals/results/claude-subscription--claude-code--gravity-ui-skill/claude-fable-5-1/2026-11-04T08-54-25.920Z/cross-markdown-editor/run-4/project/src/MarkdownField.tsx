import { useCallback, useEffect, useId } from 'react';
import {
  MarkdownEditorView,
  useMarkdownEditor,
  type MarkupString,
  type RenderPreview,
} from '@gravity-ui/markdown-editor';
import { Flex, Text } from '@gravity-ui/uikit';

import { MarkdownPreview } from './MarkdownPreview';

export interface MarkdownFieldProps {
  label: string;
  /** Initial markup. The editor owns its state afterwards; read changes via `onChange`. */
  initialValue?: MarkupString;
  onChange: (value: MarkupString) => void;
  /** Fired on Ctrl/Cmd+Enter inside the editor. */
  onSubmit?: (value: MarkupString) => void;
  note?: string;
  errorMessage?: string;
  autofocus?: boolean;
}

/**
 * Form field: the user types Markdown in the source (markup) pane and sees
 * the rendered result side by side, updated live.
 */
export function MarkdownField({
  label,
  initialValue = '',
  onChange,
  onSubmit,
  note,
  errorMessage,
  autofocus,
}: MarkdownFieldProps) {
  const labelId = useId();
  const invalid = Boolean(errorMessage);

  const renderPreview = useCallback<RenderPreview>(
    ({ getValue, md }) => (
      <MarkdownPreview
        getValue={getValue}
        allowHTML={md.html}
        breaks={md.breaks}
        linkify={md.linkify}
        linkifyTlds={md.linkifyTlds}
      />
    ),
    [],
  );

  const editor = useMarkdownEditor(
    {
      md: { html: false, breaks: true, linkify: true },
      initial: {
        markup: initialValue,
        mode: 'markup',
        toolbarVisible: true,
        splitModeEnabled: true,
      },
      markupConfig: {
        splitMode: 'horizontal',
        renderPreview,
        placeholder: 'Напишите текст в формате Markdown…',
      },
    },
    [renderPreview],
  );

  useEffect(() => {
    const handleChange = () => onChange(editor.getValue());
    const handleSubmit = () => onSubmit?.(editor.getValue());

    editor.on('change', handleChange);
    editor.on('submit', handleSubmit);
    return () => {
      editor.off('change', handleChange);
      editor.off('submit', handleSubmit);
    };
  }, [editor, onChange, onSubmit]);

  return (
    <Flex direction="column" gap={2} className="markdown-field">
      <Text as="label" id={labelId} variant="subheader-1">
        {label}
      </Text>
      <div
        className={invalid ? 'markdown-field__editor markdown-field__editor_invalid' : 'markdown-field__editor'}
        role="group"
        aria-labelledby={labelId}
        aria-invalid={invalid || undefined}
      >
        <MarkdownEditorView editor={editor} stickyToolbar autofocus={autofocus} />
      </div>
      {errorMessage ? (
        <Text variant="body-1" color="danger">
          {errorMessage}
        </Text>
      ) : note ? (
        <Text variant="body-1" color="secondary">
          {note}
        </Text>
      ) : null}
    </Flex>
  );
}
