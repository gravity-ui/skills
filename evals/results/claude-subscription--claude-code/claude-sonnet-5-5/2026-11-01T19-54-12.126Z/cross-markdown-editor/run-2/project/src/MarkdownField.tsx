import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Text, TextArea } from '@gravity-ui/uikit';

import './MarkdownField.css';

export interface MarkdownFieldProps {
  value: string;
  onUpdate: (value: string) => void;
  label?: string;
  placeholder?: string;
  name?: string;
  minRows?: number;
}

/** Поле ввода Markdown с живым превью: форматирование обновляется по мере набора. */
export function MarkdownField({
  value,
  onUpdate,
  label = 'Описание',
  placeholder = 'Введите текст в формате Markdown…',
  name,
  minRows = 12,
}: MarkdownFieldProps) {
  const inputId = React.useId();
  const previewId = React.useId();

  return (
    <div className="markdown-field">
      <div className="markdown-field__pane">
        <label htmlFor={inputId}>
          <Text variant="subheader-2">{label}</Text>
        </label>
        <TextArea
          id={inputId}
          name={name}
          value={value}
          onUpdate={onUpdate}
          placeholder={placeholder}
          minRows={minRows}
          controlProps={{ 'aria-describedby': previewId, spellCheck: false }}
        />
      </div>

      <div className="markdown-field__pane">
        <Text variant="subheader-2" id={previewId}>
          Предпросмотр
        </Text>
        <div className="markdown-field__preview" aria-live="polite" aria-labelledby={previewId}>
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <Text color="secondary">Здесь появится отформатированный текст</Text>
          )}
        </div>
      </div>
    </div>
  );
}
