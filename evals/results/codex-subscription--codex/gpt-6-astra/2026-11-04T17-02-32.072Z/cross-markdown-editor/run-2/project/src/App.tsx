import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./styles.css";

type IconName =
  | "grid"
  | "file"
  | "book"
  | "settings"
  | "chevron"
  | "plus"
  | "arrow"
  | "check"
  | "eye"
  | "code"
  | "split"
  | "link"
  | "image"
  | "list"
  | "ordered"
  | "quote"
  | "expand"
  | "help"
  | "close"
  | "external"
  | "clock";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    file: (
      <>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
        <path d="M14 3v6h6M8 13h8M8 17h5" />
      </>
    ),
    book: (
      <>
        <path d="M12 5v16M3 4h5a4 4 0 0 1 4 3 4 4 0 0 1 4-3h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3Z" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-.6 2.5-2 .9-2.4-.7-2 3.5 1.8 1.8v2L2 14.8l2 3.5 2.4-.7 2 .9L9 21h4l.6-2.5 2-.9 2.4.7 2-3.5-1.8-1.8v-2L20 9.2l-2-3.5-2.4.7-2-.9L13 3Z" />
        <circle cx="11" cy="12" r="3" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="m14 7-5 5 5 5M9 12h12" />,
    check: <path d="m5 12 4 4L19 6" />,
    eye: (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    code: <path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16" />,
    split: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M12 4v16" />
      </>
    ),
    link: (
      <>
        <path d="m10 13 4-4M8 15l-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m2 2 1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8" cy="8" r="1.5" />
        <path d="m3 17 5-5 4 4 4-6 5 7" />
      </>
    ),
    list: (
      <>
        <path d="M9 6h12M9 12h12M9 18h12" />
        <path d="M3 6h1M3 12h1M3 18h1" />
      </>
    ),
    ordered: (
      <>
        <path d="M10 6h11M10 12h11M10 18h11M3 4h1v5M3 13c3-2 4 1 1 3l-1 2h3" />
      </>
    ),
    quote: (
      <>
        <path d="M10 6H4v7h6V6ZM20 6h-6v7h6V6ZM10 13c0 4-2 5-4 5m14-5c0 4-2 5-4 5" />
      </>
    ),
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1-1.5 3M12 17h.01" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    external: (
      <path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
const initialMarkdown = `## Хорошие идеи начинаются с заметки

Это пространство для ваших мыслей. Пишите, добавляйте
детали и превращайте идеи в **что-то большее**.

### Что можно добавить?

- **Главное** — выделите жирным
- *Настроение* — передайте курсивом
- [Полезную ссылку](https://www.markdownguide.org)

> Не ждите идеального момента. Просто начните писать.

### Небольшой план

1. Поймать идею
2. Записать самое важное
3. Поделиться с командой

\`\`\`javascript
const idea = "Сделать что-то классное";
console.log(idea);
\`\`\``;
type Draft = { title: string; content: string };
const initialDraft: Draft = {
  title: "Место для хороших идей",
  content: initialMarkdown,
};
function readDraft(): Draft {
  try {
    const d = JSON.parse(localStorage.getItem("prostor-draft") || "null");
    return d && typeof d.title === "string" && typeof d.content === "string"
      ? d
      : initialDraft;
  } catch {
    return initialDraft;
  }
}

export function App() {
  const [draft, setDraft] = useState<Draft>(readDraft);
  const [mode, setMode] = useState<"split" | "write" | "preview">("split");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [section, setSection] = useState("Публикации");
  const [published, setPublished] = useState<Draft[]>(() => {
    try {
      const items = JSON.parse(
        localStorage.getItem("prostor-publications") || "[]",
      );
      return Array.isArray(items)
        ? items.filter(
            (item) =>
              item &&
              typeof item.title === "string" &&
              typeof item.content === "string",
          )
        : [];
    } catch {
      return [];
    }
  });
  const textarea = useRef<HTMLTextAreaElement>(null);
  const helpDialog = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!help) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = helpDialog.current;
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialog) return;
      const buttons = dialog.querySelectorAll<HTMLButtonElement>("button");
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      previousFocus?.focus();
    };
  }, [help]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelp(false);
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  function update(next: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...next }));
    setSaved(false);
  }
  function save() {
    try {
      localStorage.setItem("prostor-draft", JSON.stringify(draft));
      setSaved(true);
      setToast("Черновик сохранён в этом браузере");
    } catch {
      setToast("Не удалось сохранить черновик. Проверьте доступ к хранилищу.");
    }
  }
  function insert(before: string, after = "", placeholder = "текст") {
    const el = textarea.current;
    const start = el?.selectionStart ?? draft.content.length,
      end = el?.selectionEnd ?? start;
    const selected = draft.content.slice(start, end) || placeholder;
    update({
      content:
        draft.content.slice(0, start) +
        before +
        selected +
        after +
        draft.content.slice(end),
    });
    if (mode === "preview") setMode("split");
    requestAnimationFrame(() => {
      textarea.current?.focus();
      textarea.current?.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  }
  function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.content.trim()) {
      setToast("Добавьте текст публикации");
      textarea.current?.focus();
      return;
    }
    try {
      const next = [...published, { ...draft }];
      localStorage.setItem("prostor-publications", JSON.stringify(next));
      setPublished(next);
      setToast("Публикация добавлена в вашу локальную библиотеку");
    } catch {
      setToast("Не удалось сохранить публикацию");
    }
  }
  const wordCount = draft.content.trim()
    ? draft.content.trim().split(/\s+/).length
    : 0;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#" className="brand" onClick={() => setSection("Публикации")}>
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          простор<span className="brand-dot">.</span>
        </a>
        <button
          className="workspace"
          onClick={() =>
            setToast(
              "Вы в личном пространстве. Все материалы сохраняются в этом браузере.",
            )
          }
        >
          <span className="workspace-avatar">Л</span>
          <span>
            Личное пространство<small>Бесплатный план</small>
          </span>
          <span className="workspace-chevron">⌄</span>
        </button>
        <span className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</span>
        <nav>
          {(
            [
              ["grid", "Обзор"],
              ["file", "Публикации"],
              ["book", "Библиотека"],
            ] as const
          ).map(([icon, label]) => (
            <button
              key={label}
              className={"nav-item " + (section === label ? "active" : "")}
              onClick={() => setSection(label)}
            >
              <Icon name={icon} />
              {label}
              {label === "Публикации" && (
                <span className="nav-count">{published.length + 1}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="idea-card">
            <span className="idea-symbol">✳</span>
            <strong>У мыслей есть место</strong>
            <p>
              Собирайте идеи. Находите слова.
              <br />
              Создавайте что-то своё.
            </p>
            <button onClick={() => setHelp(true)}>
              Немного вдохновения <span>↗</span>
            </button>
          </div>
          <button className="support" onClick={() => setHelp(true)}>
            <Icon name="help" size={18} />
            Помощь и подсказки
            <Icon name="external" size={14} />
          </button>
          <div className="profile">
            <span className="profile-avatar">АК</span>
            <div>
              <strong>Александр</strong>
              <small>Личное пространство</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            Рабочее пространство
            <Icon name="chevron" size={13} />
            <span>{section}</span>
          </div>
          <span className="private-indicator">
            <span />
            Только для вас
          </span>
        </header>
        <main>
          {section === "Публикации" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">СЛОВА, КОТОРЫЕ ИМЕЮТ ЗНАЧЕНИЕ</div>
                  <h1>
                    Новая публикация
                    <span className="draft-badge">Черновик</span>
                  </h1>
                  <p>Дайте вашей идее форму. Всё начинается с первой строки.</p>
                </div>
                <button
                  className="quiet-button guide-button"
                  onClick={() => setHelp(true)}
                >
                  <Icon name="book" size={17} />
                  Как это работает
                  <Icon name="external" size={13} />
                </button>
              </div>
              <form onSubmit={publish}>
                <div className="title-field">
                  <label htmlFor="title">
                    Заголовок <span>*</span>
                  </label>
                  <input
                    id="title"
                    required
                    maxLength={120}
                    placeholder="Придумайте заголовок"
                    value={draft.title}
                    onChange={(e) => update({ title: e.target.value })}
                  />
                  <div className="field-hint">
                    Короткий заголовок, который передаёт главное.
                    <span>{draft.title.length}/120</span>
                  </div>
                </div>
                <div
                  className={"content-section " + (expanded ? "expanded" : "")}
                >
                  <div className="content-heading">
                    <label htmlFor="markdown">
                      Содержание <span>*</span>
                    </label>
                    <span className="markdown-badge">
                      <b>
                        M<span>↓</span>
                      </b>
                      Поддерживает Markdown
                    </span>
                  </div>
                  <div className={"editor-card mode-" + mode}>
                    <div className="editor-top">
                      <div className="view-switch" aria-label="Режим редактора">
                        {(
                          [
                            ["write", "code", "Редактор"],
                            ["split", "split", "Разделить"],
                            ["preview", "eye", "Просмотр"],
                          ] as const
                        ).map(([value, icon, label]) => (
                          <button
                            type="button"
                            key={value}
                            className={mode === value ? "selected" : ""}
                            onClick={() => setMode(value)}
                            aria-pressed={mode === value}
                          >
                            <Icon name={icon} size={16} />
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="live-status">
                        <span />
                        Обновляется при вводе
                      </div>
                      <button
                        type="button"
                        className="icon-button expand-button"
                        title={expanded ? "Свернуть редактор" : "На весь экран"}
                        onClick={() => setExpanded(!expanded)}
                      >
                        <Icon name={expanded ? "close" : "expand"} size={17} />
                      </button>
                    </div>
                    <div className="editor-panels">
                      {mode !== "preview" && (
                        <div className="source-pane">
                          <div className="format-toolbar">
                            <button
                              type="button"
                              title="Жирный (Ctrl+B)"
                              onClick={() => insert("**", "**")}
                            >
                              <b>B</b>
                            </button>
                            <button
                              type="button"
                              title="Курсив (Ctrl+I)"
                              onClick={() => insert("*", "*")}
                            >
                              <i>I</i>
                            </button>
                            <button
                              type="button"
                              title="Заголовок"
                              onClick={() => insert("\n## ", "", "Заголовок")}
                            >
                              <span className="heading-tool">
                                H<span>2</span>
                              </span>
                            </button>
                            <span className="toolbar-divider" />
                            <button
                              type="button"
                              title="Ссылка"
                              onClick={() =>
                                insert(
                                  "[",
                                  "](https://example.com)",
                                  "Текст ссылки",
                                )
                              }
                            >
                              <Icon name="link" size={17} />
                            </button>
                            <button
                              type="button"
                              title="Изображение по URL"
                              onClick={() =>
                                insert(
                                  "![",
                                  "](https://example.com/image.jpg)",
                                  "Описание изображения",
                                )
                              }
                            >
                              <Icon name="image" size={17} />
                            </button>
                            <span className="toolbar-divider" />
                            <button
                              type="button"
                              title="Маркированный список"
                              onClick={() => insert("\n- ", "", "Пункт списка")}
                            >
                              <Icon name="list" size={18} />
                            </button>
                            <button
                              type="button"
                              title="Нумерованный список"
                              onClick={() =>
                                insert("\n1. ", "", "Пункт списка")
                              }
                            >
                              <Icon name="ordered" size={18} />
                            </button>
                            <button
                              type="button"
                              title="Цитата"
                              onClick={() => insert("\n> ", "", "Цитата")}
                            >
                              <Icon name="quote" size={17} />
                            </button>
                            <button
                              type="button"
                              title="Код"
                              onClick={() => insert("`", "`", "код")}
                            >
                              <Icon name="code" size={17} />
                            </button>
                          </div>
                          <textarea
                            ref={textarea}
                            id="markdown"
                            spellCheck={false}
                            value={draft.content}
                            placeholder="Начните писать… Markdown превратит текст в историю."
                            onChange={(e) =>
                              update({ content: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (
                                (e.ctrlKey || e.metaKey) &&
                                ["b", "i", "s"].includes(e.key.toLowerCase())
                              ) {
                                e.preventDefault();
                                const k = e.key.toLowerCase();
                                if (k === "s") save();
                                else
                                  insert(
                                    k === "b" ? "**" : "*",
                                    k === "b" ? "**" : "*",
                                  );
                              }
                            }}
                          />
                        </div>
                      )}
                      {mode !== "write" && (
                        <div className="preview-pane">
                          <div className="preview-heading">
                            <Icon name="eye" size={15} />
                            ПРЕДПРОСМОТР<span>Так увидят читатели</span>
                          </div>
                          <article className="markdown-preview">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {draft.content}
                            </ReactMarkdown>
                            {!draft.content && (
                              <div className="preview-empty">
                                <Icon name="file" size={32} />
                                <p>Здесь появится ваша история</p>
                                <small>Начните писать в редакторе слева</small>
                              </div>
                            )}
                          </article>
                        </div>
                      )}
                    </div>
                    <div className="editor-footer">
                      <span>
                        {wordCount} слов<span className="footer-dot">·</span>
                        {draft.content.length} символов
                      </span>
                      <button type="button" onClick={() => setHelp(true)}>
                        <Icon name="help" size={14} />
                        Шпаргалка по Markdown
                        <Icon name="external" size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="editor-note">
                    <span className="sparkle">✧</span>Пишите свободно —
                    форматирование появляется само.
                  </div>
                </div>
                <div className="form-actions">
                  <span className="draft-info">
                    <Icon name={saved ? "check" : "clock"} size={17} />
                    {saved
                      ? "Черновик сохранён в браузере"
                      : "Ваши идеи пока видны только вам"}
                  </span>
                  <div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={save}
                    >
                      <Icon name="check" size={17} />
                      {saved ? "Сохранено" : "Сохранить черновик"}
                    </button>
                    <button type="submit" className="primary-button">
                      Опубликовать
                      <Icon name="chevron" size={16} />
                    </button>
                  </div>
                </div>
              </form>
              <footer className="page-footer">
                <span className="mini-brand">простор.</span>Место, где мысли
                становятся чем-то большим.
                <span className="footer-end">
                  Создавайте в своём ритме <span>✳</span>
                </span>
              </footer>
            </>
          ) : (
            <div className="library-view">
              <div className="eyebrow">ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО</div>
              <h1>
                {section === "Обзор" ? "Всё начинается с идеи" : "Библиотека"}
              </h1>
              <p>Ваши публикации хранятся в этом браузере.</p>
              <button
                className="primary-button"
                onClick={() => setSection("Публикации")}
              >
                <Icon name="plus" size={18} />
                Создать публикацию
              </button>
              <div className="publication-grid">
                {published.length ? (
                  published.map((item, i) => (
                    <article className="publication-card" key={i}>
                      <span className="published-tag">
                        <Icon name="check" size={14} />
                        Опубликовано локально
                      </span>
                      <h2>{item.title}</h2>
                      <div className="markdown-preview">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {item.content}
                        </ReactMarkdown>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-library">
                    <Icon name="book" size={40} />
                    <h2>Здесь будут ваши истории</h2>
                    <p>
                      Опубликуйте первый текст, чтобы сохранить его в
                      библиотеке.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
          <button aria-label="Закрыть уведомление" onClick={() => setToast("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            ref={helpDialog}
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              aria-label="Закрыть"
              onClick={() => setHelp(false)}
            >
              <Icon name="close" />
            </button>
            <span className="help-symbol">M↓</span>
            <h2 id="help-title">Чуть разметки. Больше смысла.</h2>
            <p>
              Добавьте эти символы к тексту — результат сразу появится в
              предпросмотре.
            </p>
            <div className="help-table">
              {[
                ["## Заголовок", "Заголовок раздела"],
                ["**Важная мысль**", "Жирный текст"],
                ["*Особое настроение*", "Курсив"],
                ["- Первый пункт", "Маркированный список"],
                ["1. Первый шаг", "Нумерованный список"],
                ["> Слова, которые вдохновляют", "Цитата"],
                ["[Название](https://example.com)", "Ссылка"],
                ["`ваш код`", "Код в строке"],
              ].map(([syntax, label]) => (
                <div key={syntax}>
                  <code>{syntax}</code>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <p className="help-tip">
              Совет: выделите текст и нажмите кнопку на панели. Используйте
              Ctrl/⌘ + B для жирного и Ctrl/⌘ + I для курсива.
            </p>
            <button className="primary-button" onClick={() => setHelp(false)}>
              Начать создавать
              <Icon name="chevron" size={16} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
