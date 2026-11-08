import {useCallback, useEffect, useId, useState} from 'react';
import transform from '@diplodoc/transform';
import {
  MarkdownEditorView,
  YfmStaticView,
  useMarkdownEditor,
  type MarkupString,
  type RenderPreview,
  type RenderPreviewParams,
} from '@gravity-ui/markdown-editor';
import {Text} from '@gravity-ui/uikit';

import './MarkdownField.css';

type PreviewProps = Pick<RenderPreviewParams, 'getValue' | 'md'>;

/** Живой предпросмотр: markdown из редактора → HTML через @diplodoc/transform. */
function MarkdownPreview({getValue, md}: PreviewProps) {
  const [html, setHtml] = useState('');

  // Редактор перерисовывает предпросмотр при каждом изменении текста,
  // поэтому эффект без зависимостей: пересчёт с небольшим дебаунсом.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const {result} = transform(getValue(), {
        allowHTML: md.html,
        breaks: md.breaks,
        linkify: md.linkify,
        linkifyTlds: md.linkifyTlds,
        needToSanitizeHtml: true,
      });
      setHtml(result.html);
    }, 150);
    return () => window.clearTimeout(timer);
  });

  return (
    <YfmStaticView html={html} mods={{'no-list-reset': true}} className="markdown-field__preview" />
  );
}

export interface MarkdownFieldProps {
  label: string;
  /** Начальное значение в markdown. Поле неконтролируемое: читайте значение через onChange. */
  initialValue?: MarkupString;
  onChange?: (value: MarkupString) => void;
  placeholder?: string;
  note?: string;
  errorMessage?: string;
}

/**
 * Поле формы с markdown-разметкой и мгновенным отображением форматирования.
 * По умолчанию — режим разметки с живым предпросмотром справа (split view);
 * через меню настроек редактора можно переключиться в WYSIWYG.
 */
export function MarkdownField({
  label,
  initialValue = '',
  onChange,
  placeholder,
  note,
  errorMessage,
}: MarkdownFieldProps) {
  const labelId = useId();

  const renderPreview = useCallback<RenderPreview>(
    ({getValue, md}) => <MarkdownPreview getValue={getValue} md={md} />,
    [],
  );

  const editor = useMarkdownEditor({
    md: {html: false, linkify: true, breaks: true},
    initial: {
      markup: initialValue,
      mode: 'markup',
      toolbarVisible: true,
      splitModeEnabled: true,
    },
    markupConfig: {
      renderPreview,
      splitMode: 'horizontal',
      placeholder,
    },
  });

  useEffect(() => {
    if (!onChange) return undefined;
    const handler = () => onChange(editor.getValue());
    editor.on('change', handler);
    return () => {
      editor.off('change', handler);
    };
  }, [editor, onChange]);

  const invalid = Boolean(errorMessage);

  return (
    <div
      className={invalid ? 'markdown-field markdown-field_invalid' : 'markdown-field'}
      role="group"
      aria-labelledby={labelId}
    >
      <Text id={labelId} variant="subheader-1">
        {label}
      </Text>
      <div className="markdown-field__editor">
        <MarkdownEditorView editor={editor} stickyToolbar={false} />
      </div>
      {invalid ? (
        <Text variant="body-1" color="danger">
          {errorMessage}
        </Text>
      ) : note ? (
        <Text variant="body-1" color="secondary">
          {note}
        </Text>
      ) : null}
    </div>
  );
}
