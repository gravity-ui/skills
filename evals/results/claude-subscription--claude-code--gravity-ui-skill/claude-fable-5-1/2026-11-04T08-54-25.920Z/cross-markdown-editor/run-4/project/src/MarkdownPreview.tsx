import { useEffect, useState } from 'react';
import transform from '@diplodoc/transform';
import { YfmStaticView, type MarkupString } from '@gravity-ui/markdown-editor';

const RENDER_DELAY_MS = 150;

export interface MarkdownPreviewProps {
  getValue: () => MarkupString;
  allowHTML?: boolean;
  breaks?: boolean;
  linkify?: boolean;
  linkifyTlds?: string | string[];
}

/**
 * Renders the current markup to HTML (via @diplodoc/transform, the same
 * renderer the editor's YFM extensions rely on) and shows it with YfmStaticView.
 * The editor re-mounts/re-renders this component on every change, so the
 * rendering is debounced to keep typing smooth.
 */
export function MarkdownPreview({
  getValue,
  allowHTML = false,
  breaks = true,
  linkify = true,
  linkifyTlds,
}: MarkdownPreviewProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const { result } = transform(getValue(), {
        allowHTML,
        breaks,
        linkify,
        linkifyTlds,
        needToSanitizeHtml: true,
      });
      setHtml(result.html);
    }, RENDER_DELAY_MS);

    return () => window.clearTimeout(timer);
  });

  return <YfmStaticView html={html} mods={{ 'no-list-reset': true }} className="markdown-preview" />;
}
