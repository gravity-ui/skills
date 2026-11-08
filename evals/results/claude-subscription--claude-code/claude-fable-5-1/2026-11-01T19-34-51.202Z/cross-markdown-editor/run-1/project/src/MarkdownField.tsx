import { useId } from 'react';
import type { ReactNode } from 'react';
import { Card, Flex, Text, TextArea } from '@gravity-ui/uikit';

import { MarkdownPreview } from './markdown';

import './MarkdownField.css';

export interface MarkdownFieldProps {
  /** Подпись поля */
  label: ReactNode;
  /** Текущее значение (markdown) */
  value: string;
  /** Вызывается при каждом изменении текста */
  onUpdate: (value: string) => void;
  /** Атрибут name для отправки формы */
  name?: string;
  placeholder?: string;
  /** Подсказка под полем */
  note?: ReactNode;
  /** Текст ошибки валидации */
  errorMessage?: ReactNode;
  /** Ограничение длины: при превышении показывается ошибка */
  maxLength?: number;
  disabled?: boolean;
  minRows?: number;
  maxRows?: number;
}

/**
 * Поле формы для текста с markdown-разметкой: слева редактор,
 * справа (на узких экранах — снизу) живой предпросмотр форматирования.
 */
export function MarkdownField({
  label,
  value,
  onUpdate,
  name,
  placeholder = 'Поддерживается markdown: **жирный**, _курсив_, `код`, списки, ссылки…',
  note,
  errorMessage,
  maxLength,
  disabled,
  minRows = 10,
  maxRows = 24,
}: MarkdownFieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const previewId = `${id}-preview`;

  const tooLong = maxLength !== undefined && value.length > maxLength;
  const error = errorMessage ?? (tooLong ? `Максимум ${maxLength} символов` : undefined);

  const counter =
    maxLength !== undefined ? (
      <Text variant="caption-2" color={tooLong ? 'danger' : 'secondary'}>
        {value.length} / {maxLength}
      </Text>
    ) : null;

  return (
    <div className="md-field" role="group" aria-labelledby={labelId}>
      <Text as="label" id={labelId} htmlFor={id} variant="subheader-1" className="md-field__label">
        {label}
      </Text>

      <div className="md-field__panes">
        <Flex direction="column" gap={1} className="md-field__pane">
          <Text variant="caption-2" color="secondary">
            Markdown
          </Text>
          <TextArea
            id={id}
            name={name}
            value={value}
            onUpdate={onUpdate}
            placeholder={placeholder}
            disabled={disabled}
            minRows={minRows}
            maxRows={maxRows}
            size="l"
            hasClear
            validationState={error ? 'invalid' : undefined}
            errorMessage={error}
            errorPlacement="outside"
            note={counter ?? undefined}
            controlProps={{
              spellCheck: true,
              'aria-describedby': previewId,
              className: 'md-field__textarea',
            }}
          />
          {note ? (
            <Text variant="caption-2" color="secondary">
              {note}
            </Text>
          ) : null}
        </Flex>

        <Flex direction="column" gap={1} className="md-field__pane">
          <Text variant="caption-2" color="secondary">
            Предпросмотр
          </Text>
          <Card view="filled" type="container" className="md-field__preview" id={previewId} aria-live="polite">
            <MarkdownPreview source={value} />
          </Card>
        </Flex>
      </div>
    </div>
  );
}
