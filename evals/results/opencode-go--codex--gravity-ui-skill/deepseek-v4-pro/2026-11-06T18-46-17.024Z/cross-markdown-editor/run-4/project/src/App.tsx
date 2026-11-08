import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useMarkdownEditor,
  MarkdownEditorView,
  YfmStaticView,
} from '@gravity-ui/markdown-editor';
import type { RenderPreview } from '@gravity-ui/markdown-editor';
import transform from '@diplodoc/transform';

import '@gravity-ui/markdown-editor/styles/styles.css';
import '@diplodoc/transform/dist/css/base.css';
import '@diplodoc/transform/dist/css/_yfm-only.css';

function SplitModePreview({ getValue }: { getValue: () => string }) {
  const [html, setHtml] = useState('');

  const render = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const result = transform(getValue(), {
          allowHTML: false,
          breaks: true,
          linkify: true,
        });
        setHtml(result.result.html);
      }, 200);
    };
  }, [getValue]);

  useEffect(() => {
    render();
  }, [render]);

  return <YfmStaticView html={html} noListReset />;
}

export function App() {
  const renderPreview = useCallback<RenderPreview>(
    ({ getValue }) => <SplitModePreview getValue={getValue} />,
    [],
  );

  const editor = useMarkdownEditor({
    initial: {
      mode: 'wysiwyg',
      toolbarVisible: true,
      splitModeEnabled: true,
    },
    markupConfig: {
      renderPreview,
      splitMode: 'horizontal',
    },
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <MarkdownEditorView stickyToolbar autofocus editor={editor} />
    </div>
  );
}
