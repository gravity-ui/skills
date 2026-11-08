import {useCallback, useMemo, useState} from 'react';
import {Button, Text, TextInput} from '@gravity-ui/uikit';
import {
  MarkdownEditorView,
  YfmStaticView,
  useMarkdownEditor,
  type RenderPreview,
} from '@gravity-ui/markdown-editor';
import transform from '@diplodoc/transform';
import './App.css';

const initialMarkup = `## Новая заметка\n\nНапишите текст с **Markdown-разметкой** — форматирование появится сразу.\n\n- списки\n- [ссылки](https://gravity-ui.com)\n\n\`\`\`ts\nconst ready = true;\n\`\`\``;

function MarkdownPreview({getValue}: {getValue: () => string}) {
  const markup = getValue();
  const html = useMemo(
    () => transform(markup, {allowHTML: false}).result.html,
    [markup],
  );

  return (
    <div className="markdown-preview">
      <YfmStaticView html={html} mods={{'no-list-reset': true}} />
    </div>
  );
}

export function App() {
  const [title, setTitle] = useState('Идеи для проекта');
  const [saved, setSaved] = useState(false);

  const renderPreview = useCallback<RenderPreview>(
    ({getValue}) => <MarkdownPreview getValue={getValue} />,
    [],
  );

  const editor = useMarkdownEditor({
    md: {html: false},
    initial: {markup: initialMarkup, mode: 'markup', splitModeEnabled: true},
    markupConfig: {
      renderPreview,
      splitMode: 'horizontal',
      placeholder: 'Введите текст с Markdown-разметкой…',
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <main className="page-shell">
      <form className="note-form" onSubmit={handleSubmit}>
        <header className="form-heading">
          <div>
            <Text variant="display-2" as="h1" className="page-title">
              Создать заметку
            </Text>
            <Text variant="body-2" color="secondary">
              Пишите в Markdown и сразу проверяйте результат
            </Text>
          </div>
          <span className="markdown-badge">MARKDOWN</span>
        </header>

        <label className="field-label" htmlFor="note-title">
          Название
        </label>
        <TextInput
          id="note-title"
          size="l"
          value={title}
          onUpdate={setTitle}
          placeholder="Например, идеи для проекта"
        />

        <div className="editor-label-row">
          <label className="field-label" htmlFor="note-content">
            Содержание
          </label>
          <Text variant="caption-2" color="secondary">
            Markdown · предпросмотр обновляется автоматически
          </Text>
        </div>
        <div className="editor-frame" id="note-content">
          <MarkdownEditorView editor={editor} stickyToolbar />
        </div>

        <footer className="form-footer">
          <Text variant="caption-2" color="secondary">
            Поддерживаются заголовки, списки, ссылки и блоки кода
          </Text>
          <Button type="submit" view="action" size="l">
            {saved ? 'Сохранено' : 'Сохранить заметку'}
          </Button>
        </footer>
      </form>
    </main>
  );
}
