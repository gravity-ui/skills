import { useDeferredValue, useId } from 'react';
import { TextArea } from '@gravity-ui/uikit';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import './MarkdownField.css';

export interface MarkdownFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}

/**
 * Поле для текста в Markdown: слева редактор, справа живой предпросмотр.
 * ReactMarkdown не использует dangerouslySetInnerHTML и по умолчанию не
 * пропускает сырой HTML, а небезопасные ссылки (javascript: и т.п.) вырезаются.
 */
export function MarkdownField({
  label,
  value,
  onChange,
  placeholder,
  minRows = 10,
}: MarkdownFieldProps) {
  const id = useId();
  // Предпросмотр может отставать на один кадр при быстром наборе — ввод при этом не тормозит.
  const deferredValue = useDeferredValue(value);
  const isPreviewEmpty = deferredValue.trim() === '';

  return (
    <div className="md-field">
      <div className="md-field__pane">
        <label className="md-field__label" htmlFor={id}>
          {label}
        </label>
        <TextArea
          id={id}
          value={value}
          onUpdate={onChange}
          placeholder={placeholder}
          minRows={minRows}
          size="l"
        />
      </div>

      <div className="md-field__pane">
        <span className="md-field__label">Предпросмотр</span>
        <div className="md-preview" aria-live="polite">
          {isPreviewEmpty ? (
            <p className="md-preview__empty">Здесь появится отформатированный текст</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{deferredValue}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
