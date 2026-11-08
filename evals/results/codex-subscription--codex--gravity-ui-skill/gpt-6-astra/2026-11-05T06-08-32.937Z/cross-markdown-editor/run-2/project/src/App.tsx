import {useEffect, useState, type FormEvent} from 'react';
import {Button, Text, TextInput} from '@gravity-ui/uikit';
import {MarkdownEditorView, useMarkdownEditor, type MarkdownEditorMode} from '@gravity-ui/markdown-editor';
import './App.css';

const STORAGE_KEY = 'markdown-document-draft';
function readDraft(): {title: string; markdown: string} {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (typeof draft?.title === 'string' && typeof draft?.markdown === 'string') return draft;
  } catch { /* The form remains usable when storage is unavailable. */ }
  return {title: '', markdown: ''};
}

export function App() {
  const [draft] = useState(readDraft);
  const [title, setTitle] = useState(draft.title);
  const [markdown, setMarkdown] = useState(draft.markdown);
  const [mode, setMode] = useState<MarkdownEditorMode>('wysiwyg');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const editor = useMarkdownEditor({
    preset: 'commonmark',
    md: {html: false},
    initial: {markup: draft.markdown, mode: 'wysiwyg'},
    wysiwygConfig: {placeholderOptions: {value: 'Начните писать здесь…'}},
    markupConfig: {placeholder: 'Введите текст с Markdown-разметкой…'},
  });

  useEffect(() => {
    const handleChange = () => {
      setMarkdown(editor.getValue());
      setStatus('');
      setError('');
    };
    const handleModeChange = () => setMode(editor.currentMode);
    editor.on('change', handleChange);
    editor.on('change-editor-mode', handleModeChange);
    return () => {
      editor.off('change', handleChange);
      editor.off('change-editor-mode', handleModeChange);
    };
  }, [editor]);

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = editor.getValue();
    if (!value.trim()) {
      setError('Добавьте текст документа перед сохранением.');
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({title, markdown: value}));
      setError('');
      setStatus('Черновик сохранён в этом браузере');
    } catch {
      setError('Не удалось сохранить черновик. Проверьте доступ к хранилищу браузера.');
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="brand"><span className="brand-mark" aria-hidden="true">м.</span><Text variant="subheader-2">Заметки</Text></div>
        <Text variant="body-1" color="secondary">Место для ваших идей</Text>
      </header>
      <main className="workspace">
        <div className="page-heading">
          <Text as="div" variant="body-1" color="secondary">Личное пространство / Документы</Text>
          <Text as="h1" variant="display-2">Новый документ</Text>
          <Text as="p" variant="body-2" color="secondary">Запишите мысль. Добавьте детали. Придайте тексту форму.</Text>
        </div>
        <form className="document-form" onSubmit={saveDraft}>
          <div className="title-field">
            <Text as="label" htmlFor="document-title" variant="subheader-1">Название</Text>
            <TextInput id="document-title" name="title" size="xl" placeholder="Например, идеи для нового проекта" value={title} onUpdate={(value) => {setTitle(value); setStatus('');}} />
          </div>
          <div className="content-field">
            <div className="content-heading">
              <Text as="h2" id="content-label" variant="subheader-1">Текст документа</Text>
              <span className="live-indicator"><span aria-hidden="true" />Форматирование при вводе</span>
            </div>
            <div className="editor-shell" role="group" aria-labelledby="content-label" aria-describedby="editor-help">
              <div className="editor-mode-bar">
                <div className="mode-buttons" role="group" aria-label="Режим редактора">
                  <Button type="button" view={mode === 'wysiwyg' ? 'normal' : 'flat'} selected={mode === 'wysiwyg'} aria-pressed={mode === 'wysiwyg'} onClick={() => editor.setEditorMode('wysiwyg')}>Визуальный</Button>
                  <Button type="button" view={mode === 'markup' ? 'normal' : 'flat'} selected={mode === 'markup'} aria-pressed={mode === 'markup'} onClick={() => editor.setEditorMode('markup')}>Markdown</Button>
                </div>
                <Text variant="caption-2" color="secondary">{mode === 'wysiwyg' ? 'Сразу виден результат' : 'Исходная разметка'}</Text>
              </div>
              <div className="editor-body"><MarkdownEditorView editor={editor} stickyToolbar={false} settingsVisible={false} /></div>
              <div className="editor-footer">
                <Text variant="caption-2" color="secondary">Markdown поддерживается</Text>
                <Text variant="caption-2" color="secondary">Символов: {markdown.length.toLocaleString('ru-RU')}</Text>
              </div>
            </div>
            <Text as="p" id="editor-help" variant="body-1" color="secondary" className="editor-help">В визуальном режиме Markdown превращается в форматированный текст прямо при вводе. Используйте панель инструментов или привычную разметку.</Text>
          </div>
          <div className="form-actions">
            <div className="save-note" role="status" aria-live="polite"><Text variant="body-1" color={error ? 'danger' : status ? 'positive' : 'secondary'}>{error || status || 'Черновик будет доступен только в этом браузере'}</Text></div>
            <Button type="submit" view="action" size="l">Сохранить черновик</Button>
          </div>
        </form>
        <section className="syntax-guide" aria-labelledby="syntax-heading">
          <Text as="h2" id="syntax-heading" variant="subheader-1">Markdown под рукой</Text>
          <div className="syntax-examples">
            <div><code># Заголовок</code><Text color="secondary">Заголовок раздела</Text></div>
            <div><code>**жирный**</code><Text color="secondary">Выделить главное</Text></div>
            <div><code>*курсив*</code><Text color="secondary">Добавить акцент</Text></div>
            <div><code>- пункт списка</code><Text color="secondary">Разложить по пунктам</Text></div>
          </div>
          <Text as="p" variant="caption-2" color="secondary">Для заголовка или списка введите символ и пробел в начале строки.</Text>
        </section>
      </main>
      <footer className="page-footer"><Text variant="caption-2" color="secondary">Ваши мысли, в хорошем формате.</Text></footer>
    </div>
  );
}
