import {useCallback, useEffect, useMemo, useState} from 'react';
import debounce from 'lodash/debounce';

import {Button} from '@gravity-ui/uikit';
import transform from '@diplodoc/transform';
import {
    MarkdownEditorView,
    type MarkupString,
    type RenderPreview,
    YfmStaticView,
    useMarkdownEditor,
} from '@gravity-ui/markdown-editor';

import './App.css';

const INITIAL_MARKUP = [
    '# Weekly update',
    '',
    'Markdown is supported — **bold**, *italic*, `code`, [links](https://example.com).',
    '',
    '- Lists',
    '- Render **as you type**',
    '',
    '> Quote blocks and tables work too.',
    '',
    '| Field | Value |',
    '| --- | --- |',
    '| Status | Draft |',
].join('\n');

type SplitPreviewProps = {
    getValue: () => MarkupString;
};

function SplitPreview({getValue}: SplitPreviewProps) {
    const [html, setHtml] = useState('');

    const rerender = useMemo(
        () =>
            debounce(() => {
                setHtml(transform(getValue(), {allowHTML: false}).result.html);
            }, 200),
        [getValue],
    );

    useEffect(() => {
        rerender();
    }, [rerender]);

    return <YfmStaticView html={html} className="md-form-preview" />;
}

export function App() {
    const [submitted, setSubmitted] = useState<MarkupString | null>(null);

    const renderPreview = useCallback<RenderPreview>(
        ({getValue}) => <SplitPreview getValue={getValue} />,
        [],
    );

    const editor = useMarkdownEditor({
        md: {html: false},
        initial: {
            markup: INITIAL_MARKUP,
            mode: 'markup',
            splitModeEnabled: true,
            toolbarVisible: true,
        },
        markupConfig: {
            renderPreview,
            splitMode: 'vertical',
        },
    });

    const handleSubmit = useCallback(() => {
        setSubmitted(editor.getValue());
    }, [editor]);

    return (
        <div className="md-form-page">
            <h2>Markdown form field</h2>
            <div className="md-form-editor">
                <MarkdownEditorView editor={editor} stickyToolbar autofocus />
            </div>
            <div className="md-form-actions">
                <Button view="action" size="m" onClick={handleSubmit}>
                    Submit
                </Button>
                {submitted !== null && <span className="md-form-submitted">Submitted {submitted.length} characters of markup.</span>}
            </div>
        </div>
    );
}
