import {useEffect, useRef, useState} from 'react';
import {Button, Modal, TextInput} from '@gravity-ui/uikit';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './styles.css';

type IconName = 'write' | 'files' | 'book' | 'arrow' | 'check' | 'help' | 'chevron' | 'link' | 'list' | 'quote' | 'code' | 'expand' | 'close' | 'eye';
function Icon({name, size = 20}: {name: IconName; size?: number}) {
  const paths: Record<IconName, React.ReactNode> = {
    write: <><path d="m14 4 6 6M4 20l4.5-1L21 6.5a2.1 2.1 0 0 0-3-3L5.5 16Z"/><path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/></>,
    files: <><path d="M7 3h9l4 4v13H7z"/><path d="M16 3v5h4M4 7v14M10 12h7M10 16h5"/></>,
    book: <><path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1ZM12 5v15"/></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 2-2.5 2-2.5 4M12 17h.01"/></>,
    chevron: <path d="m9 5 7 7-7 7"/>,
    link: <><path d="m10 13 4-4M9 15l-2 2a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4 0M13 7l2-2a3 3 0 0 1 4 4l-4 4a3 3 0 0 1-4 0"/></>,
    list: <path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/>,
    quote: <path d="M4 7h6v6H5c0 3 2 4 4 4M14 7h6v6h-5c0 3 2 4 4 4"/>,
    code: <path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16"/>,
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const initialText = `## Место, где идеи обретают форму

Всё начинается с чистого листа. И одной мысли,
которой хочется поделиться.

### Просто начните писать

Не ищите идеальные слова — **дайте идеям место**.
А с оформлением поможет Markdown:

- Выделяйте **главное**
- Добавляйте *немного акцентов*
- Собирайте мысли в списки

> Хороший текст начинается не с правил,
> а с желания что-то сказать.

Больше о разметке — в [руководстве по Markdown](https://www.markdownguide.org/basic-syntax/).
`;
type Draft = {title: string; text: string; updated: string};
const storageKey = 'folio-publication-draft';
function readDraft(): Draft | null {
  try {
    const draft = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return draft && typeof draft.title === 'string' && typeof draft.text === 'string' && typeof draft.updated === 'string' ? draft : null;
  } catch { return null; }
}

export function App() {
  const [existing] = useState(readDraft);
  const [title, setTitle] = useState(existing?.title ?? 'У каждой идеи есть история');
  const [text, setText] = useState(existing?.text ?? initialText);
  const [saved, setSaved] = useState<Draft | null>(existing);
  const [view, setView] = useState<'editor' | 'drafts'>('editor');
  const [mode, setMode] = useState<'split' | 'write' | 'preview'>('split');
  const [help, setHelp] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState('');
  const [saveError, setSaveError] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const isSaved = saved?.title === title && saved?.text === text;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {if (event.key === 'Escape') setExpanded(false);};
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function saveDraft() {
    if (!title.trim() || !text.trim()) {
      setSaveError(!title.trim() ? 'Добавьте название публикации.' : 'Добавьте текст публикации.');
      if (!text.trim()) {setMode('split'); requestAnimationFrame(() => textarea.current?.focus());}
      return;
    }
    const draft = {title, text, updated: new Date().toISOString()};
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setSaved(draft); setSaveError(''); setToast('Черновик сохранён в этом браузере');
    } catch { setSaveError('Не удалось сохранить черновик. Проверьте доступ к хранилищу браузера.'); }
  }

  function format(before: string, after = '', placeholder = 'текст') {
    const field = textarea.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = text.slice(start, end) || placeholder;
    setText(text.slice(0, start) + before + selected + after + text.slice(end));
    requestAnimationFrame(() => {
      field.focus(); field.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  const formatting = [
    {label: 'Жирный (Ctrl+B)', content: <b>B</b>, action: () => format('**', '**')},
    {label: 'Курсив (Ctrl+I)', content: <i>I</i>, action: () => format('*', '*')},
    {label: 'Заголовок', content: <span className="heading-icon">H<span>2</span></span>, action: () => format('\n## ', '\n', 'Заголовок')},
    {label: 'Вставить ссылку', content: <Icon name="link" size={18}/>, action: () => format('[', '](https://example.com)', 'Текст ссылки')},
    {label: 'Список', content: <Icon name="list" size={18}/>, action: () => format('\n- ', '\n', 'Пункт списка')},
    {label: 'Цитата', content: <Icon name="quote" size={18}/>, action: () => format('\n> ', '\n', 'Цитата')},
    {label: 'Код', content: <Icon name="code" size={18}/>, action: () => format('`', '`', 'код')},
  ];

  return <div className="app-shell">
    <aside className="sidebar">
      <a href="#" className="brand" onClick={(e) => {e.preventDefault(); setView('editor');}} aria-label="Folio — редактор"><span className="brand-symbol"><span/><span/><span/></span>folio<span className="brand-dot">.</span></a>
      <div className="workspace"><span className="workspace-icon"><Icon name="book" size={19}/></span><div><strong>Моё пространство</strong><span>Место для ваших идей</span></div></div>
      <span className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</span>
      <nav aria-label="Основное меню">
        <button className={`nav-item ${view === 'editor' ? 'active' : ''}`} aria-label="Редактор" onClick={() => setView('editor')}><Icon name="write"/>Редактор<span className="nav-indicator"/></button>
        <button className={`nav-item ${view === 'drafts' ? 'active' : ''}`} aria-label="Черновики" onClick={() => setView('drafts')}><Icon name="files"/>Черновики<span className="nav-count">{saved ? 1 : 0}</span></button>
      </nav>
      <div className="sidebar-bottom">
        <div className="inspiration"><span className="sparkle">✳</span><p>Большие истории<br/>начинаются с одной мысли.</p><span>Пусть ваша будет следующей.</span></div>
        <button className="help-nav" aria-label="Помощь с Markdown" onClick={() => setHelp(true)}><Icon name="help" size={19}/>Помощь с Markdown<Icon name="chevron" size={14}/></button>
        <div className="profile"><span className="avatar">В</span><div><strong>Ваше пространство</strong><span>Локальный редактор</span></div><span className="online-dot"/></div>
      </div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumbs"><span>Рабочее пространство</span><Icon name="chevron" size={13}/><span className="current">{view === 'editor' ? 'Новая публикация' : 'Черновики'}</span></div><span className="topbar-note"><span/>Ваши мысли. Ваши слова.</span></header>
      <main>
        <div className="page-heading"><div><div className="eyebrow">СЛОВА, КОТОРЫЕ ИМЕЮТ ЗНАЧЕНИЕ</div><h1>{view === 'editor' ? 'Новая публикация' : 'Ваши черновики'}<span className="title-dot">.</span></h1><p>{view === 'editor' ? 'Запишите идею. Придайте ей форму. Поделитесь с миром.' : 'Идеи, к которым хочется вернуться.'}</p></div><span className="draft-badge"><span/>{view === 'editor' ? 'Черновик' : 'Локальное хранилище'}</span></div>
        {view === 'drafts' ? <section className="drafts-section">
          {saved ? <button className="draft-card" onClick={() => {setTitle(saved.title); setText(saved.text); setView('editor');}}><span className="draft-card-icon"><Icon name="files" size={26}/></span><span><strong>{saved.title || 'Без названия'}</strong><span>Сохранено {new Date(saved.updated).toLocaleString('ru-RU', {day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'})}</span></span><Icon name="arrow"/></button> : <div className="empty-drafts"><Icon name="files" size={36}/><h2>Здесь появятся ваши идеи</h2><p>Сохраните публикацию как черновик, чтобы вернуться к ней позже.</p><Button size="l" onClick={() => setView('editor')}>Открыть редактор</Button></div>}
          <p className="storage-note">Черновик хранится только в этом браузере.</p>
        </section> : <form onSubmit={(event) => {event.preventDefault(); saveDraft();}}>
          <section className="title-section"><label htmlFor="publication-title">Название публикации <span>*</span></label><TextInput id="publication-title" name="title" size="xl" value={title} onUpdate={setTitle} placeholder="Дайте своей истории название" controlProps={{maxLength: 150, required: true}} hasClear/><span className="field-hint">Хорошее название — начало интересной истории.<span>{title.length}/150</span></span></section>
          <div className="content-label"><label htmlFor="markdown-content">Текст публикации <span>*</span></label><span className="markdown-label"><span className="md-symbol">M↓</span> Markdown</span></div>
          <section className={`editor ${expanded ? 'editor-expanded' : ''} mode-${mode}`} aria-label="Редактор Markdown">
            <div className="editor-toolbar"><div className="formatting-tools">{formatting.map((tool, index) => <span className={index === 3 || index === 6 ? 'tool-group' : ''} key={tool.label}><Button view="flat" size="m" type="button" title={tool.label} aria-label={tool.label} onClick={() => {if (mode === 'preview') setMode('split'); tool.action();}}>{tool.content}</Button></span>)}</div><div className="editor-views"><div className="view-switch" aria-label="Вид редактора">{([{key: 'write', label: 'Текст'}, {key: 'split', label: 'Разделить'}, {key: 'preview', label: 'Просмотр'}] as const).map(item => <button key={item.key} type="button" className={mode === item.key ? 'selected' : ''} aria-pressed={mode === item.key} onClick={() => setMode(item.key)}>{item.label}</button>)}</div><Button view="flat" type="button" title={expanded ? 'Свернуть редактор' : 'Развернуть редактор'} aria-label={expanded ? 'Свернуть редактор' : 'Развернуть редактор'} onClick={() => setExpanded(!expanded)}><Icon name={expanded ? 'close' : 'expand'} size={17}/></Button></div></div>
            <div className="editor-panels">
              <div className="source-panel"><div className="panel-caption"><span><Icon name="code" size={14}/> MARKDOWN</span><span>Пишите здесь</span></div><div className="source-body"><div className="line-numbers" ref={lines} aria-hidden="true">{text.split('\n').map((_, index) => <div key={index}>{index + 1}</div>)}</div><textarea ref={textarea} id="markdown-content" name="content" aria-label="Текст публикации в Markdown" value={text} aria-required="true" spellCheck={false} placeholder="Начните свою историю…" onChange={event => setText(event.target.value)} onScroll={event => {if (lines.current) lines.current.scrollTop = event.currentTarget.scrollTop;}} onKeyDown={event => {if ((event.ctrlKey || event.metaKey) && ['b', 'i'].includes(event.key.toLowerCase())) {event.preventDefault(); const marker = event.key.toLowerCase() === 'b' ? '**' : '*'; format(marker, marker);}}}/></div></div>
              <div className="preview-panel"><div className="panel-caption"><span><Icon name="eye" size={15}/> ПРЕДПРОСМОТР</span><span className="live-label"><span/>В реальном времени</span></div><div className="markdown-preview" role="region" aria-label="Предпросмотр Markdown">{text.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={{a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer"/>}}>{text}</ReactMarkdown> : <div className="empty-preview"><Icon name="write" size={29}/><p>Здесь оживёт ваш текст</p><span>Начните писать в редакторе</span></div>}</div></div>
            </div>
            <div className="editor-status"><span><span className="status-dot"/>Все изменения видны сразу</span><span>{wordCount} слов<span className="status-separator">·</span>{text.length} символов</span></div>
          </section>
          <div className="editor-help"><Icon name="help" size={16}/><span>Немного разметки — много возможностей.</span><button type="button" onClick={() => setHelp(true)}>Шпаргалка по Markdown<Icon name="arrow" size={14}/></button></div>
          {saveError && <p className="error-message" role="alert">{saveError}</p>}
          <div className="form-footer"><span className="save-status"><Icon name={isSaved ? 'check' : 'files'} size={17}/>{isSaved ? 'Черновик сохранён в этом браузере' : 'Ваша история ещё не сохранена'}</span><Button className="save-button" view="action" size="xl" type="submit"><Icon name="check" size={18}/>Сохранить черновик</Button></div>
        </form>}
        <footer className="page-footer"><span>Сделано для мыслей, которыми хочется делиться.</span><span>Пишите с удовольствием <span className="footer-flower">✳</span></span></footer>
      </main>
    </div>
    <Modal open={help} onOpenChange={setHelp} aria-labelledby="help-title"><div className="help-modal"><div className="modal-heading"><span className="eyebrow">ПРОСТО О ФОРМАТИРОВАНИИ</span><Button view="flat" aria-label="Закрыть подсказку" onClick={() => setHelp(false)}><Icon name="close"/></Button></div><h2 id="help-title">Знакомьтесь, Markdown<span className="title-dot">.</span></h2><p>Добавьте несколько символов, и текст преобразится.<br/>Результат сразу появится в предпросмотре.</p><div className="syntax-table">{[['## Заголовок', 'Заголовок второго уровня'], ['**Жирный текст**', 'Выделение главного'], ['*Курсив*', 'Лёгкий акцент'], ['- Пункт списка', 'Маркированный список'], ['> Цитата', 'Блок с цитатой'], ['[Текст](https://example.com)', 'Ссылка'], ['`код`', 'Фрагмент кода'], ['- [ ] Задача', 'Список задач']].map(([syntax, description]) => <div key={syntax}><code>{syntax}</code><span>{description}</span></div>)}</div><Button view="action" size="l" width="max" onClick={() => setHelp(false)}>Всё понятно, пишем!</Button></div></Modal>
    {toast && <div className="toast" role="status"><span><Icon name="check" size={17}/></span>{toast}<button aria-label="Закрыть уведомление" onClick={() => setToast('')}><Icon name="close" size={16}/></button></div>}
  </div>;
}
