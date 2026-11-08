import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Button, Checkbox, Icon, Modal, SegmentedRadioGroup, Select, Text, TextInput,
} from '@gravity-ui/uikit';
import {
  ArrowsExpand, ArrowRight, BookOpen, Check, ChevronRight, CircleCheck,
  CircleInfo, CloudCheck, Code, Eye, FileText, LayoutColumns, Pencil, Xmark,
} from '@gravity-ui/icons';
import {
  MarkdownEditorView, useMarkdownEditor, YfmStaticView,
} from '@gravity-ui/markdown-editor';
import {commonmark} from '@gravity-ui/markdown-editor/toolbars';
import {EditorView, lineNumbers} from '@codemirror/view';
import MarkdownIt from 'markdown-it';
import './styles.css';

const EXAMPLE = `## Всё начинается с идеи

У каждой хорошей истории есть начало.
Пусть эта заметка станет вашим.

### Немного вдохновения

Соберите мысли, которые хочется сохранить:

- **Идеи**, которые не дают уснуть
- *Наблюдения* за повседневным
- Планы на что-то прекрасное

> Не ждите идеального момента.
> Создайте его сами.

Больше возможностей — в [справке по Markdown](https://www.markdownguide.org/basic-syntax/).
`;
const STORAGE_KEY = 'slovo-note-draft-v1';
type Draft = {title: string; category: string[]; markdown: string; favorite: boolean};
const freshDraft: Draft = {title: 'Место для ваших идей', category: ['personal'], markdown: EXAMPLE, favorite: false};
function loadDraft(): Draft {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (value && typeof value.title === 'string' && typeof value.markdown === 'string' && Array.isArray(value.category) && value.category.every((item: unknown) => typeof item === 'string')) {
      return {...freshDraft, ...value};
    }
  } catch { /* A fresh draft remains available when browser storage is unavailable. */ }
  return freshDraft;
}
const parser = new MarkdownIt({html: false, linkify: true, breaks: true});
const categories = [{value: 'personal', content: 'Личное'}, {value: 'work', content: 'Работа'}, {value: 'ideas', content: 'Идеи'}, {value: 'study', content: 'Обучение'}];
const hints = [
  ['# Заголовок', 'Заголовок'], ['**жирный**', 'Жирный текст'], ['*курсив*', 'Курсив'],
  ['- Элемент', 'Список'], ['[текст](ссылка)', 'Ссылка'], ['> Цитата', 'Цитата'],
];

export function App() {
  const [initial] = useState(loadDraft);
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState(initial.category);
  const [markdown, setMarkdown] = useState(initial.markdown);
  const [favorite, setFavorite] = useState(initial.favorite);
  const [mode, setMode] = useState('markup');
  const [view, setView] = useState('split');
  const [expanded, setExpanded] = useState(false);
  const [dialog, setDialog] = useState<'help' | 'discard' | 'saved' | null>(null);
  const [saveStatus, setSaveStatus] = useState('Все изменения сохранены');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const editor = useMarkdownEditor({
    preset: 'commonmark',
    md: {html: false, breaks: true, linkify: true},
    initial: {mode: 'markup', markup: initial.markdown, toolbarVisible: true},
    markupConfig: {
      placeholder: 'Начните писать… Markdown превратит ваши мысли в красивый текст.',
      extensions: [lineNumbers(), EditorView.contentAttributes.of({'aria-label': 'Содержание заметки в Markdown'}), EditorView.theme({
        '&': {fontSize: '13px', minHeight: '400px'},
        '.cm-content': {fontFamily: 'var(--g-font-family-monospace)', lineHeight: '1.85', padding: '20px 0'},
        '.cm-line': {paddingLeft: '16px', paddingRight: '20px'},
        '.cm-gutters': {backgroundColor: 'transparent', border: 'none', color: 'var(--g-color-text-hint)', paddingLeft: '12px'},
        '.cm-gutterElement': {lineHeight: '1.85'},
        '&.cm-focused': {outline: 'none'},
      })],
    },
    wysiwygConfig: {placeholderOptions: {value: 'Начните писать…'}},
  });

  useEffect(() => {
    const update = () => {setMarkdown(editor.getValue()); setSubmitted(false);};
    const updateMode = ({mode}: {mode: 'markup' | 'wysiwyg'}) => setMode(mode);
    editor.on('change', update);
    editor.on('change-editor-mode', updateMode);
    return () => {editor.off('change', update); editor.off('change-editor-mode', updateMode);};
  }, [editor]);

  const draft = useMemo(() => ({title, category, markdown, favorite}), [title, category, markdown, favorite]);
  const persist = useCallback((value: Draft) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      setSaveStatus('Все изменения сохранены');
      return true;
    } catch {
      setSaveStatus('Не удалось сохранить в браузере');
      return false;
    }
  }, []);

  useEffect(() => {
    setSaveStatus('Сохраняем изменения…');
    const timeout = window.setTimeout(() => persist(draft), 600);
    return () => window.clearTimeout(timeout);
  }, [draft, persist]);

  const html = useMemo(() => parser.render(markdown), [markdown]);
  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const wordLabel = words % 10 === 1 && words % 100 !== 11 ? 'слово' : words % 10 >= 2 && words % 10 <= 4 && (words % 100 < 12 || words % 100 > 14) ? 'слова' : 'слов';

  const saveNote = useCallback(() => {
    if (!title.trim()) {setError('Дайте заметке название'); return;}
    if (!editor.getValue().trim()) {setError('Добавьте текст заметки'); editor.focus(); return;}
    setError('');
    const value = {...draft, markdown: editor.getValue()};
    try {
      const notes = JSON.parse(localStorage.getItem('slovo-saved-notes-v1') || '[]');
      const list = Array.isArray(notes) ? notes : [];
      localStorage.setItem('slovo-saved-notes-v1', JSON.stringify([...list.filter((note: Draft) => note.title !== value.title), {...value, savedAt: new Date().toISOString()}]));
      persist(value);
      setSubmitted(true);
      setDialog('saved');
    } catch {setError('Не удалось сохранить заметку. Проверьте, разрешено ли хранение данных в браузере.');}
  }, [draft, editor, persist, title]);

  useEffect(() => {
    editor.on('submit', saveNote);
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {event.preventDefault(); saveNote();}
      if (event.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {editor.off('submit', saveNote); window.removeEventListener('keydown', onKey);};
  }, [editor, saveNote]);

  function changeMode(value: string) {
    editor.setEditorMode(value === 'markup' ? 'markup' : 'wysiwyg');
    setMode(value);
  }
  function discard() {
    setTitle(''); setCategory(['personal']); setFavorite(false); editor.clear(); setMarkdown('');
    setError(''); setSubmitted(false); setDialog(null);
  }
  function exportNote() {
    const blob = new Blob([`# ${title}\n\n${markdown}`], {type: 'text/markdown;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `${title.replace(/[/\\?%*:|"<>]/g, '-') || 'Заметка'}.md`; link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand" aria-label="Слово — пространство для заметок"><span className="brand-icon"><Icon data={Pencil} size={20}/></span><span>слово<span className="brand-dot">.</span></span></div>
          <span className="header-divider"/>
          <span className="workspace-name">Личное пространство</span>
          <div className="header-right"><Button view="flat" onClick={() => setDialog('help')}><Icon data={BookOpen} size={16}/> <span>Справка</span></Button><span className="avatar" title="Личное пространство">А</span></div>
        </div>
      </header>

      <main className="main">
        <div className="breadcrumbs"><Icon data={FileText} size={15}/><span>Мои заметки</span><Icon data={ChevronRight} size={12}/><span className="breadcrumb-current">Новая заметка</span></div>
        <div className="page-heading">
          <div><div className="eyebrow">МЫСЛИ СТАНОВЯТСЯ СЛОВАМИ</div><Text as="h1" variant="display-2" className="page-title">Новая заметка</Text><p className="page-description">Поймайте мысль. Придайте ей форму.</p></div>
          <div className="draft-badge"><span className="status-dot"/>Черновик</div>
        </div>

        <form onSubmit={(event) => {event.preventDefault(); saveNote();}}>
          <section className="note-card" aria-label="Новая заметка">
            <div className="metadata">
              <div className="title-field"><label htmlFor="note-title">Название <span className="required">*</span></label><TextInput id="note-title" name="title" size="xl" value={title} placeholder="Как назовём вашу заметку?" onUpdate={(value) => {setTitle(value); setError(''); setSubmitted(false);}} controlProps={{maxLength: 200}} validationState={error && !title.trim() ? 'invalid' : undefined}/></div>
              <div className="category-field"><label htmlFor="note-category">Коллекция</label><Select id="note-category" size="xl" width="max" value={category} options={categories} onUpdate={setCategory}/></div>
            </div>
            <div className="content-label"><label>Содержание <span className="required">*</span></label><span className="markdown-badge"><Icon data={Code} size={13}/> Markdown</span><Button size="s" view="flat" className="syntax-link" onClick={() => setDialog('help')}><Icon data={CircleInfo} size={14}/> Подсказки по разметке</Button></div>
            <div className={`editor-shell ${expanded ? 'editor-shell-expanded' : ''}`}>
              <div className="editor-topbar">
                <SegmentedRadioGroup value={mode} onUpdate={changeMode} size="m" aria-label="Режим редактора">
                  <SegmentedRadioGroup.Option value="markup"><span className="option-content"><Icon data={Code} size={15}/>Markdown</span></SegmentedRadioGroup.Option>
                  <SegmentedRadioGroup.Option value="wysiwyg"><span className="option-content"><Icon data={Pencil} size={14}/>Визуальный</span></SegmentedRadioGroup.Option>
                </SegmentedRadioGroup>
                <div className="editor-view-actions">
                  <Button size="m" view="flat" selected={view === 'split'} title="Редактор и предпросмотр" aria-label="Редактор и предпросмотр" onClick={() => setView('split')}><Icon data={LayoutColumns} size={17}/></Button>
                  <Button size="m" view="flat" selected={view === 'preview'} title="Только предпросмотр" aria-label="Только предпросмотр" onClick={() => setView(view === 'preview' ? 'edit' : 'preview')}><Icon data={Eye} size={17}/></Button>
                  <span className="toolbar-divider"/>
                  <Button size="m" view="flat" title={expanded ? 'Свернуть редактор' : 'Развернуть редактор'} aria-label={expanded ? 'Свернуть редактор' : 'Развернуть редактор'} onClick={() => setExpanded(!expanded)}><Icon data={expanded ? Xmark : ArrowsExpand} size={16}/></Button>
                </div>
              </div>
              <div className={`editor-columns view-${view}`}>
                <div className="source-pane" style={view === 'preview' ? {display: 'none'} : undefined}>
                  <MarkdownEditorView editor={editor} stickyToolbar={false} settingsVisible={false} toolbarsPreset={commonmark} className="note-editor"/>
                </div>
                {view !== 'edit' && <section className="preview-pane" aria-label="Предпросмотр заметки">
                  <div className="preview-heading"><span><Icon data={Eye} size={15}/>Предпросмотр</span><span className="live-label"><span className="live-dot"/>В реальном времени</span></div>
                  <div className="preview-content">{markdown.trim() ? <YfmStaticView html={html} className="note-preview"/> : <div className="empty-preview"><span className="empty-icon"><Icon data={FileText} size={30}/></span><Text variant="subheader-2">Здесь оживут ваши мысли</Text><p>Начните писать в редакторе —<br/>форматирование появится сразу.</p></div>}</div>
                </section>}
              </div>
              <div className="editor-status"><span className="instant-message"><Icon data={Check} size={13}/> Форматирование на лету</span><div><span>{words} {wordLabel}</span><span className="count-divider">·</span><span>{markdown.length} символов</span></div></div>
            </div>
            <div className="under-editor"><span><Icon data={CloudCheck} size={15}/>{saveStatus}</span><span className="shortcut-hint"><kbd>Ctrl</kbd> + <kbd>S</kbd> для сохранения</span></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-footer"><Checkbox checked={favorite} onUpdate={setFavorite}>Добавить в избранное</Checkbox><div className="footer-actions"><Button view="flat" size="l" onClick={() => setDialog('discard')}>Отменить</Button><Button type="submit" view="action" size="l"><Icon data={submitted ? CircleCheck : Check} size={17}/>{submitted ? 'Заметка сохранена' : 'Сохранить заметку'}</Button></div></div>
          </section>
        </form>

        <section className="tip-card"><span className="tip-icon"><Icon data={BookOpen} size={22}/></span><div className="tip-copy"><Text as="h2" variant="subheader-2">Пишите просто. Получайте красивый текст.</Text><p>Заголовки, списки, цитаты и ссылки — немного символов, много возможностей.</p></div><Button view="flat" onClick={() => setDialog('help')}>Знакомство с Markdown <Icon data={ArrowRight} size={16}/></Button></section>
        <footer className="page-footer"><span>Меньше шума. Больше смысла.</span><span>Сделано для ваших мыслей <span className="footer-spark">✳</span></span></footer>
      </main>

      <Modal open={dialog === 'help'} onClose={() => setDialog(null)} aria-labelledby="help-heading"><div className="dialog-content"><div className="dialog-heading"><Text id="help-heading" as="h2" variant="header-1">Немного Markdown — и готово</Text><Button view="flat" aria-label="Закрыть справку" onClick={() => setDialog(null)}><Icon data={Xmark} size={18}/></Button></div><p className="dialog-description">Добавляйте символы прямо в текст. Результат сразу появится в предпросмотре.</p><div className="syntax-table">{hints.map(([syntax, label]) => <div className="syntax-row" key={syntax}><code>{syntax}</code><span>{label}</span></div>)}</div><p className="help-shortcuts"><kbd>Ctrl / ⌘ + B</kbd> жирный <span>·</span> <kbd>Ctrl / ⌘ + I</kbd> курсив</p><Button view="action" size="l" width="max" onClick={() => setDialog(null)}>Попробовать в редакторе</Button></div></Modal>
      <Modal open={dialog === 'discard'} onClose={() => setDialog(null)} aria-labelledby="discard-heading"><div className="dialog-content"><Text as="h2" id="discard-heading" variant="header-1">Очистить черновик?</Text><p className="dialog-description">Название и текст этой заметки будут удалены. Сохранённые заметки останутся в браузере.</p><div className="dialog-actions"><Button size="l" onClick={() => setDialog(null)}>Продолжить писать</Button><Button size="l" view="outlined-danger" onClick={discard}>Очистить</Button></div></div></Modal>
      <Modal open={dialog === 'saved'} onClose={() => setDialog(null)} aria-labelledby="saved-heading"><div className="dialog-content saved-dialog"><span className="success-icon"><Icon data={CircleCheck} size={32}/></span><Text as="h2" id="saved-heading" variant="header-1">Мысль сохранена</Text><p className="dialog-description">«{title}» сохранена в коллекции «{categories.find((item) => item.value === category[0])?.content || 'Личное'}» в этом браузере.</p><div className="dialog-actions"><Button size="l" onClick={exportNote}>Скачать .md</Button><Button size="l" view="action" onClick={() => setDialog(null)}>Продолжить писать</Button></div></div></Modal>
    </div>
  );
}
