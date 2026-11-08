import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import { Text, TextArea } from '@gravity-ui/uikit';

import './MarkdownField.css';

// html: false — raw HTML in the source is escaped, never injected into the preview.
// linkify: true — bare URLs become links. markdown-it's default validateLink
// rejects unsafe schemes such as javascript:.
// breaks: true — a single newline becomes <br>, so the preview matches what the user typed.
const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

const defaultLinkOpen = md.renderer.rules.link_open;
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank');
  tokens[idx].attrSet('rel', 'noopener noreferrer');
  return defaultLinkOpen
    ? defaultLinkOpen(tokens, idx, options, env, self)
    : self.renderToken(tokens, idx, options);
};

export type MarkdownFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
};

/**
 * Markdown input with a live preview: the left pane is the source,
 * the right pane is the formatted result, updated on every keystroke.
 * Panes stack vertically on narrow screens.
 */
export function MarkdownField({
  label,
  value,
  onChange,
  placeholder,
  minRows = 8,
}: MarkdownFieldProps) {
  const html = useMemo(() => md.render(value), [value]);

  return (
    <div className="md-field">
      <Text variant="subheader-1">{label}</Text>
      <div className="md-field__panes">
        <TextArea
          value={value}
          onUpdate={onChange}
          placeholder={placeholder}
          minRows={minRows}
          controlProps={{ 'aria-label': label, spellCheck: true }}
        />
        <div className="md-field__preview" role="region" aria-label={`${label}: предпросмотр`}>
          {value.trim() ? (
            <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <span className="md-field__hint">Здесь появится отформатированный текст</span>
          )}
        </div>
      </div>
    </div>
  );
}
