import { useId, useState } from 'react';
import { Card, SegmentedRadioGroup, Text, TextArea } from '@gravity-ui/uikit';

import { MarkdownPreview } from './MarkdownPreview';
import './MarkdownField.css';

export type MarkdownViewMode = 'edit' | 'split' | 'preview';

export interface MarkdownFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  placeholder?: string;
  /** Максимальная длина текста. При превышении счётчик подсвечивается, поле считается невалидным */
  maxLength?: number;
  /** Текст ошибки валидации, показывается под полем */
  error?: string;
  minRows?: number;
  maxRows?: number;
  defaultMode?: MarkdownViewMode;
  disabled?: boolean;
}

const MODE_OPTIONS: { value: MarkdownViewMode; content: string }[] = [
  { value: 'edit', content: 'Редактор' },
  { value: 'split', content: 'Разделить' },
  { value: 'preview', content: 'Предпросмотр' },
];

export function MarkdownField({
  label,
  value,
  onChange,
  name,
  placeholder = 'Напишите текст. Поддерживается Markdown: **жирный**, *курсив*, `код`, списки, ссылки…',
  maxLength,
  error,
  minRows = 8,
  maxRows = 20,
  defaultMode = 'split',
  disabled,
}: MarkdownFieldProps) {
  const [mode, setMode] = useState<MarkdownViewMode>(defaultMode);
  const inputId = useId();

  const tooLong = maxLength !== undefined && value.length > maxLength;
  const invalid = Boolean(error) || tooLong;
  const showEditor = mode !== 'preview';
  const showPreview = mode !== 'edit';

  return (
    <div className="md-field">
      <div className="md-field__header">
        <Text as="label" variant="subheader-1" {...{ htmlFor: inputId }}>
          {label}
        </Text>
        <SegmentedRadioGroup<MarkdownViewMode>
          size="s"
          value={mode}
          onUpdate={setMode}
          options={MODE_OPTIONS}
          aria-label="Режим отображения"
        />
      </div>

      <div className={`md-field__body md-field__body_mode_${mode}`}>
        {showEditor && (
          <TextArea
            id={inputId}
            name={name}
            className="md-field__editor"
            value={value}
            onUpdate={onChange}
            placeholder={placeholder}
            minRows={minRows}
            maxRows={maxRows}
            disabled={disabled}
            validationState={invalid ? 'invalid' : undefined}
            controlProps={{ spellCheck: true, 'aria-describedby': `${inputId}-hint` }}
          />
        )}
        {showPreview && (
          <Card view="outlined" className="md-field__preview" aria-live="polite">
            <MarkdownPreview source={value} />
          </Card>
        )}
      </div>

      <div className={`md-field__footer${invalid ? ' md-field__footer_invalid' : ''}`} id={`${inputId}-hint`}>
        <Text variant="caption-2" color={error ? 'danger' : 'secondary'}>
          {error ?? 'Форматирование применяется сразу, по мере ввода'}
        </Text>
        {maxLength !== undefined && (
          <Text variant="caption-2" color="secondary" className="md-field__counter">
            {value.length} / {maxLength}
          </Text>
        )}
      </div>
    </div>
  );
}
