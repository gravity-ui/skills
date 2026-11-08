import { useMemo, useState } from 'react';
import './App.css';

const starterText = `## Коротко о проекте

Расскажите, что вы создаёте и **для кого**. Предпросмотр обновляется сразу, пока вы пишете.

- Добавляйте списки и ссылки
- Выделяйте важное **жирным** или *курсивом*

> Хорошее описание помогает команде быстро понять идею.`;

type InlinePart = { kind: 'text' | 'strong' | 'em' | 'code' | 'strike' | 'link'; value: string; href?: string };

function inlineParts(source: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ kind: 'text', value: source.slice(cursor, index) });
    const token = match[0];
    if (token.startsWith('**') || token.startsWith('__')) {
      parts.push({ kind: 'strong', value: token.slice(2, -2) });
    } else if (token.startsWith('~~')) {
      parts.push({ kind: 'strike', value: token.slice(2, -2) });
    } else if (token.startsWith('`')) {
      parts.push({ kind: 'code', value: token.slice(1, -1) });
    } else if (token.startsWith('*') || token.startsWith('_')) {
      parts.push({ kind: 'em', value: token.slice(1, -1) });
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const href = link[2].trim();
        parts.push({ kind: 'link', value: link[1], href: /^(https?:|mailto:)/i.test(href) ? href : undefined });
      }
    }
    cursor = index + token.length;
  }
  if (cursor < source.length) parts.push({ kind: 'text', value: source.slice(cursor) });
  return parts;
}

function Inline({ text }: { text: string }) {
  return <>{inlineParts(text).map((part, index) => {
    switch (part.kind) {
      case 'strong': return <strong key={index}>{part.value}</strong>;
      case 'em': return <em key={index}>{part.value}</em>;
      case 'code': return <code key={index}>{part.value}</code>;
      case 'strike': return <del key={index}>{part.value}</del>;
      case 'link': return part.href ? <a key={index} href={part.href} target="_blank" rel="noreferrer">{part.value}</a> : <span key={index}>{part.value}</span>;
      default: return <span key={index}>{part.value}</span>;
    }
  })}</>;
}

function MarkdownPreview({ source }: { source: string }) {
  const blocks = useMemo(() => {
    const lines = source.replace(/\r/g, '').split('\n');
    const result: { type: string; value: string; level?: number }[] = [];
    let paragraph: string[] = [];
    let list: string[] = [];
    let code: string[] = [];
    let inCode = false;
    const flushParagraph = () => {
      if (paragraph.length) result.push({ type: 'p', value: paragraph.join(' ') });
      paragraph = [];
    };
    const flushList = () => {
      if (list.length) result.push({ type: 'ul', value: list.join('\n') });
      list = [];
    };
    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        if (inCode) {
          result.push({ type: 'pre', value: code.join('\n') });
          code = [];
          inCode = false;
        } else {
          flushParagraph(); flushList(); inCode = true;
        }
        continue;
      }
      if (inCode) { code.push(line); continue; }
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      const item = line.match(/^\s*[-*+]\s+(.+)$/);
      if (heading) {
        flushParagraph(); flushList();
        result.push({ type: 'h', value: heading[2], level: heading[1].length });
      } else if (item) {
        flushParagraph(); list.push(item[1]);
      } else if (/^>\s?/.test(line)) {
        flushParagraph(); flushList(); result.push({ type: 'quote', value: line.replace(/^>\s?/, '') });
      } else if (!line.trim()) {
        flushParagraph(); flushList();
      } else {
        flushList(); paragraph.push(line.trim());
      }
    }
    if (inCode) result.push({ type: 'pre', value: code.join('\n') });
    flushParagraph(); flushList();
    return result;
  }, [source]);

  if (!source.trim()) return <div className="preview-empty">Ваше форматированное описание появится здесь</div>;
  return <div className="markdown-content">{blocks.map((block, index) => {
    if (block.type === 'h') {
      const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3';
      return <Tag key={index}><Inline text={block.value} /></Tag>;
    }
    if (block.type === 'ul') return <ul key={index}>{block.value.split('\n').map((item, i) => <li key={i}><Inline text={item} /></li>)}</ul>;
    if (block.type === 'quote') return <blockquote key={index}><Inline text={block.value} /></blockquote>;
    if (block.type === 'pre') return <pre key={index}><code>{block.value}</code></pre>;
    return <p key={index}><Inline text={block.value} /></p>;
  })}</div>;
}

export function App() {
  const [value, setValue] = useState(starterText);
  const insert = (before: string, after = before, placeholder = 'текст') => {
    const field = document.querySelector<HTMLTextAreaElement>('.markdown-input');
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    setValue(next);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  return <main className="page-shell">
    <div className="editor-wrap">
      <header className="page-heading">
        <div className="eyebrow"><span className="eyebrow-dot" /> НОВАЯ ЗАПИСЬ</div>
        <h1>Опишите свою идею</h1>
        <p>Добавьте подробности, чтобы другие могли быстро разобраться в проекте.</p>
      </header>

      <section className="form-card" aria-label="Описание проекта">
        <div className="field-heading">
          <label htmlFor="description">Описание <span className="required">*</span></label>
          <span className="field-hint">Поддерживается Markdown</span>
        </div>

        <div className="split-editor">
          <div className="editor-pane">
            <div className="pane-title"><span>РЕДАКТОР</span><span className="live-indicator"><i /> Живой ввод</span></div>
            <div className="toolbar" aria-label="Форматирование текста">
              <button type="button" aria-label="Жирный" title="Жирный" onClick={() => insert('**')}><strong>B</strong></button>
              <button type="button" aria-label="Курсив" title="Курсив" onClick={() => insert('*')}><em>I</em></button>
              <span className="toolbar-divider" />
              <button type="button" aria-label="Заголовок" title="Заголовок" onClick={() => setValue((v) => `${v}\n\n## Заголовок`)}>H</button>
              <button type="button" aria-label="Список" title="Список" onClick={() => setValue((v) => `${v}\n- Пункт списка`)}>☷</button>
              <button type="button" aria-label="Ссылка" title="Ссылка" onClick={() => insert('[', '](https://example.com)', 'ссылка')}>↗</button>
            </div>
            <textarea
              id="description"
              className="markdown-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              spellCheck="false"
              aria-describedby="markdown-help"
            />
            <div className="editor-footer" id="markdown-help"><span>Markdown поддерживается</span><span>{value.length} символов</span></div>
          </div>

          <div className="preview-pane">
            <div className="pane-title"><span>ПРЕДПРОСМОТР</span><span className="preview-check">✓ Обновляется автоматически</span></div>
            <div className="preview-body"><MarkdownPreview source={value} /></div>
          </div>
        </div>
        <div className="card-footer"><span><span className="info-icon">i</span> Используйте Markdown, чтобы структурировать описание</span></div>
      </section>
      <div className="bottom-note"><span className="lock-icon">▣</span> Черновик виден только вам</div>
    </div>
  </main>;
}
