import './MarkdownField.css';

import { Text, TextArea } from '@gravity-ui/uikit';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownFieldProps {
  value: string;
  onUpdate: (value: string) => void;
  label?: string;
  placeholder?: string;
  minRows?: number;
}

const remarkPlugins = [remarkGfm];

// Safe by default: react-markdown renders React elements (no innerHTML),
// ignores raw HTML in the source and strips unsafe URL protocols like `javascript:`.
const components = {
  a: ({ node: _node, ...props }: React.ComponentProps<'a'> & { node?: unknown }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
};

/** Textarea with markdown source on the left and a live rendered preview on the right. */
export function MarkdownField({
  value,
  onUpdate,
  label = 'Описание',
  placeholder = 'Введите текст в формате Markdown…',
  minRows = 10,
}: MarkdownFieldProps) {
  return (
    <div className="markdown-field">
      <div className="markdown-field__pane">
        <Text variant="subheader-1" as="label" htmlFor="markdown-field-input">
          {label} <span className="markdown-field__pane-title">(Markdown)</span>
        </Text>
        <TextArea
          id="markdown-field-input"
          value={value}
          onUpdate={onUpdate}
          placeholder={placeholder}
          minRows={minRows}
          maxRows={20}
        />
      </div>
      <div className="markdown-field__pane">
        <Text variant="subheader-1" color="secondary">
          Предпросмотр
        </Text>
        <div className="markdown-field__preview" aria-live="polite">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
              {value}
            </ReactMarkdown>
          ) : (
            <span className="markdown-field__preview-empty">Здесь появится отформатированный текст</span>
          )}
        </div>
      </div>
    </div>
  );
}
