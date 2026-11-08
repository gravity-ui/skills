import { useEffect, useRef, useState } from "react";
import { ThemeProvider } from "@gravity-ui/uikit";
import "./styles.css";

type Page = "overview" | "notes" | "collections";
type IconName =
  | "grid"
  | "note"
  | "folder"
  | "search"
  | "plus"
  | "arrow"
  | "sun"
  | "moon"
  | "chevron"
  | "star"
  | "close"
  | "leaf"
  | "spark"
  | "check"
  | "trash"
  | "menu"
  | "help";
function Icon({
  name,
  size = 20,
  ...props
}: { name: IconName; size?: number } & React.SVGProps<SVGSVGElement>) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3.5" y="3.5" width="6" height="6" rx="1.4" />
        <rect x="14.5" y="3.5" width="6" height="6" rx="1.4" />
        <rect x="3.5" y="14.5" width="6" height="6" rx="1.4" />
        <rect x="14.5" y="14.5" width="6" height="6" rx="1.4" />
      </>
    ),
    note: (
      <>
        <path d="M14 3.5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9Z" />
        <path d="M14 3.5v6h6M8 13h8M8 17h5" />
      </>
    ),
    folder: (
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM3 10h18" />
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: <path d="M20.5 13a8.7 8.7 0 0 1-9.5-9.5A8.8 8.8 0 1 0 20.5 13Z" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    leaf: (
      <>
        <path d="M20 4C6 2 1 15 8 19s14-3 12-15Z" />
        <path d="m5 22 11-13" />
      </>
    ),
    spark: (
      <path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6Z" />
    ),
    check: <path d="m5 12 4 4L19 6" />,
    trash: (
      <>
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4m0 3h.01" />
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
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

type Note = {
  id: string;
  title: string;
  content: string;
  collection: string;
  favorite: boolean;
  date: string;
  color: string;
};
const initialNotes: Note[] = [
  {
    id: "1",
    title: "Идеи, которым нужно время",
    content:
      "Иногда лучшая идея — та, которой позволили немного подождать. Собираю здесь мысли, к которым хочется вернуться со свежим взглядом.",
    collection: "Вдохновение",
    favorite: true,
    date: "2026-11-05T10:30:00",
    color: "green",
  },
  {
    id: "2",
    title: "Маленькие привычки",
    content:
      "Читать по 20 минут. Начинать утро без телефона. Замечать хорошее. Большие перемены начинаются с маленьких шагов.",
    collection: "Личное",
    favorite: false,
    date: "2026-11-05T09:00:00",
    color: "peach",
  },
  {
    id: "3",
    title: "Новый взгляд на проект",
    content:
      "Что, если начать с самого простого? Убрать лишнее, оставить суть и дать идее пространство. Несколько мыслей о следующем проекте.",
    collection: "Работа",
    favorite: true,
    date: "2026-11-04T15:20:00",
    color: "lavender",
  },
  {
    id: "4",
    title: "Места, куда хочется вернуться",
    content:
      "Тихая кофейня на углу. Лесная тропинка после дождя. Книжный магазин с деревянной лестницей. Места, в которых чувствуешь себя собой.",
    collection: "Личное",
    favorite: false,
    date: "2026-11-03T11:00:00",
    color: "peach",
  },
  {
    id: "5",
    title: "Красота в простых вещах",
    content:
      "Свет на стене ранним утром, фактура бумаги, случайное сочетание цветов. Вдохновение всегда рядом, нужно только остановиться.",
    collection: "Вдохновение",
    favorite: false,
    date: "2026-11-02T12:00:00",
    color: "green",
  },
  {
    id: "6",
    title: "Планы на ноябрь",
    content:
      "Завершить концепцию проекта. Освободить время для новых идей. Разобрать закладки и собрать небольшую подборку референсов.",
    collection: "Работа",
    favorite: false,
    date: "2026-11-01T08:00:00",
    color: "lavender",
  },
];
const collections = [
  {
    name: "Вдохновение",
    description: "Всё, что зажигает искру",
    image: "nature.jpg",
    color: "green",
  },
  {
    name: "Работа",
    description: "От первых идей к большим делам",
    image: "architecture.jpg",
    color: "lavender",
  },
  {
    name: "Личное",
    description: "Немного времени для себя",
    image: "ideas.jpg",
    color: "peach",
  },
];
const pageLabels: Record<Page, string> = {
  overview: "Обзор",
  notes: "Заметки",
  collections: "Коллекции",
};
function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function currentPage(): Page {
  const route = location.hash.replace("#", "");
  return route === "notes" || route === "collections" ? route : "overview";
}

function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 470 300"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="271" cy="157" r="112" fill="#D7E2C6" />
      <circle
        cx="271"
        cy="157"
        r="139"
        stroke="#B9C6A4"
        strokeDasharray="3 7"
        opacity=".7"
      />
      <g transform="translate(236 50) rotate(14)">
        <rect width="139" height="178" rx="10" fill="#4F6951" />
        <path
          d="M26 32h87M26 45h60M26 125h87M26 138h72"
          stroke="#9EAF97"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="68" cy="86" r="22" fill="#D6E4C3" />
        <path d="m58 86 8 8 14-17" stroke="#4F6951" strokeWidth="3" />
      </g>
      <g transform="translate(142 57) rotate(-12)">
        <rect
          x="2"
          y="7"
          width="145"
          height="185"
          rx="10"
          fill="#A7B49A"
          opacity=".25"
        />
        <rect width="145" height="185" rx="10" fill="#FFFEF6" />
        <rect x="21" y="23" width="27" height="5" rx="2.5" fill="#BAC9A6" />
        <path
          d="M23 49h99M23 61h81M23 73h91"
          stroke="#D5D8CB"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M34 153c-8-36 6-52 34-34 3-36 31-35 38-13 9 28-21 48-50 51"
          fill="#C8D0AB"
        />
        <path
          d="m44 162 42-47"
          stroke="#82936C"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <rect
        x="116"
        y="43"
        width="60"
        height="25"
        rx="3"
        fill="#D6B77E"
        fillOpacity=".8"
        transform="rotate(-25 116 43)"
      />
      <path d="m378 71 5 12 13 5-13 5-5 13-5-13-13-5 13-5Z" fill="#5B7250" />
      <path d="m121 204 3 8 9 3-9 3-3 9-3-9-8-3 8-3Z" fill="#8A9D73" />
      <circle cx="355" cy="244" r="8" fill="#C9AC72" />
      <path
        d="M338 209c18 4 24-7 30-20-20-1-29 7-30 20Zm-1 0c-19-4-21-15-20-28 17 5 24 14 20 28Z"
        fill="#859875"
      />
      <path d="m338 208-6 24" stroke="#859875" strokeWidth="2" />
    </svg>
  );
}

export function App() {
  const [page, setPage] = useState<Page>(currentPage);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    readStored("forma-theme", "light"),
  );
  const [notes, setNotes] = useState<Note[]>(() => {
    const data = readStored<Note[]>("forma-notes", initialNotes);
    return Array.isArray(data) &&
      data.every(
        (n) => typeof n.title === "string" && typeof n.content === "string",
      )
      ? data
      : initialNotes;
  });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Все заметки");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editor, setEditor] = useState<Note | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const helpDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !editor &&
        !helpOpen &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      ) {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, [editor, helpOpen]);

  useEffect(() => {
    const listener = () => {
      setPage(currentPage());
      setMobileOpen(false);
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  useEffect(() => {
    localStorage.setItem("forma-theme", JSON.stringify(theme));
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("forma-notes", JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    if (editor) {
      dialog.current?.showModal();
      setConfirmDelete(false);
    } else dialog.current?.close();
  }, [editor?.id]);
  useEffect(() => {
    if (helpOpen) helpDialog.current?.showModal();
    else helpDialog.current?.close();
  }, [helpOpen]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function navigate(next: Page, nextFilter = "Все заметки") {
    setPage(next);
    location.hash = next;
    setFilter(nextFilter);
    setQuery("");
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function newNote() {
    setEditor({
      id: crypto.randomUUID(),
      title: "",
      content: "",
      collection: collections.some((c) => c.name === filter)
        ? filter
        : "Вдохновение",
      favorite: false,
      date: new Date().toISOString(),
      color: "green",
    });
  }
  function saveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!editor?.title.trim()) return;
    const saved = {
      ...editor,
      title: editor.title.trim(),
      date: new Date().toISOString(),
      color:
        collections.find((c) => c.name === editor.collection)?.color || "green",
    };
    setNotes((prev) => [saved, ...prev.filter((n) => n.id !== saved.id)]);
    setEditor(null);
    setToast("Заметка сохранена");
  }
  function toggleFavorite(id: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n)),
    );
  }
  const favorites = notes.filter((n) => n.favorite).length;
  const visibleNotes = notes.filter(
    (n) =>
      (filter === "Все заметки" ||
        (filter === "Избранное" ? n.favorite : n.collection === filter)) &&
      `${n.title} ${n.content} ${n.collection}`
        .toLocaleLowerCase("ru")
        .includes(query.toLocaleLowerCase("ru")),
  );
  const noteCount = (count: number) =>
    `${count} ${count % 10 === 1 && count % 100 !== 11 ? "заметка" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "заметки" : "заметок"}`;

  function NoteCard({ note }: { note: Note }) {
    return (
      <article
        className="note-card"
        onClick={() => setEditor({ ...note })}
        onKeyDown={(e) => {
          if (
            e.target === e.currentTarget &&
            (e.key === "Enter" || e.key === " ")
          ) {
            e.preventDefault();
            setEditor({ ...note });
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Открыть заметку «${note.title}»`}
      >
        <div className="note-card-top">
          <span className={`note-icon ${note.color}`}>
            <Icon
              name={
                note.color === "green"
                  ? "spark"
                  : note.color === "peach"
                    ? "leaf"
                    : "note"
              }
              size={21}
            />
          </span>
          <button
            className={`icon-button favorite ${note.favorite ? "is-favorite" : ""}`}
            title={note.favorite ? "Убрать из избранного" : "В избранное"}
            aria-label={note.favorite ? "Убрать из избранного" : "В избранное"}
            aria-pressed={note.favorite}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(note.id);
            }}
          >
            <Icon name="star" size={18} />
          </button>
        </div>
        <h3>{note.title}</h3>
        <p>{note.content}</p>
        <div className="note-card-bottom">
          <span className={`tag ${note.color}`}>
            <span />
            {note.collection}
          </span>
          <time dateTime={note.date}>
            {new Date(note.date)
              .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
              .replace(".", "")}
          </time>
        </div>
      </article>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className={`app ${theme}`}>
        {mobileOpen && (
          <button
            className="sidebar-backdrop"
            aria-label="Закрыть меню"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
          <a
            href="#overview"
            className="brand"
            onClick={(e) => {
              e.preventDefault();
              navigate("overview");
            }}
            aria-label="forma — главная"
          >
            <span className="brand-mark">
              <i />
              <i />
              <i />
              <i />
            </span>
            forma<span className="brand-period">.</span>
          </a>
          <div className="workspace-label">ЛИЧНОЕ ПРОСТРАНСТВО</div>
          <nav className="main-nav" aria-label="Основная навигация">
            {(
              [
                ["overview", "grid"],
                ["notes", "note"],
                ["collections", "folder"],
              ] as [Page, IconName][]
            ).map(([key, icon]) => (
              <a
                key={key}
                href={`#${key}`}
                aria-current={page === key ? "page" : undefined}
                className={page === key ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(key);
                }}
              >
                <Icon name={icon} />
                <span>{pageLabels[key]}</span>
                {key === "notes" && (
                  <span className="nav-count">{notes.length}</span>
                )}
              </a>
            ))}
          </nav>
          <div className="collections-label">
            МОИ КОЛЛЕКЦИИ <span>{collections.length}</span>
          </div>
          <div className="collection-nav">
            {collections.map((c) => (
              <button
                key={c.name}
                className={
                  filter === c.name && page === "notes" ? "selected" : ""
                }
                onClick={() => navigate("notes", c.name)}
              >
                <span className={`color-dot ${c.color}`} />
                {c.name}
              </button>
            ))}
          </div>
          <div className="sidebar-bottom">
            <div className="little-reminder">
              <span className="reminder-icon">
                <Icon name="leaf" size={21} />
              </span>
              <p>
                У каждой идеи
                <br />
                есть своё место.
              </p>
              <span className="reminder-line" />
            </div>
            <div className="theme-row">
              <span>Оформление</span>
              <div
                className="theme-switch"
                role="group"
                aria-label="Цветовая тема"
              >
                <button
                  aria-label="Светлая тема"
                  aria-pressed={theme === "light"}
                  className={theme === "light" ? "selected" : ""}
                  onClick={() => setTheme("light")}
                >
                  <Icon name="sun" size={17} />
                </button>
                <button
                  aria-label="Тёмная тема"
                  aria-pressed={theme === "dark"}
                  className={theme === "dark" ? "selected" : ""}
                  onClick={() => setTheme("dark")}
                >
                  <Icon name="moon" size={16} />
                </button>
              </div>
            </div>
            <button className="help-button" onClick={() => setHelpOpen(true)}>
              <Icon name="help" size={18} />
              Помощь и подсказки
              <Icon name="arrow" size={16} />
            </button>
            <div className="profile">
              <span className="avatar">АЛ</span>
              <div>
                <strong>Александр</strong>
                <span>Личное пространство</span>
              </div>
              <span
                className="profile-online"
                title="Всё сохраняется на этом устройстве"
              />
            </div>
          </div>
        </aside>

        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="mobile-menu icon-button"
                aria-label="Открыть меню"
                onClick={() => setMobileOpen(true)}
              >
                <Icon name="menu" />
              </button>
              <span className="breadcrumb-home">Моё пространство</span>
              <span className="breadcrumb-separator">/</span>
              <span>{pageLabels[page]}</span>
            </div>
            <div className="topbar-actions">
              <label className="global-search">
                <Icon name="search" size={17} />
                <input
                  ref={searchInput}
                  aria-label="Поиск заметок"
                  placeholder="Найти что-нибудь..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage("notes");
                    location.hash = "notes";
                    setFilter("Все заметки");
                  }}
                />
                <kbd title="Нажмите / для поиска">/</kbd>
              </label>
              <span className="topbar-divider" />
              <span className="today">
                <span className="status-dot" />
                Ваше место для идей
              </span>
            </div>
          </header>
          <main key={page}>
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  {page === "overview"
                    ? "ПРОСТО, СПОКОЙНО, ПО ПОРЯДКУ"
                    : "ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО"}
                </div>
                <h1>
                  {page === "overview"
                    ? "Хороший день для новых идей"
                    : pageLabels[page]}
                  <span className="heading-dot">.</span>
                </h1>
                <p>
                  {page === "overview"
                    ? "Собирайте мысли, сохраняйте важное и находите вдохновение."
                    : page === "notes"
                      ? "Мысли, планы и маленькие открытия — всё под рукой."
                      : "Разложите идеи по полочкам. У каждой истории — своё место."}
                </p>
              </div>
              {page === "overview" ? (
                <span className="date-label">
                  <span />
                  {new Date().toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                  })}
                  <span className="date-year">{new Date().getFullYear()}</span>
                </span>
              ) : page === "notes" ? (
                <button className="primary-button" onClick={newNote}>
                  <Icon name="plus" size={18} />
                  Новая заметка
                </button>
              ) : (
                <span className="collection-total">
                  {collections.length} коллекции
                </span>
              )}
            </div>

            {page === "overview" && (
              <>
                <section className="hero">
                  <div className="hero-copy">
                    <span className="hero-kicker">
                      <span />
                      ПРОСТРАНСТВО ДЛЯ ГЛАВНОГО
                    </span>
                    <h2>
                      Ваши мысли.
                      <br />В хорошей форме.
                    </h2>
                    <p>
                      От мимолётной мысли до большого плана —
                      <br className="desktop-break" />
                      сохраните то, что имеет значение.
                    </p>
                    <button className="hero-button" onClick={newNote}>
                      <Icon name="plus" size={17} />
                      Создать заметку
                      <Icon name="arrow" size={18} />
                    </button>
                  </div>
                  <HeroArt />
                  <div className="hero-bottom-caption">
                    НЕМНОГО ПОРЯДКА. БОЛЬШЕ ЯСНОСТИ.
                  </div>
                </section>
                <div className="stats">
                  <button className="stat" onClick={() => navigate("notes")}>
                    <span className="stat-icon green">
                      <Icon name="note" size={22} />
                    </span>
                    <div>
                      <span>Всего заметок</span>
                      <strong>{String(notes.length).padStart(2, "0")}</strong>
                    </div>
                    <span className="stat-link">
                      <Icon name="arrow" size={18} />
                    </span>
                  </button>
                  <button
                    className="stat"
                    onClick={() => navigate("collections")}
                  >
                    <span className="stat-icon peach">
                      <Icon name="folder" size={22} />
                    </span>
                    <div>
                      <span>Коллекции</span>
                      <strong>
                        {String(collections.length).padStart(2, "0")}
                      </strong>
                    </div>
                    <span className="stat-link">
                      <Icon name="arrow" size={18} />
                    </span>
                  </button>
                  <button
                    className="stat"
                    onClick={() => navigate("notes", "Избранное")}
                  >
                    <span className="stat-icon lavender">
                      <Icon name="star" size={22} />
                    </span>
                    <div>
                      <span>В избранном</span>
                      <strong>{String(favorites).padStart(2, "0")}</strong>
                    </div>
                    <span className="stat-link">
                      <Icon name="arrow" size={18} />
                    </span>
                  </button>
                </div>
                <section className="notes-section">
                  <div className="section-heading">
                    <h2>
                      Недавние заметки <span>{notes.length}</span>
                    </h2>
                    <button
                      className="text-button"
                      onClick={() => navigate("notes")}
                    >
                      Все заметки
                      <Icon name="arrow" size={17} />
                    </button>
                  </div>
                  <div className="notes-grid">
                    {notes.slice(0, 3).map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                    {notes.length === 0 && (
                      <div className="empty-state">
                        <Icon name="note" size={32} />
                        <h3>Здесь начинается ваша история</h3>
                        <p>Создайте первую заметку и сохраните свою идею.</p>
                        <button className="primary-button" onClick={newNote}>
                          Создать заметку
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {page === "notes" && (
              <section className="all-notes">
                <div className="notes-toolbar">
                  <div className="filter-tabs">
                    {[
                      "Все заметки",
                      "Избранное",
                      ...collections.map((c) => c.name),
                    ].map((label) => (
                      <button
                        key={label}
                        className={filter === label ? "active" : ""}
                        onClick={() => setFilter(label)}
                      >
                        {label === "Избранное" && (
                          <Icon name="star" size={14} />
                        )}{" "}
                        {label}
                      </button>
                    ))}
                  </div>
                  <span className="result-count">
                    {noteCount(visibleNotes.length)}
                  </span>
                </div>
                <div className="notes-grid">
                  {visibleNotes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                  {visibleNotes.length === 0 && (
                    <div className="empty-state">
                      <Icon name={query ? "search" : "note"} size={36} />
                      <h3>
                        {query
                          ? "Ничего не нашлось"
                          : filter === "Избранное"
                            ? "Здесь будет самое важное"
                            : "Место для новой идеи"}
                      </h3>
                      <p>
                        {query
                          ? "Попробуйте другое слово или проверьте написание."
                          : filter === "Избранное"
                            ? "Нажмите на звёздочку у заметки, чтобы добавить её сюда."
                            : "Создайте первую заметку в этой коллекции."}
                      </p>
                      {!query && filter !== "Избранное" && (
                        <button className="primary-button" onClick={newNote}>
                          Создать заметку
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {(page === "overview" || page === "collections") && (
              <section
                className={`collections-section ${page === "collections" ? "full-collections" : ""}`}
              >
                <div className="section-heading">
                  <h2>
                    {page === "overview"
                      ? "Ваши коллекции"
                      : "Всё на своих местах"}
                    {page === "collections" && <span>3</span>}
                  </h2>
                  {page === "overview" && (
                    <button
                      className="text-button"
                      onClick={() => navigate("collections")}
                    >
                      Все коллекции
                      <Icon name="arrow" size={17} />
                    </button>
                  )}
                </div>
                <div className="collections-grid">
                  {collections.map((c) => (
                    <button
                      className="collection-card"
                      key={c.name}
                      onClick={() => navigate("notes", c.name)}
                    >
                      <div className="collection-cover">
                        <img
                          src={`/images/${c.image}`}
                          alt={
                            c.name === "Вдохновение"
                              ? "Солнечный свет сквозь зелёный лес"
                              : c.name === "Работа"
                                ? "Минималистичная современная архитектура"
                                : "Уютное рабочее пространство"
                          }
                          loading="lazy"
                        />
                        <span className="collection-cover-icon">
                          <Icon name="folder" size={21} />
                        </span>
                        <span className="collection-cover-arrow">
                          <Icon name="arrow" size={18} />
                        </span>
                      </div>
                      <div className="collection-info">
                        <div>
                          <h3>{c.name}</h3>
                          {page === "collections" && <p>{c.description}</p>}
                        </div>
                        <span>
                          {noteCount(
                            notes.filter((n) => n.collection === c.name).length,
                          )}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {page === "collections" && (
                  <div className="collection-tip">
                    <Icon name="spark" size={22} />
                    <div>
                      <h3>Большие идеи любят порядок</h3>
                      <p>
                        Выбирайте коллекцию при создании заметки, чтобы легко
                        находить нужное.
                      </p>
                    </div>
                    <button className="text-button" onClick={newNote}>
                      Создать заметку
                      <Icon name="arrow" size={17} />
                    </button>
                  </div>
                )}
              </section>
            )}
            <footer className="page-footer">
              <span>Меньше шума. Больше смысла.</span>
              <span>
                Сделано для ваших идей <span className="footer-spark">✳</span>
              </span>
            </footer>
          </main>
        </div>

        <dialog
          ref={dialog}
          className="editor-dialog"
          onCancel={() => setEditor(null)}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditor(null);
          }}
        >
          {editor && (
            <form onSubmit={saveNote}>
              <div className="dialog-heading">
                <span>
                  <Icon name="note" size={20} />
                  {notes.some((n) => n.id === editor.id)
                    ? "Ваша заметка"
                    : "Новая заметка"}
                </span>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Закрыть"
                  onClick={() => setEditor(null)}
                >
                  <Icon name="close" />
                </button>
              </div>
              <input
                className="title-input"
                aria-label="Название заметки"
                placeholder="С чего начинается идея?"
                required
                maxLength={100}
                value={editor.title}
                onChange={(e) =>
                  setEditor({ ...editor, title: e.target.value })
                }
                autoFocus
              />
              <textarea
                aria-label="Текст заметки"
                placeholder="Просто начните писать…"
                value={editor.content}
                onChange={(e) =>
                  setEditor({ ...editor, content: e.target.value })
                }
              />
              <div className="editor-options">
                <label>
                  Коллекция
                  <select
                    value={editor.collection}
                    onChange={(e) =>
                      setEditor({ ...editor, collection: e.target.value })
                    }
                  >
                    {collections.map((c) => (
                      <option key={c.name}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={`favorite-option ${editor.favorite ? "is-favorite" : ""}`}
                  aria-pressed={editor.favorite}
                  onClick={() =>
                    setEditor({ ...editor, favorite: !editor.favorite })
                  }
                >
                  <Icon name="star" size={18} />В избранное
                </button>
              </div>
              <div className="dialog-footer">
                {notes.some((n) => n.id === editor.id) && (
                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => {
                      if (confirmDelete) {
                        setNotes((prev) =>
                          prev.filter((n) => n.id !== editor.id),
                        );
                        setEditor(null);
                        setToast("Заметка удалена");
                      } else setConfirmDelete(true);
                    }}
                  >
                    <Icon name="trash" size={17} />
                    {confirmDelete ? "Подтвердить удаление" : "Удалить"}
                  </button>
                )}
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditor(null)}
                >
                  Отмена
                </button>
                <button className="primary-button" type="submit">
                  <Icon name="check" size={17} />
                  Сохранить
                </button>
              </div>
            </form>
          )}
        </dialog>
        <dialog
          ref={helpDialog}
          className="help-dialog"
          onCancel={() => setHelpOpen(false)}
          onClick={(e) => {
            if (e.target === e.currentTarget) setHelpOpen(false);
          }}
        >
          <div className="dialog-heading">
            <span>
              <Icon name="leaf" />
              Немного о forma
            </span>
            <button
              className="icon-button"
              aria-label="Закрыть помощь"
              onClick={() => setHelpOpen(false)}
            >
              <Icon name="close" />
            </button>
          </div>
          <h2>Место для ваших мыслей.</h2>
          <p>
            Создавайте заметки, собирайте их в коллекции и отмечайте самое
            важное звёздочкой.
          </p>
          <div className="help-item">
            <Icon name="note" />
            <div>
              <strong>Записывайте без лишних шагов</strong>
              <p>
                Нажмите «Создать заметку». Чтобы изменить запись, откройте её
                карточку.
              </p>
            </div>
          </div>
          <div className="help-item">
            <Icon name="moon" />
            <div>
              <strong>Выбирайте своё настроение</strong>
              <p>Светлая и тёмная темы переключаются внизу бокового меню.</p>
            </div>
          </div>
          <div className="help-item">
            <Icon name="check" />
            <div>
              <strong>Ваши идеи остаются с вами</strong>
              <p>
                Заметки и тема сохраняются в этом браузере на вашем устройстве.
                Очистка данных браузера удалит их.
              </p>
            </div>
          </div>
          <button className="primary-button" onClick={() => setHelpOpen(false)}>
            Всё понятно
            <Icon name="check" size={17} />
          </button>
        </dialog>
        {toast && (
          <div className="toast" role="status">
            <span>
              <Icon name="check" size={17} />
            </span>
            {toast}
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
