import { useEffect, useState } from 'react';
import transform from '@diplodoc/transform';
import { YfmStaticView, type MarkdownEditorMdOptions } from '@gravity-ui/markdown-editor';

const RENDER_DEBOUNCE_MS = 150;

type MarkdownPreviewProps = {
  /** Markdown source. */
  markup: string;
  /** Parser options; pass the ones the editor uses so preview and editor agree. */
  md?: Readonly<MarkdownEditorMdOptions>;
  className?: string;
};

function render(markup: string, md: Readonly<MarkdownEditorMdOptions> = {}): string {
  return transform(markup, {
    allowHTML: md.html ?? false,
    breaks: md.breaks ?? true,
    linkify: md.linkify ?? true,
    linkifyTlds: md.linkifyTlds,
    needToSanitizeHtml: true,
  }).result.html;
}

/** Renders markdown to HTML with the same YFM styles as the editor. */
export function MarkdownPreview({ markup, md, className }: MarkdownPreviewProps) {
  const [html, setHtml] = useState(() => render(markup, md));

  useEffect(() => {
    const timer = window.setTimeout(() => setHtml(render(markup, md)), RENDER_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [markup, md]);

  return <YfmStaticView html={html} noListReset className={className} />;
}
