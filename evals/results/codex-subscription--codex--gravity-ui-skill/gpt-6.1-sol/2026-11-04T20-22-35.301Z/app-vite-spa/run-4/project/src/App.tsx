import { useEffect, useState } from "react";
import { AsideHeader } from "@gravity-ui/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Icon,
  Label,
  Modal,
  Progress,
  Select,
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
  BookOpen,
  Calendar,
  Check,
  CircleCheck,
  CircleQuestion,
  Clock,
  Folder,
  House,
  Magnifier,
  Moon,
  Plus,
  Sparkles,
  Sun,
  TrashBin,
  Xmark,
} from "@gravity-ui/icons";
import "./styles.css";

type Page = "overview" | "projects" | "notes";
type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  progress: number;
  tasks: number;
  date: string;
};
type Note = {
  id: string;
  title: string;
  body: string;
  tag: string;
  date: string;
};
const initialProjects: Project[] = [
  {
    id: "1",
    title: "Новый взгляд на бренд",
    description: "Айдентика, которая говорит за вас",
    category: "Дизайн",
    color: "purple",
    progress: 65,
    tasks: 12,
    date: "12 ноя",
  },
  {
    id: "2",
    title: "Сайт для студии",
    description: "От первой идеи до первого клика",
    category: "Разработка",
    color: "green",
    progress: 40,
    tasks: 20,
    date: "18 ноя",
  },
  {
    id: "3",
    title: "Запуск подкаста",
    description: "Истории, которыми хочется делиться",
    category: "Личное",
    color: "orange",
    progress: 25,
    tasks: 8,
    date: "24 ноя",
  },
];
const initialNotes: Note[] = [
  {
    id: "1",
    title: "Идеи приходят в движении",
    body: "Попробовать новый формат: короткие прогулки без телефона. Иногда лучшая идея — та, для которой освободили немного места.",
    tag: "Вдохновение",
    date: "Сегодня",
  },
  {
    id: "2",
    title: "Мысли после встречи",
    body: "Больше воздуха в макетах. Меньше слов, больше смысла. Начать с главного и постепенно раскрывать детали.",
    tag: "Работа",
    date: "Вчера",
  },
  {
    id: "3",
    title: "Что почитать в ноябре",
    body: "Дональд Норман — «Дизайн привычных вещей»\nДжеймс Клир — «Атомные привычки»\nОстин Клеон — «Покажи свою работу!»",
    tag: "Личное",
    date: "2 ноября",
  },
];
const initialTasks = [
  {
    id: "1",
    title: "Собрать мудборд для айдентики",
    project: "Новый взгляд на бренд",
    done: false,
    color: "purple",
  },
  {
    id: "2",
    title: "Согласовать структуру сайта",
    project: "Сайт для студии",
    done: false,
    color: "green",
  },
  {
    id: "3",
    title: "Найти референсы для обложки",
    project: "Запуск подкаста",
    done: true,
    color: "orange",
  },
];
function useSaved<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage may be unavailable in private mode. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
function getPage(): Page {
  const p = location.hash.replace("#/", "");
  return p === "projects" || p === "notes" ? p : "overview";
}
function OrbitLogo() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="16"
        cy="16"
        rx="7"
        ry="14"
        stroke="currentColor"
        strokeWidth="2.4"
        transform="rotate(45 16 16)"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="7"
        ry="14"
        stroke="currentColor"
        strokeWidth="2.4"
        transform="rotate(-45 16 16)"
      />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}
function Artwork({ color, hero = false }: { color: string; hero?: boolean }) {
  return (
    <div
      className={`artwork ${color} ${hero ? "artwork-hero" : ""}`}
      aria-hidden="true"
    >
      {color === "green" ? (
        <div className="stack-shape">
          <i />
          <i />
          <i />
          <i />
        </div>
      ) : color === "orange" ? (
        <div className="stairs-shape">
          <i />
          <i />
          <i />
        </div>
      ) : (
        <div className="orbit-shape">
          <i />
          <i />
          <i />
          <b />
        </div>
      )}
      <span className="art-spark spark-one">✦</span>
      <span className="art-spark spark-two">✧</span>
      <span className="art-dot" />
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useSaved<"light" | "dark">("orbita-theme", "light");
  const [projects, setProjects] = useSaved("orbita-projects", initialProjects);
  const [notes, setNotes] = useSaved("orbita-notes", initialNotes);
  const [tasks, setTasks] = useSaved("orbita-tasks", initialTasks);
  const [page, setPage] = useState<Page>(getPage);
  const [compact, setCompact] = useState(() => window.innerWidth < 850);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialog, setDialog] = useState<
    "project" | "note" | "help" | "notifications" | "profile" | null
  >(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(["Дизайн"]);
  const [color, setColor] = useState("purple");
  useEffect(() => {
    const fn = () => {
      setPage(getPage());
      setQuery("");
      setFilter("all");
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 849px)");
    const fn = () => setCompact(media.matches);
    media.addEventListener("change", fn);
    return () => media.removeEventListener("change", fn);
  }, []);
  const navigate = (p: Page) => {
    location.hash = `/${p}`;
    setPage(p);
    setQuery("");
  };
  const newProject = () => {
    setTitle("");
    setDescription("");
    setCategory(["Дизайн"]);
    setColor("purple");
    setDialog("project");
  };
  const openNote = (note?: Note) => {
    setEditNote(note ?? null);
    setTitle(note?.title ?? "");
    setDescription(note?.body ?? "");
    setDialog("note");
  };
  const save = () => {
    if (!title.trim()) return;
    if (dialog === "project")
      setProjects([
        ...projects,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          description: description.trim() || "Здесь начинается что-то хорошее",
          category: category[0],
          color,
          progress: 0,
          tasks: 0,
          date: "Без срока",
        },
      ]);
    else {
      const note = {
        id: editNote?.id ?? crypto.randomUUID(),
        title: title.trim(),
        body: description.trim(),
        tag: editNote?.tag ?? "Идеи",
        date: "Сегодня",
      };
      setNotes(
        editNote
          ? notes.map((n) => (n.id === note.id ? note : n))
          : [note, ...notes],
      );
    }
    setDialog(null);
  };
  const visibleProjects = projects.filter(
    (p) =>
      (p.title + " " + p.description)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" ||
        (filter === "active" ? p.progress < 100 : p.progress === 100)),
  );
  const visibleNotes = notes.filter((n) =>
    (n.title + " " + n.body).toLowerCase().includes(query.toLowerCase()),
  );
  const active = projects.filter((p) => p.progress < 100).length;
  const done = tasks.filter((t) => t.done).length;
  const pageNames = {
    overview: "Обзор",
    projects: "Проекты",
    notes: "Заметки",
  };
  const dateLabel = new Intl.DateTimeFormat("ru", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date());
  const projectCards = (list: Project[]) => (
    <div className="projects-grid">
      {list.map((p) => (
        <Card key={p.id} className={`project-card ${p.color}`} view="outlined">
          <div className="project-cover">
            <Artwork color={p.color} />
            <span className="cover-category">
              <Label
                theme={
                  p.color === "green"
                    ? "success"
                    : p.color === "orange"
                      ? "warning"
                      : "utility"
                }
                size="s"
              >
                {p.category}
              </Label>
            </span>
            <Button
              className="cover-open"
              view="flat"
              size="m"
              aria-label={`Открыть проект ${p.title}`}
              onClick={() => setSelected(p)}
            >
              <Icon data={ArrowUpRight} />
            </Button>
          </div>
          <Box className="project-info">
            <Button
              className="project-title"
              view="flat"
              onClick={() => setSelected(p)}
            >
              {p.title}
            </Button>
            <Text
              className="project-description"
              color="secondary"
              variant="body-1"
            >
              {p.description}
            </Text>
            <Flex className="progress-caption" justifyContent="space-between">
              <Text color="secondary" variant="caption-2">
                Прогресс проекта
              </Text>
              <Text variant="caption-2">{p.progress}%</Text>
            </Flex>
            <Progress
              size="xs"
              value={p.progress}
              theme={
                p.color === "green"
                  ? "success"
                  : p.color === "orange"
                    ? "warning"
                    : "misc"
              }
            />
            <Flex
              className="project-meta"
              justifyContent="space-between"
              alignItems="center"
            >
              <span>
                <Icon data={CircleCheck} size={14} />{" "}
                {Math.round((p.tasks * p.progress) / 100)} из {p.tasks} задач
              </span>
              <span>
                <Icon data={Calendar} size={14} /> {p.date}
              </span>
            </Flex>
          </Box>
        </Card>
      ))}
    </div>
  );
  const empty = (kind: string) => (
    <Card className="empty-state" view="outlined">
      <Icon data={query ? Magnifier : Folder} size={32} />
      <Text variant="subheader-3">
        {query ? "Ничего не нашлось" : `Здесь пока нет ${kind}`}
      </Text>
      <Text color="secondary">
        {query
          ? "Попробуйте другое название или сбросьте фильтр."
          : "Самое время дать новой идее начало."}
      </Text>
      <Button
        view="outlined"
        onClick={() => {
          setQuery("");
          setFilter("all");
          if (!query && filter === "all") {
            page === "notes" ? openNote() : newProject();
          }
        }}
      >
        {query || filter !== "all" ? "Сбросить фильтры" : "Создать"}
      </Button>
    </Card>
  );

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        className="app-shell"
        compact={compact}
        onChangeCompact={setCompact}
        hideSectionDividers
        collapseTitle="Свернуть меню"
        expandTitle="Развернуть меню"
        logo={{
          text: "орбита",
          icon: OrbitLogo,
          iconSize: 31,
          textSize: 27,
          iconClassName: "brand-logo",
          href: "#/overview",
        }}
        aboveMenuContent={
          !compact ? (
            <div className="sidebar-intro">
              <Text variant="caption-2" color="secondary">
                ЛИЧНОЕ ПРОСТРАНСТВО
              </Text>
            </div>
          ) : null
        }
        menuItems={[
          {
            id: "overview",
            title: "Обзор",
            icon: House,
            current: page === "overview",
            onItemClick: () => navigate("overview"),
          },
          {
            id: "projects",
            title: "Проекты",
            icon: Folder,
            current: page === "projects",
            rightAdornment: (
              <span className="nav-count">{projects.length}</span>
            ),
            onItemClick: () => navigate("projects"),
          },
          {
            id: "notes",
            title: "Заметки",
            icon: BookOpen,
            current: page === "notes",
            onItemClick: () => navigate("notes"),
          },
          ...(!compact
            ? [
                {
                  id: "favorites-label",
                  title: "ИЗБРАННОЕ",
                  itemWrapper: () => (
                    <div className="favorites-label">ИЗБРАННОЕ</div>
                  ),
                },
                ...projects
                  .slice(0, 2)
                  .map((p) => ({
                    id: `fav-${p.id}`,
                    title: p.title,
                    icon: () => <span className={`favorite-dot ${p.color}`} />,
                    onItemClick: () => setSelected(p),
                  })),
              ]
            : []),
        ]}
        renderFooter={() => (
          <div className={`sidebar-footer ${compact ? "is-compact" : ""}`}>
            {!compact && (
              <div className="sidebar-tip">
                <span className="tip-icon">
                  <Icon data={Sparkles} size={20} />
                </span>
                <Text variant="subheader-2">Место для больших идей</Text>
                <Text color="secondary" variant="body-1">
                  Маленькие шаги сегодня —<br />
                  большие перемены завтра.
                </Text>
                <Button view="flat" size="s" onClick={() => setDialog("help")}>
                  Освоиться в Орбите <Icon data={ArrowUpRight} size={14} />
                </Button>
              </div>
            )}
            <Flex className="theme-row" alignItems="center" gap={3}>
              <Icon data={theme === "dark" ? Moon : Sun} size={18} />
              {!compact && (
                <>
                  <Text className="flexible">Тёмная тема</Text>
                  <Switch
                    checked={theme === "dark"}
                    onUpdate={(v) => setTheme(v ? "dark" : "light")}
                    controlProps={{ "aria-label": "Тёмная тема" }}
                  />
                </>
              )}
              {compact && (
                <Button
                  view="flat"
                  className="compact-theme"
                  aria-label="Переключить тему"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Icon data={theme === "dark" ? Moon : Sun} />
                </Button>
              )}
            </Flex>
            <Button
              className="profile-button"
              view="flat"
              width="max"
              onClick={() => setDialog("profile")}
            >
              <Flex alignItems="center" gap={3}>
                <Avatar text="АС" size="m" className="profile-avatar" />
                {!compact && (
                  <Box className="profile-copy">
                    <Text variant="subheader-1">Александра Смирнова</Text>
                    <Text color="secondary" variant="caption-2">
                      Личное пространство
                    </Text>
                  </Box>
                )}
              </Flex>
            </Button>
          </div>
        )}
        renderContent={() => (
          <div className="content-shell">
            <header className="topbar">
              <Flex gap={2} alignItems="center">
                <span className="breadcrumb-muted">Моё пространство</span>
                <span className="breadcrumb-divider">/</span>
                <Text>{pageNames[page]}</Text>
              </Flex>
              <Flex gap={4} alignItems="center">
                <span className="top-date">
                  <Icon data={Calendar} size={15} />
                  {dateLabel}
                </span>
                <span className="topbar-divider" />
                <Button
                  view="flat"
                  aria-label="Уведомления"
                  onClick={() => setDialog("notifications")}
                >
                  <span className="notification-icon">
                    <Icon data={Bell} size={19} />
                    <i />
                  </span>
                </Button>
                <Avatar text="АС" size="s" className="profile-avatar" />
              </Flex>
            </header>
            <main className="main-content">
              <Flex
                className="page-heading"
                justifyContent="space-between"
                alignItems="center"
                gap={4}
              >
                <Box className="flexible">
                  <Flex gap={3} alignItems="center">
                    <Text as="h1" variant="display-1">
                      {page === "overview"
                        ? "Всё начинается с идеи"
                        : pageNames[page]}
                    </Text>
                    {page === "overview" && (
                      <span className="greeting-spark">✳</span>
                    )}
                  </Flex>
                  <Text as="p" color="secondary" variant="body-2">
                    {page === "overview"
                      ? "Хороший день, чтобы сделать шаг к чему-то большему."
                      : page === "projects"
                        ? "Большие замыслы складываются из маленьких шагов."
                        : "Сохраняйте мысли, к которым хочется вернуться."}
                  </Text>
                </Box>
                <Button
                  className="primary-create"
                  view="action"
                  size="l"
                  onClick={page === "notes" ? () => openNote() : newProject}
                >
                  <Icon data={Plus} size={18} />
                  {page === "notes" ? "Новая заметка" : "Новый проект"}
                </Button>
              </Flex>
              {page === "overview" ? (
                <>
                  <section className="welcome-banner">
                    <Box className="welcome-copy">
                      <span className="eyebrow">
                        <span className="live-dot" /> В СВОЁМ ТЕМПЕ, В СВОЁМ
                        НАПРАВЛЕНИИ
                      </span>
                      <Text as="h2" variant="display-3">
                        Меньше суеты.
                        <br />
                        Больше смысла.
                      </Text>
                      <Text as="p" variant="body-2">
                        Ваши проекты, мысли и планы — в одной орбите.
                        <br />
                        Сосредоточьтесь на том, что действительно важно.
                      </Text>
                      <Button
                        view="outlined"
                        size="l"
                        onClick={() => navigate("projects")}
                      >
                        К моим проектам <Icon data={ArrowRight} size={16} />
                      </Button>
                    </Box>
                    <div className="hero-visual">
                      <div className="hero-orbit orbit-a" />
                      <div className="hero-orbit orbit-b" />
                      <div className="hero-orbit orbit-c" />
                      <div className="hero-planet">
                        <OrbitLogo />
                      </div>
                      <span className="hero-star">✦</span>
                      <span className="hero-star small">✧</span>
                      <span className="hero-small-planet" />
                      <span className="floating-label label-idea">
                        <Icon data={Sparkles} size={15} /> Свежая идея
                      </span>
                      <span className="floating-label label-done">
                        <Icon data={CircleCheck} size={15} /> Шаг за шагом
                      </span>
                    </div>
                  </section>
                  <section className="stats-grid" aria-label="Ваша статистика">
                    {[
                      {
                        label: "Активных проектов",
                        value: active,
                        icon: Folder,
                        color: "purple",
                        hint: "Всё идёт по плану",
                      },
                      {
                        label: "Задач на сегодня",
                        value: tasks.length - done,
                        icon: CircleCheck,
                        color: "green",
                        hint: `${done} из ${tasks.length} уже выполнено`,
                      },
                      {
                        label: "Заметок с идеями",
                        value: notes.length,
                        icon: BookOpen,
                        color: "orange",
                        hint: "Чтобы ничего не забыть",
                      },
                      {
                        label: "Завершено проектов",
                        value: projects.length - active,
                        icon: Check,
                        color: "blue",
                        hint: "Каждый шаг имеет значение",
                      },
                    ].map((s) => (
                      <Card key={s.label} className="stat-card" view="outlined">
                        <Flex
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Text color="secondary">{s.label}</Text>
                          <span className={`stat-icon ${s.color}`}>
                            <Icon data={s.icon} size={18} />
                          </span>
                        </Flex>
                        <Text className="stat-number" variant="display-2">
                          {String(s.value).padStart(2, "0")}
                        </Text>
                        <Text color="secondary" variant="caption-2">
                          {s.hint}
                        </Text>
                      </Card>
                    ))}
                  </section>
                  <section className="projects-section">
                    <Flex
                      className="section-heading"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Flex gap={3} alignItems="center">
                        <Text as="h2" variant="header-1">
                          В фокусе
                        </Text>
                        <span className="section-count">{active}</span>
                      </Flex>
                      <Button view="flat" onClick={() => navigate("projects")}>
                        Все проекты <Icon data={ArrowRight} size={16} />
                      </Button>
                    </Flex>
                    {projects.length
                      ? projectCards(
                          projects.filter((p) => p.progress < 100).slice(0, 3),
                        )
                      : empty("проектов")}
                    {projects.length > 0 && active === 0 && (
                      <Text color="secondary">
                        Все проекты завершены. Отличная работа!
                      </Text>
                    )}
                  </section>
                  <div className="bottom-grid">
                    <section className="tasks-section">
                      <Flex
                        className="section-heading"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text as="h2" variant="header-1">
                          Небольшие шаги на сегодня
                        </Text>
                        <span className="subtle-caption">
                          {done} / {tasks.length}
                        </span>
                      </Flex>
                      <Card className="task-list" view="outlined">
                        {tasks.map((t) => (
                          <Flex
                            key={t.id}
                            className={`task-row ${t.done ? "task-done" : ""}`}
                            alignItems="center"
                            gap={3}
                          >
                            <Checkbox
                              checked={t.done}
                              onUpdate={(v) =>
                                setTasks(
                                  tasks.map((item) =>
                                    item.id === t.id
                                      ? { ...item, done: v }
                                      : item,
                                  ),
                                )
                              }
                              controlProps={{ "aria-label": t.title }}
                            />
                            <Box className="flexible">
                              <Text className="task-title">{t.title}</Text>
                              <Text
                                className="task-project"
                                color="secondary"
                                variant="caption-2"
                              >
                                <span className={`favorite-dot ${t.color}`} />
                                {t.project}
                              </Text>
                            </Box>
                            <span className="task-today">Сегодня</span>
                          </Flex>
                        ))}
                      </Card>
                    </section>
                    <section>
                      <Flex
                        className="section-heading"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text as="h2" variant="header-1">
                          На полях
                        </Text>
                        <Button
                          view="flat"
                          size="s"
                          aria-label="Все заметки"
                          onClick={() => navigate("notes")}
                        >
                          <Icon data={ArrowUpRight} size={18} />
                        </Button>
                      </Flex>
                      {notes[0] ? (
                        <Card className="quick-note" view="filled">
                          <Flex gap={2} alignItems="center">
                            <Icon data={BookOpen} size={16} />
                            <Text variant="caption-2">МЫСЛЬ ДНЯ</Text>
                          </Flex>
                          <Text as="h3" variant="subheader-3">
                            {notes[0].title}
                          </Text>
                          <Text
                            as="p"
                            color="secondary"
                            className="note-excerpt"
                          >
                            {notes[0].body}
                          </Text>
                          <Button
                            size="s"
                            view="flat"
                            onClick={() => openNote(notes[0])}
                          >
                            Открыть заметку{" "}
                            <Icon data={ArrowUpRight} size={14} />
                          </Button>
                        </Card>
                      ) : (
                        <Card className="quick-note" view="filled">
                          <Text>Место для новой мысли</Text>
                          <Button view="flat" onClick={() => openNote()}>
                            Написать заметку <Icon data={Plus} />
                          </Button>
                        </Card>
                      )}
                    </section>
                  </div>
                </>
              ) : (
                <>
                  <Flex
                    className="list-toolbar"
                    gap={4}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    {page === "projects" ? (
                      <Flex className="filter-buttons" gap={1}>
                        {[
                          { id: "all", title: "Все проекты" },
                          { id: "active", title: "В работе" },
                          { id: "done", title: "Завершённые" },
                        ].map((f) => (
                          <Button
                            key={f.id}
                            view={filter === f.id ? "normal" : "flat"}
                            selected={filter === f.id}
                            onClick={() => setFilter(f.id)}
                          >
                            {f.title}
                            {f.id === "all" && (
                              <span className="filter-count">
                                {projects.length}
                              </span>
                            )}
                          </Button>
                        ))}
                      </Flex>
                    ) : (
                      <Text color="secondary">
                        {notes.length} заметок · ни одной потерянной мысли
                      </Text>
                    )}
                    <TextInput
                      className="search-input"
                      placeholder={
                        page === "projects" ? "Найти проект…" : "Найти заметку…"
                      }
                      value={query}
                      onUpdate={setQuery}
                      hasClear
                      startContent={<Icon data={Magnifier} size={16} />}
                      controlProps={{ "aria-label": "Поиск" }}
                      size="l"
                    />
                  </Flex>
                  {page === "projects" ? (
                    visibleProjects.length ? (
                      projectCards(visibleProjects)
                    ) : (
                      empty("проектов")
                    )
                  ) : visibleNotes.length ? (
                    <div className="notes-grid">
                      {visibleNotes.map((n, i) => (
                        <Card
                          className={`note-card note-${i % 3}`}
                          key={n.id}
                          view="outlined"
                        >
                          <Flex
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Label
                              theme={
                                i % 3 === 0
                                  ? "utility"
                                  : i % 3 === 1
                                    ? "success"
                                    : "warning"
                              }
                            >
                              {n.tag}
                            </Label>
                            <Icon data={BookOpen} size={18} />
                          </Flex>
                          <Text as="h2" variant="header-1">
                            {n.title}
                          </Text>
                          <Text as="p" className="note-body" color="secondary">
                            {n.body || "Всё начинается с первой мысли…"}
                          </Text>
                          <Flex
                            className="note-bottom"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Text variant="caption-2" color="secondary">
                              {n.date}
                            </Text>
                            <Button view="flat" onClick={() => openNote(n)}>
                              Открыть <Icon data={ArrowUpRight} size={16} />
                            </Button>
                          </Flex>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    empty("заметок")
                  )}
                </>
              )}
              <footer className="page-footer">
                <Flex gap={2} alignItems="center">
                  <span className="footer-brand">
                    <OrbitLogo />
                  </span>
                  <Text variant="caption-2" color="secondary">
                    Орбита — пространство для ваших идей
                  </Text>
                </Flex>
                <Button view="flat" size="s" onClick={() => setDialog("help")}>
                  <Icon data={CircleQuestion} size={15} />
                  Нужна помощь?
                </Button>
              </footer>
            </main>
          </div>
        )}
      />
      <Modal
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        aria-label={
          dialog === "project"
            ? "Новый проект"
            : dialog === "note"
              ? "Редактор заметки"
              : "Информация"
        }
      >
        <div className="dialog-content">
          <Flex justifyContent="space-between" alignItems="center">
            <Text variant="header-2">
              {dialog === "project"
                ? "Начнём что-то новое"
                : dialog === "note"
                  ? editNote
                    ? "Ваша заметка"
                    : "Поймайте мысль"
                  : dialog === "notifications"
                    ? "Вы в курсе всего"
                    : dialog === "profile"
                      ? "Ваше пространство"
                      : "Добро пожаловать в Орбиту"}
            </Text>
            <Button
              view="flat"
              aria-label="Закрыть"
              onClick={() => setDialog(null)}
            >
              <Icon data={Xmark} />
            </Button>
          </Flex>
          {dialog === "project" || dialog === "note" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <label className="field-label" htmlFor="item-title">
                {dialog === "project" ? "Название проекта" : "Заголовок"}
              </label>
              <TextInput
                id="item-title"
                size="l"
                autoFocus
                value={title}
                onUpdate={setTitle}
                placeholder={
                  dialog === "project"
                    ? "Например, моя новая идея"
                    : "О чём вы думаете?"
                }
                controlProps={{ maxLength: 100 }}
              />
              <label className="field-label" htmlFor="item-description">
                {dialog === "project"
                  ? "Несколько слов о проекте"
                  : "Ваши мысли"}
              </label>
              <TextArea
                id="item-description"
                minRows={dialog === "project" ? 3 : 7}
                value={description}
                onUpdate={setDescription}
                placeholder="Свободное место для ваших мыслей…"
              />
              {dialog === "project" && (
                <>
                  <label className="field-label">Категория</label>
                  <Select
                    size="l"
                    value={category}
                    onUpdate={setCategory}
                    options={[
                      "Дизайн",
                      "Разработка",
                      "Личное",
                      "Работа",
                      "Идеи",
                    ].map((value) => ({ value, content: value }))}
                  />
                  <Text className="field-label">Цвет обложки</Text>
                  <Flex gap={2}>
                    {["purple", "green", "orange"].map((c) => (
                      <Button
                        key={c}
                        selected={color === c}
                        className={`color-choice ${c}`}
                        aria-label={
                          {
                            purple: "Фиолетовый",
                            green: "Зелёный",
                            orange: "Оранжевый",
                          }[c]
                        }
                        onClick={() => setColor(c)}
                      >
                        {color === c && <Icon data={Check} />}
                      </Button>
                    ))}
                  </Flex>
                </>
              )}
              <Flex
                className="dialog-actions"
                justifyContent="space-between"
                gap={3}
              >
                {dialog === "note" && editNote ? (
                  <Button
                    view="flat-danger"
                    aria-label="Удалить заметку"
                    onClick={() => {
                      setNotes(notes.filter((n) => n.id !== editNote.id));
                      setDialog(null);
                    }}
                  >
                    <Icon data={TrashBin} />
                  </Button>
                ) : (
                  <span />
                )}
                <Flex gap={2}>
                  <Button view="outlined" onClick={() => setDialog(null)}>
                    Отмена
                  </Button>
                  <Button type="submit" view="action" disabled={!title.trim()}>
                    {dialog === "project" ? "Создать проект" : "Сохранить"}
                  </Button>
                </Flex>
              </Flex>
            </form>
          ) : dialog === "notifications" ? (
            <div className="info-content">
              <span className="info-symbol">
                <Icon data={CircleCheck} size={34} />
              </span>
              <Text variant="subheader-3">Ничего срочного</Text>
              <Text color="secondary">
                Все важные события появятся здесь. А пока можно спокойно
                заняться своими идеями.
              </Text>
            </div>
          ) : dialog === "profile" ? (
            <div className="info-content">
              <Avatar text="АС" size="xl" className="profile-avatar" />
              <Text variant="subheader-3">Александра Смирнова</Text>
              <Text color="secondary">
                Ваше личное пространство: {projects.length} проектов и{" "}
                {notes.length} заметок. Все изменения сохраняются в этом
                браузере автоматически.
              </Text>
            </div>
          ) : (
            <div className="help-content">
              <Text as="p" color="secondary">
                Соберите всё важное в одном спокойном пространстве.
              </Text>
              {[
                {
                  icon: House,
                  title: "Обзор",
                  text: "Держите в фокусе проекты и отмечайте небольшие шаги на сегодня.",
                },
                {
                  icon: Folder,
                  title: "Проекты",
                  text: "Создавайте проекты, следите за прогрессом и отмечайте завершённые.",
                },
                {
                  icon: BookOpen,
                  title: "Заметки",
                  text: "Записывайте идеи, редактируйте и возвращайтесь к ним в любое время.",
                },
              ].map((h) => (
                <Flex key={h.title} gap={4} className="help-row">
                  <Icon data={h.icon} size={22} />
                  <Box>
                    <Text variant="subheader-2">{h.title}</Text>
                    <Text as="p" color="secondary">
                      {h.text}
                    </Text>
                  </Box>
                </Flex>
              ))}
              <Text color="secondary" variant="caption-2">
                Проекты, заметки и выбранная тема сохраняются в вашем браузере.
              </Text>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        aria-label="Подробности проекта"
      >
        {selected && (
          <div className="dialog-content project-detail">
            <Flex justifyContent="space-between" alignItems="center">
              <Label theme="utility">{selected.category}</Label>
              <Button
                view="flat"
                aria-label="Закрыть"
                onClick={() => setSelected(null)}
              >
                <Icon data={Xmark} />
              </Button>
            </Flex>
            <Artwork color={selected.color} />
            <Text as="h2" variant="header-2">
              {selected.title}
            </Text>
            <Text as="p" color="secondary">
              {selected.description}
            </Text>
            <Flex justifyContent="space-between" className="progress-caption">
              <Text>Прогресс проекта</Text>
              <Text>{selected.progress}%</Text>
            </Flex>
            <Progress value={selected.progress} theme="misc" size="s" />
            <Flex
              className="dialog-actions"
              justifyContent="space-between"
              gap={3}
            >
              <Button
                view="flat-danger"
                onClick={() => {
                  setProjects(projects.filter((p) => p.id !== selected.id));
                  setSelected(null);
                }}
              >
                <Icon data={TrashBin} />
                Удалить
              </Button>
              <Button
                view="action"
                onClick={() => {
                  const updated = {
                    ...selected,
                    progress: selected.progress === 100 ? 0 : 100,
                  };
                  setProjects(
                    projects.map((p) => (p.id === updated.id ? updated : p)),
                  );
                  setSelected(updated);
                }}
              >
                <Icon data={Check} />
                {selected.progress === 100
                  ? "Вернуть в работу"
                  : "Завершить проект"}
              </Button>
            </Flex>
          </div>
        )}
      </Modal>
    </ThemeProvider>
  );
}
