import { useEffect, useState } from 'react';
import transform from '@diplodoc/transform';
import { YfmStaticView, type MarkupString, type RenderPreviewParams } from '@gravity-ui/markdown-editor';

const RENDER_DEBOUNCE_MS = 150;

type MarkdownOptions = RenderPreviewParams['md'];

type MarkdownPreviewProps = {
    getValue: () => MarkupString;
    md: MarkdownOptions;
};

function renderMarkdown(markup: MarkupString, md: MarkdownOptions): string {
    return transform(markup, {
        // Plain markdown only: no YFM plugins and no liquid templating,
        // so the preview matches what the 'default' editor preset produces.
        plugins: [],
        disableLiquid: true,
        allowHTML: md.html ?? false,
        needToSanitizeHtml: true,
        breaks: md.breaks,
        linkify: md.linkify,
        linkifyTlds: md.linkifyTlds,
    }).result.html;
}

/**
 * Preview for the markup mode of the editor (split view and full-screen preview).
 * The editor re-renders this component on every change, so the transform is debounced.
 */
export function MarkdownPreview({ getValue, md }: MarkdownPreviewProps) {
    const markup = getValue();
    const [html, setHtml] = useState(() => renderMarkdown(markup, md));

    useEffect(() => {
        const timer = setTimeout(() => setHtml(renderMarkdown(markup, md)), RENDER_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [markup, md]);

    return <YfmStaticView html={html} noListReset />;
}
