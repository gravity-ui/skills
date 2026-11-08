import React from 'react';
import { Text, TextArea } from '@gravity-ui/uikit';

import { renderMarkdown } from './markdown';
import './markdown.css';

export interface MarkdownFieldProps {
  label?: string;
  value: string;
  onUpdate: (value: string) => void;
  placeholder?: string;
  name?: string;
  minRows?: number;
}

/** Поле ввода markdown: слева редактор, справа живое превью. */
export function MarkdownField({
  label,
  value,
  onUpdate,
  placeholder,
  name,
  minRows = 10,
}: MarkdownFieldProps) {
  const id = React.useId();
  const preview = React.useMemo(() => renderMarkdown(value), [value]);

  return (
    <div className="md-field">
      {label && (
        <label htmlFor={id} className="md-field__label">
          <Text variant="subheader-2">{label}</Text>
        </label>
      )}
      <div className="md-field__panes">
        <div className="md-field__pane">
          <Text variant="caption-2" color="secondary" className="md-field__caption">
            Markdown
          </Text>
          <TextArea
            id={id}
            name={name}
            value={value}
            onUpdate={onUpdate}
            placeholder={placeholder}
            minRows={minRows}
            maxRows={24}
            size="l"
          />
        </div>
        <div className="md-field__pane">
          <Text variant="caption-2" color="secondary" className="md-field__caption">
            Предпросмотр
          </Text>
          <div className="md-preview" aria-live="polite" data-testid="markdown-preview">
            {value.trim() ? (
              preview
            ) : (
              <Text color="secondary">Здесь появится отформатированный текст</Text>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
