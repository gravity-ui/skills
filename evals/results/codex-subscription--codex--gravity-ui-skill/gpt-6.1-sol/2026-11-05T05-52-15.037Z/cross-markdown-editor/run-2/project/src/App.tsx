import {useEffect, useMemo, useState} from 'react';
import {Button, Icon, Label, Modal, SegmentedRadioGroup, Select, Switch, Text, TextInput} from '@gravity-ui/uikit';
import {ArrowChevronRight, ArrowLeft, ArrowUpRight, BookOpen, Check, CircleInfo, CircleQuestion, Eye, FileText, Globe, PaperPlane} from '@gravity-ui/icons';
import {configure, MarkdownEditorView, useMarkdownEditor, YfmStaticView} from '@gravity-ui/markdown-editor';
import transform from '@diplodoc/transform';
import './App.css';

configure({lang: 'ru'});

const example = `## Хорошие идеи начинаются с текста

Поделитесь тем, что важно. Добавьте **главную мысль**, выделите *детали* и сделайте текст удобным для чтения.

### Что нового

- Редактор с поддержкой Markdown
- Форматирование в реальном времени
- Всё необходимое — в одном месте

> Пишите свободно. О форматировании мы позаботимся.

Узнать больше можно в [руководстве по Markdown](https://www.markdownguide.org/basic-syntax/).`;
const draftKey = 'pages-publication-draft';
type Draft = {title: string; body: string; category: string[]; visibility: string[]; notify: boolean; tags: string[]};
function readDraft(): Draft | null {
  try { const d = JSON.parse(localStorage.getItem(draftKey) || 'null'); return d && typeof d.title === 'string' && typeof d.body === 'string' && Array.isArray(d.tags) && Array.isArray(d.category) && Array.isArray(d.visibility) && typeof d.notify === 'boolean' ? d : null; } catch { return null; }
}
function Preview({body}: {body: string}) {
  const result = useMemo(() => {
    try { return {html: transform(body, {allowHTML: false, needToSanitizeHtml: true, disableLiquid: true, plugins: [], preprocessors: [], enableMarkdownAttrs: false}).result.html, error: false}; }
    catch { return {html: '', error: true}; }
  }, [body]);
  if (result.error) return <div className="preview-empty" role="alert">Не удалось отобразить текст. Проверьте разметку.</div>;
  if (!body.trim()) return <div className="preview-empty"><Icon data={FileText} size={28}/><p>Здесь появится ваш текст</p><span>Начните писать в редакторе слева</span></div>;
  return <YfmStaticView className="rendered-markdown" html={result.html} noListReset/>;
}

export function App() {
  const [initial] = useState(readDraft);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? example);
  const [category, setCategory] = useState(initial?.category ?? ['news']);
  const [visibility, setVisibility] = useState(initial?.visibility ?? ['team']);
  const [notify, setNotify] = useState(initial?.notify ?? true);
  const [tags, setTags] = useState(initial?.tags ?? ['Обновления', 'Команда']);
  const [tagInput, setTagInput] = useState('');
  const [mode, setMode] = useState('split');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState(false);
  const [help, setHelp] = useState(false);
  const [published, setPublished] = useState(false);
  const [saved, setSaved] = useState(Boolean(initial));
  const editor = useMarkdownEditor({preset: 'commonmark', md: {html: false, linkify: true}, initial: {markup: initial?.body ?? example, mode: 'markup'}, markupConfig: {placeholder: 'Начните писать…'}, wysiwygConfig: {placeholderOptions: {value: 'Начните писать…'}}});
  useEffect(() => {
    const onChange = () => {setBody(editor.getValue()); setSaved(false); setPublished(false);};
    editor.on('change', onChange);
    return () => {editor.off('change', onChange);};
  }, [editor]);
  useEffect(() => {if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 4500); return () => window.clearTimeout(timer);}, [notice]);
  const words = body.trim() ? body.trim().split(/\s+/u).length : 0;
  const currentDraft = (): Draft => ({title, body: editor.getValue(), category, visibility, notify, tags});
  const save = () => {
    try {localStorage.setItem(draftKey, JSON.stringify(currentDraft())); setSaved(true); setNotice('Черновик сохранён в этом браузере');}
    catch {setNotice('Не удалось сохранить черновик. Проверьте доступ к хранилищу браузера.');}
  };
  const publish = () => {
    if (!title.trim() || !body.trim()) {setError(true); setNotice('Добавьте название и текст публикации'); document.getElementById(!title.trim() ? 'publication-title' : 'content-heading')?.focus(); return;}
    try {localStorage.setItem('pages-published', JSON.stringify({...currentDraft(), publishedAt: new Date().toISOString()})); setPublished(true); setNotice('Публикация сохранена в этом браузере');} catch {setNotice('Не удалось сохранить публикацию в браузере');}
  };
  const addTag = () => {const next = tagInput.trim().replace(/,$/u, ''); if (next && !tags.includes(next)) {setTags([...tags, next]); setSaved(false);} setTagInput('');};
  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="./" aria-label="Страницы — главная"><span className="brand-symbol"><Icon data={BookOpen} size={20}/></span><Text variant="subheader-3">страницы</Text></a>
        <span className="header-divider"/>
        <span className="workspace-name">Рабочее пространство</span>
        <div className="header-end"><Button view="flat" onClick={() => setHelp(true)}><Icon data={CircleQuestion} size={17}/> <span className="help-label">Помощь</span></Button><span className="user-avatar" title="Анна Смирнова">АС</span></div>
      </header>
      <main className="page">
        <div className="breadcrumbs"><span>Публикации</span><Icon data={ArrowChevronRight} size={13}/><span>Новая публикация</span></div>
        <div className="page-heading"><div><div className="heading-line"><Text as="h1" variant="display-1">Новая публикация</Text><Label size="s" theme={published ? 'success' : 'normal'}>{published ? 'Сохранена' : 'Черновик'}</Label></div><Text as="p" variant="body-2" color="secondary">Превратите свои мысли в то, чем хочется поделиться.</Text></div><div className="private-note"><Icon data={Eye} size={16}/><span>Видно только вам</span></div></div>
        <form onSubmit={e => {e.preventDefault(); publish();}}>
          <div className="form-layout">
            <section className="editor-card">
              <div className="card-heading"><span className="section-icon"><Icon data={FileText} size={18}/></span><Text as="h2" variant="subheader-2">Содержание публикации</Text></div>
              <div className="content-fields">
                <label className="field-label" htmlFor="publication-title">Название <span className="required">*</span></label>
                <TextInput id="publication-title" size="xl" placeholder="О чём вы хотите рассказать?" value={title} onUpdate={value => {setTitle(value); setSaved(false); setPublished(false);}} validationState={error && !title.trim() ? 'invalid' : undefined} errorMessage={error && !title.trim() ? 'Введите название публикации' : undefined} controlProps={{maxLength: 160}}/>
                <div className="title-hint"><span>Короткий заголовок, который передаёт главное</span><span>{title.length}/160</span></div>
                <div className="body-label"><Text as="label" id="content-heading" tabIndex={-1} variant="body-2" className="field-label">Текст публикации <span className="required">*</span></Text><span className="markdown-support"><span className="md-mark">M↓</span> Поддерживает Markdown</span></div>
                <div className={`editor-shell view-${mode}`}>
                  <div className="editor-topline"><SegmentedRadioGroup size="s" value={mode} onUpdate={setMode} aria-label="Вид редактора"><SegmentedRadioGroup.Option value="edit">Редактор</SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="split">Разделённый вид</SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="preview">Просмотр</SegmentedRadioGroup.Option></SegmentedRadioGroup><span className="live-indicator"><i/> В реальном времени</span></div>
                  <div className="pane-labels">{mode !== 'preview' && <span>MARKDOWN</span>}{mode !== 'edit' && <span><Icon data={Eye} size={14}/> ПРЕДПРОСМОТР</span>}</div>
                  <div className="editor-panes"><div className="source-pane" hidden={mode === 'preview'}><MarkdownEditorView editor={editor} stickyToolbar={false} settingsVisible={false}/></div>{mode !== 'edit' && <div className="preview-pane"><Preview body={body}/></div>}</div>
                  <div className="editor-status"><span>{words} слов <span className="status-dot">·</span> {body.length} символов</span><span>Markdown <Icon data={Check} size={12}/></span></div>
                </div>
                {error && !body.trim() && <span className="error-text">Добавьте текст публикации</span>}
                <div className="editor-hint"><Icon data={CircleInfo} size={15}/><span>Форматируйте текст с помощью панели инструментов или Markdown.</span><Button view="flat" size="xs" onClick={() => setHelp(true)}>Шпаргалка <Icon data={ArrowUpRight} size={12}/></Button></div>
                <div className="tags-field"><label className="field-label" htmlFor="tags">Теги <span className="optional">необязательно</span></label><div className="tags-control"><div className="tag-chips">{tags.map(tag => <Label key={tag} size="s" type="close" onCloseClick={() => {setTags(tags.filter(t => t !== tag)); setSaved(false);}} closeButtonLabel={`Удалить тег ${tag}`}>{tag}</Label>)}</div><TextInput id="tags" view="clear" value={tagInput} onUpdate={setTagInput} placeholder="Добавить тег…" onBlur={addTag} onKeyDown={e => {if (e.key === 'Enter' || e.key === ',') {e.preventDefault(); addTag();}}}/></div><span className="field-hint">Помогают быстрее находить публикации. Нажмите Enter, чтобы добавить.</span></div>
              </div>
            </section>
            <div className="sidebar">
              <section className="settings-card"><Text as="h2" variant="subheader-2">Настройки публикации</Text><div className="setting-field"><label className="field-label" htmlFor="category">Раздел</label><Select id="category" width="max" size="l" value={category} onUpdate={v => {setCategory(v); setSaved(false);}} options={[{value: 'news', content: 'Новости команды'}, {value: 'knowledge', content: 'База знаний'}, {value: 'ideas', content: 'Идеи и предложения'}]}/><span className="field-hint">Где появится ваша публикация</span></div><div className="setting-field"><label className="field-label" htmlFor="visibility">Кто может читать</label><Select id="visibility" size="l" width="max" value={visibility} onUpdate={v => {setVisibility(v); setSaved(false);}} options={[{value: 'team', content: 'Все участники'}, {value: 'private', content: 'Только я'}]}/><span className="visibility-hint"><Icon data={Globe} size={14}/>{visibility[0] === 'team' ? 'Участники рабочего пространства' : 'Личная публикация'}</span></div><div className="notify-row"><div><Text variant="body-2">Уведомить участников</Text><span className="field-hint">О новой публикации</span></div><Switch checked={notify} onUpdate={v => {setNotify(v); setSaved(false);}} aria-label="Уведомить участников"/></div></section>
              <section className="tips-card"><div className="tips-heading"><span className="tip-spark">✧</span><Text as="h2" variant="subheader-2">Сначала мысли,<br/>потом оформление</Text></div><Text as="p" variant="body-1" color="secondary">Markdown помогает сосредоточиться на тексте. Несколько символов — и всё на своих местах.</Text><div className="syntax-examples"><div><code>**Текст**</code><strong>Жирный</strong></div><div><code>*Текст*</code><em>Курсив</em></div><div><code>## Заголовок</code><b>Заголовок</b></div><div><code>[Текст](url)</code><span className="example-link">Ссылка</span></div><div><code>- Пункт</code><span>• &nbsp; Список</span></div></div><Button view="flat" size="m" width="max" className="all-syntax" onClick={() => setHelp(true)}>Все возможности Markdown <Icon data={ArrowUpRight} size={14}/></Button></section>
              <div className="draft-note"><Icon data={FileText} size={17}/><span>Ещё не готовы поделиться?<br/>Сохраните текст в черновиках.</span></div>
            </div>
          </div>
          <footer className="form-footer"><span className="save-state"><Icon data={Check} size={15}/>{saved ? 'Черновик сохранён' : 'Сохраните, чтобы продолжить позже'}</span><div className="footer-actions"><Button size="l" view="outlined" onClick={save}>Сохранить черновик</Button><Button size="l" view="action" type="submit"><Icon data={PaperPlane} size={16}/> Опубликовать</Button></div></footer>
        </form>
        <div className="page-bottom"><span>Ваши идеи заслуживают хорошего оформления.</span><span>Сделано для совместной работы <span className="small-spark">✳</span></span></div>
      </main>
      {notice && <div className="toast" role="status"><Icon data={CircleInfo} size={18}/>{notice}</div>}
      <Modal open={help} onOpenChange={setHelp} aria-labelledby="markdown-help"><div className="help-modal"><span className="modal-eyebrow">ПИШИТЕ ПРОСТО. ОФОРМЛЯЙТЕ ЛЕГКО.</span><Text as="h2" variant="header-1" id="markdown-help">Шпаргалка по Markdown</Text><p>Добавляйте эти символы в редакторе и сразу смотрите результат.</p><div className="help-table">{[['# Заголовок', 'Заголовок первого уровня'], ['## Подзаголовок', 'Заголовок второго уровня'], ['**Жирный текст**', 'Выделение главной мысли'], ['*Курсив*', 'Мягкий акцент'], ['- Пункт списка', 'Маркированный список'], ['1. Пункт списка', 'Нумерованный список'], ['[Текст](https://example.com)', 'Ссылка'], ['> Цитата', 'Блок с цитатой'], ['`код`', 'Фрагмент кода']].map(([syntax, label]) => <div key={syntax}><code>{syntax}</code><span>{label}</span></div>)}</div><Button view="action" size="l" onClick={() => setHelp(false)} width="max"><Icon data={ArrowLeft} size={16}/> Вернуться к тексту</Button></div></Modal>
    </div>
  );
}
