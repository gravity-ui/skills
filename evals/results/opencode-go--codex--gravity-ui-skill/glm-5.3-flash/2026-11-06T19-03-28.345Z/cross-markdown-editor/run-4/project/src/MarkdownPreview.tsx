import React from 'react';

import type {RenderPreviewParams} from '@gravity-ui/markdown-editor';
import {YfmStaticView} from '@gravity-ui/markdown-editor/view';
import transform from '@diplodoc/transform';

import '@diplodoc/transform/dist/css/yfm.css';

type MarkdownPreviewProps = RenderPreviewParams;

const renderDelay = 200;

export function MarkdownPreview({getValue, md}: MarkdownPreviewProps) {
  const [html, setHtml] = React.useState('');
  const previousValue = React.useRef<string | null>(null);

  React.useEffect(() => {
    const render = () => {
      const value = String(getValue());

      if (previousValue.current === value) {
        return;
      }

      previousValue.current = value;
      setHtml(
        transform(value, {
          allowHTML: false,
          breaks: md.breaks,
          linkify: md.linkify,
          linkifyTlds: md.linkifyTlds,
        }).result.html,
      );
    };

    render();
    const timerId = window.setTimeout(render, renderDelay);

    return () => window.clearTimeout(timerId);
  }, [getValue, md]);

  return <YfmStaticView className="markdown-preview" html={html} noListReset />;
}
