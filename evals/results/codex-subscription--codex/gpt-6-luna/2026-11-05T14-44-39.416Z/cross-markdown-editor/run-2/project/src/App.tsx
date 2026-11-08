import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

const starterText = `## Коротко о задаче\n\nОпишите, что нужно сделать, и добавьте полезные детали. Markdown поможет **выделить главное**.\n\n- Что уже известно\n- Какой результат ожидается\n\n> Можно вставлять ссылки, списки и даже таблицы.\n\n| Приоритет | Срок |\n|:--|:--|\n| Высокий | Сегодня |`;

function Icon({ name }: { name: 'spark' | 'file' | 'eye' | 'bold' | 'italic' | 'list' | 'link' | 'code' | 'check' }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  const paths = {
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    bold: <><path d="M7 5h7a4 4 0 0 1 0 8H7z"/><path d="M7 13h8a4 4 0 0 1 0 8H7z"/></>,
    italic: <><path d="M19 4h-9M14 20H5M15 4 9 20"/></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.5.5l3-3A5 5 0 0 0 13.4 3.4l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/></>,
    code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export function App() {
  const [markdown, setMarkdown] = useState(starterText);
  const [title, setTitle] = useState('Подготовить описание задачи');
  const [category, setCategory] = useState('Рабочее');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after = before) => {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = markdown.slice(start, end) || 'текст';
    const next = `${markdown.slice(0, start)}${before}${selected}${after}${markdown.slice(end)}`;
    setMarkdown(next);
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  return (
    <main className="workspace">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Перо — главная"><span className="brand-mark"><Icon name="spark" /></span><span>перо</span></a>
        <div className="topbar-right"><span className="save-state"><span className="save-dot" />Все изменения сохранены</span><button className="avatar" aria-label="Профиль пользователя">А</button></div>
      </header>

      <div className="page" id="top">
        <div className="breadcrumbs"><span>Мои записи</span><span className="crumb-sep">/</span><span className="crumb-current">Новая запись</span></div>
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />НОВАЯ ЗАПИСЬ</div><h1>Создайте запись</h1><p className="page-subtitle">Соберите мысли в одном месте — форматирование появится сразу.</p></div><div className="step-indicator"><span className="step-count">01</span><span>из 01</span></div></div>

        <form className="entry-form" onSubmit={(event) => event.preventDefault()}>
          <section className="details-card" aria-labelledby="details-heading">
            <div className="section-heading"><span className="section-icon"><Icon name="file" /></span><div><h2 id="details-heading">Детали записи</h2><p>Дайте записи название и выберите категорию</p></div></div>
            <div className="details-fields">
              <label className="field"><span className="field-label">Название <span className="required">*</span></span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, идеи для проекта" required /></label>
              <label className="field category-field"><span className="field-label">Категория</span><span className="select-wrap"><select value={category} onChange={(event) => setCategory(event.target.value)}><option>Рабочее</option><option>Личное</option><option>Идеи</option><option>Без категории</option></select><span className="select-arrow">⌄</span></span></label>
            </div>
          </section>

          <section className="content-card" aria-labelledby="content-heading">
            <div className="content-head"><div className="section-heading"><span className="section-icon section-icon-lilac"><Icon name="spark" /></span><div><h2 id="content-heading">Содержание</h2><p>Пишите в Markdown, а результат смотрите рядом</p></div></div><span className="markdown-badge"><span className="markdown-hash">#</span> Markdown</span></div>
            <div className="editor-columns">
              <div className="editor-panel">
                <div className="panel-top"><div className="panel-title"><span className="live-dot" />Редактор</div><span className="panel-hint">Markdown</span></div>
                <div className="toolbar" aria-label="Инструменты форматирования">
                  <button type="button" onClick={() => insertMarkdown('**')} aria-label="Жирный текст"><Icon name="bold" /></button>
                  <button type="button" onClick={() => insertMarkdown('*')} aria-label="Курсив"><Icon name="italic" /></button><span className="toolbar-divider" />
                  <button type="button" onClick={() => insertMarkdown('\n- ', '')} aria-label="Маркированный список"><Icon name="list" /></button>
                  <button type="button" onClick={() => insertMarkdown('[', '](https://example.com)')} aria-label="Ссылка"><Icon name="link" /></button>
                  <button type="button" onClick={() => insertMarkdown('`')} aria-label="Код"><Icon name="code" /></button>
                  <span className="toolbar-spacer" /><span className="toolbar-markdown">M↓</span>
                </div>
                <textarea ref={editorRef} className="markdown-input" value={markdown} onChange={(event) => setMarkdown(event.target.value)} aria-label="Текст записи в Markdown" spellCheck="false" />
                <div className="editor-footer"><span><kbd>⌘</kbd> + <kbd>↵</kbd> для новой строки</span><span>{markdown.length} символов</span></div>
              </div>
              <div className="preview-panel">
                <div className="panel-top"><div className="panel-title"><Icon name="eye" />Предпросмотр</div><span className="preview-live"><span className="live-dot" />В реальном времени</span></div>
                <article className="markdown-preview"><ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown || '*Предпросмотр появится здесь…*'}</ReactMarkdown></article>
                <div className="preview-footer"><span className="preview-check"><Icon name="check" /></span>Так будет выглядеть ваша запись</div>
              </div>
            </div>
            <div className="format-note"><span className="note-icon">i</span><span>Поддерживаются заголовки, списки, ссылки, цитаты и таблицы.</span><a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noreferrer">Шпаргалка по Markdown <span aria-hidden="true">↗</span></a></div>
          </section>

          <div className="form-actions"><span className="draft-note"><span className="draft-icon"><Icon name="check" /></span>Запись сохранится в черновики</span><div className="action-buttons"><button type="button" className="button-secondary">Отмена</button><button type="submit" className="button-primary">Создать запись <span aria-hidden="true">→</span></button></div></div>
        </form>
        <footer className="page-footer"><span>© 2024 перо</span><span>Ваши мысли — в порядке</span></footer>
      </div>
    </main>
  );
}
