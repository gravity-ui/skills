import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Text, TextArea } from '@gravity-ui/uikit';

import './MarkdownField.css';

export interface MarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minRows?: number;
  name?: string;
}

/** Текстовое поле с Markdown-разметкой и живым превью рядом. */
export function MarkdownField({
  value,
  onChange,
  label,
  placeholder,
  minRows = 12,
  name,
}: MarkdownFieldProps) {
  const id = React.useId();
  const previewId = `${id}-preview`;

  return (
    <div className="md-field">
      {label && (
        <label htmlFor={id}>
          <Text variant="subheader-2">{label}</Text>
        </label>
      )}
      <div className="md-field__panes">
        <TextArea
          id={id}
          name={name}
          className="md-field__editor"
          size="l"
          value={value}
          onUpdate={onChange}
          placeholder={placeholder}
          minRows={minRows}
          controlProps={{ 'aria-describedby': previewId, spellCheck: false }}
        />
        <div
          id={previewId}
          className="md-field__preview"
          role="region"
          aria-label="Предпросмотр"
          aria-live="polite"
          style={{ minHeight: `${minRows * 1.5 + 1.5}em` }}
        >
          {value.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <Text color="secondary">Здесь появится предпросмотр</Text>
          )}
        </div>
      </div>
    </div>
  );
}
