import {useCallback, useEffect, useMemo, useState} from 'react';

import transform from '@diplodoc/transform';
import {
  MarkdownEditorView,
  type MarkdownEditorMdOptions,
  type RenderPreviewParams,
  useMarkdownEditor,
} from '@gravity-ui/markdown-editor';
import {Box, Text, useThemeValue} from '@gravity-ui/uikit';

import './App.css';

const PREVIEW_DEBOUNCE_MS = 150;
const DEFAULT_MARKDOWN = `# Заголовок

Введите текст с **разметкой**, чтобы увидеть форматирование справа:

- списки
- \`код\`
- [ссылки](https://gravity-ui.com)
`;

function LiveMarkdownPreview({getValue}: Pick<RenderPreviewParams, 'getValue'>) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHtml(transform(getValue()).result.html);
    }, PREVIEW_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [getValue]);

  return <div className="yfm" dangerouslySetInnerHTML={{__html: html}} />;
}

export function App() {
  const themeValue = useThemeValue();
  const renderPreview = useCallback(
    ({getValue}: RenderPreviewParams) => <LiveMarkdownPreview getValue={getValue} />,
    [],
  );

  const md = useMemo<MarkdownEditorMdOptions>(
    () => ({breaks: true, linkify: true}),
    [],
  );

  const editor = useMarkdownEditor({
    md,
    initial: {
      markup: DEFAULT_MARKDOWN,
      mode: 'markup',
      splitModeEnabled: true,
    },
    markupConfig: {
      renderPreview,
      splitMode: 'horizontal',
    },
  });

  return (
    <Box spacing={{p: 6}} maxWidth={1100}>
      <Box spacing={{mb: 4}}>
        <Text variant="header-1">Markdown</Text>
        <Text variant="body-1" color="secondary">
          Пишите с разметкой — форматирование появляется сразу.
        </Text>
      </Box>

      <Box
        className={`g-root g-root_theme_${themeValue} markdown-form-preview`}
        overflow="hidden"
        minHeight={520}
      >
        <MarkdownEditorView
          editor={editor}
          stickyToolbar
          autofocus
          settingsVisible
        />
      </Box>
    </Box>
  );
}
