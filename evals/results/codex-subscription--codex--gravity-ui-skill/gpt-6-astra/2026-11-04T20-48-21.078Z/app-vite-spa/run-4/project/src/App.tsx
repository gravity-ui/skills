import { useEffect, useState } from "react";
import { AsideHeader } from "@gravity-ui/navigation";
import {
  Button,
  Checkbox,
  Icon,
  Modal,
  Switch,
  Text,
  TextArea,
  TextInput,
  ThemeProvider,
} from "@gravity-ui/uikit";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  CircleCheck,
  CircleQuestion,
  Clock,
  FileText,
  Folder,
  House,
  LayoutHeader,
  Magnifier,
  Moon,
  Pencil,
  Plus,
  Sun,
  Xmark,
} from "@gravity-ui/icons";
import "./styles.css";

type Page = "overview" | "projects" | "notes";
type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  tone: string;
  progress: number;
  date: string;
  members: string[];
};
type Note = { id: string; title: string; content: string; date: string };
const initialProjects: Project[] = [
  {
    id: "website",
    title: "Редизайн сайта",
    description: "Новый взгляд на наш главный продукт",
    category: "Дизайн",
    tone: "purple",
    progress: 65,
    date: "12 нояб.",
    members: ["АК", "МС", "ДВ"],
  },
  {
    id: "mobile",
    title: "Мобильное приложение",
    description: "Всё необходимое — всегда под рукой",
    category: "Разработка",
    tone: "blue",
    progress: 40,
    date: "20 нояб.",
    members: ["МС", "ЕЛ"],
  },
  {
    id: "brand",
    title: "Бренд-платформа",
    description: "История, которую хочется рассказать",
    category: "Маркетинг",
    tone: "orange",
    progress: 85,
    date: "8 нояб.",
    members: ["АК", "ЕЛ", "ДВ"],
  },
];
const initialNotes: Note[] = [
  {
    id: "1",
    title: "Идеи для нового сайта",
    content:
      "Больше воздуха и внимания к деталям.\n\nПопробовать крупную типографику на главном экране и добавить истории реальных пользователей.\n\nГлавная мысль: сложное может быть простым.",
    date: "4 ноября",
  },
  {
    id: "2",
    title: "После встречи с командой",
    content:
      "Обсудили приоритеты на неделю:\n\n— Подготовить прототип главной страницы\n— Собрать обратную связь\n— Обновить библиотеку компонентов",
    date: "3 ноября",
  },
  {
    id: "3",
    title: "Маленькие шаги — большие дела",
    content:
      "Не обязательно делать всё сразу.\n\nВыбрать одну важную задачу, выделить время и двигаться вперёд. Хороший результат складывается из маленьких шагов.",
    date: "2 ноября",
  },
];
const initialTasks = [
  {
    id: 1,
    title: "Подготовить макеты главной страницы",
    project: "Редизайн сайта",
    date: "Сегодня",
    done: false,
  },
  {
    id: 2,
    title: "Обсудить прототип с командой",
    project: "Мобильное приложение",
    date: "Сегодня",
    done: false,
  },
  {
    id: 3,
    title: "Собрать референсы для айдентики",
    project: "Бренд-платформа",
    date: "Завтра",
    done: false,
  },
];
function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* App remains usable when browser storage is unavailable. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
function getPage(): Page {
  const page = location.hash.slice(1);
  return page === "projects" || page === "notes" ? page : "overview";
}
const titles: Record<Page, string> = {
  overview: "Обзор",
  projects: "Проекты",
  notes: "Заметки",
};
function OrbitalLogo() {
  return (
    <span className="orbital-logo" aria-hidden="true">
      <span />
    </span>
  );
}
function Avatar({ name, index = 0 }: { name: string; index?: number }) {
  return (
    <span className={`avatar avatar-${index % 4}`} title={name}>
      {name}
    </span>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <Icon data={Magnifier} size={28} />
      <Text variant="subheader-2">{text}</Text>
      <span>Попробуйте другой запрос или создайте что-нибудь новое.</span>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useStored<"light" | "dark">(
    "orbita-theme",
    "light",
  );
  const [projects, setProjects] = useStored("orbita-projects", initialProjects);
  const [notes, setNotes] = useStored("orbita-notes", initialNotes);
  const [tasks, setTasks] = useStored("orbita-tasks", initialTasks);
  const [page, setPage] = useState<Page>(getPage);
  const [compact, setCompact] = useState(window.innerWidth < 800);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Все проекты");
  const [modal, setModal] = useState<
    "project" | "note" | "help" | "notifications" | null
  >(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const change = () => {
      setPage(getPage());
      setQuery("");
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 799px)");
    const resize = () => setCompact(media.matches);
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  useEffect(() => {
    document.title = `${titles[page]} — Орбита`;
  }, [page]);
  useEffect(() => {
    if (notice) {
      const timeout = setTimeout(() => setNotice(""), 3500);
      return () => clearTimeout(timeout);
    }
  }, [notice]);
  const navigate = (next: Page) => {
    location.hash = next;
    setPage(next);
    setQuery("");
  };
  const create = (kind: "project" | "note") => {
    setTitle("");
    setDescription("");
    setEditingNote(null);
    setModal(kind);
  };
  const save = () => {
    if (!title.trim()) return;
    if (modal === "project") {
      setProjects([
        ...projects,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          description: description.trim() || "Здесь начинается что-то большое",
          category: "Дизайн",
          tone: "purple",
          progress: 0,
          date: "Без срока",
          members: ["АК"],
        },
      ]);
      navigate("projects");
      setNotice("Проект создан");
    }
    if (modal === "note") {
      const note = {
        id: editingNote || crypto.randomUUID(),
        title: title.trim(),
        content: description,
        date: new Date().toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
        }),
      };
      setNotes(
        editingNote
          ? notes.map((n) => (n.id === editingNote ? note : n))
          : [note, ...notes],
      );
      navigate("notes");
      setNotice("Заметка сохранена");
    }
    setModal(null);
  };
  const editNote = (note: Note) => {
    setEditingNote(note.id);
    setTitle(note.title);
    setDescription(note.content);
    setModal("note");
  };
  const matches = (value: string) =>
    value.toLowerCase().includes(query.toLowerCase());
  const filteredProjects = projects.filter(
    (p) =>
      matches(p.title + " " + p.description) &&
      (filter === "Все проекты" || p.category === filter),
  );
  const completed = tasks.filter((t) => t.done).length;
  const pageHeader = (
    heading: string,
    subtitle: string,
    action: "project" | "note",
  ) => (
    <div className="page-heading">
      <div>
        <Text as="h1" variant="display-1">
          {heading}
        </Text>
        <p>{subtitle}</p>
      </div>
      <Button view="action" size="l" onClick={() => create(action)}>
        <Icon data={Plus} size={16} />
        {action === "project" ? "Создать проект" : "Создать заметку"}
      </Button>
    </div>
  );
  const projectCard = (project: Project) => (
    <article className="project-card" key={project.id}>
      <div className="project-card-top">
        <div className={`project-symbol ${project.tone}`}>
          <Icon
            data={
              project.tone === "blue"
                ? LayoutHeader
                : project.tone === "orange"
                  ? Sun
                  : Folder
            }
            size={23}
          />
        </div>
        <span className="status">
          <i />В работе
        </span>
      </div>
      <Button
        view="flat"
        className="project-title"
        onClick={() => setSelectedProject(project)}
      >
        {project.title}
      </Button>
      <p className="project-description">{project.description}</p>
      <span className={`category ${project.tone}`}>{project.category}</span>
      <div className="progress-caption">
        <span>Прогресс</span>
        <strong>{project.progress}%</strong>
      </div>
      <div
        className={`progress-track ${project.tone}`}
        role="progressbar"
        aria-label={`Прогресс: ${project.title}`}
        aria-valuenow={project.progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${project.progress}%` }} />
      </div>
      <div className="project-card-footer">
        <div className="avatars">
          {project.members.map((m, i) => (
            <Avatar name={m} index={i} key={m} />
          ))}
        </div>
        <span className="date">
          <Icon data={Calendar} size={14} />
          {project.date}
        </span>
      </div>
    </article>
  );
  const content = (
    <>
      <header className="topbar">
        <div className="breadcrumbs">
          Рабочее пространство <span>/</span>
          <strong>{titles[page]}</strong>
        </div>
        <div className="topbar-actions">
          <TextInput
            className="global-search"
            size="m"
            view="clear"
            placeholder="Найти в пространстве"
            value={query}
            onUpdate={setQuery}
            startContent={<Icon data={Magnifier} size={16} />}
            hasClear
            controlProps={{ "aria-label": "Поиск по странице" }}
          />
          <span className="topbar-divider" />
          <Button
            view="flat"
            aria-label="Уведомления"
            onClick={() => setModal("notifications")}
          >
            <span className="notification-icon">
              <Icon data={Bell} size={19} />
              <i />
            </span>
          </Button>
          <Avatar name="АК" />
        </div>
      </header>
      <main className="main-content" key={page}>
        {page === "overview" && (
          <>
            {pageHeader(
              "Всё начинается с идеи",
              "Ваши проекты, мысли и планы — в одном пространстве.",
              "project",
            )}
            <section className="welcome-banner">
              <div className="welcome-copy">
                <span className="eyebrow">
                  <span />
                  ВАШЕ ПРОСТРАНСТВО ДЛЯ БОЛЬШОГО
                </span>
                <Text as="h2" variant="display-2">
                  Меньше суеты.
                  <br />
                  Больше смысла.
                </Text>
                <p>
                  Освободите голову для важных идей.
                  <br />
                  Орбита поможет держать всё остальное в порядке.
                </p>
                <Button
                  size="l"
                  view="outlined"
                  onClick={() => navigate("projects")}
                >
                  К моим проектам <Icon data={ArrowRight} size={16} />
                </Button>
              </div>
              <div className="orbit-art" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="orbit orbit-three" />
                <div className="planet" />
                <div className="satellite satellite-one" />
                <div className="satellite satellite-two" />
                <div className="floating-card floating-folder">
                  <Icon data={Folder} size={34} />
                  <span />
                  <span />
                </div>
                <div className="floating-card floating-check">
                  <div>
                    <Icon data={Check} size={22} />
                  </div>
                  <span />
                  <span />
                </div>
                <span className="spark spark-one">✦</span>
                <span className="spark spark-two">✧</span>
                <span className="little-dot" />
              </div>
            </section>
            <section className="stats-grid" aria-label="Статистика">
              <div className="stat-card">
                <span className="stat-icon purple">
                  <Icon data={Folder} size={20} />
                </span>
                <div>
                  <span>Активных проектов</span>
                  <div>
                    <Text variant="display-1">{projects.length}</Text>
                    <span className="stat-hint">Всё под контролем</span>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon green">
                  <Icon data={CircleCheck} size={20} />
                </span>
                <div>
                  <span>Задач выполнено</span>
                  <div>
                    <Text variant="display-1">{24 + completed}</Text>
                    <span className="stat-trend">↗ 8 за неделю</span>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon orange">
                  <Icon data={FileText} size={20} />
                </span>
                <div>
                  <span>Заметок с идеями</span>
                  <div>
                    <Text variant="display-1">{notes.length}</Text>
                    <span className="stat-hint">Ни одна не потеряется</span>
                  </div>
                </div>
              </div>
            </section>
            <div className="section-heading">
              <Text as="h2" variant="header-1">
                В фокусе
              </Text>
              <Button view="flat" onClick={() => navigate("projects")}>
                Все проекты <Icon data={ArrowRight} size={15} />
              </Button>
            </div>
            <section className="projects-grid">
              {projects
                .filter((p) => matches(p.title + " " + p.description))
                .slice(0, 3)
                .map(projectCard)}
            </section>
            {query &&
              !projects.some((p) => matches(p.title + " " + p.description)) && (
                <Empty text="Проекты не найдены" />
              )}
            <section className="bottom-grid">
              <div className="tasks-panel">
                <div className="section-heading">
                  <div className="inline-heading">
                    <Text as="h2" variant="header-1">
                      Ближайшие задачи
                    </Text>
                    <span className="count-pill">
                      {tasks.length - completed}
                    </span>
                  </div>
                  <span className="muted">На этой неделе</span>
                </div>
                <div className="task-list">
                  {tasks.map((task) => (
                    <div
                      className={`task-row ${task.done ? "task-done" : ""}`}
                      key={task.id}
                    >
                      <Checkbox
                        checked={task.done}
                        onUpdate={(done) =>
                          setTasks(
                            tasks.map((t) =>
                              t.id === task.id ? { ...t, done } : t,
                            ),
                          )
                        }
                        size="l"
                        aria-label={task.title}
                      />
                      <div className="task-description">
                        <span>{task.title}</span>
                        <small>{task.project}</small>
                      </div>
                      <span
                        className={`task-date ${task.date === "Сегодня" ? "today" : ""}`}
                      >
                        {task.done ? "Готово" : task.date}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="tasks-foot">
                  <Icon data={CircleCheck} size={15} />
                  {completed === 3
                    ? "Отличная работа! Все задачи выполнены."
                    : "Большие результаты начинаются с маленьких шагов."}
                </div>
              </div>
              <div className="activity-panel">
                <div className="section-heading">
                  <Text as="h2" variant="header-1">
                    Что нового
                  </Text>
                  <span className="activity-dot" />
                </div>
                <div className="activity-list">
                  <div className="activity-item">
                    <Avatar name="МС" index={1} />
                    <div>
                      <p>
                        <strong>Маша</strong> обновила проект
                      </p>
                      <span>Мобильное приложение</span>
                      <small>25 минут назад</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <Avatar name="ДВ" index={2} />
                    <div>
                      <p>
                        <strong>Дима</strong> завершил задачу
                      </p>
                      <span>Собрать мудборд</span>
                      <small>1 час назад</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-note">
                      <Icon data={FileText} size={16} />
                    </span>
                    <div>
                      <p>Пространство для свежих мыслей</p>
                      <Button
                        view="flat"
                        size="s"
                        className="activity-link"
                        onClick={() => navigate("notes")}
                      >
                        Открыть ваши заметки{" "}
                        <Icon data={ArrowUpRight} size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
        {page === "projects" && (
          <>
            {pageHeader(
              "Мои проекты",
              "От первой идеи до последнего штриха.",
              "project",
            )}
            <div className="page-toolbar">
              <div className="filters">
                {["Все проекты", "Дизайн", "Разработка", "Маркетинг"].map(
                  (f) => (
                    <Button
                      key={f}
                      view={filter === f ? "normal" : "flat"}
                      selected={filter === f}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                      {f === "Все проекты" && (
                        <span className="filter-count">{projects.length}</span>
                      )}
                    </Button>
                  ),
                )}
              </div>
              <span className="muted">
                {filteredProjects.length} в пространстве
              </span>
            </div>
            <section className="projects-grid full-projects">
              {filteredProjects.map(projectCard)}
              <Button
                className="add-project"
                view="outlined"
                onClick={() => create("project")}
              >
                <span className="add-project-content">
                  <span className="add-circle">
                    <Icon data={Plus} size={24} />
                  </span>
                  <Text variant="subheader-2">Начать что-то новое</Text>
                  <span>У каждой идеи есть своя орбита</span>
                </span>
              </Button>
            </section>
            {!filteredProjects.length && (
              <Empty text="Таких проектов пока нет" />
            )}
            <div className="page-tip">
              <Icon data={CircleQuestion} size={16} />
              Нажмите на название проекта, чтобы посмотреть подробности.
            </div>
          </>
        )}
        {page === "notes" && (
          <>
            {pageHeader(
              "Мои заметки",
              "Место для мыслей, которые стоит сохранить.",
              "note",
            )}
            <div className="page-toolbar">
              <Text variant="subheader-2">
                Все заметки <span className="filter-count">{notes.length}</span>
              </Text>
              <span className="muted">Ваши мысли всегда под рукой</span>
            </div>
            <section className="notes-grid">
              {notes
                .filter((n) => matches(n.title + " " + n.content))
                .map((note, i) => (
                  <article className={`note-card note-${i % 3}`} key={note.id}>
                    <div className="note-top">
                      <Icon data={FileText} size={20} />
                      <Button
                        view="flat"
                        size="s"
                        aria-label={`Редактировать: ${note.title}`}
                        onClick={() => editNote(note)}
                      >
                        <Icon data={Pencil} size={15} />
                      </Button>
                    </div>
                    <Button
                      className="note-title"
                      view="flat"
                      onClick={() => editNote(note)}
                    >
                      {note.title}
                    </Button>
                    <p>{note.content}</p>
                    <div className="note-footer">
                      <span>{note.date}</span>
                      <Icon data={ArrowUpRight} size={16} />
                    </div>
                  </article>
                ))}
            </section>
            {!notes.some((n) => matches(n.title + " " + n.content)) && (
              <Empty text="Заметки не найдены" />
            )}
          </>
        )}
        <footer className="page-footer">
          <span>
            <span className="footer-orbit">◎</span> Место, где идеи обретают
            форму.
          </span>
          <span>
            Сделано с вниманием к деталям <span className="footer-star">✦</span>
          </span>
        </footer>
      </main>
    </>
  );
  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        className="app-shell"
        compact={compact}
        onChangeCompact={setCompact}
        hideCollapseButton
        hideSectionDividers
        logo={{
          text: () => (
            <span className="brand-name">
              орбита<span className="brand-dot">.</span>
            </span>
          ),
          icon: OrbitalLogo,
          iconSize: 34,
          href: "#overview",
        }}
        aboveMenuContent={
          compact ? (
            <div className="compact-spacer" />
          ) : (
            <div className="sidebar-intro">
              <div className="workspace">
                <span className="workspace-icon">А</span>
                <div>
                  <strong>Моё пространство</strong>
                  <small>Личный аккаунт</small>
                </div>
                <Icon data={ChevronDown} size={14} />
              </div>
              <span className="navigation-label">ПРОСТРАНСТВО</span>
            </div>
          )
        }
        menuItems={[
          {
            id: "overview",
            title: "Обзор",
            icon: House,
            current: page === "overview",
            href: "#overview",
            menuItemAriaProps: {
              "aria-current": page === "overview" ? "page" : undefined,
            },
          },
          {
            id: "projects",
            title: "Проекты",
            icon: Folder,
            current: page === "projects",
            href: "#projects",
            rightAdornment: !compact ? (
              <span className="nav-count">{projects.length}</span>
            ) : undefined,
            menuItemAriaProps: {
              "aria-current": page === "projects" ? "page" : undefined,
            },
          },
          {
            id: "notes",
            title: "Заметки",
            icon: FileText,
            current: page === "notes",
            href: "#notes",
            menuItemAriaProps: {
              "aria-current": page === "notes" ? "page" : undefined,
            },
          },
        ]}
        renderFooter={() => (
          <div className={`sidebar-footer ${compact ? "is-compact" : ""}`}>
            {!compact && (
              <div className="sidebar-quote">
                <span>✧</span>
                <Text variant="subheader-2">
                  У больших идей
                  <br />
                  есть своё место.
                </Text>
                <p>И оно прямо здесь.</p>
                <div className="quote-orbit" />
              </div>
            )}
            <Button
              view="flat"
              width="max"
              className="help-button"
              onClick={() => setModal("help")}
              aria-label="Помощь и поддержка"
            >
              <Icon data={CircleQuestion} size={18} />
              {!compact && "Помощь и поддержка"}
            </Button>
            <div className="theme-row">
              <Icon data={theme === "dark" ? Moon : Sun} size={18} />
              {!compact && <span>Тёмная тема</span>}
              <Switch
                size="m"
                checked={theme === "dark"}
                onUpdate={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Тёмная тема"
              />
            </div>
            {!compact && (
              <div className="sidebar-profile">
                <Avatar name="АК" />
                <div>
                  <strong>Александр</strong>
                  <small>Личное пространство</small>
                </div>
                <span className="profile-online" />
              </div>
            )}
          </div>
        )}
        renderContent={() => content}
      />
      <Modal
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        aria-label={
          modal === "project"
            ? "Новый проект"
            : modal === "note"
              ? "Заметка"
              : modal === "help"
                ? "Помощь"
                : "Уведомления"
        }
      >
        <div className="modal-content">
          <div className="modal-heading">
            <Text as="h2" variant="header-2">
              {modal === "project"
                ? "Новый проект"
                : modal === "note"
                  ? editingNote
                    ? "Редактировать заметку"
                    : "Новая заметка"
                  : modal === "help"
                    ? "Добро пожаловать в Орбиту"
                    : "Уведомления"}
            </Text>
            <Button
              view="flat"
              aria-label="Закрыть"
              onClick={() => setModal(null)}
            >
              <Icon data={Xmark} size={18} />
            </Button>
          </div>
          {modal === "project" || modal === "note" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <label className="form-label" htmlFor="entry-title">
                Название
              </label>
              <TextInput
                id="entry-title"
                size="l"
                autoFocus
                value={title}
                onUpdate={setTitle}
                placeholder={
                  modal === "project"
                    ? "Как называется ваша идея?"
                    : "О чём эта заметка?"
                }
                controlProps={{ required: true, maxLength: 100 }}
              />
              <label className="form-label" htmlFor="entry-description">
                {modal === "project" ? "Описание" : "Ваши мысли"}
              </label>
              <TextArea
                id="entry-description"
                value={description}
                onUpdate={setDescription}
                minRows={5}
                placeholder="Начните писать…"
              />
              <div className="modal-actions">
                <Button size="l" view="outlined" onClick={() => setModal(null)}>
                  Отмена
                </Button>
                <Button
                  size="l"
                  view="action"
                  type="submit"
                  disabled={!title.trim()}
                >
                  {modal === "project" ? "Создать проект" : "Сохранить заметку"}
                </Button>
              </div>
            </form>
          ) : modal === "help" ? (
            <div className="help-content">
              <p>
                Орбита помогает собирать проекты, задачи и идеи в одном месте.
              </p>
              <p>
                <strong>Проекты.</strong> Создавайте проекты и открывайте их
                карточки, чтобы следить за прогрессом.
              </p>
              <p>
                <strong>Заметки.</strong> Сохраняйте мысли и возвращайтесь к ним
                в любой момент.
              </p>
              <p>
                <strong>Ваш стиль.</strong> Переключайте светлую и тёмную тему
                внизу бокового меню.
              </p>
              <div className="help-note">
                Данные сохраняются в этом браузере. Это ваше личное
                демопространство.
              </div>
            </div>
          ) : (
            <div className="notifications-list">
              <Icon data={CircleCheck} size={34} />
              <Text variant="subheader-2">Вы в курсе всего</Text>
              <p>
                Новых уведомлений пока нет. Хороший момент, чтобы
                сосредоточиться на главном.
              </p>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={!!selectedProject}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
        aria-label="Подробности проекта"
      >
        {selectedProject && (
          <div className="modal-content">
            <div className="modal-heading">
              <Text as="h2" variant="header-2">
                {selectedProject.title}
              </Text>
              <Button
                view="flat"
                aria-label="Закрыть"
                onClick={() => setSelectedProject(null)}
              >
                <Icon data={Xmark} size={18} />
              </Button>
            </div>
            <span className={`category ${selectedProject.tone}`}>
              {selectedProject.category}
            </span>
            <p className="detail-description">{selectedProject.description}</p>
            <div className="detail-row">
              <span>Срок проекта</span>
              <strong>{selectedProject.date}</strong>
            </div>
            <div className="detail-row">
              <span>Участники</span>
              <div className="avatars">
                {selectedProject.members.map((m, i) => (
                  <Avatar name={m} index={i} key={m} />
                ))}
              </div>
            </div>
            <div className="detail-row">
              <span>Прогресс</span>
              <strong>{selectedProject.progress}%</strong>
            </div>
            <div className={`progress-track ${selectedProject.tone}`}>
              <span style={{ width: `${selectedProject.progress}%` }} />
            </div>
            <div className="modal-actions">
              <Button
                view="action"
                size="l"
                onClick={() => {
                  setSelectedProject(null);
                  navigate("projects");
                }}
              >
                К проектам <Icon data={ArrowRight} size={16} />
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {notice && (
        <div className="toast" role="status">
          <Icon data={CircleCheck} size={19} />
          {notice}
        </div>
      )}
    </ThemeProvider>
  );
}
