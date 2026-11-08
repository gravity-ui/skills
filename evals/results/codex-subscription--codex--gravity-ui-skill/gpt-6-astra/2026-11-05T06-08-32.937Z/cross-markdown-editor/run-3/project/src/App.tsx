import {useEffect, useState} from 'react';
import {Button, Label, Text, TextInput} from '@gravity-ui/uikit';
import {MarkdownEditorView, useMarkdownEditor, type RenderPreview} from '@gravity-ui/markdown-editor';
import {YfmStaticView} from '@gravity-ui/markdown-editor/view';
import MarkdownIt from 'markdown-it';
import './App.css';

const storageKey = 'markdown-form-draft';
const example = `## Делитесь идеями — красиво

Хороший текст начинается с простой мысли. Используйте **жирный текст**, *курсив* и списки, чтобы выделить главное.

### Что можно добавить

- Описание вашей идеи
- Полезные ссылки и примеры
- Следующие шаги

> Всё, что вы пишете, сразу приобретает форму.

Попробуйте изменить этот текст или начните с чистого листа.`;

function readDraft(): {title: string; markdown: string} {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (typeof value?.title === 'string' && typeof value?.markdown === 'string') return value;
  } catch { /* An unavailable or invalid local draft should not prevent editing. */ }
  return {title: '', markdown: ''};
}

// Match the editor's CommonMark parser and disable raw HTML in the preview.
const markdownParser = new MarkdownIt({html: false, linkify: true});
const renderPreview: RenderPreview = ({getValue}) => {
  const value = getValue();
  return <section className="preview" aria-label="Предпросмотр текста">
    <Text className="preview-caption" variant="caption-2" color="secondary">ПРЕДПРОСМОТР</Text>
    {value.trim()
      ? <YfmStaticView html={markdownParser.render(value)} mods={{'no-list-reset': true}} />
      : <Text as="p" color="hint">Здесь появится ваш отформатированный текст.</Text>}
  </section>;
};

export function App() {
  const [initial] = useState(readDraft);
  const [title, setTitle] = useState(initial.title);
  const [markdown, setMarkdown] = useState(initial.markdown);
  const [mode, setMode] = useState<'markup' | 'wysiwyg'>('markup');
  const [status, setStatus] = useState('');
  const [failed, setFailed] = useState(false);
  const editor = useMarkdownEditor({
    preset: 'commonmark', md: {html: false, linkify: true},
    initial: {markup: initial.markdown, mode: 'markup', splitModeEnabled: true},
    markupConfig: {renderPreview, splitMode: 'horizontal', placeholder: 'Начните писать… Например: **важная мысль**'},
    wysiwygConfig: {placeholderOptions: {value: 'Начните писать… Используйте Markdown или панель форматирования.'}},
  });
  useEffect(() => {
    const onChange = () => {setMarkdown(editor.getValue()); setStatus('');};
    const onModeChange = ({mode: next}: {mode: 'markup' | 'wysiwyg'}) => setMode(next);
    editor.on('change', onChange);
    editor.on('change-editor-mode', onModeChange);
    return () => {editor.off('change', onChange); editor.off('change-editor-mode', onModeChange);};
  }, [editor]);
  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({title, markdown: editor.getValue()}));
      setFailed(false); setStatus('Черновик сохранён в этом браузере');
    } catch {
      setFailed(true); setStatus('Не удалось сохранить черновик. Проверьте доступ к хранилищу браузера.');
    }
  };
  useEffect(() => {editor.on('submit', save); return () => editor.off('submit', save);}, [editor, title]);

  return <div className="app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">м.</span><Text variant="subheader-3">Заметки</Text></div>
      <Text className="brand-description" variant="body-1" color="secondary">Пространство для ваших мыслей</Text>
      <Label className="personal-label" theme="normal" size="s">Личный черновик</Label>
    </header>
    <main className="main">
      <div className="breadcrumb"><Text color="secondary">Мои заметки</Text><span>/</span><Text>Новая заметка</Text></div>
      <div className="page-heading">
        <div><Text as="h1" variant="display-1">От мысли к тексту</Text><Text as="p" variant="body-2" color="secondary">Запишите главное. А форматирование уже под рукой.</Text></div>
        <span className="page-number">01 / НОВАЯ ЗАМЕТКА</span>
      </div>
      <form className="note-form" onSubmit={(event) => {event.preventDefault(); save();}}>
        <div className="form-heading"><div><Text as="h2" variant="header-1">Новая заметка</Text><Text color="secondary">Ваши идеи, в удобной форме</Text></div><Label theme="warning">Черновик</Label></div>
        <div className="title-field">
          <Text as="label" htmlFor="note-title" variant="subheader-1">Название <Text color="hint" variant="body-1">· необязательно</Text></Text>
          <TextInput id="note-title" size="xl" placeholder="О чём будет ваша заметка?" value={title} onUpdate={(value) => {setTitle(value); setStatus('');}} />
        </div>
        <div className="content-heading"><div><Text as="h3" id="content-label" variant="subheader-1">Содержание</Text><Text color="secondary">Пишите с Markdown и сразу смотрите результат</Text></div><Label theme="clear">Markdown</Label></div>
        <div className="editor-shell" role="group" aria-labelledby="content-label">
          <div className="editor-tabs"><div className="mode-buttons">
            <Button type="button" view={mode === 'markup' ? 'normal' : 'flat'} selected={mode === 'markup'} onClick={() => editor.setEditorMode('markup')}>Markdown + предпросмотр</Button>
            <Button type="button" view={mode === 'wysiwyg' ? 'normal' : 'flat'} selected={mode === 'wysiwyg'} onClick={() => editor.setEditorMode('wysiwyg')}>Визуальный</Button>
          </div><span className="live-status"><span />В реальном времени</span></div>
          <div className="editor-body"><MarkdownEditorView editor={editor} stickyToolbar={false} settingsVisible={false} /></div>
          <div className="editor-footer"><Text variant="caption-2" color="secondary">Markdown поддерживается</Text><Text variant="caption-2" color="secondary">Символов: {markdown.length.toLocaleString('ru-RU')}</Text></div>
        </div>
        <div className="form-actions"><div aria-live="polite"><Text color={failed ? 'danger' : 'secondary'}>{status || 'Черновик будет сохранён только в этом браузере'}</Text></div><Button type="submit" view="action" size="l">Сохранить черновик</Button></div>
      </form>
      <section className="help-card" aria-label="Подсказки Markdown">
        <div className="help-heading"><Text variant="subheader-2">Маленькие знаки. Большие возможности.</Text><Text color="secondary">Несколько приёмов, чтобы текст читался легче</Text></div>
        <div className="syntax-examples"><div><code>**текст**</code><strong>Жирный</strong></div><div><code>*текст*</code><em>Курсив</em></div><div><code>## Заголовок</code><span>Заголовок</span></div><div><code>- пункт</code><span>Маркированный список</span></div><div><code>[текст](ссылка)</code><span>Ссылка</span></div></div>
        <div className="example-action"><Text color="secondary">Хотите попробовать?</Text><Button type="button" view="flat" size="s" disabled={Boolean(markdown.trim())} onClick={() => {editor.replace(example); setMarkdown(example); setStatus('');}}>Вставить пример ↗</Button><Text variant="caption-1" color="hint">Доступно для пустого поля</Text></div>
      </section>
      <footer className="page-footer"><Text color="hint" variant="caption-2">Место, где мысли становятся словами.</Text><Text color="hint" variant="caption-2">Сделано с Gravity UI</Text></footer>
    </main>
  </div>;
}
