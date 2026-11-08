import { useMemo } from 'react';
import { YfmStaticView, type RenderPreview } from '@gravity-ui/markdown-editor';

import { renderMarkdown } from './renderMarkdown';

export function MarkdownPreview({ markup }: { markup: string }) {
    const html = useMemo(() => renderMarkdown(markup), [markup]);
    return <YfmStaticView html={html} mods={{ 'no-list-reset': true }} />;
}

/** Plugged into `useMarkdownEditor({markupConfig: {renderPreview}})`. */
export const renderPreview: RenderPreview = ({ getValue }) => <MarkdownPreview markup={getValue()} />;
