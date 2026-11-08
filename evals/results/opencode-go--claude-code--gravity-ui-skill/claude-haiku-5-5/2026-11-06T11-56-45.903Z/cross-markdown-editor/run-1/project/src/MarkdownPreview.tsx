import {useMemo} from 'react';
import transform from '@diplodoc/transform';
import {YfmStaticView} from '@gravity-ui/markdown-editor';
import type {MarkupString} from '@gravity-ui/markdown-editor';

import '@diplodoc/transform/dist/css/yfm.css';

type MarkdownPreviewProps = {
    getValue: () => MarkupString;
};

// Rendered next to the markup editor (split mode). The editor re-renders this
// component on every change, so reading getValue() here keeps the preview live.
export function MarkdownPreview({getValue}: MarkdownPreviewProps) {
    const markup = getValue();
    const html = useMemo(
        () => transform(markup, {allowHTML: false, linkify: true}).result.html,
        [markup],
    );

    return <YfmStaticView html={html} />;
}
