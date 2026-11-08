import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Select, TextInput } from "@gravity-ui/uikit";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "folder"
  | "chart"
  | "settings"
  | "help"
  | "chevron"
  | "arrow"
  | "search"
  | "plus"
  | "download"
  | "filter"
  | "bell"
  | "close"
  | "check"
  | "mail"
  | "logout"
  | "spark"
  | "link";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
    folder: (
      <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    ),
    chart: (
      <>
        <path d="M4 3v17h17M9 15v-4m5 4V7m5 8v-5" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-1.3.8-1.8 1.3-1.8 2.8M12 17h.01" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    arrow: <path d="M12 4v16m-5-5 5 5 5-5" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M7 12h10m-7 5h4" />
        <circle cx="8" cy="7" r="2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5m5-12 4 4-4 4m-5-4h12" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2" />
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
type Person = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  date: string;
  color: number;
};
const peopleNames = [
  "Анна Смирнова",
  "Михаил Иванов",
  "Екатерина Волкова",
  "Александр Петров",
  "Мария Козлова",
  "Дмитрий Соколов",
  "Анастасия Морозова",
  "Иван Новиков",
  "София Лебедева",
  "Артём Кузнецов",
  "Полина Орлова",
  "Никита Васильев",
  "Дарья Павлова",
  "Максим Фёдоров",
  "Алиса Семёнова",
  "Кирилл Попов",
  "Елена Белова",
  "Андрей Егоров",
  "Виктория Захарова",
  "Сергей Николаев",
  "Ольга Макарова",
  "Роман Андреев",
  "Вероника Зайцева",
  "Денис Алексеев",
  "Ксения Титова",
  "Павел Громов",
  "Валерия Сергеева",
  "Владимир Романов",
  "Наталья Крылова",
  "Олег Фомин",
  "Юлия Соловьёва",
  "Константин Миронов",
  "Евгения Власова",
  "Матвей Зуев",
  "Татьяна Сафонова",
  "Глеб Медведев",
  "Анна Котова",
  "Марк Белов",
  "Елизавета Жукова",
  "Тимофей Гусев",
  "Арина Филатова",
  "Степан Борисов",
  "Кристина Лукина",
  "Фёдор Карпов",
  "Милана Осипова",
  "Вадим Тарасов",
  "Александра Ильина",
  "Лев Денисов",
];
const emailNames = [
  "anna.smirnova",
  "mikhail.ivanov",
  "ekaterina.volkova",
  "alexander.petrov",
  "maria.kozlova",
  "dmitry.sokolov",
  "anastasia.morozova",
  "ivan.novikov",
];
const depts = [
  "Дизайн",
  "Разработка",
  "Маркетинг",
  "Разработка",
  "HR",
  "Разработка",
  "Дизайн",
  "Продажи",
];
const roles = [
  "Product Designer",
  "Frontend Developer",
  "Marketing Manager",
  "Backend Developer",
  "HR Manager",
  "Tech Lead",
  "UX/UI Designer",
  "Sales Manager",
];
const initialPeople: Person[] = peopleNames.map((name, i) => ({
  id: i + 1,
  name,
  email: `${emailNames[i] || "team.member" + (i + 1)}@acme.design`,
  role: roles[i % 8],
  department: depts[i % 8],
  status:
    i === 5 || (i > 7 && i % 9 === 0)
      ? "В отпуске"
      : i === 7 || (i > 7 && i % 11 === 0)
        ? "Неактивен"
        : "Активен",
  date: `202${i < 6 ? "3" : "4"}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 25) + 3).padStart(2, "0")}`,
  color: i % 8,
}));
const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
const dateLabel = (date: string) =>
  new Date(date + "T12:00:00")
    .toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(" г.", "");
type SortKey = "name" | "role" | "department" | "status" | "date";
export function App() {
  const [people, setPeople] = useState(initialPeople);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Все сотрудники");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({
    key: "name",
    asc: true,
  });
  const [sortActive, setSortActive] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Person | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDept, setNewDept] = useState("Дизайн");
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAddOpen(false);
        setDetail(null);
        setFilterOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };
  const filtered = useMemo(() => {
    let rows = people.filter(
      (p) =>
        (p.name + " " + p.email + " " + p.role)
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (department === "all" || p.department === department) &&
        (status === "all" || p.status === status) &&
        (tab === "Все сотрудники" || p.status === tab),
    );
    if (sortActive)
      rows = [...rows].sort(
        (a, b) =>
          a[sort.key].localeCompare(b[sort.key], "ru") * (sort.asc ? 1 : -1),
      );
    return rows;
  }, [people, query, department, status, tab, sort, sortActive]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const allChecked =
    visible.length > 0 && visible.every((p) => selected.has(p.id));
  const someChecked = visible.some((p) => selected.has(p.id));
  const filterCount = Number(department !== "all") + Number(status !== "all");
  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function togglePage() {
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((p) => (allChecked ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  }
  function changeSort(key: SortKey) {
    setSort({ key, asc: sort.key === key && sortActive ? !sort.asc : true });
    setSortActive(true);
    setPage(1);
  }
  function exportData() {
    const rows = selected.size
      ? people.filter((p) => selected.has(p.id))
      : filtered;
    const csv =
      "\uFEFF" +
      [
        ["Имя", "Email", "Должность", "Отдел", "Статус", "Дата добавления"],
        ...rows.map((p) => [
          p.name,
          p.email,
          p.role,
          p.department,
          p.status,
          p.date,
        ]),
      ]
        .map((row) =>
          row.map((v) => '"' + v.replaceAll('"', '""') + '"').join(";"),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "сотрудники.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify(`Экспортировано сотрудников: ${rows.length}`);
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-icon">
            <span />
            <span />
            <span />
            <span />
          </span>
          forma<span className="brand-dot">.</span>
        </a>
        <button
          className="workspace"
          onClick={() => notify("Вы работаете в пространстве Acme Studio")}
        >
          <span className="workspace-logo">
            a<span>c</span>
          </span>
          <span>
            <strong>Acme Studio</strong>
            <small>Рабочее пространство</small>
          </span>
          <span className="double-chevron">
            ⌃<br />⌄
          </span>
        </button>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          <button
            onClick={() =>
              notify(
                `В команде ${people.length} сотрудников, ${people.filter((p) => p.status === "Активен").length} активных`,
              )
            }
          >
            <Icon name="grid" />
            Обзор
          </button>
          <button
            className="nav-active"
            onClick={() => {
              setQuery("");
              setTab("Все сотрудники");
              setDepartment("all");
              setStatus("all");
              setPage(1);
            }}
          >
            <Icon name="users" />
            Сотрудники<span className="nav-count">{people.length}</span>
          </button>
          <button
            onClick={() => {
              setFilterOpen(true);
              document
                .getElementById("team-table")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Icon name="folder" />
            Отделы<span className="small-count">5</span>
          </button>
          <button onClick={exportData}>
            <Icon name="chart" />
            Отчёты<small className="soon-label">CSV</small>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-icon">
              <Icon name="spark" size={18} />
            </span>
            <strong>Больше возможностей</strong>
            <p>
              Всё для продуктивной работы
              <br />
              вашей команды.
            </p>
            <button
              onClick={() =>
                notify("Вы уже используете все возможности демоверсии")
              }
            >
              Познакомиться с Pro <span>↗</span>
            </button>
          </div>
          <button
            className="bottom-link"
            onClick={() =>
              notify(
                "Настройки таблицы: выберите число строк внизу или настройте фильтры",
              )
            }
          >
            <Icon name="settings" />
            Настройки
          </button>
          <button
            className="bottom-link"
            onClick={() =>
              notify(
                "Нажмите на заголовок колонки для сортировки. Выберите строки для экспорта.",
              )
            }
          >
            <Icon name="help" />
            Помощь и поддержка
            <Icon name="link" size={14} />
          </button>
          <div className="sidebar-user">
            <span className="avatar user-avatar">АС</span>
            <div>
              <strong>Алексей Соколов</strong>
              <small>Администратор</small>
            </div>
            <button
              aria-label="Профиль администратора"
              onClick={() =>
                notify("Алексей Соколов · Администратор Acme Studio")
              }
            >
              <Icon name="chevron" size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            Рабочее пространство <Icon name="chevron" size={14} />
            <span>Сотрудники</span>
          </div>
          <div className="topbar-actions">
            <span className="workspace-status">
              <i />
              Все изменения сохранены
            </span>
            <span className="header-divider" />
            <button
              className="notification"
              aria-label="Уведомления"
              onClick={() => notify("Новых уведомлений пока нет")}
            >
              <Icon name="bell" />
              <i />
            </button>
            <span className="avatar top-avatar">АС</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ЛЮДИ, КОТОРЫЕ ДВИГАЮТ ВПЕРЁД</div>
              <h1>
                Сотрудники <span>{people.length}</span>
              </h1>
              <p>
                Вся команда в одном месте. Управляйте, находите и будьте на
                связи.
              </p>
            </div>
            <Button view="action" size="l" onClick={() => setAddOpen(true)}>
              <Icon name="plus" size={18} />
              Добавить сотрудника
            </Button>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <span className="stat-label">Всего сотрудников</span>
                <div className="stat-value">
                  {people.length}
                  <span className="stat-growth">↗ 12%</span>
                </div>
                <span className="stat-caption">
                  по сравнению с прошлым месяцем
                </span>
              </div>
              <span className="stat-icon purple">
                <Icon name="users" size={22} />
              </span>
              <svg className="sparkline" viewBox="0 0 110 36">
                <path d="M2 33 18 24 30 27 44 16 57 20 70 9 84 13 108 2" />
              </svg>
            </div>
            <div className="stat-card">
              <div>
                <span className="stat-label">Активные сотрудники</span>
                <div className="stat-value">
                  {people.filter((p) => p.status === "Активен").length}
                  <span className="stat-note">
                    <i />В команде
                  </span>
                </div>
                <span className="stat-caption">
                  создаём отличные продукты вместе
                </span>
              </div>
              <span className="stat-icon green">
                <Icon name="check" size={22} />
              </span>
            </div>
            <div className="stat-card">
              <div>
                <span className="stat-label">Отделы</span>
                <div className="stat-value">
                  5
                  <span className="department-dots">
                    <i>Д</i>
                    <i>Р</i>
                    <i>М</i>
                    <i>+2</i>
                  </span>
                </div>
                <span className="stat-caption">
                  разные экспертизы, одна команда
                </span>
              </div>
              <span className="stat-icon blue">
                <Icon name="folder" size={22} />
              </span>
            </div>
          </div>
          <section className="table-card" id="team-table">
            <div className="table-tabs">
              {["Все сотрудники", "Активен", "В отпуске", "Неактивен"].map(
                (t) => (
                  <button
                    key={t}
                    className={tab === t ? "tab active" : "tab"}
                    onClick={() => {
                      setTab(t);
                      setPage(1);
                    }}
                  >
                    {t === "Активен"
                      ? "Активные"
                      : t === "Неактивен"
                        ? "Неактивные"
                        : t}
                    <span>
                      {t === "Все сотрудники"
                        ? people.length
                        : people.filter((p) => p.status === t).length}
                    </span>
                  </button>
                ),
              )}
              <div className="table-caption">
                <i />
                Команда Acme
              </div>
            </div>
            <div className="table-toolbar">
              <div className="search-field">
                <TextInput
                  size="l"
                  placeholder="Поиск по имени, почте или должности"
                  value={query}
                  onUpdate={(v) => {
                    setQuery(v);
                    setPage(1);
                  }}
                  startContent={<Icon name="search" size={18} />}
                  hasClear
                  controlProps={{ "aria-label": "Поиск сотрудников" }}
                />
              </div>
              <div className="toolbar-actions">
                <div className="filter-wrap">
                  <Button
                    size="l"
                    view={filterCount ? "outlined-action" : "outlined"}
                    onClick={() => setFilterOpen(!filterOpen)}
                  >
                    <Icon name="filter" size={18} />
                    Фильтры
                    {filterCount > 0 && (
                      <span className="filter-number">{filterCount}</span>
                    )}
                  </Button>
                  {filterOpen && (
                    <div className="filter-popover">
                      <div className="popover-heading">
                        Фильтры
                        <button
                          aria-label="Закрыть фильтры"
                          onClick={() => setFilterOpen(false)}
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>
                      <label>Отдел</label>
                      <Select
                        width="max"
                        value={[department]}
                        onUpdate={(v) => {
                          setDepartment(v[0]);
                          setPage(1);
                        }}
                        options={[
                          { value: "all", content: "Все отделы" },
                          ...[
                            "Дизайн",
                            "Разработка",
                            "Маркетинг",
                            "HR",
                            "Продажи",
                          ].map((v) => ({ value: v, content: v })),
                        ]}
                      />
                      <label>Статус</label>
                      <Select
                        width="max"
                        value={[status]}
                        onUpdate={(v) => {
                          setStatus(v[0]);
                          setPage(1);
                        }}
                        options={[
                          { value: "all", content: "Все статусы" },
                          ...["Активен", "В отпуске", "Неактивен"].map((v) => ({
                            value: v,
                            content: v,
                          })),
                        ]}
                      />
                      <Button
                        view="flat-secondary"
                        width="max"
                        onClick={() => {
                          setDepartment("all");
                          setStatus("all");
                          setPage(1);
                        }}
                      >
                        Сбросить фильтры
                      </Button>
                    </div>
                  )}
                </div>
                <Button view="outlined" size="l" onClick={exportData}>
                  <Icon name="download" size={17} />
                  Экспорт<span className="export-label">CSV</span>
                </Button>
              </div>
            </div>
            {selected.size > 0 && (
              <div className="selection-bar">
                <span>
                  <strong>Выбрано: {selected.size}</strong>
                  <button onClick={() => setSelected(new Set())}>
                    Снять выделение
                  </button>
                </span>
                <button onClick={exportData}>
                  <Icon name="download" size={15} />
                  Экспорт выбранных
                </button>
              </div>
            )}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th className="check-cell">
                      <Checkbox
                        checked={allChecked}
                        indeterminate={!allChecked && someChecked}
                        onUpdate={togglePage}
                        controlProps={{ "aria-label": "Выбрать все строки на странице" }}
                      />
                    </th>
                    {(
                      [
                        ["name", "Сотрудник"],
                        ["role", "Должность"],
                        ["department", "Отдел"],
                        ["status", "Статус"],
                        ["date", "Дата добавления"],
                      ] as [SortKey, string][]
                    ).map(([key, label]) => (
                      <th
                        key={key}
                        aria-sort={
                          sortActive && sort.key === key
                            ? sort.asc
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <button
                          className={
                            "sort-button " +
                            (sortActive && sort.key === key ? "sorted" : "")
                          }
                          onClick={() => changeSort(key)}
                        >
                          {label}
                          <span
                            className={
                              sortActive && sort.key === key && sort.asc
                                ? "sort-icon ascending"
                                : "sort-icon"
                            }
                          >
                            <Icon name="arrow" size={14} />
                          </span>
                        </button>
                      </th>
                    ))}
                    <th className="row-menu-cell" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <tr
                      key={p.id}
                      className={selected.has(p.id) ? "selected-row" : ""}
                    >
                      <td className="check-cell">
                        <Checkbox
                          checked={selected.has(p.id)}
                          onUpdate={() => toggle(p.id)}
                          controlProps={{ "aria-label": `Выбрать: ${p.name}` }}
                        />
                      </td>
                      <td>
                        <button
                          className="person-cell"
                          onClick={() => setDetail(p)}
                        >
                          <span className={`avatar avatar-${p.color}`}>
                            {initials(p.name)}
                          </span>
                          <span>
                            <strong>{p.name}</strong>
                            <small>{p.email}</small>
                          </span>
                        </button>
                      </td>
                      <td>
                        <span className="role-text">{p.role}</span>
                      </td>
                      <td>
                        <span className={"department-tag dept-" + p.department}>
                          {p.department}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            "status-tag " +
                            (p.status === "Активен"
                              ? "status-active"
                              : p.status === "В отпуске"
                                ? "status-away"
                                : "status-inactive")
                          }
                        >
                          <i />
                          {p.status}
                        </span>
                      </td>
                      <td className="date-cell">{dateLabel(p.date)}</td>
                      <td className="row-menu-cell">
                        <button
                          className="row-more"
                          aria-label={`Подробнее: ${p.name}`}
                          onClick={() => setDetail(p)}
                        >
                          ···
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible.length === 0 && (
                <div className="empty-state">
                  <Icon name="search" size={30} />
                  <h3>Сотрудники не найдены</h3>
                  <p>Попробуйте другой запрос или сбросьте фильтры.</p>
                  <Button
                    view="outlined"
                    onClick={() => {
                      setQuery("");
                      setDepartment("all");
                      setStatus("all");
                      setTab("Все сотрудники");
                    }}
                  >
                    Сбросить всё
                  </Button>
                </div>
              )}
            </div>
            <div className="pagination">
              <span className="results-text">
                Показано{" "}
                <strong>
                  {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                  {Math.min(currentPage * pageSize, filtered.length)}
                </strong>{" "}
                из <strong>{filtered.length}</strong> сотрудников
              </span>
              <div className="pagination-controls">
                <span className="per-page-label">На странице</span>
                <Select
                  size="m"
                  value={[String(pageSize)]}
                  options={[8, 16, 24].map((n) => ({
                    value: String(n),
                    content: String(n),
                  }))}
                  onUpdate={(v) => {
                    setPageSize(Number(v[0]));
                    setPage(1);
                  }}
                  aria-label="Количество строк на странице"
                />
                <div className="page-buttons">
                  <button
                    aria-label="Предыдущая страница"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    <span className="previous">
                      <Icon name="chevron" size={16} />
                    </span>
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      className={currentPage === n ? "page-active" : ""}
                      aria-label={`Страница ${n}`}
                      aria-current={currentPage === n ? "page" : undefined}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    aria-label="Следующая страница"
                    disabled={currentPage === pages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    <Icon name="chevron" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>
          <div className="page-footer">
            <span>
              <Icon name="check" size={14} />
              Данные вашей команды под надёжной защитой
            </span>
            <span>
              Создавайте больше. Вместе с <strong>forma.</strong>
            </span>
          </div>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={17} />
          </span>
          {toast}
          <button aria-label="Закрыть уведомление" onClick={() => setToast("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {addOpen && (
        <div className="modal-overlay" onClick={() => setAddOpen(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Закрыть"
              onClick={() => setAddOpen(false)}
            >
              <Icon name="close" />
            </button>
            <div className="modal-icon">
              <Icon name="users" size={26} />
            </div>
            <h2 id="add-title">Новый сотрудник</h2>
            <p>Добавьте нового человека в вашу команду.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newName.trim()) return;
                setPeople((prev) => [
                  ...prev,
                  {
                    id: Math.max(...prev.map((p) => p.id)) + 1,
                    name: newName.trim(),
                    email: newEmail,
                    role: "Новый сотрудник",
                    department: newDept,
                    status: "Активен",
                    date: new Date().toISOString().slice(0, 10),
                    color: people.length % 8,
                  },
                ]);
                setAddOpen(false);
                setNewName("");
                setNewEmail("");
                setQuery("");
                setStatus("all");
                setDepartment("all");
                setTab("Все сотрудники");
                setSort({ key: "date", asc: false });
                setSortActive(true);
                setPage(1);
                notify("Сотрудник добавлен в команду");
              }}
            >
              <label htmlFor="name">Имя и фамилия</label>
              <input
                id="name"
                autoFocus
                required
                placeholder="Например, Анна Смирнова"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <label htmlFor="email">Рабочая почта</label>
              <input
                id="email"
                type="email"
                required
                placeholder="name@acme.design"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <label>Отдел</label>
              <Select
                size="l"
                width="max"
                value={[newDept]}
                onUpdate={(v) => setNewDept(v[0])}
                options={[
                  "Дизайн",
                  "Разработка",
                  "Маркетинг",
                  "HR",
                  "Продажи",
                ].map((v) => ({ value: v, content: v }))}
              />
              <div className="modal-actions">
                <Button
                  size="l"
                  view="outlined"
                  onClick={() => setAddOpen(false)}
                >
                  Отмена
                </Button>
                <Button size="l" view="action" type="submit">
                  Добавить сотрудника
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <section
            className="modal detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Закрыть"
              onClick={() => setDetail(null)}
            >
              <Icon name="close" />
            </button>
            <span className={`avatar large-avatar avatar-${detail.color}`}>
              {initials(detail.name)}
            </span>
            <h2 id="detail-title">{detail.name}</h2>
            <p>{detail.role}</p>
            <dl>
              <div>
                <dt>Рабочая почта</dt>
                <dd>
                  <a href={`mailto:${detail.email}`}>{detail.email}</a>
                </dd>
              </div>
              <div>
                <dt>Отдел</dt>
                <dd>{detail.department}</dd>
              </div>
              <div>
                <dt>Статус</dt>
                <dd>{detail.status}</dd>
              </div>
              <div>
                <dt>Дата добавления</dt>
                <dd>{dateLabel(detail.date)}</dd>
              </div>
            </dl>
            <Button
              view="action"
              size="l"
              width="max"
              onClick={() => {
                toggle(detail.id);
                setDetail(null);
              }}
            >
              {selected.has(detail.id)
                ? "Снять выделение"
                : "Выбрать сотрудника"}
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}
