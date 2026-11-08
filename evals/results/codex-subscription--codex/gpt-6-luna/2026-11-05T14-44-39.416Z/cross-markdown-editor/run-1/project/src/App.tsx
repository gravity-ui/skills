import { useState, type FormEvent } from 'react';
import './app.css';

const initialText = `## Заметки к релизу\n\nМы подготовили несколько **важных обновлений**.\n\n- Быстрее загружаются страницы\n- Появилась тёмная тема\n- Исправлены мелкие ошибки\n\n> Обновление уже доступно всем пользователям.`;

type InlinePart = string | { kind: 'bold' | 'italic' | 'code' | 'link'; value: string; href?: string };

function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith('**') || token.startsWith('__')) {
      parts.push({ kind: 'bold', value: token.slice(2, -2) });
    } else if (token.startsWith('`')) {
      parts.push({ kind: 'code', value: token.slice(1, -1) });
    } else if (token.startsWith('[')) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) parts.push({ kind: 'link', value: link[1], href: link[2] });
    } else {
      parts.push({ kind: 'italic', value: token.slice(1, -1) });
    }
    cursor = match.index + token.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return parts;
}

function renderInline(text: string) {
  return parseInline(text).map((part, index) => {
    if (typeof part === 'string') return <span key={index}>{part}</span>;
    if (part.kind === 'bold') return <strong key={index}>{part.value}</strong>;
    if (part.kind === 'italic') return <em key={index}>{part.value}</em>;
    if (part.kind === 'code') return <code key={index}>{part.value}</code>;
    const safeHref = part.href && /^(https?:|mailto:|\/)/i.test(part.href) ? part.href : '#';
    return <a key={index} href={safeHref}>{part.value}</a>;
  });
}

function MarkdownPreview({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) code.push(lines[index++]);
      index += 1;
      blocks.push(<pre key={`code-${index}`}><code>{code.join('\n')}</code></pre>);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = `h${heading[1].length + 1}` as 'h2' | 'h3' | 'h4';
      blocks.push(<Tag key={`heading-${index}`}>{renderInline(heading[2])}</Tag>);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) quote.push(lines[index++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={`quote-${index}`}>{quote.map((item, i) => <p key={i}>{renderInline(item)}</p>)}</blockquote>);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      const matcher = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/;
      while (index < lines.length && matcher.test(lines[index])) items.push(lines[index++].replace(matcher, ''));
      const List = ordered ? 'ol' : 'ul';
      blocks.push(<List key={`list-${index}`}>{items.map((item, i) => <li key={i}>{renderInline(item)}</li>)}</List>);
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^(#{1,3})\s|^>|^```|^\s*[-*+]\s+|^\s*\d+\.\s+/.test(lines[index])) {
      paragraph.push(lines[index++]);
    }
    blocks.push(<p key={`paragraph-${index}`}>{paragraph.map((item, i) => <span key={i}>{i > 0 && <br />}{renderInline(item)}</span>)}</p>);
  }

  return <div className="markdown-content">{blocks.length ? blocks : <p className="preview-empty">Здесь появится отформатированный текст</p>}</div>;
}

export function App() {
  const [text, setText] = useState(initialText);
  const [title, setTitle] = useState('Обновление продукта');
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Редактор, на главную"><span className="brand-mark">m</span><span>paper<span className="brand-muted">.work</span></span></a>
        <div className="topbar-note"><span className="status-dot" /> Все изменения сохраняются автоматически</div>
        <button className="avatar" type="button" aria-label="Профиль пользователя">А</button>
      </header>

      <section className="workspace">
        <div className="breadcrumb"><span>Рабочее пространство</span><span className="crumb-divider">/</span><span>Документы</span><span className="crumb-divider">/</span><span className="crumb-current">Новый документ</span></div>

        <form className="document-form" onSubmit={submit}>
          <div className="form-heading">
            <div>
              <div className="eyebrow">НОВЫЙ ДОКУМЕНТ</div>
              <h1>Создайте публикацию</h1>
              <p className="subtitle">Напишите текст — форматирование появится сразу.</p>
            </div>
            <span className="draft-badge"><span /> Черновик</span>
          </div>

          <label className="title-field">
            <span className="field-label">Название</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, обновление продукта" />
          </label>

          <div className="field-label body-label">Текст публикации <span className="optional-label">Markdown</span></div>
          <div className="editor-frame">
            <section className="editor-pane" aria-label="Ввод Markdown">
              <div className="pane-header"><div className="pane-title"><span className="edit-icon">✎</span> РЕДАКТОР</div><span className="pane-hint">Пишите в Markdown</span></div>
              <textarea aria-label="Текст с Markdown-разметкой" value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} placeholder="Начните писать..." />
              <div className="editor-footer"><span><span className="keyboard-icon">⌘</span> Markdown поддерживается</span><span>{text.length} знаков</span></div>
            </section>
            <div className="pane-separator" />
            <section className="preview-pane" aria-label="Предпросмотр форматирования">
              <div className="pane-header"><div className="pane-title"><span className="preview-icon">◉</span> ПРЕДПРОСМОТР</div><span className="live-badge"><span /> LIVE</span></div>
              <article className="preview-paper">
                <div className="preview-document-title">{title || 'Без названия'}</div>
                <MarkdownPreview text={text} />
              </article>
            </section>
          </div>

          <div className="markdown-tip"><span className="tip-icon">✦</span><span><strong>Небольшая подсказка</strong><span className="tip-copy">Используйте <code>**жирный**</code>, <code>*курсив*</code>, <code># заголовок</code> или <code>- список</code></span></span></div>

          <footer className="form-actions"><span className="privacy-note"><span className="lock-icon">▣</span> Видно только вам, пока не опубликуете</span><div className="action-buttons"><button className="secondary-button" type="button" onClick={() => { setTitle(''); setText(''); }}>Очистить</button><button className="primary-button" type="submit">{saved ? 'Сохранено ✓' : 'Сохранить черновик'} <span>→</span></button></div></footer>
        </form>
        <div className="workspace-footer"><span>Сделано для ясных мыслей</span><span>Помощь&nbsp;&nbsp; · &nbsp;&nbsp;Обратная связь</span></div>
      </section>
    </main>
  );
}
