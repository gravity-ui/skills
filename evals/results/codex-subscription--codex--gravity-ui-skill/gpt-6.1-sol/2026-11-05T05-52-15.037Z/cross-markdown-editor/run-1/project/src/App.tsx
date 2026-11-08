import {useEffect, useMemo, useState} from 'react';
import {Button, Icon, Modal, SegmentedRadioGroup, Select, Text, TextInput} from '@gravity-ui/uikit';
import {ArrowDownToLine, ArrowRight, BookOpen, Check, ChevronRight, CircleQuestion, Code, Eye, FileText, FloppyDisk, Pencil, Xmark} from '@gravity-ui/icons';
import {MarkdownEditorView, useMarkdownEditor, YfmStaticView} from '@gravity-ui/markdown-editor';
import MarkdownIt from 'markdown-it';
import './App.css';

const initialMarkdown = `## Дайте идее пространство

Каждый большой проект начинается с маленькой идеи.
Запишите её — и позвольте ей стать чем-то большим.

### Соберите самое важное

- **Контекст.** Какую задачу мы решаем?
- **Идея.** Что можно сделать иначе?
- **Следующий шаг.** С чего начнём?

> Не ждите идеального момента. Начните с первого абзаца.

Используйте \`markdown\`, чтобы сосредоточиться на главном.
А форматирование мы возьмём на себя.

Подробнее — в [руководстве по Markdown](https://www.markdownguide.org/basic-syntax/).`;

type Draft = {title: string; category: string; markdown: string};
const defaultDraft: Draft = {title: 'С чего начинается хорошая идея', category: 'ideas', markdown: initialMarkdown};
const storageKey = 'stroka-article-draft';
function readDraft(): Draft {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved.title === 'string' && typeof saved.markdown === 'string' && ['ideas', 'guides', 'notes'].includes(saved.category)) return saved;
  } catch { /* A new draft remains available when browser storage is disabled. */ }
  return defaultDraft;
}
const markdownParser = new MarkdownIt({html: false, linkify: true, typographer: true});
const syntax = [['Заголовок', '## Заголовок'], ['Жирный текст', '**текст**'], ['Курсив', '*текст*'], ['Список', '- пункт списка'], ['Ссылка', '[текст](https://example.com)'], ['Цитата', '> ваша мысль'], ['Код', '`код`']];

export function App() {
  const [draft] = useState(readDraft);
  const [title, setTitle] = useState(draft.title);
  const [category, setCategory] = useState([draft.category]);
  const [markdown, setMarkdown] = useState(draft.markdown);
  const [mode, setMode] = useState('markup');
  const [helpOpen, setHelpOpen] = useState(false);
  const [publishedOpen, setPublishedOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [attempted, setAttempted] = useState(false);
  const editor = useMarkdownEditor({
    preset: 'commonmark', md: {html: false, linkify: true},
    initial: {markup: draft.markdown, mode: 'markup', toolbarVisible: true},
    markupConfig: {placeholder: 'Начните писать… Например, ## Заголовок', searchPanel: false},
  });
  useEffect(() => {
    const onChange = () => {setMarkdown(editor.getValue()); setSaved(false); setNotice('');};
    editor.on('change', onChange);
    return () => { editor.off('change', onChange); };
  }, [editor]);
  const html = useMemo(() => markdownParser.render(markdown), [markdown]);
  const words = markdown.trim().split(/\s+/u).filter(Boolean).length;
  const titleError = attempted && !title.trim();
  const bodyError = attempted && !markdown.trim();
  function saveDraft() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({title, category: category[0], markdown: editor.getValue()}));
      setSaved(true); setNotice('Черновик сохранён в этом браузере');
    } catch {setNotice('Не удалось сохранить черновик. Скачайте текст, чтобы не потерять его.');}
  }
  function download() {
    const blob = new Blob([`# ${title.trim() || 'Без названия'}\n\n${editor.getValue()}`], {type: 'text/markdown;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title.trim() || 'article'}.md`; a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="app">
      <header className="app-header"><div className="header-inner">
        <div className="brand"><span className="brand-mark"><Icon data={Pencil} size={20} /></span><span>строка<span className="brand-period">.</span></span></div>
        <span className="header-divider" /><div className="workspace-name">Рабочее пространство</div>
        <div className="header-actions"><Button view="flat-secondary" onClick={() => setHelpOpen(true)}><Icon data={CircleQuestion} size={17} /><span className="help-label">Помощь</span></Button><span className="avatar" aria-label="Ваш профиль">АК</span></div>
      </div></header>
      <main className="main">
        <div className="breadcrumbs"><Icon data={BookOpen} size={15} /><span>База знаний</span><Icon data={ChevronRight} size={12} /><span className="breadcrumb-current">Новая статья</span></div>
        <div className="page-heading"><div><div className="eyebrow">МЕСТО ДЛЯ ВАШИХ МЫСЛЕЙ</div><Text as="h1" variant="display-2" className="page-title">Новая статья</Text><Text as="p" variant="body-2" color="secondary" className="page-description">Оформите идею, поделитесь знаниями или расскажите историю.</Text></div><span className="draft-badge"><span className="status-dot" />Черновик</span></div>
        <form className="article-form" onSubmit={(event) => {event.preventDefault(); setAttempted(true); if (title.trim() && editor.getValue().trim()) setPublishedOpen(true);}}>
          <section className="form-details">
            <div className="section-heading"><span className="section-icon"><Icon data={FileText} size={18} /></span><Text as="h2" variant="subheader-2">О статье</Text><span className="section-caption">Начните с главного</span></div>
            <div className="details-grid">
              <div className="field"><label htmlFor="article-title">Название <span className="required">*</span></label><TextInput id="article-title" size="xl" value={title} placeholder="Дайте статье название" onUpdate={(value) => {setTitle(value); setSaved(false); setNotice('');}} validationState={titleError ? 'invalid' : undefined} errorMessage={titleError ? 'Добавьте название статьи' : undefined} controlProps={{maxLength: 150}} /><span className="field-note">Короткое и понятное название поможет найти статью.</span></div>
              <div className="field"><label htmlFor="article-category">Раздел</label><Select id="article-category" size="xl" width="max" value={category} onUpdate={(value) => {setCategory(value); setSaved(false); setNotice('');}} options={[{value: 'ideas', content: 'Идеи и вдохновение'}, {value: 'guides', content: 'Руководства'}, {value: 'notes', content: 'Заметки'}]} /><span className="field-note">Где будет храниться статья.</span></div>
            </div>
          </section>
          <section className="content-section" aria-labelledby="content-label">
            <div className="content-heading"><div><Text as="h2" variant="subheader-2" id="content-label">Содержание <span className="required">*</span></Text><span className="content-subtitle">Пишите с Markdown — результат появится справа.</span></div><Button size="s" view="flat-secondary" onClick={() => setHelpOpen(true)}><Icon data={CircleQuestion} size={14} />Шпаргалка по Markdown</Button></div>
            <div className={`editor-frame${bodyError ? ' editor-frame_error' : ''}`}>
              <div className="editor-topbar"><SegmentedRadioGroup size="m" value={mode} onUpdate={(value) => {setMode(value); editor.setEditorMode(value === 'markup' ? 'markup' : 'wysiwyg');}} aria-label="Режим редактора"><SegmentedRadioGroup.Option value="markup"><span className="mode-option"><Icon data={Code} size={15} />Markdown</span></SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="wysiwyg"><span className="mode-option"><Icon data={Pencil} size={14} />Визуальный</span></SegmentedRadioGroup.Option></SegmentedRadioGroup><span className="editor-tip">Ваша мысль. Ваш стиль.</span></div>
              <div className="editor-columns">
                <div className="source-pane"><MarkdownEditorView className="article-editor" editor={editor} stickyToolbar={false} settingsVisible={false} /></div>
                <div className="preview-pane"><div className="preview-heading"><span><Icon data={Eye} size={16} />Предпросмотр</span><span className="live-badge"><span className="status-dot" />В реальном времени</span></div><div className="preview-content">{markdown.trim() ? <YfmStaticView className="article-preview" html={html} /> : <div className="empty-preview"><Icon data={FileText} size={30} /><Text variant="subheader-2">Здесь появится ваша история</Text><Text color="secondary">Начните писать в редакторе слева.</Text></div>}</div></div>
              </div>
              <div className="editor-status"><span><span className="markdown-symbol">M↓</span>Markdown поддерживается</span><span>{words} слов<span className="stat-separator">·</span>{markdown.length} символов</span></div>
            </div>
            {bodyError && <Text color="danger" className="body-error">Добавьте текст статьи</Text>}
            <div className="writing-note"><span className="note-icon"><Icon data={CircleQuestion} size={17} /></span><div><strong>Сосредоточьтесь на тексте.</strong> Используйте <code>**жирный**</code>, <code>*курсив*</code> и <code>## заголовки</code> — форматирование появится автоматически.</div></div>
          </section>
          <footer className="form-footer"><div className="save-status" role="status">{saved ? <><Icon data={Check} size={16} /><span>{notice}</span></> : <><span className="status-dot" /><span>{notice || 'Сохраните черновик, чтобы продолжить позже.'}</span></>}</div><div className="form-actions"><Button size="l" view="outlined" onClick={saveDraft}><Icon data={FloppyDisk} size={16} />Сохранить черновик</Button><Button size="l" view="action" type="submit">Готово<Icon data={ArrowRight} size={16} /></Button></div></footer>
        </form>
        <div className="page-footer"><span>Хорошие мысли заслуживают красивой формы.</span><Button size="s" view="flat-secondary" onClick={download}><Icon data={ArrowDownToLine} size={14} />Скачать .md</Button></div>
      </main>
      <Modal open={helpOpen} onOpenChange={setHelpOpen} aria-labelledby="markdown-help-title"><div className="dialog"><div className="dialog-heading"><Text as="h2" variant="header-1" id="markdown-help-title">Немного Markdown — много возможностей</Text><Button view="flat" onClick={() => setHelpOpen(false)} aria-label="Закрыть"><Icon data={Xmark} size={18} /></Button></div><Text as="p" color="secondary">Добавьте разметку в текст или используйте панель редактора.</Text><div className="syntax-list">{syntax.map(([name, example]) => <div key={name}><span>{name}</span><code>{example}</code></div>)}</div><Text color="secondary">Ctrl / ⌘ + B — жирный, Ctrl / ⌘ + I — курсив.</Text><div className="dialog-footer"><Button view="action" size="l" onClick={() => setHelpOpen(false)}>Всё понятно</Button></div></div></Modal>
      <Modal open={publishedOpen} onOpenChange={setPublishedOpen} aria-labelledby="article-ready-title"><div className="dialog"><div className="dialog-heading"><Text as="h2" variant="header-1" id="article-ready-title">Статья готова</Text><Button view="flat" onClick={() => setPublishedOpen(false)} aria-label="Закрыть"><Icon data={Xmark} size={18} /></Button></div><Text as="p" color="secondary">«{title}» — сохраните статью в Markdown, чтобы поделиться ею или перенести в базу знаний.</Text><div className="dialog-footer"><Button size="l" view="outlined" onClick={() => setPublishedOpen(false)}>Вернуться к статье</Button><Button size="l" view="action" onClick={download}><Icon data={ArrowDownToLine} size={16} />Скачать статью</Button></div></div></Modal>
    </div>
  );
}
