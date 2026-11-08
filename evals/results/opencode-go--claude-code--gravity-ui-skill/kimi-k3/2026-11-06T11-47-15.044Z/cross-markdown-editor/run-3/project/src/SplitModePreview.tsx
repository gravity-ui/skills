import {useEffect, useMemo, useState} from 'react';

import transform from '@diplodoc/transform';
import {YfmStaticView, type RenderPreviewParams} from '@gravity-ui/markdown-editor';
import {useThemeValue} from '@gravity-ui/uikit';

const TRANSFORM_OPTIONS = {
    allowHTML: false,
    breaks: true,
    linkify: true,
    needToSanitizeHtml: true,
} as const;

/**
 * Live preview for the editor's markup mode: re-renders the current markdown
 * (debounced) every time the editor content changes.
 */
export function SplitModePreview({getValue, md}: RenderPreviewParams) {
    const [html, setHtml] = useState('');
    const theme = useThemeValue();

    const render = useMemo(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const {result} = transform(getValue(), {
                    ...TRANSFORM_OPTIONS,
                    allowHTML: md.html ?? TRANSFORM_OPTIONS.allowHTML,
                    breaks: md.breaks ?? TRANSFORM_OPTIONS.breaks,
                    linkify: md.linkify ?? TRANSFORM_OPTIONS.linkify,
                    linkifyTlds: md.linkifyTlds,
                });
                setHtml(result.html);
            }, 200);
        };
    }, [getValue, md, theme]);

    // The editor re-renders this component on every content change.
    useEffect(() => {
        render();
    });

    return <YfmStaticView html={html} mods={{'no-list-reset': true}} />;
}

/** Read-only rendering of a markdown string (used for the submitted result). */
export function MarkdownPreview({markup}: {markup: string}) {
    const {result} = useMemo(() => transform(markup, TRANSFORM_OPTIONS), [markup]);

    return <YfmStaticView html={result.html} mods={{'no-list-reset': true}} />;
}
