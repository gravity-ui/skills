import { useId } from 'react';
import { TextArea, Text } from '@gravity-ui/uikit';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import './MarkdownField.css';

type MarkdownFieldProps = {
  label: string;
  name?: string;
  value: string;
  onUpdate: (value: string) => void;
  placeholder?: string;
};

/**
 * Текстовое поле с markdown-разметкой: слева ввод исходного текста,
 * справа предпросмотр, который обновляется на каждое изменение.
 *
 * Предпросмотр строится из React-элементов без `rehype-raw`, поэтому
 * сырой HTML во вводе выводится как текст и не выполняется.
 */
export function MarkdownField({ label, name, value, onUpdate, placeholder }: MarkdownFieldProps) {
  const id = useId();

  return (
    <div className="md-field">
      <label htmlFor={id}>
        <Text as="span" variant="subheader-2">
          {label}
        </Text>
      </label>

      <div className="md-field__panes">
        <TextArea
          id={id}
          name={name}
          value={value}
          onUpdate={onUpdate}
          placeholder={placeholder}
          size="l"
          view="normal"
          minRows={16}
          maxRows={32}
        />

        <section className="md-preview" aria-label="Предпросмотр">
          {value.trim() === '' ? (
            <Text as="span" color="secondary">
              Предпросмотр появится здесь
            </Text>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          )}
        </section>
      </div>
    </div>
  );
}
