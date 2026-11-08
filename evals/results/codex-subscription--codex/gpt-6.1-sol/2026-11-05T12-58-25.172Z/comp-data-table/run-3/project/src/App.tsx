import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "layers"
  | "chart"
  | "settings"
  | "help"
  | "chevron"
  | "plus"
  | "search"
  | "download"
  | "filter"
  | "columns"
  | "arrow"
  | "more"
  | "close"
  | "check"
  | "logout"
  | "mail"
  | "external";
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
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M17 4a4 4 0 0 1 0 8M21 21v-2a4 4 0 0 0-3-3.87" />
        <circle cx="9.5" cy="7" r="4" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M9 15v-4M14 15V6M19 15v-7" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-.6 2.3-2 .9L4 5.7 2 9l1.7 1.6v2.8L2 15l2 3.3 2.4-.5 2 .9L9 21h4l.6-2.3 2-.9 2.4.5 2-3.3-1.7-1.6v-2.8L20 9l-2-3.3-2.4.5-2-.9L13 3Z" />
        <circle cx="11" cy="12" r="3" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16h.01" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="2" fill="currentColor" />
        <circle cx="15" cy="17" r="2" fill="currentColor" />
      </>
    ),
    columns: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16M15 4v16" />
      </>
    ),
    arrow: <path d="M12 4v16m-5-5 5 5 5-5" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    logout: (
      <>
        <path d="M9 4H4v16h5M12 12h9m-4-4 4 4-4 4" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7L11 13M10 4H4v16h16v-6" />
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
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  date: string;
  color: number;
};
const departments = [
  "Дизайн",
  "Разработка",
  "Маркетинг",
  "Продажи",
  "HR",
  "Финансы",
];
const people = [
  ["Анна Смирнова", "anna.smirnova", "Product Designer", "Дизайн"],
  ["Михаил Иванов", "m.ivanov", "Frontend Developer", "Разработка"],
  ["Екатерина Волкова", "e.volkova", "Marketing Manager", "Маркетинг"],
  ["Александр Петров", "a.petrov", "Sales Manager", "Продажи"],
  ["Мария Козлова", "m.kozlova", "HR Business Partner", "HR"],
  ["Дмитрий Соколов", "d.sokolov", "Backend Developer", "Разработка"],
  ["Анастасия Морозова", "a.morozova", "UX Researcher", "Дизайн"],
  ["Артём Новиков", "a.novikov", "Financial Analyst", "Финансы"],
  ["Елена Фёдорова", "e.fedorova", "Brand Designer", "Дизайн"],
  ["Никита Орлов", "n.orlov", "DevOps Engineer", "Разработка"],
  ["Полина Лебедева", "p.lebedeva", "Content Manager", "Маркетинг"],
  ["Иван Васильев", "i.vasiliev", "Account Manager", "Продажи"],
  ["София Павлова", "s.pavlova", "Recruiter", "HR"],
  ["Андрей Семёнов", "a.semenov", "QA Engineer", "Разработка"],
  ["Виктория Попова", "v.popova", "Product Designer", "Дизайн"],
  ["Максим Егоров", "m.egorov", "Accountant", "Финансы"],
  ["Дарья Николаева", "d.nikolaeva", "UX Designer", "Дизайн"],
  ["Сергей Захаров", "s.zakharov", "Frontend Developer", "Разработка"],
  ["Алиса Зайцева", "a.zaytseva", "SEO Specialist", "Маркетинг"],
  ["Денис Кузнецов", "d.kuznetsov", "Sales Lead", "Продажи"],
  ["Ксения Белова", "k.belova", "HR Manager", "HR"],
  ["Роман Алексеев", "r.alekseev", "Backend Developer", "Разработка"],
  ["Ольга Тихонова", "o.tikhonova", "Design Lead", "Дизайн"],
  ["Павел Громов", "p.gromov", "Financial Manager", "Финансы"],
  ["Вера Соловьёва", "v.solovieva", "Illustrator", "Дизайн"],
  ["Илья Макаров", "i.makarov", "Mobile Developer", "Разработка"],
  ["Арина Сергеева", "a.sergeeva", "SMM Manager", "Маркетинг"],
  ["Глеб Борисов", "g.borisov", "Sales Manager", "Продажи"],
  ["Наталья Андреева", "n.andreeva", "Recruiter", "HR"],
  ["Тимофей Фомин", "t.fomin", "QA Engineer", "Разработка"],
  ["Ульяна Миронова", "u.mironova", "UX Writer", "Дизайн"],
  ["Вадим Крылов", "v.krylov", "Analyst", "Финансы"],
  ["Ева Медведева", "e.medvedeva", "Product Designer", "Дизайн"],
  ["Матвей Романов", "m.romanov", "Frontend Developer", "Разработка"],
  ["Юлия Гусева", "y.guseva", "Marketing Analyst", "Маркетинг"],
  ["Кирилл Титов", "k.titov", "Account Manager", "Продажи"],
  ["Валерия Осипова", "v.osipova", "HR Specialist", "HR"],
  ["Даниил Фролов", "d.frolov", "Backend Developer", "Разработка"],
  ["Александра Сидорова", "a.sidorova", "UI Designer", "Дизайн"],
  ["Владислав Логинов", "v.loginov", "Financial Analyst", "Финансы"],
  ["Милана Ефимова", "m.efimova", "Graphic Designer", "Дизайн"],
  ["Марк Савельев", "m.saveliev", "Tech Lead", "Разработка"],
  ["Елизавета Котова", "e.kotova", "Copywriter", "Маркетинг"],
  ["Степан Белов", "s.belov", "Sales Manager", "Продажи"],
  ["Таисия Воронова", "t.voronova", "People Partner", "HR"],
  ["Давид Комаров", "d.komarov", "Mobile Developer", "Разработка"],
  ["Василиса Куликова", "v.kulikova", "UX Designer", "Дизайн"],
  ["Лев Миронов", "l.mironov", "Accountant", "Финансы"],
];
const initialEmployees: Employee[] = people.map(
  ([name, email, role, department], i) => ({
    id: i + 1,
    name,
    email: email + "@form.team",
    role,
    department,
    status: [2, 12, 23].includes(i)
      ? "В отпуске"
      : [6, 18, 29, 38, 45].includes(i)
        ? "Приглашён"
        : "Активен",
    date: `2024-${String(1 + (Math.floor(i / 4) % 12)).padStart(2, "0")}-${String(10 + (i % 18)).padStart(2, "0")}`,
    color: i % 8,
  }),
);
const columnNames = {
  name: "Сотрудник",
  role: "Должность",
  department: "Отдел",
  status: "Статус",
  date: "Дата добавления",
};
type Column = keyof typeof columnNames;
const allColumns = Object.keys(columnNames) as Column[];
function CheckBox({
  checked,
  mixed = false,
  onChange,
  label,
}: {
  checked: boolean;
  mixed?: boolean;
  onChange: () => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = mixed;
  }, [mixed]);
  return (
    <input
      ref={ref}
      className="checkbox"
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
    />
  );
}
function Avatar({
  employee,
  small = false,
}: {
  employee: Employee;
  small?: boolean;
}) {
  return (
    <span className={`avatar color-${employee.color} ${small ? "small" : ""}`}>
      {employee.name
        .split(" ")
        .map((n) => n[0])
        .join("")}
    </span>
  );
}
function Status({ value }: { value: string }) {
  return (
    <span
      className={`status ${value === "Активен" ? "active" : value === "В отпуске" ? "vacation" : "invited"}`}
    >
      <span />
      {value}
    </span>
  );
}

export function App() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("form-studio-employees") ?? "null",
      );
      if (
        Array.isArray(saved) &&
        saved.every(
          (entry: Employee) =>
            entry &&
            typeof entry.id === "number" &&
            typeof entry.name === "string" &&
            typeof entry.email === "string" &&
            typeof entry.role === "string" &&
            departments.includes(entry.department) &&
            ["Активен", "В отпуске", "Приглашён"].includes(entry.status) &&
            typeof entry.date === "string" &&
            typeof entry.color === "number",
        )
      )
        return saved;
    } catch {
      /* Use demo data if browser storage is unavailable. */
    }
    return initialEmployees;
  });
  useEffect(() => {
    try {
      localStorage.setItem("form-studio-employees", JSON.stringify(employees));
    } catch {
      /* The table also works without browser storage. */
    }
  }, [employees]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Все сотрудники");
  const [department, setDepartment] = useState("Все отделы");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [sort, setSort] = useState<{
    key: Column;
    direction: "asc" | "desc";
  } | null>(null);
  const [columns, setColumns] = useState<Column[]>(allColumns);
  const [popover, setPopover] = useState<string | null>(null);
  const [modal, setModal] = useState<"add" | "help" | "settings" | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [section, setSection] = useState("Сотрудники");
  const [toast, setToast] = useState("");
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const toolbarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSection("Сотрудники");
        requestAnimationFrame(() =>
          document
            .querySelector<HTMLInputElement>(".search-field input")
            ?.focus(),
        );
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    if (!modal && !editEmployee && !deleteIds.length) return;
    const previous = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      const dialog = document.querySelector<HTMLElement>("[role=dialog]");
      if (dialog && !dialog.contains(document.activeElement))
        dialog.querySelector<HTMLElement>("input,button,select")?.focus();
    });
    const fn = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = document
        .querySelector("[role=dialog]")
        ?.querySelectorAll<HTMLElement>("button:not(:disabled),input,select");
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", fn);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [modal, editEmployee, deleteIds]);
  useEffect(() => {
    const fn = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      )
        setPopover(null);
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);
  useEffect(() => {
    setPage(1);
  }, [query, tab, department, pageSize]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setEditEmployee(null);
        setPopover(null);
        setDeleteIds([]);
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);
  const filtered = useMemo(() => {
    let rows = employees.filter(
      (e) =>
        (department === "Все отделы" || e.department === department) &&
        (tab === "Все сотрудники" ||
          e.status ===
            {
              Активные: "Активен",
              "В отпуске": "В отпуске",
              Приглашённые: "Приглашён",
            }[tab]) &&
        `${e.name} ${e.email} ${e.role} ${e.department}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
    );
    if (sort)
      rows.sort(
        (a, b) =>
          a[sort.key].localeCompare(b[sort.key], "ru") *
          (sort.direction === "asc" ? 1 : -1),
      );
    return rows;
  }, [employees, query, tab, department, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const checkedOnPage = visible.filter((e) => selected.has(e.id)).length;
  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((e) =>
        checkedOnPage === visible.length ? next.delete(e.id) : next.add(e.id),
      );
      return next;
    });
  const toggleSort = (key: Column) => {
    setSort((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };
  const exportCsv = () => {
    const rows = selected.size
      ? employees.filter((e) => selected.has(e.id))
      : filtered;
    const csv =
      "\uFEFF" +
      [
        allColumns.map((k) => columnNames[k]),
        ...rows.map((e) => allColumns.map((k) => e[k])),
      ]
        .map((row) =>
          row.map((c) => '"' + c.replaceAll('"', '""') + '"').join(";"),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "Сотрудники.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast(`Экспортировано сотрудников: ${rows.length}`);
  };
  const count = (status: string) =>
    employees.filter((e) => e.status === status).length;
  const navigate = (name: string) => {
    setSection(name);
    setPopover(null);
  };
  const resetFilters = () => {
    setQuery("");
    setTab("Все сотрудники");
    setDepartment("Все отделы");
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Сотрудники");
          }}
        >
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          form<span className="brand-dot">.</span>
        </a>
        <button
          className="workspace-switch"
          onClick={() => setModal("settings")}
        >
          <span className="workspace-logo">f.</span>
          <span>
            <strong>Form Studio</strong>
            <small>Рабочее пространство</small>
          </span>
          <Icon name="chevron" size={15} />
        </button>
        <div className="nav-caption">ПРОСТРАНСТВО</div>
        <nav>
          {(
            [
              ["Обзор", "grid"],
              ["Сотрудники", "users"],
              ["Команды", "layers"],
              ["Отчёты", "chart"],
            ] as [string, IconName][]
          ).map(([name, icon]) => (
            <button
              key={name}
              className={`nav-item ${section === name ? "current" : ""}`}
              aria-label={name}
              aria-current={section === name ? "page" : undefined}
              onClick={() => navigate(name)}
            >
              <Icon name={icon} />
              <span>{name}</span>
              {name === "Сотрудники" && (
                <span className="nav-count">{employees.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="team-card">
            <div className="team-card-top">
              <span className="tiny-spark">✧</span>
              <span>Больше возможностей</span>
            </div>
            <p>
              Всё для слаженной работы
              <br />
              вашей команды.
            </p>
            <button onClick={() => setModal("help")}>
              Узнать подробнее <Icon name="external" size={14} />
            </button>
          </div>
          <button
            className="nav-item"
            aria-label="Настройки"
            onClick={() => setModal("settings")}
          >
            <Icon name="settings" />
            <span>Настройки</span>
          </button>
          <button
            className="nav-item"
            aria-label="Помощь и поддержка"
            onClick={() => setModal("help")}
          >
            <Icon name="help" />
            <span>Помощь и поддержка</span>
          </button>
          <button
            className="profile"
            aria-label="Профиль администратора"
            onClick={() => setModal("settings")}
          >
            <span className="profile-avatar">АК</span>
            <span>
              <strong>Алексей Кузнецов</strong>
              <small>Администратор</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{section}</strong>
          </div>
          <div className="topbar-right">
            <span className="workspace-status">
              <span />
              Все изменения сохранены
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              title="Помощь"
              onClick={() => setModal("help")}
            >
              <Icon name="help" size={19} />
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="title-line">
                <h1>{section}</h1>
                {section === "Сотрудники" && (
                  <span className="title-count">{employees.length}</span>
                )}
              </div>
              <p>
                {section === "Сотрудники"
                  ? "Ваша команда в одном месте. Управляйте сотрудниками и оставайтесь на связи."
                  : section === "Команды"
                    ? "Люди, которые создают результат. Найдите свою команду."
                    : section === "Отчёты"
                      ? "Актуальные данные о вашей команде, всегда под рукой."
                      : "Главное о вашей команде и рабочем пространстве."}
              </p>
            </div>
            <div className="heading-actions">
              <button className="button" onClick={exportCsv}>
                <Icon name="download" size={17} />
                Экспорт
              </button>
              <button
                className="button primary"
                onClick={() => setModal("add")}
              >
                <Icon name="plus" size={18} />
                Добавить сотрудника
              </button>
            </div>
          </div>
          <div className="stats-grid">
            {[
              {
                label: "Всего сотрудников",
                value: employees.length,
                icon: "users" as IconName,
                note: (
                  <>
                    <span className="stat-growth">↗ +12%</span>
                    <span>к прошлому месяцу</span>
                  </>
                ),
              },
              {
                label: "Активные",
                value: count("Активен"),
                icon: "check" as IconName,
                note: (
                  <>
                    <span className="stat-dot green" />
                    <span>Готовы к новым задачам</span>
                  </>
                ),
              },
              {
                label: "Отделы",
                value: new Set(employees.map((e) => e.department)).size,
                icon: "layers" as IconName,
                note: (
                  <>
                    <span>Вместе к общим целям</span>
                  </>
                ),
              },
              {
                label: "Приглашённые",
                value: count("Приглашён"),
                icon: "mail" as IconName,
                note: (
                  <>
                    <span className="stat-dot orange" />
                    <span>Ожидают присоединения</span>
                  </>
                ),
              },
            ].map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-top">
                  <span>{s.label}</span>
                  <Icon name={s.icon} size={18} />
                </div>
                <strong className="stat-value">{s.value}</strong>
                <div className="stat-note">{s.note}</div>
              </div>
            ))}
          </div>
          {section === "Команды" ? (
            <div className="department-grid">
              {departments.map((d) => (
                <button
                  className="department-card"
                  key={d}
                  onClick={() => {
                    setDepartment(d);
                    setSection("Сотрудники");
                  }}
                >
                  <span
                    className={`department department-${departments.indexOf(d)}`}
                  >
                    <Icon name="layers" size={20} />
                  </span>
                  <h2>{d}</h2>
                  <p>
                    {employees.filter((e) => e.department === d).length}{" "}
                    сотрудников
                  </p>
                  <span className="team-avatars">
                    {employees
                      .filter((e) => e.department === d)
                      .slice(0, 5)
                      .map((e) => (
                        <Avatar employee={e} key={e.id} small />
                      ))}
                  </span>
                  <span className="view-team">
                    Открыть команду <Icon name="chevron" size={15} />
                  </span>
                </button>
              ))}
            </div>
          ) : section === "Отчёты" ? (
            <section className="report-panel">
              <span className="report-icon">
                <Icon name="chart" size={32} />
              </span>
              <h2>Отчёт по сотрудникам</h2>
              <p>
                Имена, должности, отделы и статусы всех сотрудников вашего
                пространства.
              </p>
              <button className="button primary" onClick={exportCsv}>
                <Icon name="download" size={17} />
                Скачать CSV
              </button>
              <small>Совместим с Excel, Numbers и Google Таблицами</small>
            </section>
          ) : (
            <section className="table-card">
              <div className="table-top">
                <div>
                  <h2>
                    {section === "Обзор"
                      ? "Ваша команда"
                      : "Список сотрудников"}
                  </h2>
                  <span className="table-subtitle">
                    Люди, с которыми всё получается
                  </span>
                </div>
                <span className="table-total">
                  {employees.length} сотрудников
                </span>
              </div>
              <div
                className="tabs"
                role="tablist"
                aria-label="Статусы сотрудников"
              >
                {[
                  "Все сотрудники",
                  "Активные",
                  "В отпуске",
                  "Приглашённые",
                ].map((t, i) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    className={tab === t ? "selected-tab" : ""}
                    onClick={() => setTab(t)}
                  >
                    {t}
                    <span>
                      {i === 0
                        ? employees.length
                        : count(["", "Активен", "В отпуске", "Приглашён"][i])}
                    </span>
                  </button>
                ))}
              </div>
              <div className="table-toolbar" ref={toolbarRef}>
                <div className="search-field">
                  <Icon name="search" size={18} />
                  <input
                    placeholder="Поиск по имени, почте или должности..."
                    aria-label="Поиск сотрудников"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query ? (
                    <button
                      className="icon-button"
                      onClick={() => setQuery("")}
                      aria-label="Очистить поиск"
                    >
                      <Icon name="close" size={15} />
                    </button>
                  ) : (
                    <kbd>⌘ K</kbd>
                  )}
                </div>
                <div className="toolbar-actions">
                  <div className="popover-anchor">
                    <button
                      className={`button ${department !== "Все отделы" ? "filter-applied" : ""}`}
                      aria-expanded={popover === "filter"}
                      onClick={() =>
                        setPopover(popover === "filter" ? null : "filter")
                      }
                    >
                      <Icon name="filter" size={16} />
                      Фильтры
                      {department !== "Все отделы" && (
                        <span className="filter-count">1</span>
                      )}
                    </button>
                    {popover === "filter" && (
                      <div className="popover filter-popover">
                        <strong>Отдел</strong>
                        {["Все отделы", ...departments].map((d) => (
                          <button
                            key={d}
                            className="popover-option"
                            onClick={() => {
                              setDepartment(d);
                              setPopover(null);
                            }}
                          >
                            {d}
                            {d === department && (
                              <Icon name="check" size={16} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="popover-anchor">
                    <button
                      className="button"
                      aria-expanded={popover === "columns"}
                      onClick={() =>
                        setPopover(popover === "columns" ? null : "columns")
                      }
                    >
                      <Icon name="columns" size={16} />
                      Колонки
                    </button>
                    {popover === "columns" && (
                      <div className="popover columns-popover">
                        <strong>Показывать колонки</strong>
                        {allColumns.map((c) => (
                          <label key={c}>
                            <CheckBox
                              checked={columns.includes(c)}
                              onChange={() =>
                                setColumns((old) =>
                                  old.includes(c)
                                    ? old.length > 1
                                      ? old.filter((k) => k !== c)
                                      : old
                                    : allColumns.filter(
                                        (k) => old.includes(k) || k === c,
                                      ),
                                )
                              }
                              label={columnNames[c]}
                            />
                            {columnNames[c]}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {department !== "Все отделы" && (
                <div className="active-filters">
                  <span>
                    Отдел: {department}
                    <button
                      onClick={() => setDepartment("Все отделы")}
                      aria-label="Сбросить отдел"
                    >
                      <Icon name="close" size={13} />
                    </button>
                  </span>
                  <button onClick={resetFilters}>Сбросить фильтры</button>
                </div>
              )}
              {selected.size > 0 && (
                <div className="selection-bar">
                  <span>
                    <strong>Выбрано: {selected.size}</strong>
                    <button onClick={() => setSelected(new Set())}>
                      Снять выделение
                    </button>
                  </span>
                  <span>
                    <button onClick={exportCsv}>
                      <Icon name="download" size={15} />
                      Экспортировать
                    </button>
                    <button
                      className="delete-action"
                      onClick={() => setDeleteIds([...selected])}
                    >
                      Удалить
                    </button>
                  </span>
                </div>
              )}
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <CheckBox
                          checked={
                            visible.length > 0 &&
                            checkedOnPage === visible.length
                          }
                          mixed={
                            checkedOnPage > 0 && checkedOnPage < visible.length
                          }
                          onChange={toggleAll}
                          label="Выбрать все строки на странице"
                        />
                      </th>
                      {columns.map((c) => (
                        <th
                          key={c}
                          className={`column-${c}`}
                          aria-sort={
                            sort?.key === c
                              ? sort.direction === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button
                            className="sort-button"
                            onClick={() => toggleSort(c)}
                          >
                            {columnNames[c]}
                            <span
                              className={`sort-icon ${sort?.key === c ? "sorted" : ""} ${sort?.key === c && sort.direction === "asc" ? "ascending" : ""}`}
                            >
                              <Icon name="arrow" size={13} />
                            </span>
                          </button>
                        </th>
                      ))}
                      <th className="row-menu-cell">
                        <span className="sr-only">Действия</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((employee) => (
                      <tr
                        key={employee.id}
                        className={
                          selected.has(employee.id) ? "row-selected" : ""
                        }
                      >
                        <td className="checkbox-cell">
                          <CheckBox
                            checked={selected.has(employee.id)}
                            onChange={() => toggleSelect(employee.id)}
                            label={`Выбрать: ${employee.name}`}
                          />
                        </td>
                        {columns.map((c) => (
                          <td key={c} className={`column-${c}`}>
                            {c === "name" ? (
                              <div className="employee-cell">
                                <Avatar employee={employee} />
                                <div>
                                  <button
                                    className="employee-name"
                                    onClick={() => setEditEmployee(employee)}
                                  >
                                    {employee.name}
                                  </button>
                                  <span className="employee-email">
                                    {employee.email}
                                  </span>
                                </div>
                              </div>
                            ) : c === "department" ? (
                              <span
                                className={`department department-${departments.indexOf(employee.department)}`}
                              >
                                {employee.department}
                              </span>
                            ) : c === "status" ? (
                              <Status value={employee.status} />
                            ) : c === "date" ? (
                              <span className="date-cell">
                                {new Date(employee.date + "T12:00:00")
                                  .toLocaleDateString("ru-RU", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                  .replace(" г.", "")}
                              </span>
                            ) : (
                              employee[c]
                            )}
                          </td>
                        ))}
                        <td className="row-menu-cell">
                          <button
                            className="icon-button"
                            aria-label={`Редактировать: ${employee.name}`}
                            onClick={() => setEditEmployee(employee)}
                          >
                            <Icon name="more" size={19} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visible.length && (
                  <div className="empty-state">
                    <Icon name="search" size={30} />
                    <h3>Сотрудники не найдены</h3>
                    <p>Попробуйте изменить запрос или сбросить фильтры.</p>
                    <button className="button" onClick={resetFilters}>
                      Сбросить фильтры
                    </button>
                  </div>
                )}
              </div>
              <div className="pagination">
                <div className="pagination-description">
                  Показано{" "}
                  <strong>
                    {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                    {Math.min(currentPage * pageSize, filtered.length)}
                  </strong>{" "}
                  из <strong>{filtered.length}</strong>
                  <span className="page-size-divider" />
                  <label>
                    На странице{" "}
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option value="8">8</option>
                      <option value="16">16</option>
                      <option value="24">24</option>
                    </select>
                  </label>
                </div>
                <div className="page-buttons">
                  <button
                    className="page-arrow"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    aria-label="Предыдущая страница"
                  >
                    <Icon name="chevron" className="rotate" size={15} />
                    <span>Назад</span>
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      aria-label={`Страница ${p}`}
                      aria-current={currentPage === p ? "page" : undefined}
                      className={`page-number ${currentPage === p ? "current-page" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="page-arrow"
                    disabled={currentPage === pages}
                    onClick={() => setPage(currentPage + 1)}
                    aria-label="Следующая страница"
                  >
                    <span>Далее</span>
                    <Icon name="chevron" size={15} />
                  </button>
                </div>
              </div>
            </section>
          )}
          <footer className="page-footer">
            <span>Хорошая работа начинается с хорошей команды.</span>
            <span>
              <span className="footer-dot" />
              Ваши данные в безопасности
            </span>
          </footer>
        </main>
      </div>
      {(modal || editEmployee || deleteIds.length > 0) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setModal(null);
            setEditEmployee(null);
            setDeleteIds([]);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              aria-label="Закрыть"
              onClick={() => {
                setModal(null);
                setEditEmployee(null);
                setDeleteIds([]);
              }}
            >
              <Icon name="close" />
            </button>
            {modal === "add" || editEmployee ? (
              <EmployeeForm
                employee={editEmployee}
                onDelete={() => {
                  setDeleteIds([editEmployee!.id]);
                  setEditEmployee(null);
                }}
                onCancel={() => {
                  setModal(null);
                  setEditEmployee(null);
                }}
                onSave={(values) => {
                  if (editEmployee) {
                    setEmployees((old) =>
                      old.map((e) =>
                        e.id === editEmployee.id ? { ...e, ...values } : e,
                      ),
                    );
                    setToast("Данные сотрудника обновлены");
                  } else {
                    setEmployees((old) => [
                      ...old,
                      {
                        ...values,
                        id: Math.max(0, ...old.map((e) => e.id)) + 1,
                        date: new Date().toISOString().slice(0, 10),
                        color: old.length % 8,
                      },
                    ]);
                    setToast("Сотрудник добавлен");
                  }
                  setModal(null);
                  setEditEmployee(null);
                }}
              />
            ) : deleteIds.length > 0 ? (
              <>
                <span className="modal-eyebrow">УПРАВЛЕНИЕ КОМАНДОЙ</span>
                <h2 id="dialog-title">Удалить сотрудников?</h2>
                <p>
                  Выбранные записи ({deleteIds.length}) будут удалены из
                  рабочего пространства.
                </p>
                <div className="modal-actions">
                  <button className="button" onClick={() => setDeleteIds([])}>
                    Отмена
                  </button>
                  <button
                    className="button danger"
                    onClick={() => {
                      setEmployees((old) =>
                        old.filter((e) => !deleteIds.includes(e.id)),
                      );
                      setSelected(
                        (old) =>
                          new Set(
                            [...old].filter((id) => !deleteIds.includes(id)),
                          ),
                      );
                      setDeleteIds([]);
                      setToast("Выбранные сотрудники удалены");
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </>
            ) : modal === "settings" ? (
              <>
                <span className="modal-eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО</span>
                <h2 id="dialog-title">Настройки Form Studio</h2>
                <p>Профиль администратора и параметры отображения.</p>
                <div className="settings-profile">
                  <span className="profile-avatar">АК</span>
                  <div>
                    <strong>Алексей Кузнецов</strong>
                    <p>Администратор · alexey@form.team</p>
                  </div>
                </div>
                <label className="form-label">
                  Строк на странице
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                    <option value={24}>24</option>
                  </select>
                </label>
                <div className="modal-actions">
                  <button
                    className="button primary"
                    onClick={() => setModal(null)}
                  >
                    Готово
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="modal-eyebrow">FORM · ЦЕНТР ПОМОЩИ</span>
                <h2 id="dialog-title">Всё для вашей команды</h2>
                <p>Управляйте сотрудниками в одном рабочем пространстве.</p>
                <div className="help-item">
                  <Icon name="arrow" />
                  <div>
                    <strong>Сортировка и поиск</strong>
                    <p>
                      Нажмите на заголовок колонки, чтобы изменить порядок.
                      Поиск работает по имени, почте, должности и отделу.
                    </p>
                  </div>
                </div>
                <div className="help-item">
                  <Icon name="check" />
                  <div>
                    <strong>Выбор сотрудников</strong>
                    <p>
                      Чекбокс в заголовке выбирает текущую страницу. Выбор
                      сохраняется при переходе между страницами.
                    </p>
                  </div>
                </div>
                <div className="help-item">
                  <Icon name="download" />
                  <div>
                    <strong>Экспорт данных</strong>
                    <p>
                      Скачайте выбранных сотрудников или весь отфильтрованный
                      список в формате CSV.
                    </p>
                  </div>
                </div>
                <button
                  className="button primary help-close"
                  onClick={() => setModal(null)}
                >
                  Всё понятно
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={17} />
          </span>
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Закрыть уведомление"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function EmployeeForm({
  employee,
  onSave,
  onCancel,
  onDelete,
}: {
  employee: Employee | null;
  onSave: (
    values: Pick<Employee, "name" | "email" | "role" | "department" | "status">,
  ) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onSave({
          name: String(data.get("name")).trim(),
          email: String(data.get("email")).trim(),
          role: String(data.get("role")).trim(),
          department: String(data.get("department")),
          status: String(data.get("status")),
        });
      }}
    >
      <span className="modal-eyebrow">ВАША КОМАНДА</span>
      <h2 id="dialog-title">
        {employee ? "Профиль сотрудника" : "Новый сотрудник"}
      </h2>
      <p>
        {employee
          ? "Данные и статус в рабочем пространстве."
          : "Добавьте того, с кем будете создавать новое."}
      </p>
      <label className="form-label">
        Имя и фамилия
        <input
          name="name"
          required
          pattern=".*\S.*"
          defaultValue={employee?.name}
          placeholder="Например, Анна Смирнова"
          autoFocus
        />
      </label>
      <label className="form-label">
        Электронная почта
        <input
          name="email"
          type="email"
          required
          defaultValue={employee?.email}
          placeholder="name@form.team"
        />
      </label>
      <label className="form-label">
        Должность
        <input
          name="role"
          required
          pattern=".*\S.*"
          defaultValue={employee?.role}
          placeholder="Например, Product Designer"
        />
      </label>
      <div className="form-row">
        <label className="form-label">
          Отдел
          <select
            name="department"
            defaultValue={employee?.department ?? "Дизайн"}
          >
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Статус
          <select name="status" defaultValue={employee?.status ?? "Приглашён"}>
            {["Активен", "В отпуске", "Приглашён"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="modal-actions">
        {employee && (
          <button
            type="button"
            className="button text-danger"
            onClick={onDelete}
          >
            Удалить
          </button>
        )}
        <button type="button" className="button" onClick={onCancel}>
          Отмена
        </button>
        <button className="button primary" type="submit">
          {employee ? "Сохранить" : "Добавить сотрудника"}
        </button>
      </div>
    </form>
  );
}
