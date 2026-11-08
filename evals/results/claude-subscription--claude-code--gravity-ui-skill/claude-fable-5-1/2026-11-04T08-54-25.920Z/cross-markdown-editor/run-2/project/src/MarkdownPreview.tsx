import {useEffect, useMemo, useState} from 'react';
import transform from '@diplodoc/transform';
import plugins from '@diplodoc/transform/lib/plugins';
import {YfmStaticView, type MarkupString, type RenderPreviewParams} from '@gravity-ui/markdown-editor';
import {useThemeValue} from '@gravity-ui/uikit';

import '@diplodoc/transform/dist/css/yfm.css';

type MarkdownPreviewProps = {
  getValue: () => MarkupString;
  md: RenderPreviewParams['md'];
};

const RENDER_DELAY_MS = 150;

/** Renders the current markup to HTML. Re-rendered by the editor on every change. */
export function MarkdownPreview({getValue, md}: MarkdownPreviewProps) {
  const [html, setHtml] = useState('');
  const theme = useThemeValue();
  const markup = getValue();

  const options = useMemo(
    () => ({
      allowHTML: md.html,
      breaks: md.breaks,
      linkify: md.linkify,
      linkifyTlds: md.linkifyTlds,
      plugins,
    }),
    [md.html, md.breaks, md.linkify, md.linkifyTlds],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHtml(transform(markup, options).result.html);
    }, RENDER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [markup, options, theme]);

  return <YfmStaticView html={html} mods={{'no-list-reset': true}} />;
}
