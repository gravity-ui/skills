import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Modal } from "@gravity-ui/uikit";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./styles.css";

type IconName =
  | "note"
  | "plus"
  | "grid"
  | "file"
  | "star"
  | "help"
  | "chevron"
  | "check"
  | "link"
  | "list"
  | "ordered"
  | "quote"
  | "code"
  | "eye"
  | "split"
  | "arrow"
  | "close";
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    note: (
      <>
        <path d="M5 3h10l4 4v14H5z" />
        <path d="M14 3v5h5M8 12h8M8 16h6" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </>
    ),
    file: (
      <>
        <path d="M14 3H5v18h14V8zM14 3v5h5M8 13h8M8 17h5" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16h.01" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    link: (
      <>
        <path
          d="m10 14 4-4M9 15l-2 2a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M15 9l2-2a3.5 3.5 0 0 0-5-5L8 6"
          transform="translate(2 2)"
        />
      </>
    ),
    list: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
      </>
    ),
    ordered: (
      <>
        <path d="M10 6h10M10 12h10M10 18h10M3 4h2v5M3 9h4M3 14c3-2 5 1 1 4l-1 1h4" />
      </>
    ),
    quote: (
      <>
        <path d="M5 7h5v6H5c0 3-1 4-2 4M15 7h5v6h-5c0 3-1 4-2 4" />
      </>
    ),
    code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" />,
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    split: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M12 4v16" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
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
const initialText = `## Всё начинается с идеи ✨

Это ваше пространство для мыслей, планов и вдохновения.
Используйте **Markdown**, чтобы придать им форму.

### Что можно добавить

- **Важные мысли** — выделить жирным
- *Немного акцента* — написать курсивом
- [Полезную ссылку](https://www.markdownguide.org)

> Большие вещи начинаются с маленьких заметок.

Осталось только начать.`;
type Note = {
  id: string;
  title: string;
  text: string;
  favorite: boolean;
  date: string;
};
type Draft = { title: string; text: string; id?: string };
function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
export function App() {
  const [draft, setDraft] = useState<Draft>(() =>
    readStored("folio-draft", { title: "", text: initialText }),
  );
  const [notes, setNotes] = useState<Note[]>(() =>
    readStored("folio-notes", []),
  );
  const [view, setView] = useState<"editor" | "all" | "favorites">("editor");
  const [mode, setMode] = useState<"split" | "write" | "preview">("split");
  const [help, setHelp] = useState(false);
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem("folio-draft", JSON.stringify(draft));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [draft]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const change = (value: Partial<Draft>) => {
    setDraft((old) => ({ ...old, ...value }));
    setIsSaved(false);
  };
  const format = (before: string, after = "", fallback = "текст") => {
    const element = input.current;
    if (!element) return;
    const start = element.selectionStart,
      end = element.selectionEnd;
    const selected = draft.text.slice(start, end) || fallback;
    change({
      text:
        draft.text.slice(0, start) +
        before +
        selected +
        after +
        draft.text.slice(end),
    });
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  };
  function persistNotes(next: Note[]) {
    try {
      localStorage.setItem("folio-notes", JSON.stringify(next));
      setNotes(next);
      return true;
    } catch {
      setNotice("Не удалось сохранить. Проверьте доступ к хранилищу браузера.");
      return false;
    }
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft.text.trim()) {
      input.current?.focus();
      setNotice("Добавьте текст заметки");
      return;
    }
    const id = draft.id || crypto.randomUUID();
    const note: Note = {
      id,
      title: draft.title.trim(),
      text: draft.text,
      favorite: notes.find((n) => n.id === id)?.favorite || false,
      date: new Date().toLocaleDateString("ru-RU"),
    };
    if (persistNotes([note, ...notes.filter((n) => n.id !== id)])) {
      setDraft({ ...draft, id });
      setIsSaved(true);
      setNotice("Заметка сохранена");
    }
  }
  const newNote = () => {
    if (view === "editor" && !draft.id) {
      input.current?.focus();
      return;
    }
    setDraft({ title: "", text: "" });
    setIsSaved(false);
    setView("editor");
  };
  const words = draft.text.trim() ? draft.text.trim().split(/\s+/u).length : 0;
  const visibleNotes = notes.filter((n) => view !== "favorites" || n.favorite);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("editor");
          }}
        >
          <span className="brand-icon">
            <Icon name="note" size={22} />
          </span>{" "}
          folio<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-avatar">Л</span>
          <div>
            Личное пространство<small>Место для ваших мыслей</small>
          </div>
        </div>
        <Button
          className="new-note"
          size="l"
          view="action"
          width="max"
          onClick={newNote}
        >
          <Icon name="plus" /> Новая заметка
        </Button>
        <div className="nav-label">МОИ ЗАМЕТКИ</div>
        <nav aria-label="Заметки">
          <button
            className={view === "all" ? "nav-item active" : "nav-item"}
            onClick={() => setView("all")}
          >
            <Icon name="grid" />
            Все заметки<span className="count">{notes.length}</span>
          </button>
          <button
            className={view === "editor" ? "nav-item active" : "nav-item"}
            onClick={() => setView("editor")}
          >
            <Icon name="file" />
            Черновики<span className="count">{isSaved ? 0 : 1}</span>
          </button>
          <button
            className={view === "favorites" ? "nav-item active" : "nav-item"}
            onClick={() => setView("favorites")}
          >
            <Icon name="star" />
            Избранное
            {notes.some((n) => n.favorite) && (
              <span className="count">
                {notes.filter((n) => n.favorite).length}
              </span>
            )}
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="little-note">
            <span className="little-note-icon">✦</span>
            <strong>Мысли заслуживают места</strong>
            <p>
              Собирайте идеи. Находите главное.
              <br />
              Создавайте что-то своё.
            </p>
            <span className="note-decoration">〰</span>
          </div>
          <button className="help-nav" onClick={() => setHelp(true)}>
            <Icon name="help" />
            Помощь и подсказки
            <Icon name="arrow" size={16} />
          </button>
          <div className="profile">
            <span className="profile-avatar">В</span>
            <div>
              Ваше пространство<small>Всё под рукой</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Личное пространство</span>
            <Icon name="chevron" size={13} />
            <span>
              {view === "editor"
                ? "Новая заметка"
                : view === "all"
                  ? "Все заметки"
                  : "Избранное"}
            </span>
          </div>
          <button className="top-help" onClick={() => setHelp(true)}>
            <Icon name="help" size={17} />
            Как это работает
          </button>
        </header>
        <main>
          {view === "editor" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">МЕСТО ДЛЯ НОВОЙ ИДЕИ</div>
                  <h1>
                    {draft.id ? "Ваша заметка" : "Новая заметка"}
                    <span className="heading-dot">.</span>
                  </h1>
                  <p>Запишите мысли. Markdown позаботится об остальном.</p>
                </div>
                <span className="draft-badge">
                  <span />
                  {isSaved ? "Сохранено" : "Черновик"}
                </span>
              </div>
              <form onSubmit={save}>
                <section className="form-card">
                  <div className="title-field">
                    <label htmlFor="note-title">
                      Название заметки <span>*</span>
                    </label>
                    <input
                      id="note-title"
                      placeholder="Дайте вашей идее название"
                      value={draft.title}
                      onChange={(e) => change({ title: e.target.value })}
                      required
                      maxLength={150}
                    />
                  </div>
                  <div className="content-label">
                    <label htmlFor="markdown-input">
                      Содержание <span>*</span>
                    </label>
                    <span className="markdown-badge">
                      <b>M↓</b> Markdown
                    </span>
                  </div>
                  <div className="editor-box">
                    <div className="editor-top">
                      <div
                        className="editor-tabs"
                        role="group"
                        aria-label="Режим редактора"
                      >
                        <button
                          type="button"
                          className={mode !== "preview" ? "selected" : ""}
                          onClick={() => setMode("write")}
                        >
                          <Icon name="code" size={16} />
                          Редактор
                        </button>
                        <button
                          type="button"
                          className={mode === "preview" ? "selected" : ""}
                          onClick={() => setMode("preview")}
                        >
                          <Icon name="eye" size={16} />
                          Просмотр
                        </button>
                      </div>
                      <button
                        type="button"
                        className={`split-toggle ${mode === "split" ? "enabled" : ""}`}
                        onClick={() =>
                          setMode(mode === "split" ? "write" : "split")
                        }
                        aria-pressed={mode === "split"}
                        title="Редактор и предпросмотр рядом"
                      >
                        <Icon name="split" size={16} />
                        <span>Разделить экран</span>
                      </button>
                    </div>
                    <div
                      className="format-toolbar"
                      role="toolbar"
                      aria-label="Форматирование Markdown"
                    >
                      <button
                        type="button"
                        title="Заголовок"
                        aria-label="Заголовок"
                        disabled={mode === "preview"}
                        onClick={() => format("\n# ", "", "Заголовок")}
                      >
                        <span className="heading-tool">
                          H<span>1</span>
                        </span>
                      </button>
                      <span className="toolbar-separator" />
                      <button
                        type="button"
                        title="Жирный (Ctrl+B)"
                        aria-label="Жирный"
                        disabled={mode === "preview"}
                        onClick={() => format("**", "**")}
                      >
                        <b>B</b>
                      </button>
                      <button
                        type="button"
                        title="Курсив (Ctrl+I)"
                        aria-label="Курсив"
                        disabled={mode === "preview"}
                        onClick={() => format("*", "*")}
                      >
                        <i>I</i>
                      </button>
                      <button
                        type="button"
                        title="Зачёркнутый"
                        aria-label="Зачёркнутый"
                        disabled={mode === "preview"}
                        onClick={() => format("~~", "~~")}
                      >
                        <s>S</s>
                      </button>
                      <span className="toolbar-separator" />
                      {(
                        [
                          {
                            icon: "link",
                            label: "Ссылка",
                            before: "[",
                            after: "](https://example.com)",
                            text: "текст ссылки",
                          },
                          {
                            icon: "list",
                            label: "Маркированный список",
                            before: "\n- ",
                            text: "Пункт списка",
                          },
                          {
                            icon: "ordered",
                            label: "Нумерованный список",
                            before: "\n1. ",
                            text: "Пункт списка",
                          },
                          {
                            icon: "quote",
                            label: "Цитата",
                            before: "\n> ",
                            text: "Цитата",
                          },
                          {
                            icon: "code",
                            label: "Код",
                            before: "`",
                            after: "`",
                            text: "код",
                          },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.icon}
                          type="button"
                          title={item.label}
                          aria-label={item.label}
                          disabled={mode === "preview"}
                          onClick={() =>
                            format(
                              item.before,
                              "after" in item ? item.after : "",
                              item.text,
                            )
                          }
                        >
                          <Icon name={item.icon} size={17} />
                        </button>
                      ))}
                      <button
                        className="toolbar-help"
                        type="button"
                        title="Справка по Markdown"
                        aria-label="Справка по Markdown"
                        onClick={() => setHelp(true)}
                      >
                        <Icon name="help" size={16} />
                      </button>
                    </div>
                    <div className={`editor-panels mode-${mode}`}>
                      {mode !== "preview" && (
                        <div className="source-panel">
                          <div className="panel-label">MARKDOWN</div>
                          <textarea
                            ref={input}
                            id="markdown-input"
                            aria-label="Текст заметки с Markdown-разметкой"
                            value={draft.text}
                            placeholder="Начните писать… Используйте **жирный**, *курсив* и # заголовки."
                            spellCheck={false}
                            onChange={(e) => change({ text: e.target.value })}
                            onKeyDown={(e) => {
                              if (
                                (e.ctrlKey || e.metaKey) &&
                                ["b", "i"].includes(e.key.toLowerCase())
                              ) {
                                e.preventDefault();
                                e.key.toLowerCase() === "b"
                                  ? format("**", "**")
                                  : format("*", "*");
                              }
                            }}
                          />
                        </div>
                      )}
                      {mode !== "write" && (
                        <div className="preview-panel">
                          <div className="panel-label">
                            ПРЕДПРОСМОТР
                            <span>
                              <i />
                              Обновляется сразу
                            </span>
                          </div>
                          <article
                            className="markdown-preview"
                            aria-label="Предпросмотр Markdown"
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {draft.text}
                            </ReactMarkdown>
                            {!draft.text && (
                              <p className="preview-placeholder">
                                Здесь появится ваша заметка.
                                <br />
                                Начните писать в редакторе.
                              </p>
                            )}
                          </article>
                        </div>
                      )}
                    </div>
                    <div className="editor-footer">
                      <span>
                        <Icon name="check" size={14} />
                        Поддерживает Markdown
                      </span>
                      <span>
                        {words} слов<span className="footer-dot">·</span>
                        {draft.text.length} символов
                      </span>
                    </div>
                  </div>
                  <div className="field-hint">
                    <Icon name="help" size={14} />
                    <span>
                      Пишите слева — результат появляется справа.{" "}
                      <button type="button" onClick={() => setHelp(true)}>
                        Шпаргалка по Markdown <span>↗</span>
                      </button>
                    </span>
                  </div>
                </section>
                <div className="form-actions">
                  <div className="autosave">
                    <Icon name={storageError ? "help" : "check"} size={16} />
                    {storageError
                      ? "Автосохранение недоступно"
                      : "Черновик сохраняется автоматически"}
                  </div>
                  <div className="action-buttons">
                    <Button
                      size="l"
                      view="outlined"
                      onClick={() => setView("all")}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      size="l"
                      view="action"
                      className="save-button"
                    >
                      <Icon name="check" size={17} />
                      {isSaved ? "Сохранено" : "Сохранить заметку"}
                    </Button>
                  </div>
                </div>
              </form>
              <div className="bottom-note">
                <span>✧</span> Меньше отвлекающего. Больше ваших мыслей.
              </div>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">ВАШИ МЫСЛИ ПОД РУКОЙ</div>
                  <h1>
                    {view === "all" ? "Все заметки" : "Избранное"}
                    <span className="heading-dot">.</span>
                  </h1>
                  <p>
                    {view === "all"
                      ? "Идеи, к которым хочется возвращаться."
                      : "Самое важное — в одном месте."}
                  </p>
                </div>
                <Button view="action" size="l" onClick={newNote}>
                  <Icon name="plus" />
                  Новая заметка
                </Button>
              </div>
              <div className="notes-grid">
                {visibleNotes.length ? (
                  visibleNotes.map((note) => (
                    <div className="note-card" key={note.id}>
                      <div className="note-card-top">
                        <Icon name="note" />
                        <button
                          title={
                            note.favorite
                              ? "Убрать из избранного"
                              : "В избранное"
                          }
                          aria-label={
                            note.favorite
                              ? "Убрать из избранного"
                              : "В избранное"
                          }
                          className={
                            note.favorite ? "favorite marked" : "favorite"
                          }
                          onClick={() =>
                            persistNotes(
                              notes.map((n) =>
                                n.id === note.id
                                  ? { ...n, favorite: !n.favorite }
                                  : n,
                              ),
                            )
                          }
                        >
                          <Icon name="star" />
                        </button>
                      </div>
                      <button
                        className="open-note"
                        onClick={() => {
                          setDraft({
                            id: note.id,
                            title: note.title,
                            text: note.text,
                          });
                          setIsSaved(true);
                          setView("editor");
                        }}
                      >
                        <h2>{note.title}</h2>
                        <p>
                          {note.text.replace(/[#*`>\[\]]/g, "").slice(0, 140)}
                        </p>
                        <span>
                          {note.date}
                          <Icon name="arrow" size={16} />
                        </span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Icon name={view === "all" ? "note" : "star"} size={34} />
                    <h2>
                      {view === "all"
                        ? "Здесь будут ваши заметки"
                        : "Здесь будет самое важное"}
                    </h2>
                    <p>
                      {view === "all"
                        ? "Создайте и сохраните свою первую заметку."
                        : "Нажмите на звёздочку у сохранённой заметки."}
                    </p>
                    <Button
                      view="outlined"
                      size="l"
                      onClick={() => setView(view === "all" ? "editor" : "all")}
                    >
                      {view === "all" ? "Перейти к черновику" : "Все заметки"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
          <footer className="page-footer">
            <span>folio — пространство для ясных мыслей</span>
            <span>
              Создано для вашего вдохновения{" "}
              <span className="tiny-star">✳</span>
            </span>
          </footer>
        </main>
      </div>
      <Modal
        open={help}
        onClose={() => setHelp(false)}
        aria-labelledby="help-title"
      >
        <div className="help-modal">
          <button
            className="close-modal"
            onClick={() => setHelp(false)}
            aria-label="Закрыть справку"
          >
            <Icon name="close" />
          </button>
          <span className="eyebrow">ВСЁ ПРОЩЕ, ЧЕМ КАЖЕТСЯ</span>
          <h2 id="help-title">
            Немного Markdown —<br />
            много возможностей.
          </h2>
          <p>Добавьте символы к тексту и сразу увидите результат.</p>
          <div className="help-table">
            {[
              ["# Заголовок", "Заголовок"],
              ["**Жирный текст**", "Жирный текст"],
              ["*Курсив*", "Курсив"],
              ["- Пункт списка", "• Пункт списка"],
              ["> Цитата", "Цитата"],
              ["[Ссылка](https://example.com)", "Ссылка"],
              ["`Код`", "Код"],
            ].map(([syntax, label]) => (
              <div key={syntax}>
                <code>{syntax}</code>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="help-tip">
            Выделите текст и используйте панель форматирования.
            <br />
            Ctrl / ⌘ + B — жирный, Ctrl / ⌘ + I — курсив.
          </p>
          <Button
            width="max"
            size="l"
            view="action"
            onClick={() => setHelp(false)}
          >
            Попробовать
          </Button>
        </div>
      </Modal>
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {notice}
          <button
            aria-label="Закрыть уведомление"
            onClick={() => setNotice("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
