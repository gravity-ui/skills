import {useEffect, useState} from 'react';

import transform from '@diplodoc/transform';
import {YfmStaticView} from '@gravity-ui/markdown-editor';
import type {RenderPreviewParams} from '@gravity-ui/markdown-editor';
import {sp} from '@gravity-ui/uikit';

type SplitModePreviewProps = Pick<RenderPreviewParams, 'getValue' | 'md'>;

/**
 * Live preview for the markup mode of the markdown editor.
 * The editor re-invokes `renderPreview` on every change, so this component
 * re-renders on each keystroke; the timeout debounces the transform call.
 */
export function SplitModePreview({getValue, md}: SplitModePreviewProps) {
    const [html, setHtml] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            const {result} = transform(getValue(), {
                allowHTML: md.html,
                breaks: md.breaks,
                linkify: md.linkify,
                linkifyTlds: md.linkifyTlds,
                needToSanitizeHtml: true,
            });
            setHtml(result.html);
        }, 150);

        return () => clearTimeout(timer);
    });

    return <YfmStaticView html={html} mods={{'no-list-reset': true}} className={sp({p: 4})} />;
}
