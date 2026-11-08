import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "chart"
  | "settings"
  | "help"
  | "search"
  | "plus"
  | "chevron"
  | "arrow"
  | "filter"
  | "columns"
  | "download"
  | "more"
  | "close"
  | "check"
  | "logout"
  | "building"
  | "sparkles"
  | "mail"
  | "trash";
const paths: Record<IconName, React.ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.7" />
      <rect x="14" y="3" width="7" height="7" rx="1.7" />
      <rect x="3" y="14" width="7" height="7" rx="1.7" />
      <rect x="14" y="14" width="7" height="7" rx="1.7" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M17 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87" />
      <circle cx="9" cy="7" r="4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 3v17h17M8 15v-4M13 15V7M18 15v-6" />
    </>
  ),
  settings: (
    <>
      <path d="m10 3-1 3-3 1-3 3 2 2-1 4 3 1 2 4h5l1-3 3-1 3-3-2-2 1-4-3-1-2-4z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-1.2.8-1.9 1.2-1.9 2.9M12 17h.01" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  arrow: <path d="M12 4v16m-5-5 5 5 5-5" />,
  filter: (
    <>
      <path d="M4 7h16M7 12h10M10 17h4" />
    </>
  ),
  columns: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9 4v16m6-16v16" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  logout: (
    <>
      <path d="M9 4H4v16h5M9 12h12m-5-5 5 5-5 5" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1m-4 6v-3h2v3" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
    </>
  ),
};
function Icon({
  name,
  size = 18,
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
type Status = "Активен" | "На паузе" | "Неактивен";
type Client = {
  id: number;
  name: string;
  email: string;
  company: string;
  domain: string;
  status: Status;
  plan: string;
  revenue: number;
  date: string;
  color: string;
};
const seeds: [
  string,
  string,
  string,
  string,
  Status,
  string,
  number,
  string,
  string,
][] = [
  [
    "Анна Смирнова",
    "anna.smirnova@gmail.com",
    "Яндекс",
    "yandex.ru",
    "Активен",
    "Бизнес",
    124500,
    "2024-06-12",
    "purple",
  ],
  [
    "Михаил Иванов",
    "m.ivanov@ozon.ru",
    "Ozon",
    "ozon.ru",
    "Активен",
    "Про",
    89000,
    "2024-06-11",
    "blue",
  ],
  [
    "Екатерина Козлова",
    "ekaterina.k@gmail.com",
    "Самокат",
    "samokat.ru",
    "На паузе",
    "Бизнес",
    156000,
    "2024-06-10",
    "pink",
  ],
  [
    "Дмитрий Петров",
    "d.petrov@avito.ru",
    "Авито",
    "avito.ru",
    "Активен",
    "Про",
    67500,
    "2024-06-09",
    "green",
  ],
  [
    "Ольга Соколова",
    "olga.sokolova@mail.ru",
    "Точка",
    "tochka.com",
    "Активен",
    "Старт",
    24000,
    "2024-06-08",
    "orange",
  ],
  [
    "Алексей Морозов",
    "a.morozov@vk.com",
    "VK",
    "vk.com",
    "Неактивен",
    "Старт",
    18000,
    "2024-06-07",
    "blue",
  ],
  [
    "Мария Волкова",
    "maria.volkova@gmail.com",
    "Сбер",
    "sber.ru",
    "Активен",
    "Бизнес",
    210000,
    "2024-06-06",
    "pink",
  ],
  [
    "Иван Новиков",
    "ivan.novikov@tbank.ru",
    "Т-Банк",
    "tbank.ru",
    "Активен",
    "Про",
    96000,
    "2024-06-05",
    "purple",
  ],
  [
    "Софья Лебедева",
    "sofia.lebedeva@mail.ru",
    "Lamoda",
    "lamoda.ru",
    "На паузе",
    "Про",
    54000,
    "2024-06-04",
    "orange",
  ],
  [
    "Андрей Васильев",
    "a.vasiliev@hh.ru",
    "HeadHunter",
    "hh.ru",
    "Активен",
    "Бизнес",
    142000,
    "2024-06-03",
    "green",
  ],
];
const moreNames = [
  "Полина Павлова",
  "Максим Фёдоров",
  "Анастасия Орлова",
  "Артём Михайлов",
  "Виктория Белова",
  "Никита Алексеев",
  "Дарья Семёнова",
  "Роман Егоров",
  "Алиса Макарова",
  "Павел Андреев",
];
const initialClients: Client[] = Array.from({ length: 48 }, (_, i) => {
  const s = seeds[i % 10];
  return {
    id: i + 1,
    name: i < 10 ? s[0] : moreNames[(i - 10) % 10],
    email: i < 10 ? s[1] : `client.${i + 1}@${s[3]}`,
    company: s[2],
    domain: s[3],
    status: s[4] as Status,
    plan: s[5],
    revenue: Number(s[6]) + (i < 10 ? 0 : i * 500),
    date:
      i < 10
        ? s[7]
        : `2024-05-${String(28 - Math.floor((i - 10) / 2)).padStart(2, "0")}`,
    color: s[8],
  };
});
const money = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₽";
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
const dateLabel = (date: string) =>
  new Date(date + "T12:00:00")
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(" г.", "");
const columnNames = {
  name: "Клиент",
  company: "Компания",
  status: "Статус",
  plan: "Тариф",
  revenue: "Выручка",
  date: "Дата добавления",
};
type Column = keyof typeof columnNames;
function Checkbox({
  checked,
  mixed,
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
    if (ref.current) ref.current.indeterminate = !!mixed;
  }, [mixed]);
  return (
    <input
      ref={ref}
      type="checkbox"
      className="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
    />
  );
}

export function App() {
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem("forma-clients");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (c) =>
              typeof c.id === "number" &&
              typeof c.name === "string" &&
              typeof c.email === "string" &&
              typeof c.revenue === "number" &&
              typeof c.date === "string",
          )
        )
          return parsed;
      }
    } catch {}
    return initialClients;
  });
  const [tab, setTab] = useState("Все клиенты");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<{ key: Column; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc",
  });
  const [popover, setPopover] = useState<string | null>(null);
  const [planFilter, setPlanFilter] = useState("Все тарифы");
  const [statusFilter, setStatusFilter] = useState("Все статусы");
  const [visible, setVisible] = useState<Column[]>(
    Object.keys(columnNames) as Column[],
  );
  const [modal, setModal] = useState<string | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [toast, setToast] = useState("");
  const [workspace, setWorkspace] = useState(() => {
    try {
      return localStorage.getItem("forma-workspace") || "Рабочее пространство";
    } catch {
      return "Рабочее пространство";
    }
  });
  const [workspaceDraft, setWorkspaceDraft] = useState(workspace);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    plan: "Старт",
    status: "Активен" as Status,
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement;
    const timer = setTimeout(() => {
      const element =
        modalRef.current?.querySelector<HTMLElement>(
          "input, textarea, select",
        ) || modalRef.current?.querySelector<HTMLElement>("button");
      element?.focus();
    }, 0);
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]',
        ) || [],
      );
      const first = items[0],
        last = items[items.length - 1];
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
      clearTimeout(timer);
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [modal]);
  useEffect(() => {
    try {
      localStorage.setItem("forma-clients", JSON.stringify(clients));
    } catch {
      setToast(
        "Браузер не разрешил сохранить данные. Изменения доступны до закрытия страницы.",
      );
    }
  }, [clients]);
  useEffect(() => {
    try {
      localStorage.setItem("forma-workspace", workspace);
    } catch {}
  }, [workspace]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node))
        setPopover(null);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setPopover(null);
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);
  const filtered = useMemo(
    () =>
      clients
        .filter((c) => {
          const expected =
            tab === "Активные"
              ? "Активен"
              : tab === "На паузе"
                ? "На паузе"
                : tab === "Неактивные"
                  ? "Неактивен"
                  : null;
          return (
            (!expected || c.status === expected) &&
            (planFilter === "Все тарифы" || c.plan === planFilter) &&
            (statusFilter === "Все статусы" || c.status === statusFilter) &&
            `${c.name} ${c.email} ${c.company}`
              .toLowerCase()
              .includes(query.toLowerCase())
          );
        })
        .sort((a, b) => {
          const x = a[sort.key],
            y = b[sort.key];
          return (
            (typeof x === "number" && typeof y === "number"
              ? x - y
              : String(x).localeCompare(String(y), "ru")) *
            (sort.direction === "asc" ? 1 : -1)
          );
        }),
    [clients, tab, query, sort, planFilter, statusFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const selectedOnPage = rows.filter((c) => selected.has(c.id)).length;
  const active = clients.filter((c) => c.status === "Активен").length;
  const resetPage = () => setPage(1);
  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((c) => {
        if (selectedOnPage === rows.length) next.delete(c.id);
        else next.add(c.id);
      });
      return next;
    });
  }
  function exportCsv() {
    const list = selected.size
      ? clients.filter((c) => selected.has(c.id))
      : filtered;
    const escape = (s: unknown) => `"${String(s).replaceAll('"', '""')}"`;
    const csv =
      "\uFEFF" +
      [
        visible.map((c) => columnNames[c]),
        ...list.map((c) => visible.map((k) => c[k])),
      ]
        .map((row) => row.map(escape).join(";"))
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast(`Экспортировано клиентов: ${list.length}`);
  }
  function openForm(client?: Client) {
    setEditing(client || null);
    setForm(
      client
        ? {
            name: client.name,
            email: client.email,
            company: client.company,
            plan: client.plan,
            status: client.status,
          }
        : {
            name: "",
            email: "",
            company: "",
            plan: "Старт",
            status: "Активен",
          },
    );
    setModal("client");
    setPopover(null);
  }
  function saveClient(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.company.trim()) return;
    if (editing)
      setClients((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? {
                ...c,
                ...form,
                name: form.name.trim(),
                company: form.company.trim(),
              }
            : c,
        ),
      );
    else {
      setClients((prev) => [
        {
          ...form,
          name: form.name.trim(),
          company: form.company.trim(),
          id: Math.max(...prev.map((c) => c.id), 0) + 1,
          domain: form.email.split("@")[1] || "",
          revenue: 0,
          date: new Date().toISOString().slice(0, 10),
          color: "purple",
        },
        ...prev,
      ]);
      setSort({ key: "date", direction: "desc" });
      setTab("Все клиенты");
      setQuery("");
      setPlanFilter("Все тарифы");
      setStatusFilter("Все статусы");
      resetPage();
    }
    setToast(editing ? "Изменения сохранены" : "Клиент добавлен");
    setModal(null);
  }
  const countForTab = (t: string) =>
    t === "Все клиенты"
      ? clients.length
      : clients.filter(
          (c) =>
            c.status ===
            (t === "Активные"
              ? "Активен"
              : t === "Неактивные"
                ? "Неактивен"
                : "На паузе"),
        ).length;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab("Все клиенты");
            setQuery("");
            resetPage();
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>{" "}
          forma<span className="brand-dot">.</span>
        </a>
        <button
          className="workspace"
          onClick={() => {
            setWorkspaceDraft(workspace);
            setModal("settings");
          }}
        >
          <span className="workspace-icon">F</span>
          <span>
            <strong>Команда Forma</strong>
            <small>Рабочее пространство</small>
          </span>
          <Icon name="chevron" size={14} />
        </button>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          <button onClick={() => setModal("overview")}>
            <Icon name="grid" />
            Обзор
          </button>
          <button
            className="nav-active"
            onClick={() => {
              setTab("Все клиенты");
              setQuery("");
              setPlanFilter("Все тарифы");
              setStatusFilter("Все статусы");
              resetPage();
            }}
          >
            <Icon name="users" />
            Клиенты<span className="nav-count">{clients.length}</span>
          </button>
          <button onClick={() => setModal("reports")}>
            <Icon name="chart" />
            Отчёты
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-icon">
              <Icon name="sparkles" size={17} />
            </span>
            <strong>Больше возможностей</strong>
            <p>
              Все инструменты для роста
              <br />
              вашего бизнеса.
            </p>
            <button onClick={() => setModal("plans")}>
              Узнать о Про <span>↗</span>
            </button>
          </div>
          <nav>
            <button
              onClick={() => {
                setWorkspaceDraft(workspace);
                setModal("settings");
              }}
            >
              <Icon name="settings" />
              Настройки
            </button>
            <button onClick={() => setModal("help")}>
              <Icon name="help" />
              Помощь и поддержка
              <Icon name="chevron" size={13} />
            </button>
          </nav>
          <button
            className="sidebar-profile"
            onClick={() => setModal("profile")}
          >
            <span className="avatar profile-avatar">АК</span>
            <span>
              <strong>Александр К.</strong>
              <small>Личный аккаунт</small>
            </span>
            <Icon name="more" />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <Icon name="building" size={16} />
            <span>{workspace}</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Клиенты</strong>
          </div>
          <div className="topbar-right">
            <span className="live-dot" />
            Все изменения сохранены
            <button
              className="avatar top-avatar"
              onClick={() => setModal("profile")}
              aria-label="Открыть профиль"
            >
              АК
            </button>
          </div>
        </header>
        <main>
          <section className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС В ЛИЦАХ</div>
              <h1>
                Клиенты<span className="heading-dot">.</span>
              </h1>
              <p>Управляйте клиентами и развивайте отношения с ними.</p>
            </div>
            <button className="button primary" onClick={() => openForm()}>
              <Icon name="plus" size={17} />
              Добавить клиента
            </button>
          </section>
          <section className="stats-grid" aria-label="Статистика клиентов">
            <div className="stat-card">
              <div className="stat-label">
                Всего клиентов
                <Icon name="users" size={17} />
              </div>
              <div className="stat-value">
                {clients.length}
                <span className="stat-change">↗ 12,8%</span>
              </div>
              <div className="stat-foot">по сравнению с прошлым месяцем</div>
              <div className="mini-bars">
                {[9, 14, 11, 20, 16, 24, 21, 31, 28, 38, 34, 43].map((h, i) => (
                  <i key={i} style={{ height: h }} />
                ))}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">
                Активные клиенты
                <span className="stat-icon green">
                  <Icon name="check" size={13} />
                </span>
              </div>
              <div className="stat-value">
                {active}
                <span className="stat-change">↗ 8,2%</span>
              </div>
              <div className="stat-foot">
                <span className="green-text">
                  {Math.round((active / Math.max(clients.length, 1)) * 100)}%
                </span>{" "}
                от общего числа клиентов
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">
                Общая выручка
                <Icon name="chart" size={17} />
              </div>
              <div className="stat-value revenue-value">
                {money(clients.reduce((sum, c) => sum + c.revenue, 0))}
              </div>
              <div className="stat-foot">
                <span className="green-text">↗ 16,4%</span>
                <span> к прошлому месяцу</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">
                Средний чек<span className="ruble-icon">₽</span>
              </div>
              <div className="stat-value">
                {money(
                  Math.round(
                    clients.reduce((sum, c) => sum + c.revenue, 0) /
                      Math.max(clients.length, 1),
                  ),
                )}
              </div>
              <div className="stat-foot">
                <span className="green-text">↗ 3,2%</span>
                <span> к прошлому месяцу</span>
              </div>
            </div>
          </section>
          <section className="table-card" ref={popoverRef}>
            <div className="tabs" role="tablist" aria-label="Статус клиентов">
              {["Все клиенты", "Активные", "На паузе", "Неактивные"].map(
                (t) => (
                  <button
                    role="tab"
                    aria-selected={tab === t}
                    key={t}
                    className={tab === t ? "tab active-tab" : "tab"}
                    onClick={() => {
                      setTab(t);
                      resetPage();
                    }}
                  >
                    {t}
                    <span>{countForTab(t)}</span>
                  </button>
                ),
              )}
              <span className="table-caption">
                <span className="tiny-dot" />
                База клиентов
              </span>
            </div>
            <div className="table-toolbar">
              <label className="search-box">
                <Icon name="search" size={17} />
                <input
                  placeholder="Поиск по имени, email или компании..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    resetPage();
                  }}
                />
                {query ? (
                  <button
                    onClick={() => {
                      setQuery("");
                      resetPage();
                    }}
                    aria-label="Очистить поиск"
                  >
                    <Icon name="close" size={14} />
                  </button>
                ) : (
                  <span className="search-hint">⌕</span>
                )}
              </label>
              <div className="toolbar-actions">
                <div className="popover-anchor">
                  <button
                    className={
                      "button " +
                      (planFilter !== "Все тарифы" ||
                      statusFilter !== "Все статусы"
                        ? "filter-active"
                        : "")
                    }
                    onClick={() =>
                      setPopover(popover === "filters" ? null : "filters")
                    }
                  >
                    <Icon name="filter" size={17} />
                    Фильтры
                    {(planFilter !== "Все тарифы" ||
                      statusFilter !== "Все статусы") && (
                      <span className="filter-dot" />
                    )}
                  </button>
                  {popover === "filters" && (
                    <div className="popover filters-popover">
                      <strong>Фильтры клиентов</strong>
                      <label>
                        Статус
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value);
                            resetPage();
                          }}
                        >
                          {[
                            "Все статусы",
                            "Активен",
                            "На паузе",
                            "Неактивен",
                          ].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Тариф
                        <select
                          value={planFilter}
                          onChange={(e) => {
                            setPlanFilter(e.target.value);
                            resetPage();
                          }}
                        >
                          {["Все тарифы", "Старт", "Про", "Бизнес"].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="text-button"
                        onClick={() => {
                          setPlanFilter("Все тарифы");
                          setStatusFilter("Все статусы");
                          resetPage();
                        }}
                      >
                        Сбросить фильтры
                      </button>
                    </div>
                  )}
                </div>
                <div className="popover-anchor">
                  <button
                    className="button"
                    onClick={() =>
                      setPopover(popover === "columns" ? null : "columns")
                    }
                  >
                    <Icon name="columns" size={16} />
                    Колонки
                  </button>
                  {popover === "columns" && (
                    <div className="popover columns-popover">
                      <strong>Видимые колонки</strong>
                      {(Object.keys(columnNames) as Column[]).map((k) => (
                        <label key={k}>
                          <input
                            className="checkbox"
                            type="checkbox"
                            checked={visible.includes(k)}
                            disabled={k === "name"}
                            onChange={() =>
                              setVisible((v) =>
                                v.includes(k)
                                  ? v.filter((x) => x !== k)
                                  : [...v, k],
                              )
                            }
                          />
                          {columnNames[k]}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <span className="toolbar-divider" />
                <button className="button export-button" onClick={exportCsv}>
                  <Icon name="download" size={16} />
                  Экспорт
                </button>
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
                <div>
                  <button onClick={exportCsv}>
                    <Icon name="download" size={15} />
                    Экспортировать
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => setModal("delete")}
                  >
                    <Icon name="trash" size={15} />
                    Удалить
                  </button>
                </div>
              </div>
            )}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <Checkbox
                        checked={
                          rows.length > 0 && selectedOnPage === rows.length
                        }
                        mixed={
                          selectedOnPage > 0 && selectedOnPage < rows.length
                        }
                        onChange={toggleAll}
                        label="Выбрать все строки на странице"
                      />
                    </th>
                    {(Object.keys(columnNames) as Column[])
                      .filter((k) => visible.includes(k))
                      .map((k) => (
                        <th
                          key={k}
                          className={k === "revenue" ? "number-cell" : ""}
                          aria-sort={
                            sort.key === k
                              ? sort.direction === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button
                            className={
                              "sort-button " + (sort.key === k ? "sorted" : "")
                            }
                            onClick={() => {
                              setSort({
                                key: k,
                                direction:
                                  sort.key === k && sort.direction === "asc"
                                    ? "desc"
                                    : "asc",
                              });
                              resetPage();
                            }}
                          >
                            {columnNames[k]}
                            <Icon
                              className={
                                sort.key === k && sort.direction === "asc"
                                  ? "arrow-up"
                                  : ""
                              }
                              name="arrow"
                              size={13}
                            />
                          </button>
                        </th>
                      ))}
                    <th className="row-action-cell" aria-label="Действия" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr
                      key={c.id}
                      className={selected.has(c.id) ? "selected-row" : ""}
                    >
                      <td className="checkbox-cell">
                        <Checkbox
                          checked={selected.has(c.id)}
                          onChange={() => toggleRow(c.id)}
                          label={`Выбрать ${c.name}`}
                        />
                      </td>
                      {visible.includes("name") && (
                        <td>
                          <button
                            className="client-cell"
                            onClick={() => openForm(c)}
                          >
                            <span className={`avatar ${c.color}`}>
                              {initials(c.name)}
                            </span>
                            <span>
                              <strong>{c.name}</strong>
                              <small>{c.email}</small>
                            </span>
                          </button>
                        </td>
                      )}
                      {visible.includes("company") && (
                        <td>
                          <div className="two-line">
                            <strong>{c.company}</strong>
                            <small>{c.domain}</small>
                          </div>
                        </td>
                      )}
                      {visible.includes("status") && (
                        <td>
                          <span
                            className={`status ${c.status === "Активен" ? "status-active" : c.status === "На паузе" ? "status-paused" : "status-inactive"}`}
                          >
                            <i />
                            {c.status}
                          </span>
                        </td>
                      )}
                      {visible.includes("plan") && (
                        <td>
                          <span
                            className={
                              "plan " +
                              (c.plan === "Бизнес"
                                ? "business"
                                : c.plan === "Про"
                                  ? "pro"
                                  : "")
                            }
                          >
                            <span>
                              {c.plan === "Бизнес"
                                ? "✧"
                                : c.plan === "Про"
                                  ? "ϟ"
                                  : "◈"}
                            </span>
                            {c.plan}
                          </span>
                        </td>
                      )}
                      {visible.includes("revenue") && (
                        <td className="number-cell amount">
                          {money(c.revenue)}
                        </td>
                      )}
                      {visible.includes("date") && (
                        <td className="date-cell">{dateLabel(c.date)}</td>
                      )}
                      <td className="row-action-cell">
                        <div className="popover-anchor">
                          <button
                            className="icon-button row-menu"
                            aria-label={`Действия: ${c.name}`}
                            onClick={() =>
                              setPopover(
                                popover === `row-${c.id}`
                                  ? null
                                  : `row-${c.id}`,
                              )
                            }
                          >
                            <Icon name="more" size={19} />
                          </button>
                          {popover === `row-${c.id}` && (
                            <div className="popover row-popover">
                              <button onClick={() => openForm(c)}>
                                Редактировать клиента
                              </button>
                              <button
                                onClick={() => {
                                  setClients((prev) =>
                                    prev.map((x) =>
                                      x.id === c.id
                                        ? {
                                            ...x,
                                            status:
                                              x.status === "Активен"
                                                ? "На паузе"
                                                : "Активен",
                                          }
                                        : x,
                                    ),
                                  );
                                  setPopover(null);
                                  setToast("Статус клиента обновлён");
                                }}
                              >
                                {c.status === "Активен"
                                  ? "Поставить на паузу"
                                  : "Активировать"}
                              </button>
                              <button
                                className="delete-button"
                                onClick={() => {
                                  setSelected(new Set([c.id]));
                                  setModal("delete");
                                  setPopover(null);
                                }}
                              >
                                Удалить клиента
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && (
                <div className="empty-state">
                  <Icon name="search" size={32} />
                  <h3>Клиенты не найдены</h3>
                  <p>Попробуйте изменить запрос или сбросить фильтры.</p>
                  <button
                    className="button"
                    onClick={() => {
                      setQuery("");
                      setTab("Все клиенты");
                      setPlanFilter("Все тарифы");
                      setStatusFilter("Все статусы");
                      resetPage();
                    }}
                  >
                    Сбросить поиск и фильтры
                  </button>
                </div>
              )}
            </div>
            <div className="pagination">
              <div className="pagination-info">
                Показано{" "}
                <strong>
                  {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                  {Math.min(currentPage * pageSize, filtered.length)}
                </strong>{" "}
                из <strong>{filtered.length}</strong> клиентов
              </div>
              <div className="pagination-right">
                <label>
                  Строк на странице
                  <select
                    aria-label="Строк на странице"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      resetPage();
                    }}
                  >
                    {[8, 16, 24, 48].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <div className="page-buttons">
                  <button
                    className="page-arrow prev"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    aria-label="Предыдущая страница"
                  >
                    <Icon name="chevron" size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        className={currentPage === n ? "current-page" : ""}
                        aria-current={currentPage === n ? "page" : undefined}
                        key={n}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    className="page-arrow"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    aria-label="Следующая страница"
                  >
                    <Icon name="chevron" size={15} />
                  </button>
                </div>
              </div>
            </div>
          </section>
          <footer className="page-footer">
            <span>
              <Icon name="check" size={13} />
              Всё под контролем. Все клиенты в одном месте.
            </span>
            <span>
              Есть идея?{" "}
              <button onClick={() => setModal("feedback")}>
                Поделитесь с нами <span>↗</span>
              </button>
            </span>
          </footer>
        </main>
      </div>
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
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {modal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            ref={modalRef}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="modal-close icon-button"
              aria-label="Закрыть"
              onClick={() => setModal(null)}
            >
              <Icon name="close" size={20} />
            </button>
            {modal === "client" ? (
              <>
                <span className="modal-symbol">
                  <Icon name="users" size={23} />
                </span>
                <h2 id="modal-title">
                  {editing ? "Редактировать клиента" : "Новый клиент"}
                </h2>
                <p>Контакты, с которых начинается сотрудничество.</p>
                <form onSubmit={saveClient}>
                  <label>
                    Имя и фамилия
                    <input
                      autoFocus
                      required
                      placeholder="Например, Анна Смирнова"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      required
                      placeholder="anna@company.ru"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Компания
                    <input
                      required
                      placeholder="Название компании"
                      value={form.company}
                      onChange={(e) =>
                        setForm({ ...form, company: e.target.value })
                      }
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Тариф
                      <select
                        value={form.plan}
                        onChange={(e) =>
                          setForm({ ...form, plan: e.target.value })
                        }
                      >
                        {["Старт", "Про", "Бизнес"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Статус
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value as Status })
                        }
                      >
                        {["Активен", "На паузе", "Неактивен"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="button"
                      onClick={() => setModal(null)}
                    >
                      Отмена
                    </button>
                    <button className="button primary" type="submit">
                      {editing ? "Сохранить изменения" : "Добавить клиента"}
                    </button>
                  </div>
                </form>
              </>
            ) : modal === "delete" ? (
              <>
                <h2 id="modal-title">Удалить клиентов?</h2>
                <p>
                  Будут удалены выбранные клиенты ({selected.size}). Это
                  действие нельзя отменить.
                </p>
                <div className="modal-actions">
                  <button className="button" onClick={() => setModal(null)}>
                    Отмена
                  </button>
                  <button
                    className="button primary"
                    onClick={() => {
                      setClients((c) => c.filter((x) => !selected.has(x.id)));
                      setSelected(new Set());
                      setModal(null);
                      setToast("Клиенты удалены");
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </>
            ) : modal === "settings" ? (
              <>
                <h2 id="modal-title">Настройки пространства</h2>
                <p>Настройте пространство под свою команду.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!workspaceDraft.trim()) return;
                    setWorkspace(workspaceDraft.trim());
                    setModal(null);
                    setToast("Настройки сохранены");
                  }}
                >
                  <label>
                    Название рабочего пространства
                    <input
                      required
                      value={workspaceDraft}
                      onChange={(e) => setWorkspaceDraft(e.target.value)}
                    />
                  </label>
                  <button className="button primary" type="submit">
                    Сохранить
                  </button>
                </form>
              </>
            ) : modal === "overview" || modal === "reports" ? (
              <>
                <span className="modal-symbol">
                  <Icon name="chart" size={24} />
                </span>
                <h2 id="modal-title">
                  {modal === "reports"
                    ? "Отчёт по клиентам"
                    : "Обзор пространства"}
                </h2>
                <p>Актуальные показатели вашей клиентской базы.</p>
                <div className="report-list">
                  <div>
                    <span>Всего клиентов</span>
                    <strong>{clients.length}</strong>
                  </div>
                  <div>
                    <span>Активные клиенты</span>
                    <strong>{active}</strong>
                  </div>
                  {["Старт", "Про", "Бизнес"].map((p) => (
                    <div key={p}>
                      <span>Выручка · {p}</span>
                      <strong>
                        {money(
                          clients
                            .filter((c) => c.plan === p)
                            .reduce((s, c) => s + c.revenue, 0),
                        )}
                      </strong>
                    </div>
                  ))}
                  <div>
                    <span>Общая выручка</span>
                    <strong>
                      {money(clients.reduce((s, c) => s + c.revenue, 0))}
                    </strong>
                  </div>
                </div>
                <button className="button primary" onClick={exportCsv}>
                  <Icon name="download" size={17} />
                  Скачать данные CSV
                </button>
              </>
            ) : modal === "help" ? (
              <>
                <h2 id="modal-title">Всё на своих местах</h2>
                <p>Короткий гид по работе с клиентами.</p>
                <div className="help-list">
                  <h4>Как отсортировать клиентов?</h4>
                  <p>
                    Нажмите на название колонки. Повторное нажатие меняет
                    направление сортировки.
                  </p>
                  <h4>Как выбрать несколько строк?</h4>
                  <p>
                    Используйте чекбоксы слева. Чекбокс в заголовке выбирает всю
                    текущую страницу. Выбор сохраняется между страницами.
                  </p>
                  <h4>Как скачать данные?</h4>
                  <p>
                    Нажмите «Экспорт»: скачаются выбранные клиенты или весь
                    отфильтрованный список в формате CSV.
                  </p>
                </div>
              </>
            ) : modal === "profile" ? (
              <>
                <span className="avatar profile-large">АК</span>
                <h2 id="modal-title">Александр К.</h2>
                <p>Администратор · Команда Forma</p>
                <div className="report-list">
                  <div>
                    <span>Email</span>
                    <strong>alexander@forma.team</strong>
                  </div>
                  <div>
                    <span>Рабочее пространство</span>
                    <strong>{workspace}</strong>
                  </div>
                  <div>
                    <span>Текущий тариф</span>
                    <strong>Старт</strong>
                  </div>
                </div>
              </>
            ) : modal === "plans" ? (
              <>
                <span className="modal-symbol">
                  <Icon name="sparkles" size={24} />
                </span>
                <h2 id="modal-title">Больше возможностей с Про</h2>
                <p>Для команд, которые готовы расти.</p>
                <div className="plan-price">
                  990 ₽ <span>/ месяц</span>
                </div>
                <div className="help-list">
                  <p>✓ Неограниченная база клиентов</p>
                  <p>✓ Расширенные отчёты и аналитика</p>
                  <p>✓ Совместная работа для 10 участников</p>
                  <p>✓ Приоритетная поддержка</p>
                </div>
                <button
                  className="button primary"
                  onClick={() => setModal("feedback")}
                >
                  Связаться с командой
                </button>
              </>
            ) : (
              <>
                <h2 id="modal-title">Ваши идеи делают Forma лучше</h2>
                <p>Расскажите, чего вам не хватает или что можно улучшить.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setModal(null);
                    setToast("Спасибо! Ваш отзыв сохранён в этом браузере.");
                    try {
                      localStorage.setItem(
                        "forma-feedback",
                        new FormData(e.currentTarget).get("feedback") as string,
                      );
                    } catch {}
                  }}
                >
                  <label>
                    Ваше сообщение
                    <textarea
                      name="feedback"
                      required
                      minLength={5}
                      rows={5}
                      placeholder="Было бы здорово, если…"
                      autoFocus
                    />
                  </label>
                  <button className="button primary" type="submit">
                    Сохранить отзыв
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
