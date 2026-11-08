import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button, Modal } from "@gravity-ui/uikit";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./styles.css";

const initialText = `# Пространство для ваших идей

У каждого хорошего текста есть начало. Иногда это всего лишь **одна мысль**, которую хочется сохранить.

Здесь можно писать свободно, а Markdown поможет придать словам нужную форму.

## Начните с простого

- Запишите то, что вас вдохновляет
- Выделите **самое важное**
- Добавьте [полезную ссылку](https://www.markdownguide.org)

> Не ждите идеального момента. Просто начните писать.

А всё остальное — *сложится по ходу*.
`;
const storageKey = "stroka-markdown-draft";
type Draft = { title: string; content: string; savedAt: string };
type IconName =
  | "feather"
  | "file"
  | "chevron"
  | "arrow"
  | "check"
  | "help"
  | "code"
  | "link"
  | "image"
  | "list"
  | "numbered"
  | "quote"
  | "split"
  | "eye"
  | "close"
  | "download"
  | "copy"
  | "clock";
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    feather: (
      <>
        <path d="M20.2 3.8a5.5 5.5 0 0 1 0 7.8L10 21H3v-7L13 3.8a5.1 5.1 0 0 1 7.2 0Z" />
        <path d="m3 21 12-12M9 15h6" />
      </>
    ),
    file: (
      <>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
        <path d="M14 3v6h6M8 13h8M8 17h5" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1-1.5 2.5M12 17h.01" />
      </>
    ),
    code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" />,
    link: (
      <>
        <path
          d="m10 13 4-4m-6 6-1.5 1.5a3.5 3.5 0 0 1-5-5L6 7a3.5 3.5 0 0 1 5 0m2 10a3.5 3.5 0 0 0 5 0l4.5-4.5a3.5 3.5 0 0 0-5-5L16 9"
          transform="translate(0 -1) scale(.95)"
        />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8" cy="8" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
    list: <path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01" />,
    numbered: (
      <path d="M10 6h11M10 12h11M10 18h11M3 4h1v5M2 14c0-3 4-3 4 0 0 1-4 4-4 4h4" />
    ),
    quote: (
      <path d="M10 6H4v7h6V6Zm0 7c0 3-1 5-4 6M21 6h-6v7h6V6Zm0 7c0 3-1 5-4 6" />
    ),
    split: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M12 4v16" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />,
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </>
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
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function readDraft(): Draft | null {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "null");
    return value &&
      typeof value.title === "string" &&
      typeof value.content === "string" &&
      typeof value.savedAt === "string"
      ? value
      : null;
  } catch {
    return null;
  }
}

export function App() {
  const [savedDraft, setSavedDraft] = useState<Draft | null>(readDraft);
  const [title, setTitle] = useState(
    () => readDraft()?.title ?? "Место, где рождаются идеи",
  );
  const [content, setContent] = useState(
    () => readDraft()?.content ?? initialText,
  );
  const [mode, setMode] = useState<"split" | "preview">("split");
  const [dialog, setDialog] = useState<"help" | "drafts" | "publish" | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const dirty =
    !savedDraft || savedDraft.title !== title || savedDraft.content !== content;
  const words = content.trim() ? content.trim().split(/\s+/u).length : 0;

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function save() {
    const draft = { title, content, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setSavedDraft(draft);
      setNotice("Черновик сохранён в этом браузере");
    } catch {
      setNotice(
        "Не удалось сохранить черновик. Скачайте текст, чтобы не потерять его.",
      );
    }
  }

  function insert(
    before: string,
    after = "",
    placeholder = "текст",
    line = false,
  ) {
    const el = textarea.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const prefix = line && start > 0 && content[start - 1] !== "\n" ? "\n" : "";
    setContent(
      content.slice(0, start) +
        prefix +
        before +
        selected +
        after +
        content.slice(end),
    );
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + prefix.length + before.length,
        start + prefix.length + before.length + selected.length,
      );
    });
  }

  function download() {
    const blob = new Blob([`# ${title}\n\n${content}`], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.trim().replace(/[<>:"/\\|?*]/g, "") || "публикация"}.md`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Файл Markdown скачан");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Добавьте название публикации");
      titleRef.current?.focus();
      return;
    }
    if (!content.trim()) {
      setError("Напишите текст публикации");
      setMode("split");
      requestAnimationFrame(() => textarea.current?.focus());
      return;
    }
    setError("");
    setDialog("publish");
  }

  const tool = (label: string, children: ReactNode, onClick: () => void) => (
    <button
      type="button"
      className="tool-button"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
  const markdown = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ children, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Строка — редактор">
          <span className="brand-mark">
            <Icon name="feather" size={21} />
          </span>
          строка<span className="brand-period">.</span>
        </a>
        <span className="brand-divider" />
        <span className="workspace-name">
          Личное пространство <span className="workspace-badge">FREE</span>
        </span>
        <nav className="topnav" aria-label="Основная навигация">
          <button className="nav-link active" onClick={() => setDialog(null)}>
            <Icon name="file" size={16} />
            Редактор
          </button>
          <button className="nav-link" onClick={() => setDialog("drafts")}>
            Мои черновики{" "}
            <span className="draft-count">{savedDraft ? 1 : 0}</span>
          </button>
        </nav>
        <button
          className="help-button"
          onClick={() => setDialog("help")}
          aria-label="Справка по Markdown"
          title="Справка"
        >
          <Icon name="help" size={20} />
        </button>
        <div className="avatar" title="Личное пространство">
          ВЫ
        </div>
      </header>

      <main>
        <div className="breadcrumb">
          <span>Личное пространство</span>
          <Icon name="chevron" size={12} />
          <span>Редактор</span>
        </div>
        <form onSubmit={submit}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШИ МЫСЛИ ОБРЕТАЮТ ФОРМУ</div>
              <h1>
                Новая публикация<span className="heading-dot">.</span>
              </h1>
              <p>Сосредоточьтесь на словах. Оформление мы берём на себя.</p>
            </div>
            <div className="page-actions">
              <Button
                size="l"
                view="outlined"
                type="button"
                className="save-button"
                onClick={save}
              >
                <Icon name="check" size={17} />
                Сохранить черновик
              </Button>
              <Button
                size="l"
                view="action"
                type="submit"
                className="primary-button"
              >
                Готово <Icon name="arrow" size={17} />
              </Button>
            </div>
          </div>

          <section className="form-card" aria-label="Форма публикации">
            <div className="title-field">
              <label htmlFor="publication-title">
                Название публикации <span>*</span>
              </label>
              <input
                id="publication-title"
                ref={titleRef}
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError("");
                }}
                placeholder="Дайте своей идее название"
                maxLength={180}
                autoComplete="off"
                aria-invalid={!!error && !title.trim()}
              />
            </div>
            <div className="content-label">
              <label htmlFor="markdown-content">
                Содержание <span>*</span>
              </label>
              <span className="markdown-badge">
                <Icon name="code" size={13} /> Markdown
              </span>
            </div>

            <div className="editor-frame">
              <div className="editor-toolbar">
                <div
                  className={`format-tools ${mode === "preview" ? "tools-hidden" : ""}`}
                  role="toolbar"
                  aria-label="Форматирование текста"
                >
                  {tool(
                    "Заголовок",
                    <span className="heading-tool">
                      H<span>2</span>
                    </span>,
                    () => insert("## ", "", "Заголовок", true),
                  )}
                  <span className="tool-divider" />
                  {tool("Жирный (Ctrl+B)", <b>B</b>, () => insert("**", "**"))}
                  {tool("Курсив (Ctrl+I)", <i>I</i>, () => insert("*", "*"))}
                  {tool("Зачёркнутый", <s>S</s>, () => insert("~~", "~~"))}
                  <span className="tool-divider" />
                  {tool("Маркированный список", <Icon name="list" />, () =>
                    insert("- ", "", "Пункт списка", true),
                  )}
                  {tool("Нумерованный список", <Icon name="numbered" />, () =>
                    insert("1. ", "", "Пункт списка", true),
                  )}
                  {tool("Цитата", <Icon name="quote" size={17} />, () =>
                    insert("> ", "", "Цитата", true),
                  )}
                  <span className="tool-divider" />
                  {tool("Ссылка", <Icon name="link" />, () =>
                    insert("[", "](https://example.com)", "текст ссылки"),
                  )}
                  {tool("Код", <Icon name="code" />, () =>
                    insert("`", "`", "код"),
                  )}
                  {tool("Изображение", <Icon name="image" />, () =>
                    insert(
                      "![",
                      "](https://example.com/image.jpg)",
                      "описание изображения",
                    ),
                  )}
                </div>
                <div className="view-switch" aria-label="Режим редактора">
                  <button
                    type="button"
                    aria-label="Редактор и предпросмотр"
                    title="Редактор и предпросмотр"
                    aria-pressed={mode === "split"}
                    className={mode === "split" ? "selected" : ""}
                    onClick={() => setMode("split")}
                  >
                    <Icon name="split" size={16} />
                    <span>Разделить</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Только предпросмотр"
                    title="Только предпросмотр"
                    aria-pressed={mode === "preview"}
                    className={mode === "preview" ? "selected" : ""}
                    onClick={() => setMode("preview")}
                  >
                    <Icon name="eye" size={17} />
                  </button>
                </div>
              </div>

              <div
                className={`editor-panels ${mode === "preview" ? "preview-only" : ""}`}
              >
                {mode === "split" && (
                  <div className="source-panel">
                    <div className="panel-heading">
                      <span>ИСХОДНЫЙ ТЕКСТ</span>
                      <span className="file-extension">.md</span>
                    </div>
                    <textarea
                      id="markdown-content"
                      ref={textarea}
                      value={content}
                      onChange={(event) => {
                        setContent(event.target.value);
                        setError("");
                      }}
                      placeholder="Начните писать… Используйте # для заголовков, ** для жирного текста и - для списков."
                      spellCheck={false}
                      aria-describedby="markdown-hint"
                      aria-invalid={!!error && !content.trim()}
                      onKeyDown={(event) => {
                        if (event.ctrlKey || event.metaKey) {
                          const key = event.key.toLowerCase();
                          if (key === "b" || key === "i") {
                            event.preventDefault();
                            insert(
                              key === "b" ? "**" : "*",
                              key === "b" ? "**" : "*",
                            );
                          }
                          if (key === "s") {
                            event.preventDefault();
                            save();
                          }
                        }
                      }}
                    />
                  </div>
                )}
                <div className="preview-panel">
                  <div className="panel-heading">
                    <span>
                      <Icon name="eye" size={14} /> ПРЕДПРОСМОТР
                    </span>
                    <span className="live-label">
                      <span />В реальном времени
                    </span>
                  </div>
                  <article
                    className={`markdown-preview ${!content.trim() ? "empty-preview" : ""}`}
                    aria-label="Предпросмотр Markdown"
                  >
                    {content.trim() ? (
                      markdown
                    ) : (
                      <div>
                        <Icon name="feather" size={32} />
                        <h3>Здесь появится ваш текст</h3>
                        <p>Начните писать слева — и сразу увидите результат.</p>
                      </div>
                    )}
                  </article>
                </div>
              </div>

              <div className="editor-status">
                <span>
                  <span className="status-dot" />
                  Все изменения видны сразу
                </span>
                <div>
                  <span>{words} слов</span>
                  <span className="status-separator" />
                  <span>{content.length} символов</span>
                </div>
              </div>
            </div>
            <div className="field-hint" id="markdown-hint">
              <span>
                <Icon name="help" size={15} />
                Пишите с Markdown — форматирование появится справа.
              </span>
              <button type="button" onClick={() => setDialog("help")}>
                Шпаргалка по Markdown <Icon name="arrow" size={14} />
              </button>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </section>
          <div className="below-card">
            <span>
              <Icon name={dirty ? "clock" : "check"} size={15} />
              {dirty
                ? "Есть несохранённые изменения"
                : "Черновик сохранён в этом браузере"}
            </span>
            <span>Немного разметки. Больше выразительности.</span>
          </div>
        </form>

        <aside className="tips-card">
          <div className="tip-icon">✦</div>
          <div>
            <strong>Меньше отвлечений, больше мыслей.</strong>
            <p>
              Выделите текст и выберите форматирование на панели. Или
              используйте привычные сочетания клавиш.
            </p>
          </div>
          <span className="shortcut">
            <kbd>Ctrl</kbd> + <kbd>B</kbd>
            <span>жирный</span>
          </span>
          <span className="shortcut">
            <kbd>Ctrl</kbd> + <kbd>I</kbd>
            <span>курсив</span>
          </span>
        </aside>
        <footer>
          <span className="footer-brand">строка.</span>
          <span>Место для ваших слов.</span>
          <span className="footer-right">
            Создавайте с удовольствием <span>↗</span>
          </span>
        </footer>
      </main>

      <Modal
        open={dialog !== null}
        onClose={() => setDialog(null)}
        contentClassName={`dialog ${dialog === "publish" ? "document-dialog" : ""}`}
        aria-label={
          dialog === "help"
            ? "Шпаргалка по Markdown"
            : dialog === "drafts"
              ? "Мои черновики"
              : "Готовая публикация"
        }
      >
        <button
          className="dialog-close"
          onClick={() => setDialog(null)}
          aria-label="Закрыть"
        >
          <Icon name="close" />
        </button>
        {dialog === "help" && (
          <>
            <div className="dialog-icon">
              <Icon name="code" size={24} />
            </div>
            <h2>Всё начинается с Markdown</h2>
            <p className="dialog-description">
              Простая разметка для выразительных текстов.
            </p>
            <div className="cheatsheet">
              {[
                ["# Заголовок", "Заголовок первого уровня"],
                ["## Подзаголовок", "Заголовок второго уровня"],
                ["**жирный текст**", "Жирный текст"],
                ["*курсив*", "Курсив"],
                ["~~текст~~", "Зачёркнутый текст"],
                ["- Пункт списка", "Маркированный список"],
                ["1. Пункт списка", "Нумерованный список"],
                ["> Цитата", "Цитата"],
                ["[текст](https://example.com)", "Ссылка"],
                ["`код`", "Встроенный код"],
                ["```\nкод\n```", "Блок кода"],
                ["![описание](https://example.com/image.jpg)", "Изображение"],
              ].map(([syntax, description]) => (
                <div key={syntax}>
                  <code>{syntax}</code>
                  <span>{description}</span>
                </div>
              ))}
            </div>
            <p className="dialog-footnote">
              Также поддерживаются таблицы и списки задач:{" "}
              <code>- [x] Готово</code>.
            </p>
          </>
        )}
        {dialog === "drafts" && (
          <>
            <div className="dialog-icon">
              <Icon name="file" size={24} />
            </div>
            <h2>Мои черновики</h2>
            <p className="dialog-description">
              Ваш последний черновик хранится в этом браузере.
            </p>
            {savedDraft ? (
              <div className="draft-item">
                <Icon name="file" size={25} />
                <div>
                  <strong>{savedDraft.title || "Без названия"}</strong>
                  <p>{new Date(savedDraft.savedAt).toLocaleString("ru-RU")}</p>
                </div>
                <Button
                  view="outlined"
                  onClick={() => {
                    if (
                      !dirty ||
                      window.confirm(
                        "Открыть сохранённый черновик? Несохранённые изменения будут заменены.",
                      )
                    ) {
                      setTitle(savedDraft.title);
                      setContent(savedDraft.content);
                      setError("");
                      setDialog(null);
                    }
                  }}
                >
                  Открыть
                </Button>
              </div>
            ) : (
              <div className="no-drafts">
                <p>Пока здесь чистый лист.</p>
                <span>
                  Нажмите «Сохранить черновик», и ваш текст появится здесь.
                </span>
              </div>
            )}
          </>
        )}
        {dialog === "publish" && (
          <>
            <div className="ready-label">
              <span className="status-dot" />
              ВАШ ТЕКСТ ГОТОВ
            </div>
            <h2>{title}</h2>
            <article className="markdown-preview published-preview">
              {markdown}
            </article>
            <div className="dialog-actions">
              <Button
                size="l"
                view="outlined"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `# ${title}\n\n${content}`,
                    );
                    setNotice("Markdown скопирован");
                  } catch {
                    setNotice(
                      "Не удалось скопировать. Скачайте файл Markdown.",
                    );
                  }
                }}
              >
                <Icon name="copy" size={16} />
                Скопировать
              </Button>
              <Button
                size="l"
                view="action"
                className="primary-button"
                onClick={download}
              >
                <Icon name="download" size={17} />
                Скачать .md
              </Button>
            </div>
          </>
        )}
      </Modal>
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={17} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Скрыть уведомление">
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
