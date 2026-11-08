import '@gravity-ui/markdown-editor/styles/styles.css';

import {
  configure as configureMarkdownEditor,
  MarkdownEditorView,
  useMarkdownEditor,
} from '@gravity-ui/markdown-editor';
import type {MarkdownEditorInstance} from '@gravity-ui/markdown-editor';

import './MarkdownField.css';

configureMarkdownEditor({lang: 'ru'});

/**
 * Creates a Markdown editor whose WYSIWYG mode renders the markup the user types
 * (`# `, `**bold**`, `- `, `> `, ...) immediately. The value is not controlled:
 * read it with `editor.getValue()`.
 */
export const useMarkdownField = (initialValue = ''): MarkdownEditorInstance =>
  useMarkdownEditor({
    md: {html: false, linkify: true},
    initial: {markup: initialValue, mode: 'wysiwyg'},
  });

export const MarkdownField = ({editor}: {editor: MarkdownEditorInstance}) => (
  <div className="markdown-field">
    <MarkdownEditorView editor={editor} stickyToolbar={false} />
  </div>
);
