import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { ThemeProvider } from "@gravity-ui/uikit";
import "./styles.css";

type Page = "overview" | "projects" | "notes";
type Project = {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  progress: number;
  date: string;
  image: string;
  status: "active" | "done";
};
type Note = {
  id: string;
  title: string;
  text: string;
  color: string;
  date: string;
};
type IconName =
  | "grid"
  | "folder"
  | "note"
  | "search"
  | "bell"
  | "sun"
  | "moon"
  | "plus"
  | "arrow"
  | "chevron"
  | "close"
  | "check"
  | "clock"
  | "dots"
  | "external"
  | "spark"
  | "trash";
const paths: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="15" y="3" width="6" height="6" rx="1.5" />
      <rect x="3" y="15" width="6" height="6" rx="1.5" />
      <rect x="15" y="15" width="6" height="6" rx="1.5" />
    </>
  ),
  folder: (
    <path d="M3 8V6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
  ),
  note: (
    <>
      <path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9M14 3v7h7L14 3Z" />
      <path d="M7 14h10M7 17h7" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M20.5 13a8.5 8.5 0 1 1-9.6-9.5 6.5 6.5 0 0 0 9.6 9.5Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  chevron: <path d="m8 10 4 4 4-4" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  dots: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  external: (
    <path d="M14 3h7v7m0-7L10 14M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
  ),
  spark: (
    <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
  ),
  trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />,
};
function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
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
function Logo() {
  return (
    <span className="brand">
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20 2c9 0 11 9 4 16 10-3 16 3 12 11-4 8-13 5-16-4-2 11-11 15-17 8-6-7 0-14 10-13C3 16 4 6 12 4c3-1 6 2 8 7V2Z"
          fill="currentColor"
        />
      </svg>
      <span>
        orbit<span className="brand-dot">.</span>
      </span>
    </span>
  );
}
const initialProjects: Project[] = [
  {
    id: "1",
    name: "Новый взгляд на бренд",
    description: "Айдентика, которая говорит сама за себя",
    category: "Дизайн",
    color: "purple",
    progress: 65,
    date: "20 ноября",
    image: "architecture",
    status: "active",
  },
  {
    id: "2",
    name: "Ближе к природе",
    description: "Веб-сайт для осознанных путешествий",
    category: "Веб-сайт",
    color: "green",
    progress: 40,
    date: "24 ноября",
    image: "nature",
    status: "active",
  },
  {
    id: "3",
    name: "Искусство в деталях",
    description: "Коллекция идей для нового сезона",
    category: "Вдохновение",
    color: "orange",
    progress: 85,
    date: "28 ноября",
    image: "art",
    status: "active",
  },
];
const initialNotes: Note[] = [
  {
    id: "1",
    title: "Идеи приходят в движении",
    text: "Попробовать новый маршрут до работы. Посмотреть на привычные вещи под другим углом. Взять с собой блокнот.",
    color: "yellow",
    date: "Сегодня",
  },
  {
    id: "2",
    title: "Меньше, но лучше",
    text: "Оставить в проекте только то, что действительно важно. Пространство — тоже часть дизайна.",
    color: "lavender",
    date: "Вчера",
  },
  {
    id: "3",
    title: "На этой неделе",
    text: "Собрать мудборд для нового проекта. Найти время для книги. Закончить то, что давно откладывалось.",
    color: "mint",
    date: "3 ноября",
  },
];
function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function getPage(): Page {
  const p = window.location.hash.slice(1);
  return p === "projects" || p === "notes" ? p : "overview";
}
const pageLabels = { overview: "Обзор", projects: "Проекты", notes: "Заметки" };
function OrbitArt() {
  return (
    <div className="orbit-art" aria-hidden="true">
      <svg viewBox="0 0 460 280">
        <defs>
          <linearGradient id="orb" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#f6ffc7" />
            <stop offset=".48" stopColor="#c1db6b" />
            <stop offset="1" stopColor="#718b25" />
          </linearGradient>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#788b39" />
            <stop offset=".5" stopColor="#c4d58a" />
            <stop offset="1" stopColor="#506425" />
          </linearGradient>
          <radialGradient id="ball" cx=".3" cy=".22" r=".8">
            <stop stopColor="#f8ffe3" />
            <stop offset=".6" stopColor="#cddaa5" />
            <stop offset="1" stopColor="#91a65e" />
          </radialGradient>
          <filter id="shadow">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <ellipse
          cx="252"
          cy="246"
          rx="110"
          ry="12"
          fill="#768749"
          opacity=".17"
          filter="url(#shadow)"
        />
        <g transform="translate(235 133) rotate(-28)">
          <ellipse
            rx="136"
            ry="57"
            fill="none"
            stroke="url(#ring)"
            strokeWidth="21"
          />
          <ellipse rx="75" ry="92" fill="url(#orb)" transform="rotate(28)" />
          <path
            d="M-136 0a136 57 0 0 0 272 0"
            fill="none"
            stroke="url(#ring)"
            strokeWidth="21"
          />
        </g>
        <circle cx="356" cy="51" r="23" fill="url(#ball)" />
        <circle cx="91" cy="201" r="12" fill="url(#ball)" />
        <path
          d="M100 56v20m-10-10h20M365 207v14m-7-7h14"
          stroke="#718342"
          strokeWidth="2"
        />
        <circle cx="325" cy="246" r="3" fill="#718342" />
        <circle cx="123" cy="108" r="3" fill="#718342" />
        <path
          d="M351 122c24 27 21 59-8 83"
          fill="none"
          stroke="#839754"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
      </svg>
      <span className="art-label">MAKE ROOM FOR WHAT MATTERS</span>
    </div>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="Закрыть" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function App() {
  const [page, setPage] = useState<Page>(getPage);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    readStorage("orbit-theme", "light"),
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    readStorage("orbit-projects", initialProjects),
  );
  const [notes, setNotes] = useState<Note[]>(() =>
    readStorage("orbit-notes", initialNotes),
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState<"project" | "note" | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [popover, setPopover] = useState<"notifications" | "profile" | null>(
    null,
  );
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const activeCount = projects.filter((p) => p.status === "active").length;
  const doneCount = projects.filter((p) => p.status === "done").length;
  useEffect(() => {
    const onHash = () => {
      setPage(getPage());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    document.title = `${pageLabels[page]} — orbit`;
  }, [page]);
  useEffect(() => {
    localStorage.setItem("orbit-theme", JSON.stringify(theme));
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#191d19" : "#f8f9f6");
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("orbit-projects", JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem("orbit-notes", JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setPopover(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  function navigate(p: Page) {
    setPage(p);
    window.location.hash = p;
    setQuery("");
    setFilter("all");
    setPopover(null);
  }
  function openNote(note?: Note) {
    setEditingNote(note || null);
    setModal("note");
  }
  function saveProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name")).trim();
    if (!name) return;
    const date = String(data.get("date"));
    setProjects((prev) => [
      {
        id: crypto.randomUUID(),
        name,
        description:
          String(data.get("description")).trim() ||
          "Здесь начинается что-то прекрасное",
        category: String(data.get("category")),
        color: "purple",
        progress: 0,
        date: date
          ? new Date(date + "T12:00:00").toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
            })
          : "Без срока",
        image: "architecture",
        status: "active",
      },
      ...prev,
    ]);
    setModal(null);
    setToast("Новый проект создан. Время воплощать идеи!");
  }
  function saveNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title")).trim();
    if (!title) return;
    const note = {
      id: editingNote?.id || crypto.randomUUID(),
      title,
      text: String(data.get("text")).trim(),
      color: String(data.get("color")),
      date: "Сегодня",
    };
    setNotes((prev) =>
      editingNote
        ? prev.map((n) => (n.id === editingNote.id ? note : n))
        : [note, ...prev],
    );
    setModal(null);
    setToast(editingNote ? "Заметка обновлена" : "Идея сохранена");
  }
  const filteredProjects = projects.filter(
    (p) =>
      `${p.name} ${p.description} ${p.category}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" || p.status === filter),
  );
  const filteredNotes = notes.filter((n) =>
    `${n.title} ${n.text}`.toLowerCase().includes(query.toLowerCase()),
  );
  function ProjectCard({ project }: { project: Project }) {
    return (
      <button
        className="project-card"
        onClick={() => setSelectedProject(project)}
      >
        <div className={`project-cover ${project.image}`}>
          <span className="cover-mark">
            {project.image === "architecture"
              ? "FORM & FEEL"
              : project.image === "nature"
                ? "closer to nature"
                : "a little less ordinary."}
          </span>
          <span className="project-cover-button">
            <Icon name="external" size={15} />
          </span>
        </div>
        <div className="project-info">
          <div className="project-meta">
            <span className={`tag ${project.color}`}>{project.category}</span>
            <span className="project-menu">
              <Icon name="dots" size={18} />
            </span>
          </div>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <div className="progress-label">
            <span>{project.status === "done" ? "Завершён" : "В процессе"}</span>
            <span>{project.progress}%</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${project.progress}%` }} />
          </div>
          <div className="project-footer">
            <span className="avatars">
              <span>АН</span>
              <span>{project.id === "2" ? "МК" : "ЕС"}</span>
              <span className="avatar-more">+1</span>
            </span>
            <span className="due-date">
              <Icon name="clock" size={13} />
              {project.date}
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="app-shell" data-theme={theme}>
        <aside className="sidebar">
          <a
            className="logo-link"
            href="#overview"
            onClick={() => navigate("overview")}
            aria-label="orbit — главная"
          >
            <Logo />
          </a>
          <div className="workspace-label">ВАШЕ ПРОСТРАНСТВО</div>
          <nav aria-label="Основная навигация">
            {(["overview", "projects", "notes"] as Page[]).map((p) => (
              <a
                key={p}
                href={`#${p}`}
                onClick={() => {
                  setPage(p);
                  setQuery("");
                  setFilter("all");
                  setPopover(null);
                }}
                className={`nav-link ${page === p ? "active" : ""}`}
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
                <span>{pageLabels[p]}</span>
                {p === "projects" && (
                  <span className="nav-count">{projects.length}</span>
                )}
              </a>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="idea-card">
              <span className="idea-icon">
                <Icon name="spark" size={22} />
              </span>
              <h3>
                У хороших идей
                <br />
                должно быть место.
              </h3>
              <p>
                Сохраните мысль, пока
                <br />
                она не улетела.
              </p>
              <button onClick={() => openNote()}>
                Записать идею <Icon name="arrow" size={16} />
              </button>
            </div>
            <div className="theme-switch" aria-label="Цветовая тема">
              <button
                className={theme === "light" ? "selected" : ""}
                aria-pressed={theme === "light"}
                onClick={() => setTheme("light")}
              >
                <Icon name="sun" size={17} />
                <span>Светлая</span>
              </button>
              <button
                className={theme === "dark" ? "selected" : ""}
                aria-pressed={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                <Icon name="moon" size={17} />
                <span>Тёмная</span>
              </button>
            </div>
            <div className="workspace-status">
              <span />
              Личное пространство
              <Icon name="chevron" size={14} />
            </div>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              <span>Рабочее пространство</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{pageLabels[page]}</strong>
            </div>
            <div className="header-actions">
              <label className="search-box">
                <Icon name="search" size={17} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (page === "overview" && e.target.value) {
                      setPage("projects");
                      window.location.hash = "projects";
                    }
                  }}
                  placeholder={
                    page === "notes"
                      ? "Найти заметку..."
                      : "Поиск по пространству..."
                  }
                  aria-label="Поиск по пространству"
                />
                <kbd>⌘ K</kbd>
              </label>
              <div className="popover-anchor">
                <button
                  className="icon-button notification-button"
                  aria-label="Уведомления"
                  aria-expanded={popover === "notifications"}
                  onClick={() =>
                    setPopover(
                      popover === "notifications" ? null : "notifications",
                    )
                  }
                >
                  <Icon name="bell" />
                  <i />
                </button>
                {popover === "notifications" && (
                  <div className="popover">
                    <h3>Вы в своём ритме</h3>
                    <p>
                      Новых уведомлений пока нет. Самое время уделить внимание
                      вашим идеям.
                    </p>
                    <span className="subtle">
                      Всё актуально <Icon name="check" size={14} />
                    </span>
                  </div>
                )}
              </div>
              <span className="header-divider" />
              <div className="popover-anchor">
                <button
                  className="profile-avatar"
                  aria-label="Профиль Александры"
                  aria-expanded={popover === "profile"}
                  onClick={() =>
                    setPopover(popover === "profile" ? null : "profile")
                  }
                >
                  А
                </button>
                {popover === "profile" && (
                  <div className="popover profile-popover">
                    <h3>Александра</h3>
                    <p>Ваше личное пространство</p>
                    <div className="profile-stat">
                      <span>Проекты</span>
                      <strong>{projects.length}</strong>
                    </div>
                    <div className="profile-stat">
                      <span>Заметки</span>
                      <strong>{notes.length}</strong>
                    </div>
                    <span className="subtle">
                      Всё сохраняется в этом браузере
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main key={page}>
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  {page === "overview"
                    ? "ВАШ ОБЗОР"
                    : page === "projects"
                      ? "ОТ ИДЕИ К РЕЗУЛЬТАТУ"
                      : "МЫСЛИ, КОТОРЫЕ ВАЖНЫ"}
                </div>
                <h1>
                  {page === "overview" ? (
                    <>
                      С возвращением, Александра{" "}
                      <span className="greeting-dot">✳</span>
                    </>
                  ) : page === "projects" ? (
                    "Ваши проекты"
                  ) : (
                    "Ваши заметки"
                  )}
                </h1>
                <p>
                  {page === "overview"
                    ? "Немного порядка — и больше места для вдохновения."
                    : page === "projects"
                      ? "Большие перемены начинаются с небольшого шага."
                      : "Идеи, планы и всё, что хочется сохранить."}
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() =>
                  page === "notes" ? openNote() : setModal("project")
                }
              >
                <Icon name="plus" size={18} />
                {page === "notes" ? "Новая заметка" : "Создать проект"}
              </button>
            </div>
            {page === "overview" && (
              <>
                <section className="hero">
                  <div className="hero-copy">
                    <div className="hero-eyebrow">
                      <span />
                      ПРОСТРАНСТВО ДЛЯ ВАЖНОГО
                    </div>
                    <h2>
                      Меньше суеты.
                      <br />
                      Больше смысла.
                    </h2>
                    <p>
                      Соберите проекты, мысли и вдохновение в одном месте.
                      <br className="desktop-break" /> Сосредоточьтесь на том,
                      что двигает вас вперёд.
                    </p>
                    <button onClick={() => navigate("projects")}>
                      К моим проектам <Icon name="arrow" size={17} />
                    </button>
                  </div>
                  <OrbitArt />
                  <span className="hero-counter">01 — ВАШ НОВЫЙ ФОКУС</span>
                </section>
                <section
                  className="stats-grid"
                  aria-label="Статистика пространства"
                >
                  <button
                    className="stat-card"
                    onClick={() => {
                      navigate("projects");
                      setFilter("active");
                    }}
                  >
                    <span className="stat-icon purple">
                      <Icon name="folder" size={21} />
                    </span>
                    <div>
                      <span className="stat-label">Активные проекты</span>
                      <strong>
                        {String(activeCount).padStart(2, "0")}
                        <small>
                          <span className="status-dot" />
                          Всё в движении
                        </small>
                      </strong>
                    </div>
                    <Icon name="external" size={15} className="stat-arrow" />
                  </button>
                  <button
                    className="stat-card"
                    onClick={() => navigate("notes")}
                  >
                    <span className="stat-icon orange">
                      <Icon name="note" size={21} />
                    </span>
                    <div>
                      <span className="stat-label">Заметки и идеи</span>
                      <strong>
                        {String(notes.length).padStart(2, "0")}
                        <small>Ничего не потеряется</small>
                      </strong>
                    </div>
                    <Icon name="external" size={15} className="stat-arrow" />
                  </button>
                  <button
                    className="stat-card"
                    onClick={() => {
                      navigate("projects");
                      setFilter("done");
                    }}
                  >
                    <span className="stat-icon green">
                      <Icon name="check" size={21} />
                    </span>
                    <div>
                      <span className="stat-label">Завершённые проекты</span>
                      <strong>
                        {String(doneCount).padStart(2, "0")}
                        <small>Повод гордиться собой</small>
                      </strong>
                    </div>
                    <Icon name="external" size={15} className="stat-arrow" />
                  </button>
                </section>
              </>
            )}
            {page !== "notes" && (
              <section className="projects-section">
                <div className="section-heading">
                  {page === "overview" ? (
                    <>
                      <h2>
                        Ваши проекты <span>{projects.length}</span>
                      </h2>
                      <button
                        className="text-button"
                        onClick={() => navigate("projects")}
                      >
                        Все проекты <Icon name="arrow" size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="filter-tabs">
                        <button
                          className={filter === "all" ? "active" : ""}
                          onClick={() => setFilter("all")}
                        >
                          Все проекты <span>{projects.length}</span>
                        </button>
                        <button
                          className={filter === "active" ? "active" : ""}
                          onClick={() => setFilter("active")}
                        >
                          В процессе <span>{activeCount}</span>
                        </button>
                        <button
                          className={filter === "done" ? "active" : ""}
                          onClick={() => setFilter("done")}
                        >
                          Завершённые <span>{doneCount}</span>
                        </button>
                      </div>
                      <span className="project-total">
                        {filteredProjects.length} из {projects.length}
                      </span>
                    </>
                  )}
                </div>
                <div className="projects-grid">
                  {(page === "overview"
                    ? projects.slice(0, 3)
                    : filteredProjects
                  ).map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
                {page === "projects" && filteredProjects.length === 0 && (
                  <div className="empty-state">
                    <Icon name="folder" size={36} />
                    <h3>
                      {query
                        ? "Проекты не найдены"
                        : filter === "done"
                          ? "Всё лучшее ещё впереди"
                          : "Место для нового начала"}
                    </h3>
                    <p>
                      {query
                        ? "Попробуйте другое название или категорию."
                        : filter === "done"
                          ? "Завершённые проекты появятся здесь. Продолжайте в своём ритме."
                          : "Создайте проект и сделайте первый шаг к своей идее."}
                    </p>
                    {!query && filter !== "done" && (
                      <button
                        className="primary-button"
                        onClick={() => setModal("project")}
                      >
                        <Icon name="plus" size={16} />
                        Создать проект
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}
            {page === "overview" && (
              <section className="bottom-grid">
                <div className="activity-panel">
                  <div className="section-heading">
                    <h2>Последняя активность</h2>
                    <span className="small-label">Сегодня</span>
                  </div>
                  <div className="activity-row">
                    <span className="activity-icon green">
                      <Icon name="folder" size={17} />
                    </span>
                    <div>
                      <p>
                        Обновлён проект{" "}
                        <button onClick={() => setSelectedProject(projects[0])}>
                          «{projects[0]?.name}»
                        </button>
                      </p>
                      <span>Ещё один шаг к результату</span>
                    </div>
                    <time>10:42</time>
                  </div>
                  <div className="activity-row">
                    <span className="activity-icon purple">
                      <Icon name="note" size={17} />
                    </span>
                    <div>
                      <p>
                        {notes.length ? (
                          <>
                            Добавлена заметка{" "}
                            <button onClick={() => openNote(notes[0])}>
                              «{notes[0].title}»
                            </button>
                          </>
                        ) : (
                          "Место для новых мыслей"
                        )}
                      </p>
                      <span>Хорошие мысли теперь под рукой</span>
                    </div>
                    <time>09:15</time>
                  </div>
                </div>
                <div className="quick-note">
                  <div className="quick-note-top">
                    <Icon name="spark" size={19} />
                    <span>МЫСЛЬ НА СЕГОДНЯ</span>
                    <span>↗</span>
                  </div>
                  <p>
                    Не обязательно видеть весь путь.
                    <br />
                    Достаточно сделать первый шаг.
                  </p>
                  <div className="quick-note-bottom">
                    <span>Маленькое напоминание от orbit</span>
                    <span>✳</span>
                  </div>
                </div>
              </section>
            )}
            {page === "notes" && (
              <section>
                <div className="section-heading">
                  <h2>
                    Ваш маленький архив <span>{notes.length}</span>
                  </h2>
                  <span className="small-label">Всё важное — под рукой</span>
                </div>
                <div className="notes-grid">
                  {filteredNotes.map((note) => (
                    <button
                      key={note.id}
                      className={`note-card ${note.color}`}
                      onClick={() => openNote(note)}
                    >
                      <div className="note-card-top">
                        <Icon name="note" size={20} />
                        <Icon name="external" size={16} />
                      </div>
                      <h3>{note.title}</h3>
                      <p>{note.text}</p>
                      <div className="note-card-bottom">
                        <span>{note.date}</span>
                        <span>
                          Открыть заметку <Icon name="arrow" size={15} />
                        </span>
                      </div>
                    </button>
                  ))}
                  <button className="add-note-card" onClick={() => openNote()}>
                    <span>
                      <Icon name="plus" size={25} />
                    </span>
                    <h3>Поймать новую мысль</h3>
                    <p>Для идеи не нужен особый повод</p>
                  </button>
                </div>
                {query && filteredNotes.length === 0 && (
                  <div className="empty-state">
                    <Icon name="search" size={30} />
                    <h3>Заметки не найдены</h3>
                    <p>Попробуйте изменить поисковый запрос.</p>
                  </div>
                )}
              </section>
            )}
            <footer className="page-footer">
              <span>В вашем темпе. В вашем пространстве.</span>
              <span>
                Сделано для ясных мыслей <span className="footer-spark">✳</span>
              </span>
            </footer>
          </main>
        </div>
        {toast && (
          <div className="toast" role="status">
            <span>
              <Icon name="check" size={16} />
            </span>
            {toast}
            <button
              className="icon-button"
              aria-label="Скрыть уведомление"
              onClick={() => setToast("")}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        {modal === "project" && (
          <Modal title="Начнём что-то новое" onClose={() => setModal(null)}>
            <p className="modal-description">
              Дайте своей идее имя. Остальное сложится по пути.
            </p>
            <form onSubmit={saveProject}>
              <label>
                Название проекта
                <input
                  autoFocus
                  name="name"
                  placeholder="Например, новый взгляд на привычное"
                  required
                  maxLength={70}
                />
              </label>
              <label>
                О чём этот проект?
                <textarea
                  name="description"
                  placeholder="Пара слов о вашей идее"
                  rows={3}
                  maxLength={200}
                />
              </label>
              <div className="form-row">
                <label>
                  Категория
                  <select name="category">
                    <option>Дизайн</option>
                    <option>Веб-сайт</option>
                    <option>Вдохновение</option>
                    <option>Личный проект</option>
                  </select>
                </label>
                <label>
                  Планируемая дата
                  <input type="date" name="date" />
                </label>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModal(null)}
                >
                  Отмена
                </button>
                <button className="primary-button" type="submit">
                  <Icon name="plus" size={17} />
                  Создать проект
                </button>
              </div>
            </form>
          </Modal>
        )}
        {modal === "note" && (
          <Modal
            title={editingNote ? "Ваша мысль в деталях" : "Поймать новую мысль"}
            onClose={() => setModal(null)}
          >
            <p className="modal-description">
              Здесь можно думать вслух. И ничего не забывать.
            </p>
            <form onSubmit={saveNote}>
              <label>
                Заголовок
                <input
                  autoFocus
                  name="title"
                  defaultValue={editingNote?.title}
                  placeholder="О чём вы думаете?"
                  required
                  maxLength={90}
                />
              </label>
              <label>
                Заметка
                <textarea
                  name="text"
                  defaultValue={editingNote?.text}
                  placeholder="Идеи, планы, внезапные озарения..."
                  rows={6}
                  maxLength={5000}
                />
              </label>
              <label>
                Настроение заметки
                <select
                  name="color"
                  defaultValue={editingNote?.color || "yellow"}
                >
                  <option value="yellow">Солнечное</option>
                  <option value="lavender">Мечтательное</option>
                  <option value="mint">Спокойное</option>
                  <option value="peach">Тёплое</option>
                </select>
              </label>
              <div className="form-actions">
                {editingNote && (
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => {
                      setNotes((prev) =>
                        prev.filter((n) => n.id !== editingNote.id),
                      );
                      setModal(null);
                      setToast("Заметка удалена");
                    }}
                  >
                    <Icon name="trash" size={17} />
                    Удалить
                  </button>
                )}
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModal(null)}
                >
                  Отмена
                </button>
                <button type="submit" className="primary-button">
                  Сохранить мысль
                  <Icon name="check" size={17} />
                </button>
              </div>
            </form>
          </Modal>
        )}
        {selectedProject && (
          <Modal
            title={selectedProject.name}
            onClose={() => setSelectedProject(null)}
          >
            <div
              className={`detail-cover project-cover ${selectedProject.image}`}
            >
              <span className="cover-mark">{selectedProject.category}</span>
            </div>
            <p className="modal-description detail-description">
              {selectedProject.description}
            </p>
            <div className="detail-meta">
              <span className={`tag ${selectedProject.color}`}>
                {selectedProject.category}
              </span>
              <span>
                <Icon name="clock" size={15} />
                {selectedProject.date}
              </span>
            </div>
            <label className="progress-editor">
              Прогресс проекта <strong>{selectedProject.progress}%</strong>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedProject.progress}
                onChange={(e) => {
                  const progress = Number(e.target.value);
                  const updated = {
                    ...selectedProject,
                    progress,
                    status:
                      progress === 100
                        ? ("done" as const)
                        : ("active" as const),
                  };
                  setSelectedProject(updated);
                  setProjects((prev) =>
                    prev.map((p) => (p.id === updated.id ? updated : p)),
                  );
                }}
              />
            </label>
            <div className="form-actions">
              <button
                className="secondary-button"
                onClick={() => setSelectedProject(null)}
              >
                Закрыть
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  const updated = {
                    ...selectedProject,
                    progress: selectedProject.status === "done" ? 0 : 100,
                    status:
                      selectedProject.status === "done"
                        ? ("active" as const)
                        : ("done" as const),
                  };
                  setProjects((prev) =>
                    prev.map((p) => (p.id === updated.id ? updated : p)),
                  );
                  setSelectedProject(null);
                  setToast(
                    updated.status === "done"
                      ? "Проект завершён. Есть чем гордиться!"
                      : "Проект снова в работе",
                  );
                }}
              >
                <Icon name="check" size={17} />
                {selectedProject.status === "done"
                  ? "Вернуть в работу"
                  : "Завершить проект"}
              </button>
            </div>
          </Modal>
        )}
      </div>
    </ThemeProvider>
  );
}
