import {useEffect} from 'react';
import {
  MarkdownEditorView,
  YfmStaticView,
  useMarkdownEditor,
  type MarkdownEditorMdOptions,
  type MarkupString,
  type RenderPreview,
} from '@gravity-ui/markdown-editor';
import transform from '@diplodoc/transform';
import {Text} from '@gravity-ui/uikit';

type MarkdownPreviewProps = {
  getValue: () => MarkupString;
  md: Readonly<MarkdownEditorMdOptions>;
};

// Re-rendered by the editor on every change (SplitModeView subscribes to 'change'),
// so the markup is transformed fresh on each render.
function MarkdownPreview({getValue, md}: MarkdownPreviewProps) {
  const {result} = transform(getValue(), {
    allowHTML: md.html,
    breaks: md.breaks,
    linkify: md.linkify,
    linkifyTlds: md.linkifyTlds,
  });

  return <YfmStaticView html={result.html} mods={{'no-list-reset': true}} />;
}

const renderPreview: RenderPreview = ({getValue, md}) => (
  <MarkdownPreview getValue={getValue} md={md} />
);

export type MarkdownFieldProps = {
  label: string;
  onChange: (value: MarkupString) => void;
};

/**
 * Markdown input with a live preview: the markup source is on one side and the
 * rendered result is on the other, updated as the user types.
 */
export function MarkdownField({label, onChange}: MarkdownFieldProps) {
  const editor = useMarkdownEditor({
    md: {html: false},
    initial: {mode: 'markup', splitModeEnabled: true},
    markupConfig: {renderPreview, splitMode: 'horizontal'},
  });

  useEffect(() => {
    const handleChange = () => onChange(editor.getValue());

    editor.on('change', handleChange);
    return () => {
      editor.off('change', handleChange);
    };
  }, [editor, onChange]);

  return (
    <div>
      <Text variant="subheader-2" as="div" style={{marginBottom: 8}}>
        {label}
      </Text>
      <MarkdownEditorView editor={editor} stickyToolbar />
    </div>
  );
}
