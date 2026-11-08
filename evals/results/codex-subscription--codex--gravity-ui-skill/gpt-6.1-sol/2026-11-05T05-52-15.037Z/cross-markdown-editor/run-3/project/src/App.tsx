import {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Icon, Modal, SegmentedRadioGroup, Select, Text, TextInput} from '@gravity-ui/uikit';
import {ArrowsExpand, ArrowDownToLine, BookOpen, Check, ChevronRight, CircleQuestion, FileText, FloppyDisk, Eye, Xmark} from '@gravity-ui/icons';
import {MarkdownEditorView, YfmStaticView, useMarkdownEditor} from '@gravity-ui/markdown-editor';
import MarkdownIt from 'markdown-it';
import './App.css';

const INITIAL_MARKDOWN = `# Привет, команда! 👋

Здесь начинается что-то хорошее. Это пространство для **ваших идей**, заметок и новых знаний.

## С чего начнём

- Соберём полезные материалы
- Поделимся идеями с командой
- Превратим планы в действия

> Большие дела начинаются с маленькой заметки.

Добавьте [полезную ссылку](https://diplodoc.com/ru) или выделите главное с помощью \`кода\`.
`;
const STORAGE_KEY = 'list-document-draft-v1';
const parser = new MarkdownIt({html: false, linkify: true, breaks: false});
const sections = [
  {value: 'general', content: 'Общие документы'},
  {value: 'team', content: 'Команда'},
  {value: 'ideas', content: 'Идеи и заметки'},
  {value: 'guides', content: 'Руководства'},
];
type Draft = {title: string; content: string; section: string};

function readDraft(): Draft {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (draft && typeof draft.title === 'string' && typeof draft.content === 'string' && sections.some((section) => section.value === draft.section)) return draft;
  } catch { /* A new document remains usable if browser storage is unavailable. */ }
  return {title: '', content: INITIAL_MARKDOWN, section: 'general'};
}

const cheatsheet = [
  ['# Заголовок', 'Заголовок первого уровня'],
  ['## Подзаголовок', 'Заголовок второго уровня'],
  ['**жирный текст**', 'Выделить главное'],
  ['*курсив*', 'Добавить акцент'],
  ['- Пункт списка', 'Маркированный список'],
  ['1. Пункт списка', 'Нумерованный список'],
  ['[текст](https://example.com)', 'Добавить ссылку'],
  ['> Цитата', 'Выделить цитату'],
  ['`код`', 'Код внутри строки'],
];

export function App() {
  const [initial] = useState(readDraft);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [section, setSection] = useState(initial.section);
  const [mode, setMode] = useState('markup');
  const [showPreview, setShowPreview] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [createdOpen, setCreatedOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [storageState, setStorageState] = useState<'saving' | 'saved' | 'error'>('saving');
  const [notice, setNotice] = useState('');

  const editor = useMarkdownEditor({
    preset: 'commonmark',
    md: {html: false, linkify: true},
    initial: {markup: initial.content, mode: 'markup', toolbarVisible: true},
    markupConfig: {placeholder: 'Начните писать здесь… Markdown поможет оформить ваши мысли.'},
    wysiwygConfig: {placeholderOptions: {value: 'Начните писать здесь…'}},
  });

  useEffect(() => {
    const onChange = () => setContent(editor.getValue());
    const onModeChange = ({mode: nextMode}: {mode: string}) => setMode(nextMode);
    const onSubmit = () => (document.getElementById('document-form') as HTMLFormElement | null)?.requestSubmit();
    editor.on('change', onChange);
    editor.on('change-editor-mode', onModeChange);
    editor.on('submit', onSubmit);
    return () => {
      editor.off('change', onChange);
      editor.off('change-editor-mode', onModeChange);
      editor.off('submit', onSubmit);
    };
  }, [editor]);

  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({title, content, section}));
      setStorageState('saved');
      return true;
    } catch {
      setStorageState('error');
      return false;
    }
  }, [title, content, section]);

  useEffect(() => {
    setStorageState('saving');
    const timeout = window.setTimeout(saveDraft, 700);
    window.addEventListener('pagehide', saveDraft);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('pagehide', saveDraft);
    };
  }, [saveDraft]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  const html = useMemo(() => parser.render(content), [content]);
  const wordCount = content.trim() ? content.trim().split(/\s+/u).length : 0;
  const titleInvalid = submitted && !title.trim();
  const contentInvalid = submitted && !content.trim();

  function downloadDocument() {
    const blob = new Blob([content], {type: 'text/markdown;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${title.trim().replace(/[\\/:*?"<>|]/g, '-') || 'Документ'}.md`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function createDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!title.trim()) {
      document.getElementById('document-title')?.focus();
      return;
    }
    if (!content.trim()) {
      editor.focus();
      return;
    }
    if (saveDraft()) setCreatedOpen(true);
    else setNotice('Не удалось сохранить документ. Скачайте Markdown, чтобы сохранить текст.');
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand" aria-label="Лист">
          <span className="brand-mark"><Icon data={FileText} size={21} /></span>
          <span className="brand-name">лист<span className="brand-period">.</span></span>
        </div>
        <div className="header-divider" />
        <span className="workspace-name">Личное пространство</span>
        <div className="header-actions">
          <Button view="flat-secondary" size="m" onClick={() => setHelpOpen(true)}><Icon data={CircleQuestion} size={16} /><span className="header-help-text">Помощь</span></Button>
          <span className="user-avatar" title="Алексей Козлов">АК</span>
        </div>
      </header>

      <main className="main">
        <nav className="breadcrumbs" aria-label="Навигационная цепочка"><Icon data={BookOpen} size={15} /><span>Документы</span><Icon data={ChevronRight} size={13} /><span className="breadcrumb-current">Новый документ</span></nav>
        <div className="page-heading">
          <div>
            <div className="heading-title-row"><Text as="h1" variant="header-2" className="page-title">Новый документ</Text><span className="draft-label">Черновик</span></div>
            <Text as="p" variant="body-2" color="secondary" className="page-description">Дайте мыслям форму. Всё остальное сделает Markdown.</Text>
          </div>
          <span className="private-note"><span className="private-dot" />Виден только вам</span>
        </div>

        <form id="document-form" onSubmit={createDocument} noValidate>
          <section className="document-details" aria-labelledby="details-heading">
            <div className="section-heading"><Text as="h2" variant="subheader-2" id="details-heading">О документе</Text><Text variant="caption-2" color="secondary">Начнём с главного</Text></div>
            <div className="details-grid">
              <div className="field">
                <label htmlFor="document-title">Название <span className="required-mark">*</span></label>
                <TextInput id="document-title" name="title" size="l" value={title} onUpdate={setTitle}
                  placeholder="Например, идеи для нового проекта" validationState={titleInvalid ? 'invalid' : undefined}
                  errorMessage={titleInvalid ? 'Добавьте название документа' : undefined} controlProps={{required: true, maxLength: 180}} />
              </div>
              <div className="field"><label htmlFor="document-section">Раздел</label><Select id="document-section" size="l" width="max" value={[section]} options={sections} onUpdate={(value) => setSection(value[0] || 'general')} /></div>
            </div>
          </section>

          <section className={`content-section${expanded ? ' content-section_expanded' : ''}`} aria-labelledby="content-heading">
            <div className="content-heading">
              <div className="content-title"><Text as="h2" variant="subheader-2" id="content-heading">Содержание <span className="required-mark">*</span></Text><Text variant="body-1" color="secondary">Пишите и сразу смотрите результат</Text></div>
              <Button view="flat-secondary" size="s" onClick={() => setHelpOpen(true)} className="syntax-link"><Icon data={BookOpen} size={15} />Шпаргалка по Markdown</Button>
            </div>
            <div className={`editor-card${!showPreview ? ' editor-card_no-preview' : ''}${contentInvalid ? ' editor-card_invalid' : ''}`}>
              <div className="editor-topbar">
                <div className="editor-tabs"><SegmentedRadioGroup size="m" value={mode} onUpdate={(value) => {
                  setMode(value); editor.setEditorMode(value as 'markup' | 'wysiwyg');
                }} aria-label="Режим редактора"><SegmentedRadioGroup.Option value="markup">Markdown</SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="wysiwyg">Визуальный</SegmentedRadioGroup.Option></SegmentedRadioGroup></div>
                <div className="editor-view-actions">
                  <Button view={showPreview ? 'flat' : 'flat-secondary'} size="s" selected={showPreview} onClick={() => setShowPreview(!showPreview)} aria-pressed={showPreview} title={showPreview ? 'Скрыть предпросмотр' : 'Показать предпросмотр'} aria-label={showPreview ? 'Скрыть предпросмотр' : 'Показать предпросмотр'}><Icon data={Eye} size={16} /><span className="preview-button-text">Предпросмотр</span></Button>
                  <span className="toolbar-separator" />
                  <Button view="flat-secondary" size="s" onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Свернуть редактор' : 'Развернуть редактор'} title={expanded ? 'Свернуть · Esc' : 'На весь экран'}><Icon data={expanded ? Xmark : ArrowsExpand} size={16} /></Button>
                </div>
              </div>
              <div className="editor-panels">
                <div className="source-pane" role="group" aria-label="Текст документа"><MarkdownEditorView editor={editor} stickyToolbar={false} settingsVisible={false} className="document-editor" /></div>
                {showPreview && <div className="preview-pane" aria-label="Предпросмотр документа">
                  <div className="preview-heading"><span>ПРЕДПРОСМОТР</span><span className="live-indicator"><span />В реальном времени</span></div>
                  <div className="preview-body">{content.trim() ? <YfmStaticView html={html} className="document-preview" /> : <div className="empty-preview"><Icon data={FileText} size={32} /><Text variant="subheader-2">Здесь появятся ваши мысли</Text><Text variant="body-1" color="secondary">Начните писать — форматирование появится сразу.</Text></div>}</div>
                </div>}
              </div>
              <div className="editor-statusbar"><span><span className="markdown-symbol">M↓</span>Markdown поддерживается</span><span>{content.length.toLocaleString('ru-RU')} символов<span className="statusbar-dot">·</span>{wordCount.toLocaleString('ru-RU')} слов</span></div>
            </div>
            {contentInvalid && <Text as="p" variant="body-1" color="danger" role="alert">Добавьте текст документа</Text>}
            <div className="tip"><span className="tip-icon"><Icon data={CircleQuestion} size={17} /></span><Text variant="body-1" color="secondary">Немного магии: <code>**текст**</code> станет <strong>жирным</strong>, <code>#</code> — заголовком, а <code>-</code> — списком.</Text></div>
          </section>

          <footer className="form-footer">
            <div className={`save-status${storageState === 'error' ? ' save-status_error' : ''}`} role="status">
              {storageState === 'saved' && <Icon data={Check} size={16} />}{storageState === 'saving' && <span className="saving-dot" />}
              <div><span>{storageState === 'saved' ? 'Черновик сохранён' : storageState === 'saving' ? 'Сохраняем изменения…' : 'Не удалось сохранить черновик'}</span><span className="save-status-caption">{storageState === 'error' ? 'Скачайте текст, чтобы не потерять изменения' : 'В этом браузере, только для вас'}</span></div>
            </div>
            <div className="form-actions">
              <Button view="outlined" size="l" type="button" onClick={() => {if (saveDraft()) setNotice('Черновик сохранён в этом браузере'); else downloadDocument();}}><Icon data={FloppyDisk} size={16} />Сохранить черновик</Button>
              <Button view="action" size="l" type="submit">Создать документ<Icon data={ChevronRight} size={16} /></Button>
            </div>
          </footer>
        </form>
        <div className="page-footnote">Место для мыслей, которыми хочется поделиться.</div>
      </main>

      <Modal open={helpOpen} onOpenChange={setHelpOpen} aria-labelledby="help-title" contentClassName="help-modal">
        <div className="modal-heading"><div><Text as="h2" variant="header-1" id="help-title">Markdown — это просто</Text><Text as="p" variant="body-2" color="secondary">Несколько символов, чтобы ваши мысли выглядели лучше.</Text></div><Button view="flat-secondary" onClick={() => setHelpOpen(false)} aria-label="Закрыть справку"><Icon data={Xmark} size={18} /></Button></div>
        <div className="cheatsheet"><div className="cheatsheet-header"><span>ВЫ ПИШЕТЕ</span><span>ПОЛУЧАЕТЕ</span></div>{cheatsheet.map(([syntax, description]) => <div className="cheatsheet-row" key={syntax}><code>{syntax}</code><span>{description}</span></div>)}</div>
        <div className="modal-footer"><Text variant="body-1" color="secondary">Выделите текст и используйте панель редактора — ещё проще.</Text><Button view="action" onClick={() => setHelpOpen(false)}>Понятно</Button></div>
      </Modal>
      <Modal open={createdOpen} onOpenChange={setCreatedOpen} aria-labelledby="created-title" contentClassName="created-modal">
        <div className="success-icon"><Icon data={Check} size={28} /></div><Text as="h2" variant="header-1" id="created-title">Документ готов</Text>
        <Text as="p" variant="body-2" color="secondary">«{title}» сохранён в этом браузере в разделе «{sections.find((item) => item.value === section)?.content}».</Text>
        <Text as="p" variant="body-1" color="secondary">Скачайте файл Markdown, чтобы поделиться им с командой.</Text>
        <div className="created-actions"><Button size="l" view="outlined" onClick={() => setCreatedOpen(false)}>К редактированию</Button><Button size="l" view="action" onClick={downloadDocument}><Icon data={ArrowDownToLine} size={16} />Скачать .md</Button></div>
      </Modal>
      {notice && <div className="toast" role="status"><Icon data={Check} size={18} />{notice}<Button view="flat-secondary" size="s" aria-label="Закрыть уведомление" onClick={() => setNotice('')}><Icon data={Xmark} size={14} /></Button></div>}
    </div>
  );
}
