import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "folder"
  | "note"
  | "sun"
  | "moon"
  | "arrow"
  | "plus"
  | "chevron"
  | "bell"
  | "search"
  | "close"
  | "check"
  | "clock"
  | "pin"
  | "trash"
  | "play"
  | "pause"
  | "reset"
  | "spark"
  | "link"
  | "leaf";
function Icon({
  name,
  size = 20,
  ...props
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    folder: (
      <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    ),
    note: (
      <>
        <path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9Z" />
        <path d="M14 3v7h7M7 14h10M7 17h6" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
      </>
    ),
    moon: <path d="M20.5 14a8.5 8.5 0 0 1-10.5-10.5A8.5 8.5 0 1 0 20.5 14Z" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    pin: <path d="m14 3 7 7-4 1-3 5-2-2-6 6m2-10 5-3 1-4M8 10l6 6" />,
    trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />,
    play: <path d="m9 5 11 7-11 7V5Z" />,
    pause: <path d="M8 5v14M16 5v14" />,
    reset: <path d="M3 11a9 9 0 1 1 2.6 7M3 4v7h7" />,
    spark: (
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
    ),
    link: (
      <path
        d="m10 13 4-4m-6 6-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 4 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0"
        transform="translate(2 1)"
      />
    ),
    leaf: <path d="M5 19C-1 7 11 2 21 3c0 11-4 20-16 16ZM5 19 16 8" />,
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
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: IconName;
  due: string;
  tasks: { id: string; text: string; done: boolean }[];
};
type Note = {
  id: string;
  title: string;
  content: string;
  tag: string;
  date: string;
  pinned: boolean;
};
const initialProjects: Project[] = [
  {
    id: "1",
    name: "Новый взгляд на бренд",
    description: "Айдентика, которая рассказывает нашу историю.",
    color: "purple",
    icon: "spark",
    due: "2026-11-18",
    tasks: [
      { id: "11", text: "Собрать референсы и мудборд", done: true },
      { id: "12", text: "Определить цветовую палитру", done: true },
      { id: "13", text: "Разработать концепцию логотипа", done: true },
      { id: "14", text: "Подготовить презентацию", done: false },
    ],
  },
  {
    id: "2",
    name: "Сайт для студии",
    description: "Место, где наши идеи встречаются с людьми.",
    color: "blue",
    icon: "link",
    due: "2026-11-24",
    tasks: [
      { id: "21", text: "Продумать структуру сайта", done: true },
      { id: "22", text: "Создать дизайн главной страницы", done: true },
      { id: "23", text: "Сверстать внутренние страницы", done: false },
      { id: "24", text: "Проверить мобильную версию", done: false },
    ],
  },
  {
    id: "3",
    name: "Личный рост",
    description: "Маленькие шаги к большим переменам.",
    color: "green",
    icon: "leaf",
    due: "2026-11-30",
    tasks: [
      { id: "31", text: "Составить план обучения", done: true },
      { id: "32", text: "Прочитать новую книгу", done: false },
    ],
  },
];
const initialNotes: Note[] = [
  {
    id: "1",
    title: "Идеи приходят в движении",
    content:
      "Больше гулять без наушников. Смотреть по сторонам. Замечать детали, из которых потом складывается что-то большое.",
    tag: "Вдохновение",
    date: "2026-11-05",
    pinned: true,
  },
  {
    id: "2",
    title: "Меньше, но лучше",
    content:
      "На этой неделе — один главный фокус на день. Оставлять пространство для глубокого погружения и неожиданных идей.",
    tag: "Мысли",
    date: "2026-11-04",
    pinned: false,
  },
  {
    id: "3",
    title: "Для следующего проекта",
    content:
      "Попробовать сочетание крупной типографики и живых текстур. Больше воздуха, естественные оттенки и простые формы.",
    tag: "Дизайн",
    date: "2026-11-03",
    pinned: false,
  },
];
function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}
const pageNames = { overview: "Обзор", projects: "Проекты", notes: "Заметки" };
type Page = keyof typeof pageNames;
function currentPage(): Page {
  const hash = location.hash.slice(1);
  return hash === "projects" || hash === "notes" ? hash : "overview";
}
const formatDate = (value: string) =>
  new Date(value + "T12:00:00")
    .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
    .replace(".", "");

export function App() {
  const [page, setPage] = useState<Page>(currentPage);
  const [theme, setTheme] = useStored<"light" | "dark">(
    "orbita-theme",
    "light",
  );
  const [projects, setProjects] = useStored("orbita-projects", initialProjects);
  const [notes, setNotes] = useStored("orbita-notes", initialNotes);
  const [query, setQuery] = useState("");
  const [projectModal, setProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<Note | "new" | null>(null);
  const [notifications, setNotifications] = useState(false);
  const [toast, setToast] = useState("");
  const [seconds, setSeconds] = useStored("orbita-timer", 25 * 60);
  const [running, setRunning] = useState(false);
  const [projectFilter, setProjectFilter] = useState("all");
  const [noteFilter, setNoteFilter] = useState("Все заметки");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const notify = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
  useEffect(() => {
    const onHash = () => {
      setPage(currentPage());
      setQuery("");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(
      () => setSeconds((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(interval);
  }, [running]);
  useEffect(() => {
    if (running && seconds === 0) {
      setRunning(false);
      notify("Отличная работа! Время сделать перерыв.");
    }
  }, [seconds, running]);
  const navigate = (next: Page) => {
    location.hash = next;
    setPage(next);
    setQuery("");
  };
  const completed = projects
    .flatMap((p) => p.tasks)
    .filter((t) => t.done).length;
  const taskCount = projects.flatMap((p) => p.tasks).length;
  const pending = taskCount - completed;
  const active = projects.filter(
    (p) => !p.tasks.length || p.tasks.some((t) => !t.done),
  );
  const selected = projects.find((p) => p.id === selectedProject);
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (projectFilter === "all" ||
        (projectFilter === "active"
          ? !p.tasks.length || p.tasks.some((t) => !t.done)
          : p.tasks.length > 0 && p.tasks.every((t) => t.done))),
  );
  const filteredNotes = [...notes]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    .filter(
      (n) =>
        `${n.title} ${n.content}`.toLowerCase().includes(query.toLowerCase()) &&
        (noteFilter === "Все заметки" || n.pinned),
    );
  function toggleTask(projectId: string, taskId: string) {
    setProjects((items) =>
      items.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t,
              ),
            }
          : p,
      ),
    );
  }

  function projectCard(p: Project, compact = false) {
    const done = p.tasks.filter((t) => t.done).length;
    const percent = p.tasks.length
      ? Math.round((done / p.tasks.length) * 100)
      : 0;
    return (
      <button
        key={p.id}
        className={`project-card ${compact ? "compact" : ""}`}
        onClick={() => setSelectedProject(p.id)}
      >
        <div className={`project-icon ${p.color}`}>
          <Icon name={p.icon} size={23} />
        </div>
        <div className="project-info">
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          {!compact && (
            <div className="project-card-status">
              <span className={`status-dot ${percent === 100 ? "done" : ""}`} />
              {percent === 100 ? "Завершён" : "В работе"}
            </div>
          )}
        </div>
        <div className="project-progress">
          <div>
            <span>
              {done} из {p.tasks.length} задач
            </span>
            <strong>{percent}%</strong>
          </div>
          <div className="progress-track">
            <span className={p.color} style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="project-due">
          <Icon name="clock" size={14} />
          {formatDate(p.due)}
        </div>
        <Icon name="chevron" size={17} className="project-arrow" />
      </button>
    );
  }
  function noteCard(n: Note) {
    return (
      <button className="note-card" key={n.id} onClick={() => setNoteModal(n)}>
        <div className="note-card-top">
          <span className={`note-tag tag-${n.tag}`}>{n.tag}</span>
          {n.pinned && <Icon name="pin" size={15} />}
        </div>
        <h3>{n.title}</h3>
        <p>{n.content}</p>
        <div className="note-bottom">
          <span>{formatDate(n.date)}</span>
          <Icon name="arrow" size={17} />
        </div>
      </button>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#overview" className="brand" aria-label="Орбита — главная">
          <span className="brand-mark">
            <span />
          </span>
          орбита<span className="brand-period">.</span>
        </a>
        <div className="workspace-label">ЛИЧНОЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Основная навигация">
          {(Object.keys(pageNames) as Page[]).map((p) => (
            <a
              key={p}
              href={`#${p}`}
              className={`nav-item ${page === p ? "active" : ""}`}
              aria-label={pageNames[p]}
              aria-current={page === p ? "page" : undefined}
            >
              <Icon
                name={
                  p === "overview"
                    ? "grid"
                    : p === "projects"
                      ? "folder"
                      : "note"
                }
              />
              <span>{pageNames[p]}</span>
              {p === "projects" && (
                <span className="nav-count">{projects.length}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="space-message">
            <div className="little-orbit">✳</div>
            <p>
              Место для мыслей.
              <br />
              Пространство для роста.
            </p>
            <span>В своём ритме, на своей орбите.</span>
          </div>
          <div className="theme-control" aria-label="Выбор темы">
            <button
              onClick={() => setTheme("light")}
              aria-label="Светлая тема"
              className={theme === "light" ? "selected" : ""}
              aria-pressed={theme === "light"}
            >
              <Icon name="sun" size={17} />
              Светлая
            </button>
            <button
              onClick={() => setTheme("dark")}
              aria-label="Тёмная тема"
              className={theme === "dark" ? "selected" : ""}
              aria-pressed={theme === "dark"}
            >
              <Icon name="moon" size={17} />
              Тёмная
            </button>
          </div>
          <div className="profile">
            <div className="avatar">А</div>
            <div>
              <strong>Александр</strong>
              <span>Личное пространство</span>
            </div>
            <span className="online-indicator" title="Всё сохранено" />
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Моё пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{pageNames[page]}</strong>
          </div>
          <div className="topbar-right">
            <span className="today-date">
              {new Date()
                .toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                .replace(" г.", "")}
            </span>
            <span className="header-divider" />
            <div className="notifications-wrap">
              <button
                className={`icon-button notification-button ${notifications ? "pressed" : ""}`}
                aria-label="Уведомления"
                aria-expanded={notifications}
                onClick={() => setNotifications(!notifications)}
              >
                <Icon name="bell" size={19} />
                <span />
              </button>
              {notifications && (
                <div className="notifications-panel">
                  <strong>Всё под контролем</strong>
                  <p>
                    У вас {pending}{" "}
                    {pending === 1
                      ? "незавершённая задача"
                      : "незавершённых задач"}{" "}
                    в проектах. Двигайтесь в своём ритме.
                  </p>
                  <button
                    onClick={() => {
                      navigate("projects");
                      setNotifications(false);
                    }}
                  >
                    Открыть проекты <Icon name="arrow" size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "overview"
                  ? "ВАШ МАЛЕНЬКИЙ ЦЕНТР УПРАВЛЕНИЯ"
                  : page === "projects"
                    ? "ОТ ПЕРВОЙ ИДЕИ ДО РЕЗУЛЬТАТА"
                    : "ЧТОБЫ НИЧЕГО НЕ ПОТЕРЯЛОСЬ"}
              </div>
              <h1>
                {page === "overview" ? (
                  <>
                    Всё начинается с идеи<span className="heading-dot">.</span>
                  </>
                ) : page === "projects" ? (
                  "Мои проекты"
                ) : (
                  "Мои заметки"
                )}
              </h1>
              <p>
                {page === "overview"
                  ? "Немного фокуса — и важное становится возможным."
                  : page === "projects"
                    ? "Большие замыслы. Понятные шаги. Ваш темп."
                    : "Идеи, мысли и маленькие открытия — в одном месте."}
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() =>
                page === "notes" ? setNoteModal("new") : setProjectModal(true)
              }
            >
              <Icon name="plus" size={18} />
              {page === "notes" ? "Новая заметка" : "Новый проект"}
            </button>
          </div>

          {page === "overview" && (
            <>
              <section className="stats-grid" aria-label="Статистика">
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Активные проекты</span>
                    <Icon name="folder" size={19} />
                  </div>
                  <div className="stat-value">
                    {active.length.toString().padStart(2, "0")}
                    <span className="stat-badge">
                      <span />
                      Всё в движении
                    </span>
                  </div>
                  <p>От идей к большим результатам</p>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Задачи в фокусе</span>
                    <Icon name="check" size={20} />
                  </div>
                  <div className="stat-value">
                    {pending.toString().padStart(2, "0")}
                    <span className="stat-detail">осталось сделать</span>
                  </div>
                  <p>По одному шагу за раз</p>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Общий прогресс</span>
                    <Icon name="spark" size={19} />
                  </div>
                  <div className="stat-value">
                    {taskCount ? Math.round((completed / taskCount) * 100) : 0}
                    <span className="percent-sign">%</span>
                    <span className="mini-bars" aria-hidden="true">
                      {[25, 38, 30, 48, 43, 65, 61, 82, 74, 100].map((h, i) => (
                        <i key={i} style={{ height: `${h}%` }} />
                      ))}
                    </span>
                  </div>
                  <p>Каждый шаг имеет значение</p>
                </div>
              </section>
              <div className="overview-columns">
                <div className="projects-section">
                  <div className="section-heading">
                    <h2>
                      В работе <span>{active.length}</span>
                    </h2>
                    <button
                      className="text-button"
                      onClick={() => navigate("projects")}
                    >
                      Все проекты <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  <div className="project-list">
                    {active.slice(0, 3).map((p) => projectCard(p, true))}
                    {!active.length && (
                      <div className="empty-state">
                        <Icon name="check" size={30} />
                        <h3>Всё готово!</h3>
                        <p>Самое время для новой идеи.</p>
                      </div>
                    )}
                  </div>
                  <button
                    className="add-project-button"
                    onClick={() => setProjectModal(true)}
                  >
                    <Icon name="plus" size={17} />
                    Дать жизнь новой идее
                  </button>
                </div>
                <section
                  className={`focus-card ${running ? "is-running" : ""}`}
                >
                  <div className="focus-heading">
                    <span>
                      <span className="focus-dot" />
                      ВРЕМЯ ДЛЯ ГЛАВНОГО
                    </span>
                    <Icon name="spark" size={19} />
                  </div>
                  <div className="orbit-art" aria-hidden="true">
                    <div className="orbit-ring ring-one" />
                    <div className="orbit-ring ring-two" />
                    <div className="orbit-ring ring-three" />
                    <div className="orbit-planet" />
                    <div className="orbit-moon" />
                    <span className="orbit-star star-one">✳</span>
                    <span className="orbit-star star-two">+</span>
                    <span className="orbit-small-dot" />
                  </div>
                  <div className="focus-content">
                    <h2>{running ? "Вы в потоке." : "Поймайте свой фокус."}</h2>
                    <p>
                      {running
                        ? "Один момент. Одна задача. Вы справляетесь."
                        : "Одна задача. Никакого шума. Только вы и то, что важно."}
                    </p>
                    <div className="focus-controls">
                      <button
                        className="focus-button"
                        onClick={() => {
                          if (seconds === 0) setSeconds(1500);
                          setRunning(!running);
                        }}
                      >
                        <Icon name={running ? "pause" : "play"} size={16} />
                        {running
                          ? "Пауза"
                          : seconds < 1500 && seconds > 0
                            ? "Продолжить"
                            : "Начать фокус"}
                        <span>
                          {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                          {String(seconds % 60).padStart(2, "0")}
                        </span>
                      </button>
                      {seconds < 1500 && (
                        <button
                          className="timer-reset"
                          aria-label="Сбросить таймер"
                          onClick={() => {
                            setRunning(false);
                            setSeconds(1500);
                          }}
                        >
                          <Icon name="reset" size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              </div>
              <section className="notes-section">
                <div className="section-heading">
                  <h2>
                    На полях{" "}
                    <span className="section-subtitle">Пока не забылось</span>
                  </h2>
                  <button
                    className="text-button"
                    onClick={() => navigate("notes")}
                  >
                    Все заметки <Icon name="arrow" size={16} />
                  </button>
                </div>
                <div className="notes-grid">
                  {[...notes]
                    .sort((a, b) => Number(b.pinned) - Number(a.pinned))
                    .slice(0, 3)
                    .map(noteCard)}
                  {!notes.length && (
                    <button
                      className="empty-note"
                      onClick={() => setNoteModal("new")}
                    >
                      <Icon name="plus" />
                      Записать первую мысль
                    </button>
                  )}
                </div>
              </section>
            </>
          )}

          {page === "projects" && (
            <>
              <div className="collection-toolbar">
                <div className="filter-tabs">
                  {[
                    ["all", "Все проекты"],
                    ["active", "В работе"],
                    ["done", "Завершённые"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      className={projectFilter === value ? "selected" : ""}
                      onClick={() => setProjectFilter(value)}
                    >
                      {label}
                      {value === "all" && <span>{projects.length}</span>}
                    </button>
                  ))}
                </div>
                <label className="search-field">
                  <Icon name="search" size={17} />
                  <input
                    placeholder="Найти проект…"
                    aria-label="Найти проект"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="project-grid">
                {filteredProjects.map((p) => projectCard(p))}
                <button
                  className="new-project-card"
                  onClick={() => setProjectModal(true)}
                >
                  <span>
                    <Icon name="plus" size={25} />
                  </span>
                  <h3>Здесь начнётся что-то новое</h3>
                  <p>Создайте проект для своей следующей идеи</p>
                </button>
              </div>
              {!filteredProjects.length && (
                <div className="empty-state">
                  <Icon name="folder" size={28} />
                  <h3>
                    {query ? "Ничего не нашлось" : "Здесь пока нет проектов"}
                  </h3>
                  <p>
                    {query
                      ? "Попробуйте другое название."
                      : "Ваши проекты появятся здесь."}
                  </p>
                </div>
              )}
            </>
          )}

          {page === "notes" && (
            <>
              <div className="collection-toolbar">
                <div className="filter-tabs">
                  {["Все заметки", "Закреплённые"].map((label) => (
                    <button
                      key={label}
                      className={noteFilter === label ? "selected" : ""}
                      onClick={() => setNoteFilter(label)}
                    >
                      {label}
                      {label === "Все заметки" && <span>{notes.length}</span>}
                    </button>
                  ))}
                </div>
                <label className="search-field">
                  <Icon name="search" size={17} />
                  <input
                    placeholder="Найти мысль…"
                    aria-label="Найти заметку"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="notes-grid full-notes">
                {filteredNotes.map(noteCard)}
                <button
                  className="new-project-card"
                  onClick={() => setNoteModal("new")}
                >
                  <span>
                    <Icon name="plus" size={25} />
                  </span>
                  <h3>Есть мысль?</h3>
                  <p>Дайте ей место здесь</p>
                </button>
              </div>
              {!filteredNotes.length && (
                <div className="empty-state">
                  <Icon name="note" size={28} />
                  <h3>{query ? "Ничего не нашлось" : "Пока пусто"}</h3>
                  <p>
                    {query
                      ? "Попробуйте поискать по-другому."
                      : "Сохраните мысль или закрепите важную заметку."}
                  </p>
                </div>
              )}
            </>
          )}
          <footer>
            <span className="footer-orbit">◎</span>Не спешите. Вы на своей
            орбите.
            <span className="footer-right">
              <span />
              Все изменения сохранены
            </span>
          </footer>
        </main>
      </div>

      {projectModal && (
        <Modal
          title="Дадим идее начало"
          subtitle="Любой большой результат начинается с первого шага."
          onClose={() => setProjectModal(false)}
        >
          <ProjectForm
            onSave={(p) => {
              setProjects([...projects, p]);
              setProjectModal(false);
              notify("Новый проект на вашей орбите");
            }}
          />
        </Modal>
      )}
      {selected && (
        <Modal
          title={selected.name}
          subtitle={selected.description}
          onClose={() => setSelectedProject(null)}
        >
          <div className="detail-meta">
            <span className={`project-icon ${selected.color}`}>
              <Icon name={selected.icon} />
            </span>
            <span>Планируем закончить {formatDate(selected.due)}</span>
            <strong>
              {selected.tasks.filter((t) => t.done).length}/
              {selected.tasks.length}
            </strong>
          </div>
          <h3 className="tasks-title">Шаги к результату</h3>
          <div className="task-list">
            {selected.tasks.map((t) => (
              <label
                className={`task-row ${t.done ? "task-done" : ""}`}
                key={t.id}
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(selected.id, t.id)}
                />
                <span>{t.text}</span>
              </label>
            ))}
            {!selected.tasks.length && (
              <p className="muted">Добавьте первый шаг для вашего проекта.</p>
            )}
          </div>
          <form
            className="add-task-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const input = form.elements.namedItem("task") as HTMLInputElement;
              if (!input.value.trim()) return;
              setProjects(
                projects.map((p) =>
                  p.id === selected.id
                    ? {
                        ...p,
                        tasks: [
                          ...p.tasks,
                          {
                            id: crypto.randomUUID(),
                            text: input.value.trim(),
                            done: false,
                          },
                        ],
                      }
                    : p,
                ),
              );
              form.reset();
            }}
          >
            <input
              name="task"
              placeholder="Следующий шаг…"
              required
              maxLength={120}
              aria-label="Новая задача"
            />
            <button className="primary-button" aria-label="Добавить задачу">
              <Icon name="plus" size={19} />
            </button>
          </form>
          <div className="modal-actions">
            <button
              className="text-button danger"
              onClick={() => {
                setProjects(projects.filter((p) => p.id !== selected.id));
                setSelectedProject(null);
                notify("Проект удалён");
              }}
            >
              <Icon name="trash" size={16} />
              Удалить проект
            </button>
            <button
              className="secondary-button"
              onClick={() => setSelectedProject(null)}
            >
              Готово
            </button>
          </div>
        </Modal>
      )}
      {noteModal && (
        <Modal
          title={noteModal === "new" ? "Поймайте мысль" : "Ваша заметка"}
          subtitle="Иногда самые простые мысли становятся лучшими идеями."
          onClose={() => setNoteModal(null)}
        >
          <NoteForm
            note={noteModal === "new" ? undefined : noteModal}
            onSave={(n) => {
              setNotes(
                noteModal === "new"
                  ? [n, ...notes]
                  : notes.map((item) => (item.id === n.id ? n : item)),
              );
              setNoteModal(null);
              notify("Заметка сохранена");
            }}
            onDelete={
              noteModal === "new"
                ? undefined
                : () => {
                    setNotes(notes.filter((n) => n.id !== noteModal.id));
                    setNoteModal(null);
                    notify("Заметка удалена");
                  }
            }
          />
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}

function Modal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first =
      ref.current?.querySelector<HTMLElement>("input, textarea, select") ??
      ref.current?.querySelector<HTMLElement>("button");
    first?.focus();
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const elements = Array.from(
          ref.current?.querySelectorAll<HTMLElement>(
            'button, input, textarea, select, [tabindex="0"]',
          ) ?? [],
        );
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
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
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          className="icon-button modal-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <Icon name="close" />
        </button>
        <div className="modal-eyebrow">ВАШЕ ПРОСТРАНСТВО</div>
        <h2 id="modal-title">{title}</h2>
        <p className="modal-subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
function ProjectForm({ onSave }: { onSave: (project: Project) => void }) {
  const [color, setColor] = useState("purple");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name")).trim();
    if (!name) return;
    onSave({
      id: crypto.randomUUID(),
      name,
      description: String(data.get("description")).trim(),
      due: String(data.get("due")),
      color,
      icon: color === "green" ? "leaf" : color === "blue" ? "link" : "spark",
      tasks: [],
    });
  }
  return (
    <form className="editor-form" onSubmit={submit}>
      <label>
        Название проекта
        <input
          name="name"
          required
          maxLength={70}
          placeholder="Например, моя большая идея"
          autoFocus
        />
      </label>
      <label>
        Пару слов о проекте
        <textarea
          name="description"
          rows={3}
          maxLength={220}
          placeholder="Что вы хотите создать?"
        />
      </label>
      <label>
        Когда планируете закончить?
        <input name="due" type="date" required defaultValue="2026-11-30" />
      </label>
      <fieldset className="color-picker">
        <legend>Цвет настроения</legend>
        {["purple", "blue", "green", "orange"].map((c) => (
          <button
            key={c}
            type="button"
            aria-label={
              {
                purple: "Фиолетовый",
                blue: "Синий",
                green: "Зелёный",
                orange: "Оранжевый",
              }[c]
            }
            aria-pressed={c === color}
            className={`${c} ${c === color ? "chosen" : ""}`}
            onClick={() => setColor(c)}
          >
            {c === color && <Icon name="check" size={16} />}
          </button>
        ))}
      </fieldset>
      <button className="primary-button form-submit" type="submit">
        <Icon name="plus" size={18} />
        Создать проект
      </button>
    </form>
  );
}
function NoteForm({
  note,
  onSave,
  onDelete,
}: {
  note?: Note;
  onSave: (note: Note) => void;
  onDelete?: () => void;
}) {
  const [pinned, setPinned] = useState(note?.pinned ?? false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title")).trim();
    if (!title) return;
    onSave({
      id: note?.id ?? crypto.randomUUID(),
      title,
      content: String(data.get("content")).trim(),
      tag: String(data.get("tag")),
      date: new Date().toLocaleDateString("en-CA"),
      pinned,
    });
  }
  return (
    <form className="editor-form" onSubmit={submit}>
      <label>
        Заголовок
        <input
          name="title"
          required
          maxLength={80}
          defaultValue={note?.title}
          placeholder="С чего начинается ваша мысль?"
          autoFocus
        />
      </label>
      <label>
        Ваша мысль
        <textarea
          name="content"
          aria-label="Ваша мысль"
          rows={6}
          required
          defaultValue={note?.content}
          placeholder="Здесь можно просто быть собой…"
        />
      </label>
      <div className="note-form-options">
        <label>
          Категория
          <select name="tag" defaultValue={note?.tag ?? "Мысли"}>
            {["Мысли", "Вдохновение", "Дизайн", "Личное"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <button
          className={`secondary-button ${pinned ? "pin-selected" : ""}`}
          type="button"
          aria-pressed={pinned}
          onClick={() => setPinned(!pinned)}
        >
          <Icon name="pin" size={16} />
          {pinned ? "Закреплена" : "Закрепить"}
        </button>
      </div>
      <div className="modal-actions">
        {onDelete ? (
          <button
            type="button"
            className="text-button danger"
            onClick={onDelete}
          >
            <Icon name="trash" size={16} />
            Удалить
          </button>
        ) : (
          <span />
        )}
        <button className="primary-button" type="submit">
          <Icon name="check" size={17} />
          Сохранить заметку
        </button>
      </div>
    </form>
  );
}
