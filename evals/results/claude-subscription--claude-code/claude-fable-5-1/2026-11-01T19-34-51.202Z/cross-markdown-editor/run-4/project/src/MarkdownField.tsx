import React, { useId, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, SegmentedRadioGroup, Text, TextArea } from '@gravity-ui/uikit';

import './MarkdownField.css';

type ViewMode = 'split' | 'write' | 'preview';

export interface MarkdownFieldProps {
  /** Field label shown above the editor */
  label: string;
  /** Current markdown source (controlled) */
  value: string;
  /** Called with the new markdown source on every keystroke */
  onUpdate: (value: string) => void;
  /** Form `name` attribute of the underlying textarea */
  name?: string;
  placeholder?: string;
  /** Helper text under the label */
  hint?: React.ReactNode;
  errorMessage?: string;
  disabled?: boolean;
  minRows?: number;
  maxRows?: number;
}

/**
 * Form field for markdown text with a live preview.
 *
 * Preview is rendered with `react-markdown` (+ GFM: tables, task lists,
 * strikethrough, autolinks). Raw HTML in the source is NOT rendered,
 * so the preview is safe against script injection.
 */
export function MarkdownField({
  label,
  value,
  onUpdate,
  name,
  placeholder = 'Напишите текст с markdown-разметкой…',
  hint,
  errorMessage,
  disabled,
  minRows = 10,
  maxRows = 24,
}: MarkdownFieldProps) {
  const id = useId();
  const [mode, setMode] = useState<ViewMode>('split');

  const showEditor = mode !== 'preview';
  const showPreview = mode !== 'write';

  return (
    <div className="md-field">
      <div className="md-field__header">
        <div>
          <Text as="label" variant="subheader-1" htmlFor={id}>
            {label}
          </Text>
          {hint && (
            <Text as="div" variant="body-1" color="secondary" className="md-field__hint">
              {hint}
            </Text>
          )}
        </div>

        <SegmentedRadioGroup<ViewMode>
          size="s"
          value={mode}
          onUpdate={setMode}
          aria-label="Режим отображения"
        >
          <SegmentedRadioGroup.Option value="write">Редактор</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="split">Рядом</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="preview">Превью</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </div>

      <div className={`md-field__panes md-field__panes_mode_${mode}`}>
        {showEditor && (
          <div className="md-field__pane">
            <TextArea
              id={id}
              name={name}
              value={value}
              onUpdate={onUpdate}
              placeholder={placeholder}
              minRows={minRows}
              maxRows={maxRows}
              disabled={disabled}
              validationState={errorMessage ? 'invalid' : undefined}
              errorMessage={errorMessage}
              controlProps={{
                spellCheck: false,
                'aria-describedby': `${id}-preview`,
                className: 'md-field__textarea',
              }}
            />
          </div>
        )}

        {showPreview && (
          <div
            id={`${id}-preview`}
            className="md-field__pane md-field__preview"
            aria-live="polite"
            aria-label="Предпросмотр"
          >
            {value.trim() ? (
              <MarkdownPreview source={value} />
            ) : (
              <Text variant="body-1" color="hint">
                Здесь появится отформатированный текст
              </Text>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Renders markdown source into React elements using Gravity UI typography. */
export function MarkdownPreview({ source }: { source: string }) {
  return (
    <div className="md-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <Text as="h1" variant="header-2" className="md-preview__heading">
              {children}
            </Text>
          ),
          h2: ({ children }) => (
            <Text as="h2" variant="header-1" className="md-preview__heading">
              {children}
            </Text>
          ),
          h3: ({ children }) => (
            <Text as="h3" variant="subheader-3" className="md-preview__heading">
              {children}
            </Text>
          ),
          h4: ({ children }) => (
            <Text as="h4" variant="subheader-2" className="md-preview__heading">
              {children}
            </Text>
          ),
          h5: ({ children }) => (
            <Text as="h5" variant="subheader-1" className="md-preview__heading">
              {children}
            </Text>
          ),
          h6: ({ children }) => (
            <Text as="h6" variant="body-2" className="md-preview__heading">
              {children}
            </Text>
          ),
          p: ({ children }) => (
            <Text as="p" variant="body-1" className="md-preview__p">
              {children}
            </Text>
          ),
          a: ({ href, children }) => (
            <Link href={href ?? '#'} target="_blank" rel="noopener noreferrer">
              {children}
            </Link>
          ),
          code: ({ className, children }) => {
            // Block code has a `language-*` class (or is inside <pre>); inline code has none.
            const isBlock = /language-/.test(className ?? '');
            return (
              <code className={isBlock ? 'md-preview__code' : 'md-preview__code-inline'}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="md-preview__pre">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="md-preview__blockquote">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="md-preview__table-wrap">
              <table className="md-preview__table">{children}</table>
            </div>
          ),
          hr: () => <hr className="md-preview__hr" />,
          input: ({ checked }) => (
            <input type="checkbox" checked={Boolean(checked)} readOnly disabled className="md-preview__checkbox" />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
