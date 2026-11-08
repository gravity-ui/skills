import { useId } from 'react';
import { Flex, Text, TextArea } from '@gravity-ui/uikit';

import { MarkdownPreview } from './markdown/MarkdownPreview';

import './MarkdownField.css';

export interface MarkdownFieldProps {
  /** Подпись поля */
  label: string;
  value: string;
  onUpdate: (value: string) => void;
  /** Подсказка под подписью */
  hint?: string;
  placeholder?: string;
  errorMessage?: string;
  disabled?: boolean;
  /** Минимальное число строк редактора (и высота области предпросмотра) */
  minRows?: number;
  maxRows?: number;
  id?: string;
  name?: string;
}

/**
 * Поле формы с markdown-разметкой: слева текст, справа живой предпросмотр.
 * На узких экранах колонки встают друг под друга.
 */
export function MarkdownField({
  label,
  value,
  onUpdate,
  hint = 'Поддерживается Markdown: **жирный**, *курсив*, `код`, списки, ссылки, заголовки.',
  placeholder = 'Введите текст…',
  errorMessage,
  disabled,
  minRows = 8,
  maxRows = 24,
  id,
  name,
}: MarkdownFieldProps) {
  const autoId = useId();
  const controlId = id ?? `markdown-field-${autoId}`;
  const previewId = `${controlId}-preview`;
  const hintId = `${controlId}-hint`;
  const isEmpty = value.trim() === '';

  return (
    <div className="markdown-field">
      <label htmlFor={controlId} className="markdown-field__label">
        <Text variant="subheader-1">{label}</Text>
      </label>
      {hint && (
        <Text as="div" id={hintId} variant="caption-2" color="secondary" className="markdown-field__hint">
          {hint}
        </Text>
      )}

      <Flex gap={3} wrap className="markdown-field__columns">
        <div className="markdown-field__column">
          <Text as="div" variant="caption-2" color="secondary" className="markdown-field__column-title">
            Текст
          </Text>
          <TextArea
            id={controlId}
            name={name}
            value={value}
            onUpdate={onUpdate}
            placeholder={placeholder}
            disabled={disabled}
            minRows={minRows}
            maxRows={maxRows}
            errorMessage={errorMessage}
            validationState={errorMessage ? 'invalid' : undefined}
            controlProps={{
              spellCheck: true,
              'aria-describedby': hint ? hintId : undefined,
              'aria-controls': previewId,
            }}
          />
        </div>

        <div className="markdown-field__column">
          <Text as="div" variant="caption-2" color="secondary" className="markdown-field__column-title">
            Предпросмотр
          </Text>
          <div
            id={previewId}
            className="markdown-field__preview"
            style={{ minHeight: `calc(${minRows} * 18px + 2 * var(--g-spacing-2))` }}
            aria-live="polite"
            aria-label="Предпросмотр форматирования"
          >
            {isEmpty ? (
              <Text variant="body-1" color="hint">
                Здесь появится отформатированный текст
              </Text>
            ) : (
              <MarkdownPreview source={value} />
            )}
          </div>
        </div>
      </Flex>
    </div>
  );
}
