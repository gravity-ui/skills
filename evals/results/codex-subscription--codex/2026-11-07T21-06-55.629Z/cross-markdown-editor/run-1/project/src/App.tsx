import { useEffect, useRef, useState } from "react";
import { Button } from "@gravity-ui/uikit";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./styles.css";

const initialText = `# Хорошие идеи начинаются с заметки

Иногда достаточно просто начать писать. А **Markdown**
поможет придать вашим мыслям красивую форму.

## Что можно добавить?

- **Важные мысли**, которые хочется сохранить
- *Вдохновение* для следующего проекта
- Список маленьких шагов к большой цели

> Не ждите идеального момента. Создайте его сами.

Больше о разметке — в [руководстве по Markdown](https://www.markdownguide.org/basic-syntax/).
`;
type Draft = { title: string; body: string; savedAt: string };
type IconName =
  | "pen"
  | "chevron"
  | "help"
  | "split"
  | "eye"
  | "expand"
  | "link"
  | "quote"
  | "list"
  | "ordered"
  | "code"
  | "check"
  | "close"
  | "arrow"
  | "file"
  | "spark"
  | "bulb"
  | "lock";
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    pen: (
      <>
        <path d="m15 4 5 5M4 20l5-1L20 8a2.8 2.8 0 0 0-4-4L5 15l-1 5Z" />
        <path d="M13 20h7" />
      </>
    ),
    chevron: <path d="m9 6 6 6-6 6" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1-1.5 2M12 16.5v.1" />
      </>
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
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
    link: (
      <>
        <path
          d="m10 13 4-4m-6 6-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m2 2 1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0"
          transform="translate(1 1)"
        />
      </>
    ),
    quote: (
      <path d="M5 7h5v6H5V7Zm9 0h5v6h-5V7ZM10 13c0 3-2 4-4 4m13-4c0 3-2 4-4 4" />
    ),
    list: (
      <>
        <path d="M9 6h12M9 12h12M9 18h12" />
        <circle cx="3" cy="6" r=".7" />
        <circle cx="3" cy="12" r=".7" />
        <circle cx="3" cy="18" r=".7" />
      </>
    ),
    ordered: (
      <path d="M10 6h11M10 12h11M10 18h11M3 4h1v5M2 13c3-3 5 0 2 2l-2 2h4" />
    ),
    code: <path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
    file: (
      <>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
        <path d="M14 3v6h6M8 13h8M8 17h5" />
      </>
    ),
    spark: (
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
    ),
    bulb: (
      <path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z" />
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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
    const draft = JSON.parse(localStorage.getItem("slovo-draft") || "null");
    return draft &&
      typeof draft.title === "string" &&
      typeof draft.body === "string" &&
      typeof draft.savedAt === "string"
      ? draft
      : null;
  } catch {
    return null;
  }
}
const syntaxExamples = [
  ["# Заголовок", "Большой заголовок"],
  ["## Подзаголовок", "Заголовок второго уровня"],
  ["**жирный**", "Жирное начертание"],
  ["*курсив*", "Курсивное начертание"],
  ["~~текст~~", "Зачёркнутый текст"],
  ["- Пункт списка", "Маркированный список"],
  ["1. Пункт списка", "Нумерованный список"],
  ["> Цитата", "Блок цитаты"],
  ["[текст](https://…)", "Ссылка"],
  ["`код`", "Фрагмент кода"],
  ["- [ ] Задача", "Список задач"],
];

export function App() {
  const [loadedDraft] = useState(readDraft);
  const [title, setTitle] = useState(
    loadedDraft?.title ?? "Моя первая заметка",
  );
  const [body, setBody] = useState(loadedDraft?.body ?? initialText);
  const [savedDraft, setSavedDraft] = useState<Draft | null>(loadedDraft);
  const [view, setView] = useState<"split" | "preview">("split");
  const [expanded, setExpanded] = useState(false);
  const [dialog, setDialog] = useState<"help" | "notes" | null>(null);
  const [toast, setToast] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const dirty =
    !savedDraft || savedDraft.body !== body || savedDraft.title !== title;
  const words = body.trim() ? body.trim().split(/\s+/u).length : 0;
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDialog(null);
        setExpanded(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!dialog && !expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [dialog, expanded]);
  function save() {
    const draft = { title, body, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem("slovo-draft", JSON.stringify(draft));
      setSavedDraft(draft);
      setToast("Заметка сохранена в этом браузере");
    } catch {
      setToast(
        "Не удалось сохранить заметку. Проверьте доступ к хранилищу браузера.",
      );
    }
  }
  function format(
    before: string,
    after = "",
    placeholder = "текст",
    block = false,
  ) {
    setView("split");
    const start = textarea.current?.selectionStart ?? body.length;
    const end = textarea.current?.selectionEnd ?? body.length;
    const selected = body.slice(start, end) || placeholder;
    const prefix =
      block && start > 0 && body[start - 1] !== "\n" ? "\n" + before : before;
    setBody(body.slice(0, start) + prefix + selected + after + body.slice(end));
    requestAnimationFrame(() => {
      textarea.current?.focus();
      textarea.current?.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length,
      );
    });
  }
  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#" aria-label="Слово — главная">
            <span className="brand-symbol">
              <Icon name="pen" size={21} />
            </span>
            слово<span className="brand-dot">.</span>
          </a>
          <nav className="main-nav" aria-label="Основная навигация">
            <button
              className="nav-item active"
              onClick={() => {
                setDialog(null);
                textarea.current?.focus();
              }}
            >
              Редактор
            </button>
            <button className="nav-item" onClick={() => setDialog("notes")}>
              Мои заметки
            </button>
          </nav>
          <div className="header-right">
            <span className="personal-space">Личное пространство</span>
            <span className="avatar" title="Личное пространство">
              А
            </span>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="breadcrumb">
          <span>Личное пространство</span>
          <Icon name="chevron" size={13} />
          <span>Редактор заметки</span>
        </div>
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span /> ПРОСТРАНСТВО ДЛЯ ИДЕЙ
            </div>
            <h1>
              Мысли — ваши. Форма — наша<span>.</span>
            </h1>
            <p>
              Пишите свободно. Добавляйте Markdown. Смотрите, как оживает текст.
            </p>
          </div>
          <div className="intro-art" aria-hidden="true">
            <div className="art-back">
              <span>#</span>
              <i />
              <i />
            </div>
            <div className="art-front">
              <span>Aa</span>
              <i />
              <i />
            </div>
            <span className="art-spark">
              <Icon name="spark" size={24} />
            </span>
          </div>
        </section>
        <form
          className="note-card"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="card-heading">
            <div className="card-heading-left">
              <span className="note-icon">
                <Icon name="file" size={20} />
              </span>
              <h2>Новая заметка</h2>
              <span className="draft-badge">Черновик</span>
            </div>
            <span className="private-note">
              <Icon name="lock" size={12} /> Только для вас
            </span>
          </div>
          <div className="form-content">
            <label className="field-label" htmlFor="note-title">
              Название заметки
            </label>
            <input
              className="title-input"
              id="note-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Дайте своей идее название"
              maxLength={200}
            />
            <div className="content-label">
              <label className="field-label" htmlFor="markdown-input">
                Содержание
              </label>
              <span>
                <span className="markdown-logo">M↓</span> Поддерживает Markdown
              </span>
            </div>
            <div className={`editor ${expanded ? "editor-expanded" : ""}`}>
              <div className="editor-toolbar">
                <div
                  className="format-tools"
                  role="toolbar"
                  aria-label="Форматирование текста"
                >
                  <button
                    type="button"
                    className="tool heading-tool"
                    title="Заголовок"
                    aria-label="Добавить заголовок"
                    onClick={() => format("## ", "", "Заголовок", true)}
                  >
                    H<span>2</span>
                  </button>
                  <span className="toolbar-divider" />
                  <button
                    type="button"
                    className="tool bold-tool"
                    title="Жирный (Ctrl/⌘ + B)"
                    aria-label="Жирный"
                    onClick={() => format("**", "**")}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    className="tool italic-tool"
                    title="Курсив (Ctrl/⌘ + I)"
                    aria-label="Курсив"
                    onClick={() => format("*", "*")}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className="tool strike-tool"
                    title="Зачёркнутый"
                    aria-label="Зачёркнутый"
                    onClick={() => format("~~", "~~")}
                  >
                    S
                  </button>
                  <span className="toolbar-divider" />
                  <button
                    type="button"
                    className="tool"
                    title="Ссылка"
                    aria-label="Добавить ссылку"
                    onClick={() =>
                      format("[", "](https://example.com)", "текст ссылки")
                    }
                  >
                    <Icon name="link" />
                  </button>
                  <button
                    type="button"
                    className="tool"
                    title="Цитата"
                    aria-label="Добавить цитату"
                    onClick={() => format("> ", "", "Цитата", true)}
                  >
                    <Icon name="quote" />
                  </button>
                  <span className="toolbar-divider" />
                  <button
                    type="button"
                    className="tool"
                    title="Маркированный список"
                    aria-label="Добавить список"
                    onClick={() => format("- ", "", "Пункт списка", true)}
                  >
                    <Icon name="list" />
                  </button>
                  <button
                    type="button"
                    className="tool"
                    title="Нумерованный список"
                    aria-label="Добавить нумерованный список"
                    onClick={() => format("1. ", "", "Пункт списка", true)}
                  >
                    <Icon name="ordered" />
                  </button>
                  <button
                    type="button"
                    className="tool"
                    title="Код"
                    aria-label="Добавить код"
                    onClick={() => format("`", "`", "код")}
                  >
                    <Icon name="code" />
                  </button>
                </div>
                <div className="view-tools">
                  <div className="view-switch" aria-label="Режим редактора">
                    <button
                      type="button"
                      className={view === "split" ? "selected" : ""}
                      aria-label="Редактор и предпросмотр"
                      aria-pressed={view === "split"}
                      title="Редактор и предпросмотр"
                      onClick={() => setView("split")}
                    >
                      <Icon name="split" size={16} />
                    </button>
                    <button
                      type="button"
                      className={view === "preview" ? "selected" : ""}
                      aria-label="Только предпросмотр"
                      aria-pressed={view === "preview"}
                      title="Только предпросмотр"
                      onClick={() => setView("preview")}
                    >
                      <Icon name="eye" size={17} />
                    </button>
                  </div>
                  <span className="toolbar-divider" />
                  <button
                    type="button"
                    className="tool"
                    title={expanded ? "Свернуть редактор" : "На весь экран"}
                    aria-label={
                      expanded ? "Свернуть редактор" : "На весь экран"
                    }
                    onClick={() => setExpanded(!expanded)}
                  >
                    <Icon name={expanded ? "close" : "expand"} size={17} />
                  </button>
                </div>
              </div>
              <div
                className={`editor-panes ${view === "preview" ? "preview-only" : ""}`}
              >
                {view === "split" && (
                  <section
                    className="source-pane"
                    aria-label="Markdown-редактор"
                  >
                    <div className="pane-heading">
                      <span>MARKDOWN</span>
                      <span className="source-heading-detail">
                        Просто начните писать
                      </span>
                    </div>
                    <textarea
                      id="markdown-input"
                      name="content"
                      ref={textarea}
                      spellCheck={false}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder={
                        "# Ваша история начинается здесь…\n\nНапишите что-нибудь. Форматирование появится справа."
                      }
                      onKeyDown={(e) => {
                        if (
                          (e.metaKey || e.ctrlKey) &&
                          ["b", "i", "s"].includes(e.key.toLowerCase())
                        ) {
                          e.preventDefault();
                          const key = e.key.toLowerCase();
                          if (key === "s") save();
                          else if (key === "b") format("**", "**");
                          else format("*", "*");
                        }
                      }}
                    />
                  </section>
                )}
                <section
                  className="preview-pane"
                  aria-label="Предпросмотр текста"
                >
                  <div className="pane-heading">
                    <span>ПРЕДПРОСМОТР</span>
                    <span className="live-label">
                      <i /> В реальном времени
                    </span>
                  </div>
                  <div className="markdown-preview">
                    {body.trim() ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ children, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {body}
                      </ReactMarkdown>
                    ) : (
                      <div className="preview-empty">
                        <Icon name="pen" size={30} />
                        <h3>Здесь появятся ваши мысли</h3>
                        <p>
                          Добавьте текст в редактор —<br />и сразу увидите
                          результат.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
              <div className="editor-status">
                <span>
                  {words} слов<span className="status-dot">·</span>
                  {body.length} символов
                </span>
                <button type="button" onClick={() => setDialog("help")}>
                  <Icon name="help" size={14} /> Шпаргалка Markdown
                </button>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <div className={`save-status ${!dirty ? "is-saved" : ""}`}>
              <Icon name={dirty ? "file" : "check"} size={16} />
              <span>
                {dirty
                  ? "Есть несохранённые изменения"
                  : "Все изменения сохранены"}
              </span>
            </div>
            <Button
              type="submit"
              view="action"
              size="l"
              className="save-button"
            >
              <Icon name="check" size={17} /> Сохранить заметку
            </Button>
          </div>
        </form>
        <aside className="tip-card">
          <span className="tip-icon">
            <Icon name="bulb" size={21} />
          </span>
          <div>
            <strong>Чуть меньше разметки. Чуть больше смысла.</strong>
            <p>
              Выделите текст и нажмите кнопку на панели — или используйте
              привычный Markdown.
            </p>
          </div>
          <button type="button" onClick={() => setDialog("help")}>
            Как это работает
            <Icon name="arrow" size={16} />
          </button>
        </aside>
        <footer className="page-footer">
          <span>Хорошим мыслям нужно место.</span>
          <span>
            Сделано с вниманием к словам{" "}
            <span className="footer-flower">✳</span>
          </span>
        </footer>
      </main>
      {dialog && (
        <div className="modal-backdrop" onClick={() => setDialog(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close tool"
              aria-label="Закрыть"
              autoFocus
              onClick={() => setDialog(null)}
            >
              <Icon name="close" />
            </button>
            {dialog === "help" ? (
              <>
                <span className="modal-symbol">
                  <Icon name="spark" size={24} />
                </span>
                <h2 id="dialog-title">Немного Markdown — много возможностей</h2>
                <p className="modal-description">
                  Введите разметку в редактор. Результат появится рядом сразу.
                </p>
                <div className="syntax-table">
                  {syntaxExamples.map(([syntax, label]) => (
                    <div key={syntax}>
                      <code>{syntax}</code>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <p className="shortcut-note">
                  Быстрые клавиши: <kbd>Ctrl / ⌘</kbd> + <kbd>B</kbd> — жирный,{" "}
                  <kbd>I</kbd> — курсив.
                </p>
              </>
            ) : (
              <>
                <span className="modal-symbol">
                  <Icon name="file" size={24} />
                </span>
                <h2 id="dialog-title">Мои заметки</h2>
                <p className="modal-description">
                  Ваш черновик хранится только в этом браузере.
                </p>
                {savedDraft ? (
                  <button
                    type="button"
                    className="saved-note"
                    onClick={() => {
                      setTitle(savedDraft.title);
                      setBody(savedDraft.body);
                      setDialog(null);
                    }}
                  >
                    <Icon name="file" size={24} />
                    <span>
                      <strong>{savedDraft.title || "Без названия"}</strong>
                      <small>
                        Сохранено{" "}
                        {new Date(savedDraft.savedAt).toLocaleString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </span>
                    <Icon name="chevron" />
                  </button>
                ) : (
                  <div className="notes-empty">
                    <Icon name="pen" size={32} />
                    <p>Здесь будет ваша первая заметка.</p>
                    <span>
                      Напишите пару строк и нажмите «Сохранить заметку».
                    </span>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
          <button
            type="button"
            aria-label="Скрыть уведомление"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
