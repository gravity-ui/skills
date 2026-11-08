import {useCallback, useEffect} from 'react';
import {
  MarkdownEditorView,
  useMarkdownEditor,
  type MarkupString,
  type RenderPreview,
} from '@gravity-ui/markdown-editor';
import {Text} from '@gravity-ui/uikit';

import {MarkdownPreview} from './MarkdownPreview';

type MarkdownFieldProps = {
  label: string;
  value: MarkupString;
  onChange: (value: MarkupString) => void;
  placeholder?: string;
};

/**
 * Form field for markdown text. The user types raw markup on the left and
 * sees the rendered result on the right, updated as they type.
 */
export function MarkdownField({label, value, onChange, placeholder}: MarkdownFieldProps) {
  const renderPreview = useCallback<RenderPreview>(
    ({getValue, md}) => <MarkdownPreview getValue={getValue} md={md} />,
    [],
  );

  const editor = useMarkdownEditor({
    md: {html: false, linkify: true, breaks: true},
    initial: {markup: value, mode: 'markup', splitModeEnabled: true, toolbarVisible: true},
    markupConfig: {renderPreview, splitMode: 'horizontal', placeholder},
  });

  useEffect(() => {
    const handleChange = () => onChange(editor.getValue());
    editor.on('change', handleChange);
    return () => {
      editor.off('change', handleChange);
    };
  }, [editor, onChange]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--g-spacing-2)'}}>
      <Text variant="subheader-1">{label}</Text>
      <div
        style={{
          minHeight: 320,
          border: '1px solid var(--g-color-line-generic)',
          borderRadius: 'var(--g-border-radius-m)',
          overflow: 'hidden',
        }}
      >
        <MarkdownEditorView editor={editor} stickyToolbar={false} settingsVisible={['mode', 'split']} />
      </div>
    </div>
  );
}
