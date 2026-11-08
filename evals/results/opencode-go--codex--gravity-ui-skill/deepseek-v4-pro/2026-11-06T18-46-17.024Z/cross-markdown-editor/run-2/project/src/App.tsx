import '@diplodoc/transform/dist/css/yfm.css';

import { useCallback, useEffect, useState } from 'react';
import { useMarkdownEditor, MarkdownEditorView, YfmStaticView } from '@gravity-ui/markdown-editor';
import type { RenderPreview } from '@gravity-ui/markdown-editor';
import debounce from 'lodash/debounce';
import transform from '@diplodoc/transform';

function SplitModePreview({ getValue }: { getValue: () => string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const render = debounce(() => {
      const res = transform(getValue(), {
        allowHTML: false,
        breaks: true,
        linkify: true,
      });
      setHtml(res.result.html);
    }, 200);

    const interval = setInterval(render, 200);
    render();

    return () => {
      clearInterval(interval);
      render.cancel();
    };
  }, [getValue]);

  return <YfmStaticView html={html} noListReset className="demo-preview" />;
}

export function App() {
  const renderPreview = useCallback<RenderPreview>(
    ({ getValue }) => <SplitModePreview getValue={getValue} />,
    [],
  );

  const editor = useMarkdownEditor(
    {
      md: { html: false, breaks: true, linkify: true },
      initial: {
        markup:
          '# Заголовок\n\n**Жирный текст** и _курсив_.\n\n- Список\n- Ещё элемент\n\n## Код\n\n`console.log("Hello")`\n\n> Цитата',
        mode: 'wysiwyg',
        toolbarVisible: true,
        splitModeEnabled: true,
      },
      markupConfig: {
        renderPreview,
        splitMode: 'horizontal',
      },
    },
    [],
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MarkdownEditorView editor={editor} stickyToolbar autofocus settingsVisible />
    </div>
  );
}
