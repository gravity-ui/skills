import {useCallback, useEffect, useState} from 'react';
import {Button, Text, TextInput} from '@gravity-ui/uikit';
import {MarkdownEditorView, useMarkdownEditor} from '@gravity-ui/markdown-editor';
import type {MarkdownEditorMode} from '@gravity-ui/markdown-editor';
import './App.css';

const storageKey = 'markdown-note';
type Note = {title: string; text: string};

function readNote(): Note {
  try {
    const note: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (note && typeof note === 'object' && 'title' in note && 'text' in note &&
      typeof note.title === 'string' && typeof note.text === 'string') return note as Note;
  } catch { /* Editing remains available when browser storage is unavailable. */ }
  return {title: '', text: ''};
}

export function App() {
  const [initialNote] = useState(readNote);
  const [title, setTitle] = useState(initialNote.title);
  const [text, setText] = useState(initialNote.text);
  const [mode, setMode] = useState<MarkdownEditorMode>('wysiwyg');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const editor = useMarkdownEditor({
    preset: 'commonmark',
    md: {html: false},
    initial: {markup: initialNote.text, mode: 'wysiwyg'},
    wysiwygConfig: {placeholderOptions: {value: 'Начните писать…'}},
    markupConfig: {placeholder: 'Введите текст с Markdown-разметкой…'},
  });

  const save = useCallback(() => {
    if (editor.isEmpty()) {
      setError('Добавьте текст заметки перед сохранением.');
      setMessage('');
      editor.focus();
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify({title, text: editor.getValue()}));
      setError('');
      setMessage('Заметка сохранена в этом браузере.');
    } catch {
      setError('Не удалось сохранить заметку. Проверьте доступ к хранилищу браузера.');
      setMessage('');
    }
  }, [editor, title]);

  useEffect(() => {
    const change = () => {setText(editor.getValue()); setMessage(''); setError('');};
    const changeMode = ({mode: nextMode}: {mode: MarkdownEditorMode}) => setMode(nextMode);
    editor.on('change', change);
    editor.on('change-editor-mode', changeMode);
    editor.on('submit', save);
    return () => {
      editor.off('change', change);
      editor.off('change-editor-mode', changeMode);
      editor.off('submit', save);
    };
  }, [editor, save]);

  return (
    <main className="note-page">
      <div className="page-intro">
        <Text variant="caption-2" color="secondary" className="eyebrow">ЛИЧНЫЕ ЗАМЕТКИ</Text>
        <Text as="h1" variant="header-2">Место для ваших мыслей</Text>
        <Text as="p" variant="body-2" color="secondary">Записывайте идеи и придавайте им форму с помощью Markdown.</Text>
      </div>
      <form className="note-form" onSubmit={(event) => {event.preventDefault(); save();}}>
        <div className="form-heading">
          <Text as="h2" variant="subheader-3">Заметка</Text>
          <Text variant="caption-2" color="secondary">Markdown</Text>
        </div>
        <div className="field">
          <Text as="label" htmlFor="note-title" variant="body-2">Название <Text color="secondary">· необязательно</Text></Text>
          <TextInput id="note-title" name="title" size="l" placeholder="О чём эта заметка?" value={title}
            onUpdate={(value) => {setTitle(value); setMessage('');}} />
        </div>
        <div className="field">
          <div className="editor-heading">
            <Text id="text-label" variant="body-2">Текст заметки</Text>
            <div className="mode-switch" role="group" aria-label="Режим редактирования">
              <Button size="s" view={mode === 'wysiwyg' ? 'normal' : 'flat'} selected={mode === 'wysiwyg'}
                type="button" onClick={() => editor.setEditorMode('wysiwyg')}>Визуальный</Button>
              <Button size="s" view={mode === 'markup' ? 'normal' : 'flat'} selected={mode === 'markup'}
                type="button" onClick={() => editor.setEditorMode('markup')}>Markdown</Button>
            </div>
          </div>
          <div className={`editor-frame${error ? ' editor-frame_error' : ''}`} role="group" aria-labelledby="text-label" aria-describedby="editor-hint">
            <MarkdownEditorView editor={editor} stickyToolbar={false} settingsVisible={false} />
          </div>
          <div className="editor-footer">
            <Text id="editor-hint" variant="caption-2" color="secondary">
              {mode === 'wysiwyg' ? 'Форматирование появляется прямо при вводе.' : 'Исходный Markdown. Визуальный режим показывает форматирование.'}
            </Text>
            <Text variant="caption-2" color="secondary" className="character-count">{text.length.toLocaleString('ru-RU')} симв.</Text>
          </div>
        </div>
        <div className="markdown-help">
          <Text variant="body-1" color="secondary">Попробуйте Markdown</Text>
          <div className="syntax-examples">
            <span><code>**текст**</code> жирный</span>
            <span><code>*текст*</code> курсив</span>
            <span><code># Заголовок</code></span>
            <span><code>- Пункт списка</code></span>
          </div>
        </div>
        <div className="form-actions">
          <Button type="submit" view="action" size="l">Сохранить заметку</Button>
          <Text variant="caption-2" color="secondary">Хранится только в этом браузере</Text>
        </div>
        {error && <Text as="p" color="danger" role="alert">{error}</Text>}
        <div role="status" aria-live="polite">{message && <Text color="positive">{message}</Text>}</div>
      </form>
    </main>
  );
}
