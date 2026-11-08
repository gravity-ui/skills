import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ThemeProvider } from "@gravity-ui/uikit";
import "./styles.css";

type Page = "overview" | "projects" | "notes";
type IconName =
  | "overview"
  | "projects"
  | "notes"
  | "search"
  | "plus"
  | "arrow"
  | "arrow-up"
  | "sun"
  | "moon"
  | "chevron"
  | "bell"
  | "close"
  | "check"
  | "calendar"
  | "grid"
  | "list"
  | "leaf"
  | "help"
  | "external"
  | "trash";
function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    projects: (
      <>
        <path d="M3 8V6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        <path d="M3 9h18" />
      </>
    ),
    notes: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4M3 7h3M3 12h3M3 17h3" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    "arrow-up": <path d="M6 18 18 6M6 6h12v12" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="3.7" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: (
      <path d="M20.5 14.2A8.8 8.8 0 0 1 9.8 3.5a8.8 8.8 0 1 0 10.7 10.7Z" />
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18M7 15h2m4 0h2" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    list: <path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" />,
    leaf: (
      <>
        <path d="M20 3C9 3 3 7 5 14s15 9 15-11Z" />
        <path d="M4 21 15 10" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1.5-1.5 3M12 17h.01" />
      </>
    ),
    external: (
      <path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
    ),
    trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />,
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
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  progress: number;
  tasks: number;
  completed: number;
  date: string;
  members: string[];
  status: "active" | "done";
};
type Note = {
  id: string;
  title: string;
  text: string;
  tag: string;
  date: string;
  color: string;
};
const initialProjects: Project[] = [
  {
    id: "1",
    title: "Новый сайт студии",
    description: "Место, где наши идеи обретают форму.",
    category: "Дизайн",
    color: "sage",
    progress: 67,
    tasks: 12,
    completed: 8,
    date: "18 ноября",
    members: ["АК", "МД", "ЕС"],
    status: "active",
  },
  {
    id: "2",
    title: "Мобильное приложение",
    description: "Простой и приятный опыт каждый день.",
    category: "Разработка",
    color: "lavender",
    progress: 40,
    tasks: 10,
    completed: 4,
    date: "24 ноября",
    members: ["АК", "ДП"],
    status: "active",
  },
  {
    id: "3",
    title: "Айдентика Bloom",
    description: "Характер бренда в каждой детали.",
    category: "Брендинг",
    color: "peach",
    progress: 88,
    tasks: 8,
    completed: 7,
    date: "15 ноября",
    members: ["МД", "ЕС"],
    status: "active",
  },
  {
    id: "4",
    title: "Осенняя коллекция",
    description: "Тёплые оттенки и новые истории.",
    category: "Дизайн",
    color: "sand",
    progress: 25,
    tasks: 8,
    completed: 2,
    date: "30 ноября",
    members: ["АК", "ЕС"],
    status: "active",
  },
  {
    id: "5",
    title: "Портфолио 2026",
    description: "Собрали то, чем по-настоящему гордимся.",
    category: "Дизайн",
    color: "sage",
    progress: 100,
    tasks: 6,
    completed: 6,
    date: "2 ноября",
    members: ["АК", "МД"],
    status: "done",
  },
];
const initialNotes: Note[] = [
  {
    id: "1",
    title: "Мысли после встречи",
    text: "Хочется больше воздуха, простоты и внимания к деталям.\n\nОбсудили новый подход к главной странице: меньше элементов, больше смысла. Следующий шаг — собрать мудборд и выбрать направление.\n\nНе забыть: отправить команде референсы до пятницы.",
    tag: "Рабочее",
    date: "Сегодня, 10:24",
    color: "sage",
  },
  {
    id: "2",
    title: "Идеи, которые стоит сохранить",
    text: "Иногда лучшие решения приходят, когда никуда не спешишь.\n\n• Серия открыток с типографикой\n• Небольшой сайт о любимых местах\n• Новая палитра: мох, песок и терракота\n\nДать каждой идее немного времени.",
    tag: "Вдохновение",
    date: "Вчера, 18:40",
    color: "peach",
  },
  {
    id: "3",
    title: "Небольшие планы на неделю",
    text: "Завершить макеты для Bloom.\nСобрать обратную связь по приложению.\nВыделить час на изучение нового.\nПогулять без телефона.",
    tag: "Личное",
    date: "3 ноября, 09:15",
    color: "lavender",
  },
  {
    id: "4",
    title: "Меньше, но лучше",
    text: "Хороший дизайн начинается с вопроса: что здесь действительно нужно?\n\nОставлять только то, что помогает. Не бояться пустого пространства. Помнить о человеке по ту сторону экрана.",
    tag: "Вдохновение",
    date: "2 ноября, 14:05",
    color: "sand",
  },
];
const pageLabels: Record<Page, string> = {
  overview: "Обзор",
  projects: "Проекты",
  notes: "Заметки",
};
function getPage(): Page {
  const value = window.location.hash.slice(1);
  return value === "projects" || value === "notes" ? value : "overview";
}
function readStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}
function saveStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage may be unavailable. */
  }
}

export function App() {
  const [page, setPage] = useState<Page>(getPage);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    readStorage("prostor-theme", "light"),
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    readStorage("prostor-projects", initialProjects),
  );
  const [notes, setNotes] = useState<Note[]>(() =>
    readStorage("prostor-notes", initialNotes),
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [noteFilter, setNoteFilter] = useState("Все заметки");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [projectModal, setProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const [help, setHelp] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onHash = () => {
      setPage(getPage());
      setQuery("");
      setMobileNav(false);
      setProjectModal(false);
      setSelectedProject(null);
      setSelectedNote(null);
      setNewNote(false);
      setNotifications(false);
      setHelp(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    saveStorage("prostor-theme", theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    saveStorage("prostor-projects", projects);
  }, [projects]);
  useEffect(() => {
    saveStorage("prostor-notes", notes);
  }, [notes]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setProjectModal(false);
        setSelectedProject(null);
        setSelectedNote(null);
        setNewNote(false);
        setHelp(false);
        setNotifications(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const activeProjects = projects.filter((p) => p.status === "active");
  const filteredProjects = projects.filter(
    (p) =>
      (filter === "all" ||
        (filter === "active" ? p.status === "active" : p.status === "done")) &&
      `${p.title} ${p.description} ${p.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const filteredNotes = notes.filter(
    (n) =>
      (noteFilter === "Все заметки" || n.tag === noteFilter) &&
      `${n.title} ${n.text}`.toLowerCase().includes(query.toLowerCase()),
  );
  const overviewProjects = activeProjects.slice(0, 3);
  const openNewNote = () => {
    setSelectedNote({
      id: crypto.randomUUID(),
      title: "",
      text: "",
      tag: "Личное",
      date: "Только что",
      color: "sage",
    });
    setNewNote(true);
  };
  const navigate = (next: Page) => {
    window.location.hash = next;
    setPage(next);
    setQuery("");
    setMobileNav(false);
  };
  function createProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title")).trim();
    if (!title) return;
    const date = String(form.get("date"));
    setProjects((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        description:
          String(form.get("description")).trim() ||
          "Новая идея, которая скоро станет реальностью.",
        category: String(form.get("category")),
        color: String(form.get("color")),
        progress: 0,
        tasks: 0,
        completed: 0,
        date: date
          ? new Date(date + "T12:00:00").toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
            })
          : "Без срока",
        members: ["АК"],
        status: "active",
      },
      ...prev,
    ]);
    setProjectModal(false);
    setToast("Новый проект создан");
  }
  function saveNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedNote) return;
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title")).trim();
    if (!title) return;
    const note = {
      ...selectedNote,
      title,
      text: String(form.get("text")),
      tag: String(form.get("tag")),
      date:
        "Сегодня, " +
        new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    };
    setNotes((prev) =>
      newNote
        ? [note, ...prev]
        : prev.map((n) => (n.id === note.id ? note : n)),
    );
    setSelectedNote(null);
    setNewNote(false);
    setToast("Заметка сохранена");
  }
  return (
    <ThemeProvider theme={theme}>
      <div className={`app ${theme}`}>
        {mobileNav && (
          <div className="nav-scrim" onClick={() => setMobileNav(false)} />
        )}
        <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
          <a
            className="brand"
            href="#overview"
            aria-label="Простор — главная"
            onClick={() => setMobileNav(false)}
          >
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>
            <span>
              простор<span className="brand-dot">.</span>
            </span>
          </a>
          <div className="workspace-label">
            <span className="workspace-avatar">А</span>
            <span>
              Личное пространство<small>Всё важное — рядом</small>
            </span>
            <span className="workspace-lock">
              <Icon name="leaf" size={15} />
            </span>
          </div>
          <div className="nav-caption">ПРОСТРАНСТВО</div>
          <nav aria-label="Основная навигация">
            {(["overview", "projects", "notes"] as Page[]).map((p) => (
              <a
                key={p}
                href={`#${p}`}
                className={`nav-link ${page === p ? "active" : ""}`}
                onClick={() => setMobileNav(false)}
                aria-current={page === p ? "page" : undefined}
              >
                <Icon name={p} />
                <span>{pageLabels[p]}</span>
                {p === "projects" ? (
                  <span className="nav-count">{activeProjects.length}</span>
                ) : page === p ? (
                  <span className="nav-active-dot" />
                ) : null}
              </a>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="little-reminder">
              <span className="reminder-illustration">
                <Icon name="leaf" size={24} />
                <span>✧</span>
              </span>
              <strong>В своём ритме</strong>
              <p>
                Большие дела начинаются
                <br />с маленьких шагов.
              </p>
              <span className="reminder-line" />
            </div>
            <button className="help-link" onClick={() => setHelp(true)}>
              <Icon name="help" size={18} />
              Помощь и подсказки
              <Icon name="external" size={14} />
            </button>
            <div className="theme-toggle" aria-label="Цветовая тема">
              <button
                className={theme === "light" ? "selected" : ""}
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
              >
                <Icon name="sun" size={17} />
                Светлая
              </button>
              <button
                className={theme === "dark" ? "selected" : ""}
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
              >
                <Icon name="moon" size={16} />
                Тёмная
              </button>
            </div>
            <div className="profile">
              <div className="avatar profile-avatar">
                АК
                <span />
              </div>
              <div>
                <strong>Александра</strong>
                <span>Личный аккаунт</span>
              </div>
              <span className="profile-badge">FREE</span>
            </div>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumbs">
              <button
                className="mobile-menu icon-button"
                onClick={() => setMobileNav(!mobileNav)}
                aria-label="Открыть меню"
              >
                <Icon name="list" />
              </button>
              <span>Моё пространство</span>
              <Icon name="chevron" size={13} />
              <strong>{pageLabels[page]}</strong>
            </div>
            <div className="topbar-right">
              <span className="today">
                <span className="today-dot" />
                {new Date()
                  .toLocaleDateString("ru-RU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                  .replace(/^./, (letter) => letter.toUpperCase())}
              </span>
              <span className="topbar-separator" />
              <div className="notification-wrap">
                <button
                  className={`icon-button notification-button ${notifications ? "is-active" : ""}`}
                  onClick={() => {
                    setNotifications(!notifications);
                    setHasNotification(false);
                  }}
                  aria-label="Уведомления"
                  aria-expanded={notifications}
                >
                  <Icon name="bell" />
                  {hasNotification && <span className="notification-dot" />}
                </button>
                {notifications && (
                  <div className="notification-popover">
                    <strong>Вы в своём пространстве</strong>
                    <p>
                      Здесь пока тихо. Все проекты и заметки сохраняются
                      автоматически на этом устройстве.
                    </p>
                    <span>
                      <Icon name="check" size={15} />
                      Всё под контролем
                    </span>
                  </div>
                )}
              </div>
              <div className="avatar top-avatar">АК</div>
            </div>
          </header>
          <main>
            <div className="page-heading">
              <div>
                <div className="eyebrow">ВАШ ЛИЧНЫЙ УГОЛОК ПОРЯДКА</div>
                <h1>
                  {page === "overview"
                    ? "Обзор пространства"
                    : pageLabels[page]}
                </h1>
                <p>
                  {page === "overview"
                    ? "Меньше суеты. Больше места для важного."
                    : page === "projects"
                      ? "От первой идеи до последней детали. Всё под рукой."
                      : "Место для мыслей, планов и внезапного вдохновения."}
                </p>
              </div>
              <button
                className="button primary"
                onClick={
                  page === "notes" ? openNewNote : () => setProjectModal(true)
                }
              >
                <Icon name="plus" size={18} />
                {page === "notes" ? "Новая заметка" : "Новый проект"}
              </button>
            </div>
            {page === "overview" && (
              <>
                <section className="welcome-banner">
                  <div className="welcome-content">
                    <div className="welcome-label">
                      <span />
                      ПРОСТРАНСТВО ДЛЯ ВАШИХ ИДЕЙ
                    </div>
                    <h2>
                      Вдохните. Выдохните.
                      <br />
                      Создайте что-то хорошее.
                    </h2>
                    <p>
                      Соберите мысли, расставьте приоритеты
                      <br className="desktop-break" /> и двигайтесь вперёд в
                      своём ритме.
                    </p>
                    <button
                      className="welcome-action"
                      onClick={() => navigate("projects")}
                    >
                      К моим проектам
                      <Icon name="arrow" size={17} />
                    </button>
                  </div>
                  <div className="welcome-photo">
                    <img
                      src="/images/workspace.jpg"
                      alt="Светлое рабочее пространство с растениями и деревянным столом"
                    />
                    <div className="photo-caption">
                      <span />
                      Меньше шума. Больше смысла.
                    </div>
                  </div>
                  <div className="banner-star">✳</div>
                </section>
                <section
                  className="stats-grid"
                  aria-label="Статистика пространства"
                >
                  <button
                    className="stat-card"
                    onClick={() => {
                      setFilter("active");
                      navigate("projects");
                    }}
                  >
                    <div className="stat-icon sage">
                      <Icon name="projects" size={21} />
                    </div>
                    <div className="stat-copy">
                      <span>Активных проектов</span>
                      <strong>
                        {String(activeProjects.length).padStart(2, "0")}
                      </strong>
                    </div>
                    <span className="stat-hint">
                      <span className="tiny-dot" />В процессе
                    </span>
                    <Icon className="stat-arrow" name="arrow-up" size={16} />
                  </button>
                  <button
                    className="stat-card"
                    onClick={() => {
                      setFilter("active");
                      navigate("projects");
                    }}
                  >
                    <div className="stat-icon peach">
                      <Icon name="check" size={21} />
                    </div>
                    <div className="stat-copy">
                      <span>Задач выполнено</span>
                      <strong>
                        {String(
                          projects.reduce((sum, p) => sum + p.completed, 0),
                        ).padStart(2, "0")}
                      </strong>
                    </div>
                    <span className="stat-hint positive">
                      <Icon name="arrow-up" size={12} />
                      Шаг за шагом
                    </span>
                    <Icon className="stat-arrow" name="arrow-up" size={16} />
                  </button>
                  <button
                    className="stat-card"
                    onClick={() => navigate("notes")}
                  >
                    <div className="stat-icon lavender">
                      <Icon name="notes" size={21} />
                    </div>
                    <div className="stat-copy">
                      <span>Заметок и идей</span>
                      <strong>{String(notes.length).padStart(2, "0")}</strong>
                    </div>
                    <span className="stat-hint">Всегда под рукой</span>
                    <Icon className="stat-arrow" name="arrow-up" size={16} />
                  </button>
                </section>
              </>
            )}
            {page !== "notes" && (
              <section className="projects-section">
                <div className="section-heading">
                  <div className="section-title">
                    <h2>{page === "overview" ? "В фокусе" : "Все проекты"}</h2>
                    <span className="count-badge">
                      {page === "overview"
                        ? activeProjects.length
                        : projects.length}
                    </span>
                    {page === "overview" && (
                      <span className="section-description">
                        То, над чем вы работаете сейчас
                      </span>
                    )}
                  </div>
                  {page === "overview" ? (
                    <button
                      className="text-link"
                      onClick={() => {
                        setFilter("all");
                        navigate("projects");
                      }}
                    >
                      Все проекты
                      <Icon name="arrow" size={16} />
                    </button>
                  ) : (
                    <div className="view-switch">
                      <button
                        className={view === "grid" ? "selected" : ""}
                        onClick={() => setView("grid")}
                        aria-label="Показать карточками"
                      >
                        <Icon name="grid" size={18} />
                      </button>
                      <button
                        className={view === "list" ? "selected" : ""}
                        onClick={() => setView("list")}
                        aria-label="Показать списком"
                      >
                        <Icon name="list" size={18} />
                      </button>
                    </div>
                  )}
                </div>
                {page === "projects" && (
                  <div className="filter-toolbar">
                    <div className="tabs">
                      {[
                        {
                          id: "all",
                          label: "Все проекты",
                          count: projects.length,
                        },
                        {
                          id: "active",
                          label: "В работе",
                          count: activeProjects.length,
                        },
                        {
                          id: "done",
                          label: "Завершённые",
                          count: projects.length - activeProjects.length,
                        },
                      ].map((t) => (
                        <button
                          key={t.id}
                          className={filter === t.id ? "active" : ""}
                          onClick={() => setFilter(t.id)}
                        >
                          {t.label}
                          <span>{t.count}</span>
                        </button>
                      ))}
                    </div>
                    <Search
                      value={query}
                      onChange={setQuery}
                      inputRef={searchRef}
                      placeholder="Найти проект…"
                    />
                  </div>
                )}
                <div
                  className={`project-grid ${page === "projects" && view === "list" ? "list-view" : ""}`}
                >
                  {(page === "overview"
                    ? overviewProjects
                    : filteredProjects
                  ).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpen={() => setSelectedProject(project)}
                    />
                  ))}
                  {page === "projects" && !query && filter !== "done" && (
                    <button
                      className="new-project-card"
                      onClick={() => setProjectModal(true)}
                    >
                      <span>
                        <Icon name="plus" size={24} />
                      </span>
                      <strong>Место для новой идеи</strong>
                      <p>Начните с небольшого шага</p>
                    </button>
                  )}
                </div>
                {(page === "overview" ? overviewProjects : filteredProjects)
                  .length === 0 && (
                  <EmptyState
                    icon="projects"
                    title={
                      query ? "Проектов не найдено" : "Здесь пока нет проектов"
                    }
                    text={
                      query
                        ? "Попробуйте другое название или категорию."
                        : "Ваш следующий большой замысел начинается здесь."
                    }
                  />
                )}
              </section>
            )}
            {page === "overview" && (
              <section className="recent-notes">
                <div className="section-heading">
                  <div className="section-title">
                    <h2>Последние заметки</h2>
                    <span className="note-subtitle">
                      Чтобы ничего не потерялось
                    </span>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => navigate("notes")}
                  >
                    Все заметки
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
                <div className="recent-note-grid">
                  {notes.slice(0, 2).map((n) => (
                    <button
                      className="recent-note"
                      key={n.id}
                      onClick={() => setSelectedNote(n)}
                    >
                      <span className={`note-file-icon ${n.color}`}>
                        <Icon name="notes" size={22} />
                      </span>
                      <span className="recent-note-content">
                        <strong>{n.title}</strong>
                        <span>{n.text.split("\n")[0]}</span>
                        <small>
                          {n.date}
                          <span>·</span>
                          {n.tag}
                        </small>
                      </span>
                      <Icon name="arrow-up" size={17} />
                    </button>
                  ))}
                </div>
                {notes.length === 0 && (
                  <EmptyState
                    icon="notes"
                    title="Мысли заслуживают своего места"
                    text="Создайте первую заметку на странице «Заметки»."
                  />
                )}
              </section>
            )}
            {page === "notes" && (
              <section className="notes-section">
                <div className="filter-toolbar">
                  <div className="tabs note-tabs">
                    {["Все заметки", "Рабочее", "Личное", "Вдохновение"].map(
                      (t) => (
                        <button
                          key={t}
                          className={noteFilter === t ? "active" : ""}
                          onClick={() => setNoteFilter(t)}
                        >
                          {t}
                          {t === "Все заметки" && <span>{notes.length}</span>}
                        </button>
                      ),
                    )}
                  </div>
                  <Search
                    value={query}
                    onChange={setQuery}
                    inputRef={searchRef}
                    placeholder="Найти заметку…"
                  />
                </div>
                <div className="notes-grid">
                  {filteredNotes.map((n) => (
                    <button
                      className={`note-card note-${n.color}`}
                      key={n.id}
                      onClick={() => setSelectedNote(n)}
                    >
                      <div className="note-card-top">
                        <span className={`tag ${n.color}`}>{n.tag}</span>
                        <Icon name="arrow-up" size={18} />
                      </div>
                      <h2>{n.title}</h2>
                      <p>{n.text}</p>
                      <div className="note-card-bottom">
                        <Icon name="notes" size={15} />
                        {n.date}
                      </div>
                    </button>
                  ))}
                  <button className="new-note-card" onClick={openNewNote}>
                    <span>
                      <Icon name="plus" size={26} />
                    </span>
                    <strong>Поймать мысль</strong>
                    <p>Пока она не улетела</p>
                  </button>
                </div>
                {filteredNotes.length === 0 && (
                  <EmptyState
                    icon="search"
                    title="Пока ничего не нашлось"
                    text="Попробуйте другой запрос или создайте новую заметку."
                  />
                )}
              </section>
            )}
            <footer>
              <span>
                <span className="footer-flower">✳</span>Больше пространства для
                того, что важно.
              </span>
              <span>
                Сделано с вниманием к вам<span className="footer-dot">·</span>
                Простор, 2026
              </span>
            </footer>
          </main>
        </div>
        {projectModal && (
          <Modal
            title="Начнём что-то хорошее"
            subtitle="Новый проект — первый шаг к большой идее."
            onClose={() => setProjectModal(false)}
          >
            <form onSubmit={createProject}>
              <label>
                Название проекта
                <input
                  name="title"
                  placeholder="Например, сайт моей студии"
                  required
                  maxLength={80}
                  autoFocus
                />
              </label>
              <label>
                Короткое описание
                <textarea
                  name="description"
                  placeholder="О чём этот проект?"
                  rows={3}
                  maxLength={300}
                />
              </label>
              <div className="form-row">
                <label>
                  Категория
                  <select name="category">
                    <option>Дизайн</option>
                    <option>Разработка</option>
                    <option>Брендинг</option>
                    <option>Личное</option>
                    <option>Другое</option>
                  </select>
                </label>
                <label>
                  Срок завершения
                  <input type="date" name="date" />
                </label>
              </div>
              <label>
                Цвет проекта
                <select name="color">
                  <option value="sage">Шалфей</option>
                  <option value="lavender">Лаванда</option>
                  <option value="peach">Персик</option>
                  <option value="sand">Песок</option>
                </select>
              </label>
              <div className="modal-actions">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setProjectModal(false)}
                >
                  Отмена
                </button>
                <button className="button primary" type="submit">
                  <Icon name="plus" size={17} />
                  Создать проект
                </button>
              </div>
            </form>
          </Modal>
        )}
        {selectedProject && (
          <Modal
            title={selectedProject.title}
            subtitle={selectedProject.description}
            onClose={() => setSelectedProject(null)}
          >
            <div className="project-detail-meta">
              <span className={`tag ${selectedProject.color}`}>
                {selectedProject.category}
              </span>
              <span>
                <Icon name="calendar" size={16} />
                {selectedProject.date}
              </span>
            </div>
            <div className="detail-progress">
              <span>
                Прогресс проекта<strong>{selectedProject.progress}%</strong>
              </span>
              <div className={`progress-track ${selectedProject.color}`}>
                <span style={{ width: `${selectedProject.progress}%` }} />
              </div>
            </div>
            <div className="project-summary">
              <Icon name="check" size={21} />
              <span>
                Выполнено {selectedProject.completed} из {selectedProject.tasks}{" "}
                задач
              </span>
            </div>
            <p className="detail-description">
              Каждый небольшой шаг приближает вас к результату. Отметьте
              следующую выполненную задачу, чтобы сохранить прогресс.
            </p>
            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setSelectedProject(null)}
              >
                Закрыть
              </button>
              <button
                className="button primary"
                disabled={selectedProject.status === "done"}
                onClick={() => {
                  const completed = Math.min(
                    selectedProject.completed + 1,
                    selectedProject.tasks || 1,
                  );
                  const tasks = selectedProject.tasks || 1;
                  const updated = {
                    ...selectedProject,
                    tasks,
                    completed,
                    progress: Math.round((completed / tasks) * 100),
                    status: (completed >= tasks
                      ? "done"
                      : "active") as Project["status"],
                  };
                  setProjects((prev) =>
                    prev.map((p) => (p.id === updated.id ? updated : p)),
                  );
                  setSelectedProject(updated);
                  setToast(
                    updated.status === "done"
                      ? "Проект завершён. Отличная работа!"
                      : "Ещё один шаг сделан!",
                  );
                }}
              >
                <Icon name="check" size={17} />
                {selectedProject.status === "done"
                  ? "Проект завершён"
                  : "Выполнить задачу"}
              </button>
            </div>
          </Modal>
        )}
        {selectedNote && (
          <Modal
            title={newNote ? "Поймать мысль" : "Ваша заметка"}
            subtitle="Важное, интересное и просто ваше."
            onClose={() => {
              setSelectedNote(null);
              setNewNote(false);
            }}
          >
            <form onSubmit={saveNote}>
              <label>
                Заголовок
                <input
                  name="title"
                  defaultValue={selectedNote.title}
                  placeholder="О чём вы думаете?"
                  maxLength={100}
                  required
                  autoFocus
                />
              </label>
              <label>
                Заметка
                <textarea
                  className="note-editor"
                  aria-label="Заметка"
                  name="text"
                  defaultValue={selectedNote.text}
                  placeholder="Здесь можно думать вслух…"
                  rows={9}
                />
              </label>
              <label>
                Категория
                <select name="tag" defaultValue={selectedNote.tag}>
                  <option>Личное</option>
                  <option>Рабочее</option>
                  <option>Вдохновение</option>
                </select>
              </label>
              <div className="modal-actions">
                {!newNote && (
                  <button
                    className="delete-note icon-button"
                    type="button"
                    aria-label="Удалить заметку"
                    onClick={() => {
                      setNotes((prev) =>
                        prev.filter((n) => n.id !== selectedNote.id),
                      );
                      setSelectedNote(null);
                      setToast("Заметка удалена");
                    }}
                  >
                    <Icon name="trash" size={19} />
                  </button>
                )}
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => {
                    setSelectedNote(null);
                    setNewNote(false);
                  }}
                >
                  Отмена
                </button>
                <button className="button primary" type="submit">
                  <Icon name="check" size={17} />
                  Сохранить
                </button>
              </div>
            </form>
          </Modal>
        )}
        {help && (
          <Modal
            title="Освойтесь в Просторе"
            subtitle="Здесь всё устроено просто."
            onClose={() => setHelp(false)}
          >
            <div className="help-items">
              <div>
                <span className="stat-icon sage">
                  <Icon name="overview" />
                </span>
                <p>
                  <strong>Всё важное — в обзоре</strong>Следите за проектами и
                  возвращайтесь к последним заметкам.
                </p>
              </div>
              <div>
                <span className="stat-icon peach">
                  <Icon name="projects" />
                </span>
                <p>
                  <strong>Двигайтесь шаг за шагом</strong>Создавайте проекты,
                  открывайте карточку и отмечайте выполненные задачи.
                </p>
              </div>
              <div>
                <span className="stat-icon lavender">
                  <Icon name="notes" />
                </span>
                <p>
                  <strong>Сохраняйте свои мысли</strong>Добавляйте и
                  редактируйте заметки. Данные хранятся в этом браузере.
                </p>
              </div>
              <div>
                <span className="stat-icon sand">
                  <Icon name="moon" />
                </span>
                <p>
                  <strong>Выберите своё настроение</strong>Переключатель светлой
                  и тёмной темы находится внизу меню.
                </p>
              </div>
            </div>
            <button
              className="button primary help-done"
              onClick={() => setHelp(false)}
            >
              Теперь всё понятно
              <Icon name="check" size={17} />
            </button>
          </Modal>
        )}
        {toast && (
          <div className="toast" role="status">
            <span>
              <Icon name="check" size={17} />
            </span>
            {toast}
            <button
              className="icon-button"
              aria-label="Закрыть уведомление"
              onClick={() => setToast("")}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  return (
    <button className="project-card" onClick={onOpen}>
      <div className="project-card-top">
        <span className={`project-symbol ${project.color}`}>
          {project.color === "lavender" ? (
            <span className="app-symbol">
              <i />
              <i />
              <i />
              <i />
            </span>
          ) : project.color === "peach" ? (
            <span className="bloom-symbol">✳</span>
          ) : project.color === "sand" ? (
            <Icon name="leaf" size={23} />
          ) : (
            <span className="web-symbol">
              <i />
              <i />
              <i />
            </span>
          )}
        </span>
        <span className={`tag ${project.color}`}>{project.category}</span>
        <span className="project-more">
          <Icon name="arrow-up" size={17} />
        </span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="project-progress-label">
        <span>{project.status === "done" ? "Завершён" : "В процессе"}</span>
        <strong>{project.progress}%</strong>
      </div>
      <div className={`progress-track ${project.color}`}>
        <span style={{ width: `${project.progress}%` }} />
      </div>
      <div className="project-card-bottom">
        <div className="avatar-stack">
          {project.members.map((m, i) => (
            <span key={m} className={`member-avatar member-${i % 4}`} title={m}>
              {m}
            </span>
          ))}
        </div>
        <span className="project-date">
          <Icon name="calendar" size={14} />
          {project.date}
        </span>
        <span className="project-tasks">
          <Icon name="check" size={14} />
          {project.completed}/{project.tasks}
        </span>
      </div>
    </button>
  );
}
function Search({
  value,
  onChange,
  inputRef,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  placeholder: string;
}) {
  return (
    <div className="search-field">
      <Icon name="search" size={17} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value ? (
        <button
          className="icon-button"
          onClick={() => onChange("")}
          aria-label="Очистить поиск"
        >
          <Icon name="close" size={14} />
        </button>
      ) : (
        <kbd>⌘ K</kbd>
      )}
    </div>
  );
}
function EmptyState({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, textarea, select, [tabindex="0"]',
        ) || [],
      );
    const input = dialogRef.current?.querySelector<HTMLElement>(
      "[autofocus], input, textarea",
    );
    (input || focusable()[0])?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = focusable();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", trap);
      prev?.focus();
    };
  }, []);
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={dialogRef}
      >
        <button
          className="modal-close icon-button"
          onClick={onClose}
          aria-label="Закрыть окно"
        >
          <Icon name="close" />
        </button>
        <span className="modal-flower">✳</span>
        <h2 id="modal-title">{title}</h2>
        <p className="modal-subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
