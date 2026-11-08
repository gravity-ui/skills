import React, { useCallback, useMemo } from 'react';
import {
  useMarkdownEditor,
  MarkdownEditorView,
  YfmStaticView,
} from '@gravity-ui/markdown-editor';
import transform from '@diplodoc/transform';
import type { RenderPreview } from '@gravity-ui/markdown-editor';
import { Flex, Text } from '@gravity-ui/uikit';

function Editor() {
  const renderPreview = useCallback<RenderPreview>(
    ({ getValue, md }) => {
      const result = transform(getValue(), {
        allowHTML: md.html,
        breaks: md.breaks,
        linkify: md.linkify,
        linkifyTlds: md.linkifyTlds,
      }).result;
      return <YfmStaticView html={result.html} noListReset />;
    },
    [],
  );

  const editor = useMarkdownEditor(
    useMemo(
      () => ({
        md: { html: false, breaks: true, linkify: true },
        initial: { toolbarVisible: true, splitModeEnabled: true, mode: 'wysiwyg' },
        markupConfig: {
          renderPreview,
          splitMode: 'horizontal',
        },
      }),
      [],
    ),
  );

  return <MarkdownEditorView stickyToolbar autofocus editor={editor} />;
}

export function App() {
  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-1">Markdown Editor</Text>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor />
      </div>
    </Flex>
  );
}
