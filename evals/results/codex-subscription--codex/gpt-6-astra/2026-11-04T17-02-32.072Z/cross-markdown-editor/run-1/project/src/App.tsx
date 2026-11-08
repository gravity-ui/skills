import { useEffect, useRef, useState } from "react";
import { Button } from "@gravity-ui/uikit";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./styles.css";

type IconName =
  | "note"
  | "grid"
  | "star"
  | "archive"
  | "folder"
  | "plus"
  | "chevron"
  | "check"
  | "help"
  | "link"
  | "list"
  | "quote"
  | "code"
  | "split"
  | "eye"
  | "edit"
  | "close"
  | "search"
  | "lock";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    note: (
      <>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
        <path d="M14 3v6h6M8 13h8M8 17h5" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-3-5.6 3 1-6.2L2.9 9.6l6.3-.9Z" />
    ),
    archive: (
      <>
        <rect x="3" y="3" width="18" height="5" rx="1" />
        <path d="M5 8v12h14V8M10 12h4" />
      </>
    ),
    folder: (
      <path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 8.5a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1-1.5 2.5M12 16.5h.01" />
      </>
    ),
    link: (
      <>
        <path d="m10 13 4-4M8 15l-1 1a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4 0m2 1 1-1a3 3 0 0 1 4 4l-4 4a3 3 0 0 1-4 0" />
      </>
    ),
    list: <path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" />,
    quote: (
      <>
        <path d="M4 6h6v7H4zm10 0h6v7h-6M10 13c0 4-3 5-5 5m15-5c0 4-3 5-5 5" />
      </>
    ),
    code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" />,
    split: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M12 4v16" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    edit: (
      <>
        <path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3" />
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
const initialText = `## У каждой идеи есть начало

Иногда достаточно записать мысль, чтобы она
стала чем-то большим. Это место для ваших
**идей, планов и вдохновения**.

### С чего начнём?

- Собрать мысли в одном месте
- Выделить самое важное
- Сделать первый маленький шаг

> Не обязательно видеть всю лестницу.
> Достаточно сделать первый шаг.

Больше возможностей — в [руководстве по Markdown](https://www.markdownguide.org/basic-syntax/).

Пишите свободно. *Всё остальное — дело техники.*`;
type Note = {
  title: string;
  text: string;
  folder: string;
  favorite: boolean;
  archived: boolean;
};
const initialNote: Note = {
  title: "Место для хороших идей",
  text: initialText,
  folder: "Личное",
  favorite: false,
  archived: false,
};
function readNote(): Note {
  try {
    const value = JSON.parse(localStorage.getItem("listva-note") || "null");
    if (
      value &&
      typeof value.title === "string" &&
      typeof value.text === "string" &&
      typeof value.folder === "string"
    )
      return { ...initialNote, ...value };
  } catch {}
  return initialNote;
}
export function App() {
  const [note, setNote] = useState<Note>(readNote);
  const [saved, setSaved] = useState<Note>(readNote);
  const [mode, setMode] = useState<"split" | "edit" | "preview">("split");
  const [page, setPage] = useState("editor");
  const [help, setHelp] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const editor = useRef<HTMLTextAreaElement>(null);
  const dirty = JSON.stringify(note) !== JSON.stringify(saved);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const update = (changes: Partial<Note>) =>
    setNote((n) => ({ ...n, ...changes }));
  function save() {
    if (!note.title.trim()) {
      setNotice("Добавьте название заметки");
      return;
    }
    try {
      localStorage.setItem("listva-note", JSON.stringify(note));
      setSaved({ ...note });
      setNotice("Заметка сохранена в этом браузере");
    } catch {
      setNotice(
        "Не удалось сохранить заметку. Проверьте доступ к хранилищу браузера.",
      );
    }
  }
  function format(before: string, after = "", placeholder = "текст") {
    const field = editor.current;
    const start = field?.selectionStart ?? note.text.length;
    const end = field?.selectionEnd ?? start;
    const selection = note.text.slice(start, end) || placeholder;
    update({
      text:
        note.text.slice(0, start) +
        before +
        selection +
        after +
        note.text.slice(end),
    });
    if (mode === "preview") setMode("split");
    requestAnimationFrame(() => {
      editor.current?.focus();
      editor.current?.setSelectionRange(
        start + before.length,
        start + before.length + selection.length,
      );
    });
  }
  const nav = [
    { name: "Все заметки", icon: "grid" },
    { name: "Избранное", icon: "star" },
    { name: "Архив", icon: "archive" },
  ] as const;
  const visible =
    (page !== "Избранное" || note.favorite) &&
    (page === "Архив" ? note.archived : !note.archived) &&
    (!["Личное", "Работа", "Вдохновение"].includes(page) ||
      note.folder === page) &&
    note.title.toLowerCase().includes(query.toLowerCase());
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("editor");
          }}
          aria-label="Листва — главная"
        >
          <span className="brand-mark">
            <svg viewBox="0 0 30 30" fill="none">
              <path
                d="M8 21C4 10 12 5 24 5c1 12-5 19-14 17"
                fill="currentColor"
              />
              <path
                d="m7 25 12-13"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          лист<span className="brand-ending">ва</span>
          <span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-avatar">М</span>
          <div>
            <strong>Моё пространство</strong>
            <span>Личный аккаунт</span>
          </div>
          <span className="workspace-chevron">⌄</span>
        </div>
        <button
          className="new-note"
          onClick={() => {
            setPage("editor");
            requestAnimationFrame(() => editor.current?.focus());
          }}
        >
          <Icon name="plus" size={18} /> Написать заметку <span>↗</span>
        </button>
        <div className="nav-heading">БИБЛИОТЕКА</div>
        <nav>
          {nav.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${page === item.name || (page === "editor" && item.name === "Все заметки") ? "active" : ""}`}
              onClick={() => setPage(item.name)}
            >
              <Icon name={item.icon} size={18} />
              {item.name}
              {item.name === "Все заметки" && (
                <span className="nav-count">{note.archived ? 0 : 1}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-heading folder-heading">
          МОИ ПАПКИ <Icon name="folder" size={14} />
        </div>
        <nav>
          {["Личное", "Работа", "Вдохновение"].map((folder, i) => (
            <button
              key={folder}
              className={`nav-item folder-item ${page === folder ? "active" : ""}`}
              onClick={() => setPage(folder)}
            >
              <span className={`folder-dot dot-${i}`} />
              {folder}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="little-spark">✳</span>
            <p>
              Большие идеи
              <br />
              начинаются с заметки.
            </p>
            <span>Сохраните свою сегодня.</span>
          </div>
          <button className="help-button" onClick={() => setHelp(true)}>
            <Icon name="help" size={18} />
            Помощь с Markdown
            <Icon name="chevron" size={14} />
          </button>
          <div className="profile">
            <span className="profile-avatar">А</span>
            <div>
              <strong>Александр</strong>
              <span>Личное пространство</span>
            </div>
            <span className="profile-status" title="Локальное пространство" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <Icon name="folder" size={17} />
            <button onClick={() => setPage("Все заметки")}>Мои заметки</button>
            <Icon name="chevron" size={13} />
            <span>{page === "editor" ? "Редактор" : page}</span>
          </div>
          <span className="private-label">
            <Icon name="lock" size={12} /> Только для вас
          </span>
        </header>
        <main>
          {page === "editor" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">ПРОСТРАНСТВО ДЛЯ ВАШИХ МЫСЛЕЙ</div>
                  <h1>
                    Хорошие идеи начинаются здесь<span>.</span>
                  </h1>
                  <p>Записывайте, оформляйте и сохраняйте то, что важно.</p>
                </div>
                <span className="draft-badge">
                  <span />
                  Черновик
                </span>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                <section className="note-form">
                  <div className="note-fields">
                    <div className="field-heading">
                      <label htmlFor="note-title">Название заметки</label>
                      <button
                        type="button"
                        className={`favorite-button ${note.favorite ? "is-favorite" : ""}`}
                        aria-label={
                          note.favorite
                            ? "Убрать из избранного"
                            : "Добавить в избранное"
                        }
                        title={
                          note.favorite
                            ? "Убрать из избранного"
                            : "Добавить в избранное"
                        }
                        onClick={() => update({ favorite: !note.favorite })}
                      >
                        <Icon name="star" size={19} />
                      </button>
                    </div>
                    <input
                      id="note-title"
                      className="title-input"
                      value={note.title}
                      onChange={(e) => update({ title: e.target.value })}
                      placeholder="Дайте своей идее название"
                      required
                      maxLength={160}
                    />
                    <div className="folder-select">
                      <Icon name="folder" size={15} />
                      <label htmlFor="folder">Папка</label>
                      <select
                        id="folder"
                        value={note.folder}
                        onChange={(e) => update({ folder: e.target.value })}
                      >
                        {["Личное", "Работа", "Вдохновение"].map((f) => (
                          <option key={f}>{f}</option>
                        ))}
                      </select>
                      <span className="field-divider" />
                      <span className="markdown-label">
                        <span className="markdown-logo">M↓</span> Markdown
                        поддерживается
                      </span>
                    </div>
                  </div>
                  <div className="editor-section">
                    <div className="editor-heading">
                      <label htmlFor="markdown-input">Содержание</label>
                      <div className="view-switch" aria-label="Режим редактора">
                        {(
                          [
                            { value: "edit", icon: "edit", label: "Редактор" },
                            { value: "split", icon: "split", label: "Рядом" },
                            {
                              value: "preview",
                              icon: "eye",
                              label: "Просмотр",
                            },
                          ] as const
                        ).map((v) => (
                          <button
                            key={v.value}
                            type="button"
                            className={mode === v.value ? "selected" : ""}
                            title={v.label}
                            aria-label={v.label}
                            aria-pressed={mode === v.value}
                            onClick={() => setMode(v.value)}
                          >
                            <Icon name={v.icon} size={16} />
                            {v.value === "split" && <span>Рядом</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={`editor-box mode-${mode}`}>
                      <div
                        className="format-toolbar"
                        aria-label="Форматирование"
                      >
                        <button
                          type="button"
                          title="Заголовок"
                          aria-label="Заголовок"
                          onClick={() => format("\n## ", "", "Заголовок")}
                        >
                          <span className="heading-tool">
                            H<span>₁</span>
                          </span>
                        </button>
                        <span className="tool-divider" />
                        <button
                          type="button"
                          title="Жирный (Ctrl+B)"
                          aria-label="Жирный"
                          onClick={() => format("**", "**")}
                        >
                          <b>B</b>
                        </button>
                        <button
                          type="button"
                          title="Курсив (Ctrl+I)"
                          aria-label="Курсив"
                          onClick={() => format("*", "*")}
                        >
                          <i>I</i>
                        </button>
                        <button
                          type="button"
                          title="Зачёркнутый"
                          aria-label="Зачёркнутый"
                          onClick={() => format("~~", "~~")}
                        >
                          <s>S</s>
                        </button>
                        <span className="tool-divider" />
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
                              label: "Список",
                              before: "\n- ",
                              text: "Пункт списка",
                            },
                            {
                              icon: "quote",
                              label: "Цитата",
                              before: "\n> ",
                              text: "Ваша цитата",
                            },
                            {
                              icon: "code",
                              label: "Код",
                              before: "`",
                              after: "`",
                              text: "код",
                            },
                          ] as const
                        ).map((tool) => (
                          <button
                            key={tool.icon}
                            type="button"
                            title={tool.label}
                            aria-label={tool.label}
                            onClick={() =>
                              format(
                                tool.before,
                                "after" in tool ? tool.after : "",
                                tool.text,
                              )
                            }
                          >
                            <Icon name={tool.icon} size={18} />
                          </button>
                        ))}
                        <button
                          type="button"
                          className="syntax-help"
                          onClick={() => setHelp(true)}
                          title="Подсказка по Markdown"
                          aria-label="Подсказка по Markdown"
                        >
                          <Icon name="help" size={17} />
                        </button>
                      </div>
                      <div className="editor-panels">
                        {mode !== "preview" && (
                          <div className="source-panel">
                            <div className="panel-label">
                              <span>MARKDOWN</span>
                              <span className="panel-label-icon">M↓</span>
                            </div>
                            <textarea
                              id="markdown-input"
                              ref={editor}
                              value={note.text}
                              spellCheck={false}
                              placeholder="Начните писать… Используйте **жирный текст**, # заголовки и списки."
                              onChange={(e) => update({ text: e.target.value })}
                              onKeyDown={(e) => {
                                if (
                                  (e.ctrlKey || e.metaKey) &&
                                  ["b", "i", "s"].includes(e.key.toLowerCase())
                                ) {
                                  e.preventDefault();
                                  if (e.key.toLowerCase() === "s") save();
                                  else
                                    format(
                                      e.key.toLowerCase() === "b" ? "**" : "*",
                                      e.key.toLowerCase() === "b" ? "**" : "*",
                                    );
                                }
                              }}
                            />
                          </div>
                        )}
                        {mode !== "edit" && (
                          <div className="preview-panel">
                            <div className="panel-label">
                              <span>ПРЕДПРОСМОТР</span>
                              <span className="live-label">
                                <span />В реальном времени
                              </span>
                            </div>
                            <div
                              className="markdown-preview"
                              aria-label="Предпросмотр Markdown"
                            >
                              {note.text ? (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    a: (props) => (
                                      <a
                                        {...props}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      />
                                    ),
                                  }}
                                >
                                  {note.text}
                                </ReactMarkdown>
                              ) : (
                                <p className="empty-preview">
                                  Ваш текст появится здесь.
                                  <br />
                                  Начните с первой мысли.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="editor-status">
                        <span>
                          <span className="status-dot" />
                          Изменения видны сразу
                        </span>
                        <span>
                          {note.text.trim()
                            ? note.text.trim().split(/\s+/).length
                            : 0}{" "}
                          слов<span className="status-separator">·</span>
                          {note.text.length} символов
                        </span>
                      </div>
                    </div>
                    <div className="editor-hint">
                      <Icon name="help" size={14} />
                      <span>
                        Немного Markdown — и ваши мысли обретают форму.
                      </span>
                      <button type="button" onClick={() => setHelp(true)}>
                        Как это работает <span>↗</span>
                      </button>
                    </div>
                  </div>
                  <div className="form-footer">
                    <div className="save-caption">
                      <Icon name={dirty ? "edit" : "check"} size={16} />
                      <span>
                        {dirty
                          ? "Есть несохранённые изменения"
                          : "Можно продолжить вашу мысль"}
                      </span>
                    </div>
                    <div className="footer-actions">
                      <Button
                        view="flat"
                        size="l"
                        onClick={() => {
                          setNote({ ...saved });
                          setNotice("Изменения отменены");
                        }}
                      >
                        Отменить
                      </Button>
                      <Button view="action" size="l" type="submit">
                        <Icon name="check" size={17} />
                        <span>Сохранить заметку</span>
                      </Button>
                    </div>
                  </div>
                </section>
              </form>
              <div className="page-bottom">
                <span className="leaf-small">❧</span> Меньше шума. Больше
                смысла.
              </div>
            </>
          ) : (
            <>
              <div className="page-heading library-heading">
                <div>
                  <div className="eyebrow">ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО</div>
                  <h1>
                    {page}
                    <span>.</span>
                  </h1>
                  <p>Всё важное — под рукой.</p>
                </div>
                <Button
                  view="action"
                  size="l"
                  onClick={() => setPage("editor")}
                >
                  Открыть редактор
                </Button>
              </div>
              <div className="search-field">
                <Icon name="search" size={18} />
                <input
                  aria-label="Поиск заметок"
                  placeholder="Найти заметку…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {visible ? (
                <article className="note-card">
                  <span className="note-card-folder">
                    <Icon name="folder" size={15} />
                    {note.folder}
                  </span>
                  <button
                    className="note-card-title"
                    onClick={() => setPage("editor")}
                  >
                    {note.title || "Без названия"}
                  </button>
                  <p>{note.text.replace(/[#*>`\[\]]/g, "").slice(0, 150)}…</p>
                  <div>
                    <Button view="outlined" onClick={() => setPage("editor")}>
                      Редактировать
                    </Button>
                    <Button
                      view="flat"
                      onClick={() => update({ archived: !note.archived })}
                    >
                      {note.archived ? "Вернуть из архива" : "В архив"}
                    </Button>
                    <button
                      className={`favorite-button ${note.favorite ? "is-favorite" : ""}`}
                      aria-label="Избранное"
                      onClick={() => update({ favorite: !note.favorite })}
                    >
                      <Icon name="star" size={19} />
                    </button>
                  </div>
                </article>
              ) : (
                <div className="empty-library">
                  <Icon
                    name={page === "Избранное" ? "star" : "note"}
                    size={32}
                  />
                  <h2>Здесь пока нет заметок</h2>
                  <p>
                    {query
                      ? "Попробуйте изменить поисковый запрос."
                      : "Ваши заметки появятся здесь, когда вы добавите их в этот раздел."}
                  </p>
                  <Button view="outlined" onClick={() => setPage("editor")}>
                    Перейти к заметке
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {notice}
          <button
            onClick={() => setNotice("")}
            aria-label="Закрыть уведомление"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setHelp(false);
            }}
          >
            <button
              className="modal-close"
              autoFocus
              onClick={() => setHelp(false)}
              aria-label="Закрыть подсказку"
            >
              <Icon name="close" />
            </button>
            <span className="help-eyebrow">ПИСАТЬ — ПРОСТО</span>
            <h2 id="help-title">Немного магии Markdown</h2>
            <p>
              Добавьте символы к тексту — результат сразу появится в
              предпросмотре.
            </p>
            <div className="syntax-examples">
              {[
                ["## Заголовок", "Заголовок раздела"],
                ["**Жирный текст**", "Выделите главное"],
                ["*Курсив*", "Добавьте акцент"],
                ["- Пункт списка", "Разложите по пунктам"],
                ["> Цитата", "Сохраните важную мысль"],
                ["[Текст](https://example.com)", "Добавьте ссылку"],
                ["`код`", "Выделите фрагмент кода"],
                ["- [x] Готово", "Отметьте выполненную задачу"],
              ].map(([code, description]) => (
                <div key={code}>
                  <code>{code}</code>
                  <span>{description}</span>
                </div>
              ))}
            </div>
            <Button
              view="action"
              size="l"
              width="max"
              onClick={() => setHelp(false)}
            >
              Понятно, начнём писать
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}
