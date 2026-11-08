import { useEffect, useRef, useState } from "react";
import { Button } from "@gravity-ui/uikit";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Bold,
  BookOpen,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  FileText,
  FolderOpen,
  Heading2,
  Italic,
  LayoutTemplate,
  Link,
  List,
  ListOrdered,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Quote,
  Search,
  Sparkles,
  SplitSquareHorizontal,
  X,
} from "lucide-react";
import "./styles.css";

const initialText = `## Рады видеть вас в команде! 👋

Этот небольшой гид поможет освоиться
и почувствовать себя как дома.

### С чего начать

- Познакомьтесь с командой
- Настройте рабочее пространство
- Загляните в нашу базу знаний

### Наш подход

Мы верим, что **лучшие идеи рождаются вместе**.
Задавайте вопросы, делитесь мыслями
и не бойтесь пробовать новое.

> Большие вещи начинаются с маленьких шагов.

Полезные ссылки и инструкции — в [базе знаний](https://www.wikipedia.org/).

---

С заботой, *ваша команда* 💚`;
type Draft = { title: string; category: string; body: string };
const emptyDraft: Draft = {
  title: "Добро пожаловать в команду",
  category: "Команда",
  body: initialText,
};
const key = "forma-material-draft";
function readDraft(): Draft {
  try {
    const d = JSON.parse(localStorage.getItem(key) || "null");
    return d &&
      typeof d.title === "string" &&
      typeof d.body === "string" &&
      typeof d.category === "string"
      ? d
      : emptyDraft;
  } catch {
    return emptyDraft;
  }
}

export function App() {
  const [draft, setDraft] = useState<Draft>(readDraft);
  const [mode, setMode] = useState<"split" | "write" | "preview">("split");
  const [section, setSection] = useState<"editor" | "materials">("editor");
  const [modal, setModal] = useState<"help" | "templates" | null>(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [sidebar, setSidebar] = useState(true);
  const editor = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const setField = (field: keyof Draft, value: string) => {
    setDraft((d) => ({ ...d, [field]: value }));
    setSaved(false);
  };
  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(draft));
      setSaved(true);
      setToast("Материал сохранён в этом браузере");
    } catch {
      setToast("Не удалось сохранить материал: хранилище браузера недоступно.");
    }
  };
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const keepFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const buttons = modalRef.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keepFocus);
    return () => document.removeEventListener("keydown", keepFocus);
  }, [modal]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setMenu(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft]);
  const format = (before: string, after = "", placeholder = "текст") => {
    const el = editor.current;
    const start = el?.selectionStart ?? draft.body.length;
    const end = el?.selectionEnd ?? start;
    const selection = draft.body.slice(start, end) || placeholder;
    setField(
      "body",
      draft.body.slice(0, start) +
        before +
        selection +
        after +
        draft.body.slice(end),
    );
    if (mode === "preview") setMode("split");
    requestAnimationFrame(() => {
      editor.current?.focus();
      editor.current?.setSelectionRange(
        start + before.length,
        start + before.length + selection.length,
      );
    });
  };
  const exportFile = () => {
    const url = URL.createObjectURL(
      new Blob([`# ${draft.title}\n\n${draft.body}`], {
        type: "text/markdown;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.title || "material"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setMenu(false);
  };
  const tools = [
    {
      icon: Heading2,
      label: "Заголовок",
      action: () => format("\n## ", "", "Заголовок"),
    },
    {
      icon: Bold,
      label: "Полужирный (Ctrl+B)",
      action: () => format("**", "**"),
    },
    { icon: Italic, label: "Курсив (Ctrl+I)", action: () => format("*", "*") },
    {
      icon: Link,
      label: "Ссылка",
      action: () => format("[", "](https://example.com)", "текст ссылки"),
    },
    {
      icon: List,
      label: "Маркированный список",
      action: () => format("\n- ", "", "Пункт списка"),
    },
    {
      icon: ListOrdered,
      label: "Нумерованный список",
      action: () => format("\n1. ", "", "Пункт списка"),
    },
    {
      icon: Quote,
      label: "Цитата",
      action: () => format("\n> ", "", "Цитата"),
    },
    { icon: Code2, label: "Код", action: () => format("`", "`", "код") },
  ];
  return (
    <div className={`app ${sidebar ? "" : "sidebar-hidden"}`}>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSection("editor");
          }}
        >
          <span className="brand-symbol">
            <span />
            <span />
            <span />
          </span>
          forma<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-avatar">S</span>
          <span>
            Моё пространство<small>Личное пространство</small>
          </span>
          <span className="workspace-dot" />
        </div>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          <button
            className="nav-item active"
            onClick={() => setSection("materials")}
          >
            <FolderOpen size={19} />
            Материалы<span className="nav-count">1</span>
          </button>
          <button className="nav-item" onClick={() => setModal("templates")}>
            <LayoutTemplate size={19} />
            Шаблоны
            <span className="new-dot" />
          </button>
        </nav>
        <button
          className="sidebar-new"
          onClick={() => {
            setDraft({ title: "", category: "Без категории", body: "" });
            setSaved(false);
            setSection("editor");
          }}
        >
          <Plus size={17} />
          Новый материал
        </button>
        <div className="sidebar-bottom">
          <div className="tip-card">
            <span className="tip-icon">
              <Sparkles size={19} />
            </span>
            <h3>
              Меньше отвлечений.
              <br />
              Больше хороших идей.
            </h3>
            <p>
              Сосредоточьтесь на тексте,
              <br />а оформление оставьте нам.
            </p>
            <button onClick={() => setModal("help")}>
              Знакомство с Markdown <ArrowRight size={14} />
            </button>
          </div>
          <button className="help-nav" onClick={() => setModal("help")}>
            <CircleHelp size={18} />
            Помощь и подсказки
          </button>
          <div className="profile">
            <div className="avatar">АК</div>
            <div>
              Александр<small>Личное пространство</small>
            </div>
            <span className="profile-status" title="Работа в браузере" />
          </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="collapse-button"
              aria-label={sidebar ? "Скрыть меню" : "Показать меню"}
              onClick={() => setSidebar(!sidebar)}
            >
              <PanelLeftClose size={19} />
            </button>
            <span className="breadcrumb-divider" />
            <button onClick={() => setSection("materials")}>Материалы</button>
            <ChevronRight size={14} />
            <span>
              {section === "editor" ? "Новый материал" : "Все материалы"}
            </span>
          </div>
          <div className="topbar-right">
            <span className="private-dot" />
            Личное пространство
            <button
              className="help-icon"
              onClick={() => setModal("help")}
              aria-label="Помощь"
            >
              <CircleHelp size={17} />
            </button>
          </div>
        </header>
        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШИ ИДЕИ. В НУЖНОЙ ФОРМЕ.</div>
              <h1>
                {section === "editor" ? "Новый материал" : "Мои материалы"}
                <span className="draft-badge">Черновик</span>
              </h1>
              <p>
                {section === "editor"
                  ? "Запишите главное. Красивое оформление получится само."
                  : "Все ваши тексты и идеи в одном месте."}
              </p>
            </div>
            <div className="heading-actions">
              <div className="more-wrap">
                <button
                  className="more-button"
                  aria-label="Дополнительные действия"
                  onClick={() => setMenu(!menu)}
                >
                  <MoreHorizontal size={21} />
                </button>
                {menu && (
                  <div className="dropdown">
                    <button onClick={exportFile}>
                      <ArrowDownToLine size={15} />
                      Скачать Markdown
                    </button>
                  </div>
                )}
              </div>
              <Button
                view="action"
                size="l"
                className="save-button"
                onClick={save}
              >
                <Check size={16} />
                <span>{saved ? "Сохранено" : "Сохранить"}</span>
              </Button>
            </div>
          </div>
          {section === "materials" ? (
            <section className="materials">
              <div className="search-field">
                <Search size={18} />
                <input
                  aria-label="Поиск материалов"
                  placeholder="Найти материал…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {draft.title.toLowerCase().includes(query.toLowerCase()) ? (
                <button
                  className="material-card"
                  onClick={() => setSection("editor")}
                >
                  <span className="material-icon">
                    <FileText size={24} />
                  </span>
                  <div>
                    <h3>{draft.title || "Без названия"}</h3>
                    <p>{draft.category} · Черновик</p>
                  </div>
                  <ArrowRight size={20} />
                </button>
              ) : (
                <p className="no-results">Материалы не найдены</p>
              )}
            </section>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <section className="details-card">
                <div className="section-heading">
                  <span className="section-icon">
                    <FileText size={18} />
                  </span>
                  <h2>О материале</h2>
                  <span>Начнём с самого важного</span>
                </div>
                <div className="details-fields">
                  <label className="title-field">
                    Название материала
                    <input
                      placeholder="Как назовём ваш материал?"
                      value={draft.title}
                      onChange={(e) => setField("title", e.target.value)}
                    />
                  </label>
                  <label className="category-field">
                    Категория
                    <span className="select-wrap">
                      <span className="category-dot" />
                      <select
                        value={draft.category}
                        onChange={(e) => setField("category", e.target.value)}
                      >
                        <option>Команда</option>
                        <option>Заметки</option>
                        <option>Проекты</option>
                        <option>Без категории</option>
                      </select>
                      <ChevronDown size={15} />
                    </span>
                  </label>
                </div>
              </section>
              <div className="content-heading">
                <div>
                  <h2>Содержание</h2>
                  <span>
                    Просто пишите — Markdown позаботится об остальном.
                  </span>
                </div>
                <button
                  type="button"
                  className="text-help"
                  onClick={() => setModal("help")}
                >
                  <CircleHelp size={15} />
                  Шпаргалка по Markdown
                </button>
              </div>
              <section className="editor-card">
                <div className="editor-toolbar">
                  <div className="format-tools">
                    {tools.map(({ icon: Icon, label, action }, i) => (
                      <span
                        className={i === 3 || i === 6 ? "tool-group-start" : ""}
                        key={label}
                      >
                        <button
                          type="button"
                          title={label}
                          aria-label={label}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={action}
                        >
                          <Icon size={18} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="view-modes" aria-label="Режим редактора">
                    <button
                      type="button"
                      title="Только редактор"
                      className={mode === "write" ? "selected" : ""}
                      onClick={() => setMode("write")}
                    >
                      Редактор
                    </button>
                    <button
                      type="button"
                      title="Только предпросмотр"
                      className={mode === "preview" ? "selected" : ""}
                      onClick={() => setMode("preview")}
                    >
                      Просмотр
                    </button>
                    <button
                      type="button"
                      title="Редактор и предпросмотр"
                      aria-label="Редактор и предпросмотр"
                      className={
                        mode === "split"
                          ? "selected split-button"
                          : "split-button"
                      }
                      onClick={() => setMode("split")}
                    >
                      <SplitSquareHorizontal size={17} />
                    </button>
                  </div>
                </div>
                <div className={`editor-columns mode-${mode}`}>
                  {mode !== "preview" && (
                    <div className="source-panel">
                      <div className="panel-heading">
                        <span>
                          <Code2 size={14} />
                          MARKDOWN
                        </span>
                        <span className="source-indicator">Исходный текст</span>
                      </div>
                      <textarea
                        name="content"
                        ref={editor}
                        aria-label="Содержание в формате Markdown"
                        spellCheck={false}
                        value={draft.body}
                        placeholder="Начните писать здесь… Используйте # для заголовка и ** для жирного текста."
                        onChange={(e) => setField("body", e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            (e.metaKey || e.ctrlKey) &&
                            ["b", "i"].includes(e.key.toLowerCase())
                          ) {
                            e.preventDefault();
                            format(
                              e.key.toLowerCase() === "b" ? "**" : "*",
                              e.key.toLowerCase() === "b" ? "**" : "*",
                            );
                          }
                        }}
                      />
                    </div>
                  )}
                  {mode !== "write" && (
                    <div className="preview-panel">
                      <div className="panel-heading">
                        <span>
                          <BookOpen size={14} />
                          ПРЕДПРОСМОТР
                        </span>
                        <span className="live-label">
                          <i />В реальном времени
                        </span>
                      </div>
                      <div
                        className="markdown-preview"
                        role="region"
                        aria-label="Предпросмотр Markdown"
                      >
                        {draft.body ? (
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
                            {draft.body}
                          </ReactMarkdown>
                        ) : (
                          <div className="empty-preview">
                            <FileText size={30} />
                            <p>Здесь появится ваш текст</p>
                            <span>Начните писать в редакторе</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="editor-footer">
                  <span>
                    <span className="markdown-mark">
                      M<span>↓</span>
                    </span>
                    Markdown поддерживается
                  </span>
                  <span>
                    {draft.body.trim()
                      ? draft.body.trim().split(/\s+/).length
                      : 0}{" "}
                    слов<span className="count-divider">·</span>
                    {draft.body.length} символов
                  </span>
                </div>
              </section>
              <div className="below-editor">
                <span>
                  <CheckCheck size={16} />
                  Изменения отображаются в предпросмотре сразу
                </span>
                <span>Ваша мысль — ваше оформление.</span>
              </div>
              <footer className="form-footer">
                <button
                  type="button"
                  className="back-button"
                  onClick={() => setSection("materials")}
                >
                  <ArrowLeft size={16} />К материалам
                </button>
                <div>
                  <span className="save-note">
                    {saved
                      ? "Все изменения сохранены"
                      : "Сохраните, чтобы не потерять изменения"}
                  </span>
                  <Button
                    view="action"
                    size="l"
                    className="save-button"
                    type="submit"
                  >
                    Сохранить материал
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </footer>
            </form>
          )}
          <div className="page-bottom">
            <span className="little-brand">forma.</span>
            <span>Пространство для ясных мыслей</span>
            <span>
              Сделано с вниманием к деталям{" "}
              <span className="little-star">✳</span>
            </span>
          </div>
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            className="modal"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="close-modal"
              aria-label="Закрыть"
              onClick={() => setModal(null)}
            >
              <X size={21} />
            </button>
            <span className="modal-icon">
              {modal === "help" ? (
                <BookOpen size={23} />
              ) : (
                <LayoutTemplate size={23} />
              )}
            </span>
            <h2 id="modal-title">
              {modal === "help"
                ? "Немного символов. Много возможностей."
                : "Начните с готовой структуры"}
            </h2>
            <p>
              {modal === "help"
                ? "Добавляйте разметку прямо в текст — результат появится рядом."
                : "Шаблон заменит текущее содержание материала."}
            </p>
            {modal === "help" ? (
              <>
                <div className="syntax-list">
                  {[
                    ["## Заголовок", "Заголовок раздела"],
                    ["**Важная мысль**", "Полужирный текст"],
                    ["*Небольшой акцент*", "Курсив"],
                    ["- Пункт списка", "Маркированный список"],
                    ["> Цитата", "Блок цитаты"],
                    ["[Текст](https://example.com)", "Ссылка"],
                    ["`код`", "Фрагмент кода"],
                    ["- [ ] Задача", "Список задач"],
                  ].map(([syntax, description]) => (
                    <div key={syntax}>
                      <code>{syntax}</code>
                      <span>{description}</span>
                    </div>
                  ))}
                </div>
                <div className="modal-note">
                  Ctrl / ⌘ + B — полужирный · Ctrl / ⌘ + I — курсив
                  <br />
                  Ctrl / ⌘ + S — сохранить материал
                </div>
              </>
            ) : (
              <div className="template-list">
                {[
                  {
                    title: "Заметки встречи",
                    body: "## О встрече\n\nДата: \nУчастники: \n\n### Обсудили\n\n- Первый вопрос\n\n### Следующие шаги\n\n- [ ] Первая задача",
                  },
                  {
                    title: "План проекта",
                    body: "## Наша цель\n\nОпишите, чего хотите достичь.\n\n### Этапы\n\n1. Подготовка\n2. Работа над проектом\n3. Запуск\n\n### Важные ссылки\n\n[Документация](https://example.com)",
                  },
                ].map((t) => (
                  <button
                    key={t.title}
                    onClick={() => {
                      setDraft({
                        title: t.title,
                        body: t.body,
                        category: "Проекты",
                      });
                      setSaved(false);
                      setSection("editor");
                      setModal(null);
                    }}
                  >
                    <FileText size={20} />
                    {t.title}
                    <ArrowRight size={17} />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
