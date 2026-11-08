import { useMemo } from 'react';
import transform from '@diplodoc/transform';
import { YfmStaticView, type MarkdownEditorMdOptions } from '@gravity-ui/markdown-editor';
import { Text } from '@gravity-ui/uikit';

type MarkdownPreviewProps = {
  /** Current markdown source; provided by the editor's `renderPreview` callback. */
  getValue: () => string;
  /** Parser options the editor itself uses, so preview and editor agree. */
  md: Readonly<MarkdownEditorMdOptions>;
};

function renderMarkdown(markup: string, md: Readonly<MarkdownEditorMdOptions>): string {
  try {
    return transform(markup, {
      allowHTML: md.html ?? false,
      breaks: md.breaks ?? true,
      linkify: md.linkify ?? false,
      linkifyTlds: md.linkifyTlds,
      // User input: never trust raw HTML, and don't evaluate `{{ liquid }}` templates.
      needToSanitizeHtml: true,
      disableLiquid: true,
      // Otherwise a trailing `{...}` is consumed as attributes and silently vanishes.
      enableMarkdownAttrs: false,
      // Plain markdown only, matching the editor's 'default' preset (no YFM notes/cuts/tabs),
      // so the preview never shows something the visual mode can't represent.
      plugins: [],
      lang: 'ru',
    }).result.html;
  } catch {
    // Malformed input must not break the form; show nothing until it parses again.
    return '';
  }
}

/**
 * Rendered markdown shown next to the source in split mode (and in the
 * full-screen preview). The editor re-renders this on every change.
 */
export function MarkdownPreview({ getValue, md }: MarkdownPreviewProps) {
  const markup = getValue();
  const html = useMemo(
    () => renderMarkdown(markup, md),
    [markup, md.html, md.breaks, md.linkify, md.linkifyTlds],
  );

  if (!markup.trim()) {
    return (
      <Text as="div" color="secondary">
        Здесь появится отформатированный текст
      </Text>
    );
  }

  return <YfmStaticView html={html} noListReset />;
}
