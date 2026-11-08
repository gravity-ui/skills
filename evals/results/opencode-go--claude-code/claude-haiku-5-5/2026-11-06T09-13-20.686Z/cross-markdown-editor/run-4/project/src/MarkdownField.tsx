import { useDeferredValue, useId, useMemo } from 'react';
import { Text, TextArea } from '@gravity-ui/uikit';

import { renderMarkdown } from './markdown';
import './MarkdownField.css';

export type MarkdownFieldProps = {
  label: string;
  value: string;
  onUpdate: (value: string) => void;
  placeholder?: string;
  name?: string;
  minRows?: number;
};

/**
 * Поле для текста с markdown-разметкой: слева редактор, справа предпросмотр,
 * который обновляется при каждом изменении текста.
 */
export function MarkdownField({
  label,
  value,
  onUpdate,
  placeholder,
  name,
  minRows = 12,
}: MarkdownFieldProps) {
  const id = useId();
  // Отложенное значение не даёт предпросмотру тормозить набор текста на больших документах.
  const deferredValue = useDeferredValue(value);
  const html = useMemo(() => renderMarkdown(deferredValue), [deferredValue]);

  return (
    <div className="md-field">
      <Text as="label" htmlFor={id} variant="subheader-1" className="md-field__label">
        {label}
      </Text>
      <div className="md-field__panes">
        <TextArea
          id={id}
          name={name}
          value={value}
          onUpdate={onUpdate}
          placeholder={placeholder}
          minRows={minRows}
          controlProps={{ spellCheck: false }}
        />
        <div className="md-field__preview" aria-label="Предпросмотр">
          {value.trim() ? (
            <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <Text color="secondary">Предпросмотр появится здесь</Text>
          )}
        </div>
      </div>
    </div>
  );
}
