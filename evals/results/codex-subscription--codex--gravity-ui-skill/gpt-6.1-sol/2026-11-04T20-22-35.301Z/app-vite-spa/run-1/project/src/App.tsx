import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AsideHeader } from "@gravity-ui/navigation";
import {
  Button,
  Checkbox,
  Flex,
  Icon,
  Modal,
  Select,
  Switch,
  Text,
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
  Folder,
  Gear,
  House,
  LayoutCells,
  Magnifier,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Xmark,
  Persons as PersonIcon,
} from "@gravity-ui/icons";
import "./styles.css";

type Page = "overview" | "projects" | "settings";
type Theme = "light" | "dark";
type Project = {
  id: number;
  name: string;
  description: string;
  category: string;
  color: string;
  progress: number;
  tasks: number;
  done: number;
  date: string;
  status: string;
  members: string[];
};
const initialProjects: Project[] = [
  {
    id: 1,
    name: "Редизайн сайта",
    description: "Новый взгляд на наш цифровой дом",
    category: "Дизайн",
    color: "violet",
    progress: 68,
    tasks: 24,
    done: 16,
    date: "12 ноября",
    status: "В работе",
    members: ["АК", "МС", "ДВ"],
  },
  {
    id: 2,
    name: "Мобильное приложение",
    description: "Всё важное — всегда под рукой",
    category: "Разработка",
    color: "peach",
    progress: 42,
    tasks: 32,
    done: 13,
    date: "24 ноября",
    status: "В работе",
    members: ["ДВ", "ЕЛ", "АК"],
  },
  {
    id: 3,
    name: "Бренд-платформа",
    description: "Находим свой голос и характер",
    category: "Маркетинг",
    color: "green",
    progress: 85,
    tasks: 18,
    done: 15,
    date: "8 ноября",
    status: "На проверке",
    members: ["МС", "ЕЛ"],
  },
];
const initialTasks = [
  {
    id: 1,
    title: "Согласовать концепцию главной страницы",
    project: "Редизайн сайта",
    color: "violet",
    time: "Сегодня",
    done: false,
  },
  {
    id: 2,
    title: "Подготовить прототип онбординга",
    project: "Мобильное приложение",
    color: "peach",
    time: "Сегодня",
    done: false,
  },
  {
    id: 3,
    title: "Собрать референсы для айдентики",
    project: "Бренд-платформа",
    color: "green",
    time: "Сегодня",
    done: true,
  },
];
const pageNames = {
  overview: "Обзор",
  projects: "Проекты",
  settings: "Настройки",
};
function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
function getPage(): Page {
  const value = window.location.hash.slice(1);
  return value === "projects" || value === "settings" ? value : "overview";
}
const BrandMark = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    aria-hidden="true"
  >
    <path d="M6 9.5 15 4l9 5.5-9 5.5-9-5.5Z" fill="currentColor" />
    <path
      d="m6 15 9 5.5 9-5.5M6 20.5l9 5.5 9-5.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
function Avatars({ members }: { members: string[] }) {
  return (
    <div className="avatars">
      {members.map((m, i) => (
        <span
          key={m}
          className={`avatar avatar-${i}`}
          title={
            {
              АК: "Александр Ковалёв",
              МС: "Мария Смирнова",
              ДВ: "Дмитрий Волков",
              ЕЛ: "Елена Лебедева",
            }[m]
          }
        >
          {m}
        </span>
      ))}
      <span className="avatar avatar-more">
        +{members.length === 2 ? 1 : 2}
      </span>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    readStored("potok-theme", "light"),
  );
  const [page, setPage] = useState<Page>(getPage);
  const [narrow, setNarrow] = useState(() => window.innerWidth < 760);
  const [projects, setProjects] = useState<Project[]>(() =>
    readStored("potok-projects", initialProjects),
  );
  const [tasks, setTasks] = useState(() =>
    readStored("potok-tasks", initialTasks),
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [modal, setModal] = useState<"new" | "notifications" | "help" | null>(
    null,
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState(["Дизайн"]);
  const [profile, setProfile] = useState(() =>
    readStored("potok-profile", {
      name: "Александр Ковалёв",
      email: "alex@studio.design",
      workspace: "Студия",
      notifications: true,
      digest: false,
    }),
  );
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const handler = () => setPage(getPage());
    const resize = () => setNarrow(window.innerWidth < 760);
    window.addEventListener("hashchange", handler);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("hashchange", handler);
      window.removeEventListener("resize", resize);
    };
  }, []);
  useEffect(() => {
    localStorage.setItem("potok-theme", JSON.stringify(theme));
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("potok-projects", JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem("potok-tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const navigate = (next: Page) => {
    window.location.hash = next;
    setPage(next);
    setSearch("");
  };
  const createProject = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setProjects((current) => [
      {
        id: Date.now(),
        name: newName.trim(),
        description: newDescription.trim() || "Здесь начинается что-то хорошее",
        category: newCategory[0],
        color: ["violet", "peach", "green"][current.length % 3],
        progress: 0,
        tasks: 0,
        done: 0,
        date: "Без срока",
        status: "В работе",
        members: ["АК"],
      },
      ...current,
    ]);
    setModal(null);
    setNewName("");
    setNewDescription("");
    navigate("projects");
    setFilter("all");
    setNotice("Проект создан. Время воплощать идеи!");
  };
  const openNew = () => {
    setNewName("");
    setNewDescription("");
    setModal("new");
  };
  const filteredProjects = projects
    .filter(
      (p) =>
        `${p.name} ${p.description} ${p.category}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (filter === "all" ||
          (filter === "active" && p.status === "В работе") ||
          (filter === "review" && p.status === "На проверке") ||
          (filter === "completed" && p.status === "Завершён")),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "ru")
        : sort === "progress"
          ? b.progress - a.progress
          : 0,
    );
  const completed = tasks.filter((t) => t.done).length;

  function ProjectCard({ project: p }: { project: Project }) {
    return (
      <article className="project-card">
        <Flex alignItems="center" justifyContent="space-between">
          <span className={`project-symbol ${p.color}`}>
            <Icon
              data={
                p.color === "violet"
                  ? LayoutCells
                  : p.color === "peach"
                    ? Folder
                    : Sparkles
              }
              size={23}
            />
          </span>
          <span
            className={`status ${p.status === "На проверке" ? "review" : p.status === "Завершён" ? "finished" : ""}`}
          >
            <i />
            {p.status}
          </span>
        </Flex>
        <Button
          view="flat"
          className="project-name"
          onClick={() => setSelectedProject(p)}
        >
          {p.name}
        </Button>
        <p className="project-description">{p.description}</p>
        <div className="progress-caption">
          <span>Прогресс</span>
          <span>{p.progress}%</span>
        </div>
        <div
          className={`progress-track ${p.color}`}
          role="progressbar"
          aria-label={`Прогресс: ${p.name}`}
          aria-valuenow={p.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${p.progress}%` }} />
        </div>
        <div className="project-meta">
          <span>
            <Icon data={CircleCheck} size={14} /> {p.done}/{p.tasks} задач
          </span>
          <span>
            <Icon data={Calendar} size={14} />
            {p.date}
          </span>
        </div>
        <div className="project-card-footer">
          <Avatars members={p.members} />
          <Button
            view="flat"
            size="s"
            aria-label={`Открыть ${p.name}`}
            onClick={() => setSelectedProject(p)}
          >
            <Icon data={ArrowUpRight} size={17} />
          </Button>
        </div>
      </article>
    );
  }

  const renderOverview = () => (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ВАШЕ РАБОЧЕЕ ПРОСТРАНСТВО</div>
          <Text as="h1" variant="display-2">
            Обзор
          </Text>
          <p>Большие идеи начинаются с маленьких шагов.</p>
        </div>
        <Button size="l" view="action" onClick={openNew}>
          <Icon data={Plus} size={17} /> Создать проект
        </Button>
      </div>
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-tag">
            <span className="sun-dot" /> ХОРОШИЙ ДЕНЬ ДЛЯ НОВЫХ ИДЕЙ
          </span>
          <Text as="h2" variant="display-2">
            Меньше суеты.
            <br />
            Больше потока.
          </Text>
          <p>
            Все проекты, задачи и команда — в одном месте.
            <br className="desktop-break" /> Сосредоточьтесь на том, что
            действительно важно.
          </p>
          <Button
            view="normal"
            size="l"
            className="hero-button"
            onClick={() => navigate("projects")}
          >
            Перейти к проектам <Icon data={ArrowRight} size={17} />
          </Button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="art-star star-one">✳</div>
          <div className="art-star star-two">✦</div>
          <div className="floating-card back-card">
            <div className="art-mini-icon">
              <Icon data={Folder} size={23} />
            </div>
            <div className="art-line long" />
            <div className="art-line" />
            <div className="art-line short" />
          </div>
          <div className="floating-card front-card">
            <span className="art-check">
              <Icon data={Check} size={27} />
            </span>
            <span className="art-card-title">Всё идёт по плану</span>
            <span className="art-card-subtitle">Шаг за шагом к большему</span>
            <div className="art-progress">
              <span />
            </div>
            <div className="art-card-bottom">
              <div className="mini-faces">
                <i>А</i>
                <i>М</i>
                <i>Д</i>
              </div>
              <span>Вместе — лучше</span>
            </div>
          </div>
          <span className="art-dot dot-one" />
          <span className="art-dot dot-two" />
        </div>
      </section>
      <section className="stats-grid" aria-label="Статистика">
        <div className="stat-item">
          <span className="stat-icon">
            <Icon data={Folder} size={21} />
          </span>
          <div>
            <span className="stat-label">Активных проектов</span>
            <div className="stat-number">
              {projects.filter((p) => p.status !== "Завершён").length}
              <span className="stat-change">
                +1 за неделю <Icon data={ArrowUpRight} size={12} />
              </span>
            </div>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">
            <Icon data={CircleCheck} size={21} />
          </span>
          <div>
            <span className="stat-label">Задач выполнено</span>
            <div className="stat-number">
              {43 + completed}
              <span className="stat-note">из 74 задач</span>
            </div>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">
            <Icon data={Clock} size={21} />
          </span>
          <div>
            <span className="stat-label">В фокусе сегодня</span>
            <div className="stat-number">
              {tasks.length - completed}
              <span className="stat-note">задачи</span>
            </div>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">
            <Icon data={PersonIcon} size={21} />
          </span>
          <div>
            <span className="stat-label">Участников команды</span>
            <div className="stat-number">
              5<span className="stat-note">вместе с вами</span>
            </div>
          </div>
        </div>
      </section>
      <section className="projects-section">
        <div className="section-heading">
          <Flex alignItems="center" gap={3}>
            <Text as="h2" variant="header-1">
              Мои проекты
            </Text>
            <span className="count-badge">{projects.length}</span>
          </Flex>
          <Button view="flat" onClick={() => navigate("projects")}>
            Все проекты <Icon data={ArrowRight} size={15} />
          </Button>
        </div>
        <div className="project-grid">
          {projects.slice(0, 3).map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>
      <div className="bottom-grid">
        <section className="task-panel">
          <div className="section-heading">
            <Flex alignItems="center" gap={3}>
              <Text as="h2" variant="header-1">
                В фокусе сегодня
              </Text>
              <span className="count-badge">{tasks.length - completed}</span>
            </Flex>
            <span className="muted small">4 ноября</span>
          </div>
          <div className="task-list">
            {tasks.map((task) => (
              <div
                className={`task-row ${task.done ? "is-done" : ""}`}
                key={task.id}
              >
                <Checkbox
                  size="l"
                  checked={task.done}
                  onUpdate={(done) =>
                    setTasks((ts) =>
                      ts.map((t) => (t.id === task.id ? { ...t, done } : t)),
                    )
                  }
                  controlProps={{ "aria-label": task.title }}
                />
                <div className="task-copy">
                  <span className="task-title">{task.title}</span>
                  <span className="task-project">
                    <i className={task.color} />
                    {task.project}
                  </span>
                </div>
                <span className="task-date">
                  {task.done ? <Icon data={Check} size={15} /> : task.time}
                </span>
              </div>
            ))}
          </div>
          <div className="task-panel-bottom">
            <span>
              {completed} из {tasks.length} задач выполнено
            </span>
            <span>
              Хороший темп <span className="tiny-spark">✧</span>
            </span>
          </div>
        </section>
        <section className="activity-panel">
          <div className="section-heading">
            <Text as="h2" variant="header-1">
              Пульс команды
            </Text>
            <span className="live-dot" />
          </div>
          <div className="activity-row">
            <span className="activity-avatar violet">МС</span>
            <div>
              <p>
                <strong>Мария</strong> обновила макеты
              </p>
              <span>
                Редизайн сайта <b>·</b> 20 мин назад
              </span>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-avatar peach">ДВ</span>
            <div>
              <p>
                <strong>Дмитрий</strong> выполнил 3 задачи
              </p>
              <span>
                Мобильное приложение <b>·</b> 1 ч назад
              </span>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-avatar green">ЕЛ</span>
            <div>
              <p>
                <strong>Елена</strong> добавила комментарий
              </p>
              <span>
                Бренд-платформа <b>·</b> 2 ч назад
              </span>
            </div>
          </div>
          <span className="team-note">Маленькие победы. Большое движение.</span>
        </section>
      </div>
      <footer className="page-footer">
        <span>Поток — пространство для ваших идей.</span>
        <span>
          Сделано для спокойной работы <span>✳</span>
        </span>
      </footer>
    </>
  );

  return (
    <ThemeProvider theme={theme} lang="ru">
      <AsideHeader
        className="app-shell"
        compact={narrow}
        hideCollapseButton
        headerDecoration={false}
        logo={{
          text: "поток",
          icon: BrandMark,
          iconSize: 30,
          textSize: 27,
          href: "#overview",
          onClick: (e) => {
            e.preventDefault();
            navigate("overview");
          },
          className: "app-logo",
        }}
        subheaderItems={
          narrow
            ? []
            : [
                {
                  item: {
                    id: "workspace",
                    title: (
                      <span className="workspace-name">
                        <span className="workspace-letter">С</span>
                        <span>
                          {profile.workspace}
                          <small>Рабочее пространство</small>
                        </span>
                        <Icon data={ChevronDown} size={14} />
                      </span>
                    ),
                    onItemClick: () => navigate("settings"),
                    className: "workspace-item",
                  },
                },
              ]
        }
        menuItems={(
          [
            { id: "overview", title: "Обзор", icon: House },
            {
              id: "projects",
              title: "Проекты",
              icon: Folder,
              rightAdornment: (
                <span className="nav-count">{projects.length}</span>
              ),
            },
            { id: "settings", title: "Настройки", icon: Gear },
          ] as const
        ).map((item) => ({
          ...item,
          current: page === item.id,
          onItemClick: () => navigate(item.id),
          className: "app-nav-item",
          tooltipText: item.title,
        }))}
        renderFooter={() => (
          <div className={`sidebar-footer ${narrow ? "compact-footer" : ""}`}>
            {!narrow && (
              <>
                <div className="sidebar-promo">
                  <span className="promo-spark">✧</span>
                  <Text as="h3" variant="subheader-2">
                    Место для большего
                  </Text>
                  <p>
                    От идеи до результата.
                    <br />В вашем собственном ритме.
                  </p>
                  <span className="promo-link">
                    Поймайте свой поток <Icon data={ArrowUpRight} size={14} />
                  </span>
                  <span className="promo-orbit" />
                </div>
                <Button
                  view="flat"
                  className="help-button"
                  onClick={() => setModal("help")}
                >
                  <Icon data={CircleQuestion} size={18} /> Помощь и поддержка{" "}
                  <Icon data={ArrowUpRight} size={13} />
                </Button>
                <div className="theme-toggle" aria-label="Тема оформления">
                  <Button
                    view={theme === "light" ? "raised" : "flat"}
                    selected={theme === "light"}
                    onClick={() => setTheme("light")}
                  >
                    <Icon data={Sun} size={16} /> Светлая
                  </Button>
                  <Button
                    view={theme === "dark" ? "raised" : "flat"}
                    selected={theme === "dark"}
                    onClick={() => setTheme("dark")}
                  >
                    <Icon data={Moon} size={15} /> Тёмная
                  </Button>
                </div>
              </>
            )}
            {narrow && (
              <Button
                view="flat"
                aria-label="Переключить тему"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Icon data={theme === "light" ? Moon : Sun} size={19} />
              </Button>
            )}
            <Button
              view="flat"
              className="profile-button"
              onClick={() => navigate("settings")}
              aria-label="Настройки профиля"
            >
              <span className="profile-avatar">АК</span>
              {!narrow && (
                <>
                  <span className="profile-text">
                    {profile.name}
                    <small>Личное пространство</small>
                  </span>
                  <Icon data={ChevronDown} size={13} />
                </>
              )}
            </Button>
          </div>
        )}
        renderContent={() => (
          <div className="main-layout">
            <header className="topbar">
              <div className="breadcrumbs">
                <span>{narrow ? "Поток" : "Рабочее пространство"}</span>
                <span className="breadcrumb-divider">/</span>
                <span>{pageNames[page]}</span>
              </div>
              <Flex alignItems="center" gap={4}>
                <span className="topbar-date">
                  <Icon data={Calendar} size={15} /> Среда, 4 ноября
                </span>
                <Button
                  view="flat"
                  className="notification-button"
                  aria-label="Уведомления"
                  onClick={() => setModal("notifications")}
                >
                  <Icon data={Bell} size={19} />
                  <span className="notification-dot" />
                </Button>
                <span className="topbar-avatar">АК</span>
              </Flex>
            </header>
            <main className="main-content" key={page}>
              {page === "overview" && renderOverview()}
              {page === "projects" && (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">ОТ ИДЕИ К РЕЗУЛЬТАТУ</div>
                      <Text as="h1" variant="display-2">
                        Проекты
                      </Text>
                      <p>
                        Всё, над чем вы работаете. Всё, что вас вдохновляет.
                      </p>
                    </div>
                    <Button view="action" size="l" onClick={openNew}>
                      <Icon data={Plus} size={17} /> Создать проект
                    </Button>
                  </div>
                  <div className="projects-toolbar">
                    <div className="filter-tabs">
                      {[
                        ["all", "Все проекты"],
                        ["active", "В работе"],
                        ["review", "На проверке"],
                        ["completed", "Завершённые"],
                      ].map(([value, label]) => (
                        <Button
                          key={value}
                          view={filter === value ? "normal" : "flat"}
                          selected={filter === value}
                          onClick={() => setFilter(value)}
                        >
                          {label}
                          {value === "all" && (
                            <span className="tab-count">{projects.length}</span>
                          )}
                        </Button>
                      ))}
                    </div>
                    <Select
                      value={[sort]}
                      onUpdate={(v) => setSort(v[0])}
                      options={[
                        { value: "recent", content: "Сначала новые" },
                        { value: "name", content: "По названию" },
                        { value: "progress", content: "По прогрессу" },
                      ]}
                      aria-label="Сортировка проектов"
                    />
                  </div>
                  <div className="search-row">
                    <TextInput
                      placeholder="Найти проект…"
                      value={search}
                      onUpdate={setSearch}
                      startContent={<Icon data={Magnifier} size={17} />}
                      hasClear
                      size="l"
                      controlProps={{ "aria-label": "Поиск проектов" }}
                    />
                    <span className="muted">
                      {filteredProjects.length} проектов
                    </span>
                  </div>
                  {filteredProjects.length > 0 ? (
                    <div className="project-grid all-projects">
                      {filteredProjects.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">
                        <Icon data={search ? Magnifier : Folder} size={36} />
                      </span>
                      <Text as="h2" variant="header-1">
                        {search ? "Ничего не нашлось" : "Пока здесь тихо"}
                      </Text>
                      <p>
                        {search
                          ? "Попробуйте другое название или сбросьте фильтры."
                          : "Проекты с этим статусом появятся здесь."}
                      </p>
                      <Button
                        view="outlined"
                        onClick={() => {
                          setSearch("");
                          setFilter("all");
                        }}
                      >
                        Показать все проекты
                      </Button>
                    </div>
                  )}
                  <div className="projects-tip">
                    <Icon data={Sparkles} size={20} />
                    <span>
                      У каждой большой идеи есть первый шаг. Создайте проект и
                      сделайте его сегодня.
                    </span>
                  </div>
                </>
              )}
              {page === "settings" && (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">ВАШ ПОТОК, ВАШИ ПРАВИЛА</div>
                      <Text as="h1" variant="display-2">
                        Настройки
                      </Text>
                      <p>Пусть рабочее пространство подстраивается под вас.</p>
                    </div>
                  </div>
                  <form
                    className="settings-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      localStorage.setItem(
                        "potok-profile",
                        JSON.stringify(profile),
                      );
                      setNotice("Настройки сохранены");
                    }}
                  >
                    <section className="settings-section">
                      <span className="settings-section-icon">
                        <Icon data={PersonIcon} size={21} />
                      </span>
                      <div className="settings-section-body">
                        <Text as="h2" variant="header-1">
                          Ваш профиль
                        </Text>
                        <p className="muted">
                          Так вас видят участники команды.
                        </p>
                        <div className="form-grid">
                          <label>
                            Имя и фамилия
                            <TextInput
                              size="l"
                              value={profile.name}
                              onUpdate={(name) =>
                                setProfile({ ...profile, name })
                              }
                              controlProps={{ required: true }}
                            />
                          </label>
                          <label>
                            Электронная почта
                            <TextInput
                              size="l"
                              type="email"
                              value={profile.email}
                              onUpdate={(email) =>
                                setProfile({ ...profile, email })
                              }
                              controlProps={{ required: true }}
                            />
                          </label>
                        </div>
                        <label className="workspace-field">
                          Название рабочего пространства
                          <TextInput
                            size="l"
                            value={profile.workspace}
                            onUpdate={(workspace) =>
                              setProfile({ ...profile, workspace })
                            }
                            controlProps={{ required: true }}
                          />
                        </label>
                      </div>
                    </section>
                    <section className="settings-section">
                      <span className="settings-section-icon">
                        <Icon data={Sun} size={21} />
                      </span>
                      <div className="settings-section-body">
                        <Text as="h2" variant="header-1">
                          Оформление
                        </Text>
                        <p className="muted">
                          Выберите настроение для своей работы. Тема сохраняется
                          автоматически.
                        </p>
                        <div className="theme-options">
                          {(["light", "dark"] as const).map((t) => (
                            <Button
                              key={t}
                              view="outlined"
                              className={`theme-option ${theme === t ? "active" : ""}`}
                              onClick={() => setTheme(t)}
                            >
                              <Icon
                                data={t === "light" ? Sun : Moon}
                                size={23}
                              />
                              <span>
                                {t === "light" ? "Светлая тема" : "Тёмная тема"}
                              </span>
                              {theme === t && (
                                <Icon data={CircleCheck} size={18} />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </section>
                    <section className="settings-section">
                      <span className="settings-section-icon">
                        <Icon data={Bell} size={21} />
                      </span>
                      <div className="settings-section-body">
                        <Text as="h2" variant="header-1">
                          Уведомления
                        </Text>
                        <p className="muted">
                          Только то, что помогает оставаться в курсе.
                        </p>
                        <div className="setting-switch-row">
                          <div>
                            <strong>Обновления проектов</strong>
                            <p className="muted">
                              Новые комментарии и изменения статусов.
                            </p>
                          </div>
                          <Switch
                            checked={profile.notifications}
                            onUpdate={(notifications) =>
                              setProfile({ ...profile, notifications })
                            }
                            controlProps={{
                              "aria-label": "Обновления проектов",
                            }}
                          />
                        </div>
                        <div className="setting-switch-row">
                          <div>
                            <strong>Итоги недели</strong>
                            <p className="muted">
                              Короткое письмо о вашем прогрессе каждую пятницу.
                            </p>
                          </div>
                          <Switch
                            checked={profile.digest}
                            onUpdate={(digest) =>
                              setProfile({ ...profile, digest })
                            }
                            controlProps={{ "aria-label": "Итоги недели" }}
                          />
                        </div>
                      </div>
                    </section>
                    <div className="settings-actions">
                      <span className="muted">
                        Всё готово? Сохраните изменения.
                      </span>
                      <Button view="action" size="l" type="submit">
                        Сохранить изменения <Icon data={Check} size={16} />
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </main>
          </div>
        )}
      />
      <Modal
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        aria-label={
          modal === "new"
            ? "Создать проект"
            : modal === "help"
              ? "Помощь"
              : "Уведомления"
        }
      >
        <div className="modal-body">
          <div className="modal-heading">
            <Text as="h2" variant="header-2">
              {modal === "new"
                ? "Начнём новый проект"
                : modal === "help"
                  ? "Найдите свой поток"
                  : "Вы в курсе событий"}
            </Text>
            <Button
              view="flat"
              aria-label="Закрыть"
              onClick={() => setModal(null)}
            >
              <Icon data={Xmark} size={18} />
            </Button>
          </div>
          {modal === "new" ? (
            <form onSubmit={createProject}>
              <p className="muted">
                Дайте идее имя. Остальное сложится по пути.
              </p>
              <label>
                Название проекта
                <TextInput
                  size="l"
                  autoFocus
                  value={newName}
                  onUpdate={setNewName}
                  placeholder="Например, Новый большой запуск"
                  controlProps={{ required: true, maxLength: 70 }}
                />
              </label>
              <label>
                Короткое описание
                <TextInput
                  size="l"
                  value={newDescription}
                  onUpdate={setNewDescription}
                  placeholder="Что вы хотите сделать?"
                  controlProps={{ maxLength: 120 }}
                />
              </label>
              <label>
                Направление
                <Select
                  size="l"
                  width="max"
                  value={newCategory}
                  onUpdate={setNewCategory}
                  options={["Дизайн", "Разработка", "Маркетинг", "Другое"].map(
                    (value) => ({ value, content: value }),
                  )}
                />
              </label>
              <div className="modal-actions">
                <Button view="outlined" size="l" onClick={() => setModal(null)}>
                  Отмена
                </Button>
                <Button
                  view="action"
                  size="l"
                  type="submit"
                  disabled={!newName.trim()}
                >
                  Создать проект <Icon data={ArrowRight} size={16} />
                </Button>
              </div>
            </form>
          ) : modal === "help" ? (
            <div className="help-content">
              <p>
                Поток помогает держать важное перед глазами и двигаться в своём
                ритме.
              </p>
              <p>
                <strong>Обзор</strong> — ваши проекты, задачи на сегодня и
                последние события команды. Отмечайте задачи, чтобы видеть свой
                прогресс.
              </p>
              <p>
                <strong>Проекты</strong> — создавайте идеи, находите нужное
                через поиск, фильтруйте по статусу. Нажмите на проект, чтобы
                узнать подробности.
              </p>
              <p>
                <strong>Настройки</strong> — измените профиль и выберите удобную
                тему. Все ваши данные сохраняются в этом браузере.
              </p>
              <Button
                view="action"
                size="l"
                width="max"
                onClick={() => setModal(null)}
              >
                Всё понятно, за работу
              </Button>
            </div>
          ) : (
            <div className="notification-content">
              <span className="empty-icon">
                <Icon data={CircleCheck} size={36} />
              </span>
              <Text variant="header-1">Ничего не упущено</Text>
              <p className="muted">
                Сейчас новых уведомлений нет.
                <br />А последние события ждут вас в пульсе команды.
              </p>
              <Button
                view="outlined"
                onClick={() => {
                  setModal(null);
                  navigate("overview");
                }}
              >
                Перейти к обзору
              </Button>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={selectedProject !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
        aria-label="О проекте"
      >
        {selectedProject && (
          <div className="modal-body project-details">
            <div className="modal-heading">
              <span className={`project-symbol ${selectedProject.color}`}>
                <Icon data={Folder} size={23} />
              </span>
              <Button
                view="flat"
                aria-label="Закрыть"
                onClick={() => setSelectedProject(null)}
              >
                <Icon data={Xmark} size={18} />
              </Button>
            </div>
            <span className="eyebrow">{selectedProject.category}</span>
            <Text as="h2" variant="header-2">
              {selectedProject.name}
            </Text>
            <p className="muted">{selectedProject.description}</p>
            <div className="detail-data">
              <span>Участники</span>
              <Avatars members={selectedProject.members} />
            </div>
            <div className="detail-data">
              <span>Срок проекта</span>
              <strong>{selectedProject.date}</strong>
            </div>
            <div className="detail-data">
              <span>Выполнено задач</span>
              <strong>
                {selectedProject.done} из {selectedProject.tasks}
              </strong>
            </div>
            <label>
              Статус проекта
              <Select
                size="l"
                width="max"
                value={[selectedProject.status]}
                options={["В работе", "На проверке", "Завершён"].map(
                  (value) => ({ value, content: value }),
                )}
                onUpdate={(values) => {
                  const updated = {
                    ...selectedProject,
                    status: values[0],
                    ...(values[0] === "Завершён"
                      ? { progress: 100, done: selectedProject.tasks }
                      : {}),
                  };
                  setSelectedProject(updated);
                  setProjects((ps) =>
                    ps.map((p) => (p.id === updated.id ? updated : p)),
                  );
                }}
              />
            </label>
            <div className="modal-actions">
              <Button
                view="action"
                size="l"
                onClick={() => setSelectedProject(null)}
              >
                Готово <Icon data={Check} size={16} />
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {notice && (
        <div className="toast" role="status">
          <Icon data={CircleCheck} size={20} />
          {notice}
        </div>
      )}
    </ThemeProvider>
  );
}
