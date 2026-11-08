import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button, Checkbox, Modal } from "@gravity-ui/uikit";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "chart"
  | "settings"
  | "help"
  | "chevron"
  | "search"
  | "plus"
  | "download"
  | "filter"
  | "columns"
  | "arrow"
  | "close"
  | "more"
  | "bell"
  | "logout"
  | "check"
  | "archive"
  | "external"
  | "mail"
  | "building";
function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M17 4a4 4 0 0 1 0 8M21 21v-2a4 4 0 0 0-3-3.87" />
        <circle cx="9.5" cy="7" r="4" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M9 15v-4M14 15V6M19 15V9" />
      </>
    ),
    settings: (
      <>
        <path d="m9.5 3-.7 2.1-2 .9-2.1-.5-2.5 4.3L3.8 12l-1.6 2.2 2.5 4.3 2.1-.5 2 .9.7 2.1h5l.7-2.1 2-.9 2.1.5 2.5-4.3-1.6-2.2 1.6-2.2-2.5-4.3-2.1.5-2-.9-.7-2.1z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 2-2.5 2-2.5 4M12 17h.01" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
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
        <path d="M4 7h16M7 12h10M10 17h4" />
      </>
    ),
    columns: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M9 4v16M15 4v16" />
      </>
    ),
    arrow: (
      <>
        <path d="M8 17V5m-3 3 3-3 3 3M16 7v12m-3-3 3 3 3-3" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5M10 12h11m-4-4 4 4-4 4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    archive: (
      <>
        <path d="M4 8h16v12H4zM3 3h18v5H3zM9 12h6" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    building: (
      <>
        <path d="M5 21V3h14v18M2 21h20M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3" />
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

type Status = "active" | "new" | "archived";
type Client = {
  id: number;
  name: string;
  email: string;
  company: string;
  status: Status;
  plan: string;
  revenue: number;
  date: string;
  color: number;
};
type SortKey = "name" | "company" | "status" | "plan" | "revenue" | "date";
const statuses: Record<Status, string> = {
  active: "Активен",
  new: "Новый",
  archived: "В архиве",
};
const seed: Omit<Client, "id" | "color">[] = [
  {
    name: "Александр Иванов",
    email: "alex.ivanov@gmail.com",
    company: "Яндекс",
    status: "active",
    plan: "Бизнес",
    revenue: 148500,
    date: "2026-10-24",
  },
  {
    name: "Мария Смирнова",
    email: "m.smirnova@mail.ru",
    company: "Точка",
    status: "active",
    plan: "Про",
    revenue: 92000,
    date: "2026-10-23",
  },
  {
    name: "Дмитрий Козлов",
    email: "d.kozlov@gmail.com",
    company: "Самокат",
    status: "new",
    plan: "Базовый",
    revenue: 24500,
    date: "2026-10-22",
  },
  {
    name: "Анна Петрова",
    email: "anna.petrova@yandex.ru",
    company: "Авито",
    status: "active",
    plan: "Бизнес",
    revenue: 215000,
    date: "2026-10-21",
  },
  {
    name: "Михаил Соколов",
    email: "m.sokolov@mail.ru",
    company: "Ozon",
    status: "active",
    plan: "Про",
    revenue: 78400,
    date: "2026-10-20",
  },
  {
    name: "Екатерина Волкова",
    email: "kate.volkova@gmail.com",
    company: "Сбер",
    status: "archived",
    plan: "Базовый",
    revenue: 35000,
    date: "2026-10-19",
  },
  {
    name: "Андрей Новиков",
    email: "a.novikov@yandex.ru",
    company: "Альфа-Банк",
    status: "active",
    plan: "Бизнес",
    revenue: 167800,
    date: "2026-10-18",
  },
  {
    name: "Ольга Морозова",
    email: "olga.morozova@mail.ru",
    company: "VK",
    status: "new",
    plan: "Про",
    revenue: 56000,
    date: "2026-10-17",
  },
];
const firstNames = [
  "Артём",
  "София",
  "Максим",
  "Елена",
  "Илья",
  "Полина",
  "Иван",
  "Дарья",
  "Никита",
  "Виктория",
  "Павел",
  "Алиса",
];
const lastNames = [
  "Васильев",
  "Кузнецова",
  "Попов",
  "Лебедева",
  "Орлов",
  "Михайлова",
  "Фёдоров",
  "Романова",
  "Егоров",
  "Захарова",
];
const initialClients: Client[] = Array.from({ length: 128 }, (_, i) => {
  if (i < seed.length) return { ...seed[i], id: i + 1, color: i % 7 };
  const status: Status = i < 99 ? "active" : i < 121 ? "new" : "archived";
  return {
    id: i + 1,
    name: `${firstNames[(i - 8) % 12]} ${lastNames[Math.floor((i - 8) / 12) % 10]}`,
    email: `client${i + 1}@company.ru`,
    company: [
      "Т-Банк",
      "Ламода",
      "Яндекс",
      "МТС",
      "Точка",
      "Ozon",
      "2ГИС",
      "Магнит",
    ][i % 8],
    status,
    plan: ["Базовый", "Про", "Бизнес"][i % 3],
    revenue: Math.round((18000 + ((i * 1793) % 183000)) / 100) * 100,
    date: new Date(Date.UTC(2026, 9, 16 - (i - 8))).toISOString().slice(0, 10),
    color: i % 7,
  };
});
const money = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₽";
const dateLabel = (value: string) =>
  new Date(value)
    .toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(" г.", "");
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
const columnLabels: Record<SortKey, string> = {
  name: "Клиент",
  company: "Компания",
  status: "Статус",
  plan: "Тариф",
  revenue: "Выручка",
  date: "Дата добавления",
};

function Sparkline({ variant = 0 }: { variant?: number }) {
  return (
    <svg
      className={`sparkline sparkline-${variant}`}
      viewBox="0 0 120 44"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#52866c" stopOpacity=".15" />
          <stop offset="1" stopColor="#52866c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={
          variant === 1
            ? "M2 35 15 30 25 33 37 23 48 27 58 19 70 23 82 12 93 16 105 8 118 7V44H2Z"
            : variant === 2
              ? "M2 35 14 35 26 29 38 31 49 21 60 23 72 15 83 18 95 8 106 12 118 3V44H2Z"
              : "M2 35 13 31 25 34 36 25 47 29 59 19 71 23 82 13 94 15 106 5 118 8V44H2Z"
        }
        fill={`url(#spark-${variant})`}
      />
      <path
        d={
          variant === 1
            ? "M2 35 15 30 25 33 37 23 48 27 58 19 70 23 82 12 93 16 105 8 118 7"
            : variant === 2
              ? "M2 35 14 35 26 29 38 31 49 21 60 23 72 15 83 18 95 8 106 12 118 3"
              : "M2 35 13 31 25 34 36 25 47 29 59 19 71 23 82 13 94 15 106 5 118 8"
        }
        stroke="#658d76"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function App() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | Status>("all");
  const [plan, setPlan] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>(
    { key: "date", direction: "desc" },
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [columns, setColumns] = useState<SortKey[]>([
    "name",
    "company",
    "status",
    "plan",
    "revenue",
    "date",
  ]);
  const [popover, setPopover] = useState<
    "filter" | "columns" | "notifications" | "workspace" | null
  >(null);
  const [modal, setModal] = useState<
    "add" | "help" | "overview" | "reports" | "settings" | "profile" | null
  >(null);
  const [detail, setDetail] = useState<Client | null>(null);
  const [toast, setToast] = useState("");
  const [compact, setCompact] = useState(false);
  const [workspace, setWorkspace] = useState("Основной проект");
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    company: "",
    plan: "Про",
  });
  const counts = useMemo(
    () => ({
      all: clients.length,
      active: clients.filter((c) => c.status === "active").length,
      new: clients.filter((c) => c.status === "new").length,
      archived: clients.filter((c) => c.status === "archived").length,
    }),
    [clients],
  );
  const totalRevenue = clients.reduce((total, c) => total + c.revenue, 0);
  const filtered = useMemo(
    () =>
      clients
        .filter(
          (c) =>
            (tab === "all" || c.status === tab) &&
            (plan === "all" || c.plan === plan) &&
            `${c.name} ${c.email} ${c.company}`
              .toLocaleLowerCase("ru")
              .includes(query.toLocaleLowerCase("ru").trim()),
        )
        .sort((a, b) => {
          const av = sort.key === "status" ? statuses[a.status] : a[sort.key];
          const bv = sort.key === "status" ? statuses[b.status] : b[sort.key];
          const result =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv), "ru");
          return result * (sort.direction === "asc" ? 1 : -1);
        }),
    [clients, tab, plan, query, sort],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const allChecked =
    visible.length > 0 && visible.every((c) => selected.has(c.id));
  const someChecked = visible.some((c) => selected.has(c.id));
  useEffect(() => setPage(1), [query, tab, plan, pageSize]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!popover) return;
    const close = () => setPopover(null);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", key);
    };
  }, [popover]);
  const togglePopover = (value: typeof popover) =>
    setPopover((v) => (v === value ? null : value));
  const toggleSelected = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((c) => (allChecked ? next.delete(c.id) : next.add(c.id)));
      return next;
    });
  const updateStatus = (ids: Set<number>, status: Status) => {
    setClients((prev) =>
      prev.map((c) => (ids.has(c.id) ? { ...c, status } : c)),
    );
    setSelected(new Set());
    setDetail(null);
    setToast(
      status === "archived"
        ? "Клиенты перемещены в архив"
        : "Статус клиента обновлён",
    );
  };
  const exportCsv = (rows?: Client[]) => {
    const data =
      rows ??
      (selected.size ? clients.filter((c) => selected.has(c.id)) : filtered);
    const escape = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    const csv =
      "\uFEFF" +
      [
        ["Имя", "Email", "Компания", "Статус", "Тариф", "Выручка", "Дата"],
        ...data.map((c) => [
          c.name,
          c.email,
          c.company,
          statuses[c.status],
          c.plan,
          c.revenue,
          c.date,
        ]),
      ]
        .map((row) => row.map(escape).join(";"))
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "folio-clients.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast(`Экспортировано клиентов: ${data.length}`);
  };
  const addClient = (e: FormEvent) => {
    e.preventDefault();
    const client: Client = {
      id: Math.max(0, ...clients.map((c) => c.id)) + 1,
      name: draft.name.trim(),
      email: draft.email.trim(),
      company: draft.company.trim(),
      plan: draft.plan,
      status: "new",
      revenue: 0,
      date: new Date().toISOString().slice(0, 10),
      color: clients.length % 7,
    };
    setClients((prev) => [client, ...prev]);
    setQuery("");
    setTab("all");
    setPlan("all");
    setSort({ key: "date", direction: "desc" });
    setPage(1);
    setModal(null);
    setDraft({ name: "", email: "", company: "", plan: "Про" });
    setToast("Новый клиент добавлен");
  };
  const pageNumbers: (number | string)[] =
    pageCount <= 7
      ? Array.from({ length: pageCount }, (_, i) => i + 1)
      : currentPage <= 4
        ? [1, 2, 3, 4, "…", pageCount]
        : currentPage >= pageCount - 3
          ? [1, "…", pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
          : [
              1,
              "…",
              currentPage - 1,
              currentPage,
              currentPage + 1,
              "…",
              pageCount,
            ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          aria-label="Folio — клиенты"
          onClick={(e) => {
            e.preventDefault();
            setQuery("");
            setTab("all");
            setPlan("all");
            setModal(null);
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          folio<span className="brand-dot">.</span>
        </a>
        <div className="workspace-wrap" onClick={(e) => e.stopPropagation()}>
          <button
            className="workspace"
            onClick={() => togglePopover("workspace")}
            aria-expanded={popover === "workspace"}
          >
            <span className="workspace-symbol">F</span>
            <span>
              <small>Рабочее пространство</small>
              <strong>{workspace}</strong>
            </span>
            <span className="double-chevron">
              ⌃<br />⌄
            </span>
          </button>
          {popover === "workspace" && (
            <div className="dropdown workspace-menu">
              {["Основной проект", "Личное пространство"].map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    setWorkspace(w);
                    setPopover(null);
                    setToast(`Выбрано пространство «${w}»`);
                  }}
                >
                  {w}
                  {workspace === w && <Icon name="check" size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="main-nav" aria-label="Основная навигация">
          <button onClick={() => setModal("overview")}>
            <Icon name="grid" />
            <span>Обзор</span>
          </button>
          <button
            className="active"
            onClick={() => {
              setModal(null);
              setTab("all");
            }}
            aria-current="page"
          >
            <Icon name="users" />
            <span>Клиенты</span>
            <span className="nav-count">{clients.length}</span>
          </button>
          <button onClick={() => setModal("reports")}>
            <Icon name="chart" />
            <span>Отчёты</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-card">
            <span className="plan-card-title">
              <span className="mini-star">✧</span> Больше возможностей
            </span>
            <p>
              Всё для роста вашего бизнеса
              <br />с тарифом Про.
            </p>
            <button onClick={() => setModal("settings")}>
              Посмотреть тарифы <Icon name="external" size={13} />
            </button>
          </div>
          <nav className="bottom-nav">
            <button onClick={() => setModal("settings")}>
              <Icon name="settings" />
              Настройки
            </button>
            <button onClick={() => setModal("help")}>
              <Icon name="help" />
              Помощь и поддержка
              <Icon name="external" size={13} />
            </button>
          </nav>
          <button
            className="sidebar-profile"
            onClick={() => setModal("profile")}
          >
            <span className="profile-avatar">АС</span>
            <span>
              <strong>Алексей Соколов</strong>
              <small>Личный аккаунт</small>
            </span>
            <Icon name="more" size={18} />
          </button>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>Клиенты</strong>
          </div>
          <div className="topbar-right">
            <span className="live-dot" />
            Все изменения сохранены
            <div className="topbar-divider" />
            <div
              className="notification-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="icon-button notification-button"
                aria-label="Уведомления"
                aria-expanded={popover === "notifications"}
                onClick={() => togglePopover("notifications")}
              >
                <Icon name="bell" size={19} />
                <i />
              </button>
              {popover === "notifications" && (
                <div className="dropdown notification-menu">
                  <h3>Уведомления</h3>
                  <div className="notification-item">
                    <span className="notification-icon">
                      <Icon name="check" />
                    </span>
                    <div>
                      <strong>Вы готовы к работе</strong>
                      <p>
                        Клиентская база загружена. Добавляйте клиентов и следите
                        за их активностью.
                      </p>
                      <small>Только что</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              className="small-avatar"
              onClick={() => setModal("profile")}
              aria-label="Открыть профиль"
            >
              АС
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС В ДЕТАЛЯХ</div>
              <h1>
                Клиенты <span>{clients.length}</span>
              </h1>
              <p>Управляйте клиентами и развивайте отношения с ними.</p>
            </div>
            <Button
              className="primary-button"
              size="l"
              onClick={() => setModal("add")}
            >
              <Icon name="plus" size={17} />
              Добавить клиента
            </Button>
          </div>
          <section className="metrics" aria-label="Статистика клиентов">
            <div className="metric-card">
              <div className="metric-top">
                <span>Всего клиентов</span>
                <Icon name="users" size={17} />
              </div>
              <div className="metric-number">
                {clients.length}
                <Sparkline />
              </div>
              <div className="metric-foot">
                <span className="growth">↗ 12,3%</span>
                <span>по сравнению с прошлым месяцем</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-top">
                <span>Активные клиенты</span>
                <span className="metric-status-dot" />
              </div>
              <div className="metric-number">
                {counts.active}
                <Sparkline variant={1} />
              </div>
              <div className="metric-foot">
                <span className="growth">↗ 8,6%</span>
                <span>по сравнению с прошлым месяцем</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-top">
                <span>Общая выручка</span>
                <span className="ruble-icon">₽</span>
              </div>
              <div className="metric-number">
                {(totalRevenue / 1000000).toLocaleString("ru-RU", {
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="metric-unit">млн ₽</span>
                <Sparkline variant={2} />
              </div>
              <div className="metric-foot">
                <span className="growth">↗ 16,2%</span>
                <span>по сравнению с прошлым месяцем</span>
              </div>
            </div>
          </section>

          <section className="data-card" aria-label="Клиентская база">
            <div className="table-top">
              <div>
                <h2>Клиентская база</h2>
                <p>Все ваши клиенты в одном месте.</p>
              </div>
              <Button
                view="outlined"
                size="l"
                className="export-button"
                onClick={() => exportCsv()}
              >
                <Icon name="download" size={16} />
                Экспорт
                <Icon name="chevron" size={12} className="down-chevron" />
              </Button>
            </div>
            <div className="tabs" role="tablist" aria-label="Статус клиентов">
              {(
                [
                  ["all", "Все клиенты"],
                  ["active", "Активные"],
                  ["new", "Новые"],
                  ["archived", "В архиве"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  className={tab === id ? "selected" : ""}
                  onClick={() => setTab(id)}
                >
                  {label}
                  <span>{counts[id]}</span>
                </button>
              ))}
            </div>
            <div className="table-toolbar">
              <div className="search-field">
                <Icon name="search" size={17} />
                <input
                  aria-label="Поиск клиентов"
                  placeholder="Поиск по имени, почте или компании..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query ? (
                  <button
                    className="icon-button clear-search"
                    aria-label="Очистить поиск"
                    onClick={() => setQuery("")}
                  >
                    <Icon name="close" size={14} />
                  </button>
                ) : (
                  <span className="search-hint">⌕</span>
                )}
              </div>
              <div
                className="toolbar-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="popover-anchor">
                  <button
                    className={`control-button ${plan !== "all" ? "is-filtered" : ""}`}
                    onClick={() => togglePopover("filter")}
                    aria-expanded={popover === "filter"}
                  >
                    <Icon name="filter" size={17} />
                    Фильтры
                    {plan !== "all" && <span className="filter-count">1</span>}
                  </button>
                  {popover === "filter" && (
                    <div className="dropdown filter-menu">
                      <h3>Фильтры</h3>
                      <label htmlFor="plan-filter">Тариф клиента</label>
                      <select
                        id="plan-filter"
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                      >
                        <option value="all">Все тарифы</option>
                        {["Базовый", "Про", "Бизнес"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                      <button
                        className="reset-filter"
                        onClick={() => {
                          setPlan("all");
                          setQuery("");
                          setTab("all");
                        }}
                      >
                        Сбросить фильтры
                      </button>
                    </div>
                  )}
                </div>
                <div className="popover-anchor">
                  <button
                    className="control-button"
                    onClick={() => togglePopover("columns")}
                    aria-expanded={popover === "columns"}
                  >
                    <Icon name="columns" size={16} />
                    <span>Столбцы</span>
                  </button>
                  {popover === "columns" && (
                    <div className="dropdown columns-menu">
                      <h3>Столбцы таблицы</h3>
                      {(Object.keys(columnLabels) as SortKey[]).map((key) => (
                        <Checkbox
                          key={key}
                          checked={columns.includes(key)}
                          disabled={key === "name"}
                          onUpdate={(checked) =>
                            setColumns((prev) =>
                              checked
                                ? [...prev, key]
                                : prev.filter((c) => c !== key),
                            )
                          }
                        >
                          {columnLabels[key]}
                        </Checkbox>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {selected.size > 0 && (
              <div className="selection-toolbar">
                <div>
                  <span className="selected-icon">
                    <Icon name="check" size={13} />
                  </span>
                  Выбрано: <strong>{selected.size}</strong>
                  <button onClick={() => setSelected(new Set())}>
                    Снять выделение
                  </button>
                </div>
                <button onClick={() => updateStatus(selected, "archived")}>
                  <Icon name="archive" size={15} />В архив
                </button>
              </div>
            )}
            <div className="table-scroll">
              <table className={compact ? "compact" : ""}>
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <Checkbox
                        checked={allChecked}
                        indeterminate={!allChecked && someChecked}
                        onUpdate={toggleAll}
                        controlProps={{
                          "aria-label": "Выбрать все строки на странице",
                        }}
                      />
                    </th>
                    {(Object.keys(columnLabels) as SortKey[])
                      .filter((key) => columns.includes(key))
                      .map((key) => (
                        <th
                          key={key}
                          className={`column-${key}`}
                          aria-sort={
                            sort.key === key
                              ? sort.direction === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button
                            onClick={() => {
                              setSort((prev) => ({
                                key,
                                direction:
                                  prev.key === key && prev.direction === "asc"
                                    ? "desc"
                                    : "asc",
                              }));
                              setPage(1);
                            }}
                          >
                            {columnLabels[key]}
                            {sort.key === key ? (
                              <span className="active-sort" aria-hidden="true">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            ) : (
                              <Icon name="arrow" size={13} />
                            )}
                          </button>
                        </th>
                      ))}
                    <th className="row-action">
                      <span className="sr-only">Действия</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((client) => (
                    <tr
                      key={client.id}
                      className={selected.has(client.id) ? "row-selected" : ""}
                    >
                      <td className="checkbox-cell">
                        <Checkbox
                          checked={selected.has(client.id)}
                          onUpdate={() => toggleSelected(client.id)}
                          controlProps={{
                            "aria-label": `Выбрать: ${client.name}`,
                          }}
                        />
                      </td>
                      {columns.includes("name") && (
                        <td className="name-cell">
                          <button
                            className="client-button"
                            onClick={() => setDetail(client)}
                          >
                            <span
                              className={`client-avatar avatar-${client.color}`}
                            >
                              {initials(client.name)}
                            </span>
                            <span>
                              <strong>{client.name}</strong>
                              <small>{client.email}</small>
                            </span>
                          </button>
                        </td>
                      )}
                      {columns.includes("company") && (
                        <td className="company-cell">{client.company}</td>
                      )}
                      {columns.includes("status") && (
                        <td>
                          <span
                            className={`status-badge status-${client.status}`}
                          >
                            <i />
                            {statuses[client.status]}
                          </span>
                        </td>
                      )}
                      {columns.includes("plan") && (
                        <td>
                          <span
                            className={`plan-badge plan-${client.plan === "Бизнес" ? "business" : client.plan === "Про" ? "pro" : "basic"}`}
                          >
                            {client.plan}
                          </span>
                        </td>
                      )}
                      {columns.includes("revenue") && (
                        <td className="revenue-cell">
                          {money(client.revenue)}
                        </td>
                      )}
                      {columns.includes("date") && (
                        <td className="date-cell">{dateLabel(client.date)}</td>
                      )}
                      <td className="row-action">
                        <button
                          className="icon-button row-menu"
                          aria-label={`Действия: ${client.name}`}
                          onClick={() => setDetail(client)}
                        >
                          <Icon name="more" size={19} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible.length === 0 && (
                <div className="empty-state">
                  <span>
                    <Icon name="search" size={27} />
                  </span>
                  <h3>Клиенты не найдены</h3>
                  <p>Попробуйте другой запрос или измените фильтры.</p>
                  <Button
                    view="outlined"
                    onClick={() => {
                      setQuery("");
                      setPlan("all");
                      setTab("all");
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </div>
            <div className="table-footer">
              <span className="result-count">
                Показано{" "}
                <strong>
                  {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                  {Math.min(currentPage * pageSize, filtered.length)}
                </strong>{" "}
                из <strong>{filtered.length}</strong> клиентов
              </span>
              <div className="pagination">
                <button
                  className="page-arrow"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Предыдущая страница"
                >
                  <Icon name="chevron" size={14} className="previous-chevron" />
                </button>
                {pageNumbers.map((n, i) =>
                  typeof n === "number" ? (
                    <button
                      key={i}
                      className={`page-button ${n === currentPage ? "current" : ""}`}
                      aria-label={`Страница ${n}`}
                      aria-current={n === currentPage ? "page" : undefined}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ) : (
                    <span key={i} className="page-ellipsis">
                      {n}
                    </span>
                  ),
                )}
                <button
                  className="page-arrow"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Следующая страница"
                >
                  <Icon name="chevron" size={14} />
                </button>
              </div>
              <label className="page-size">
                На странице
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  aria-label="Количество строк на странице"
                >
                  {[6, 12, 24].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
          <div className="page-bottom">
            <span>
              <span className="keyboard-key">↵</span> Нажмите на имя клиента,
              чтобы открыть его карточку
            </span>
            <span>
              Сделано для вашего роста <span className="footer-flower">✳</span>
            </span>
          </div>
        </main>
        <footer className="app-footer">
          <span>© 2026 Folio</span>
          <span>Порядок в данных. Фокус на главном.</span>
          <span className="system-status">
            <i />
            Все системы работают
          </span>
        </footer>
      </div>

      <Modal
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        contentClassName="app-modal"
        aria-label={
          modal === "add"
            ? "Добавить клиента"
            : modal === "help"
              ? "Помощь и поддержка"
              : "Информация"
        }
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">FOLIO WORKSPACE</span>
            <h2>
              {
                (
                  {
                    add: "Новый клиент",
                    help: "Помощь и поддержка",
                    overview: "Обзор пространства",
                    reports: "Отчёты",
                    settings: "Настройки пространства",
                    profile: "Ваш профиль",
                  } as Record<string, string>
                )[modal ?? "add"]
              }
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={() => setModal(null)}
            aria-label="Закрыть окно"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        {modal === "add" && (
          <form onSubmit={addClient} className="client-form">
            <p>Добавьте контакт — и начните новую историю сотрудничества.</p>
            <label>
              Имя и фамилия
              <input
                required
                autoFocus
                maxLength={80}
                placeholder="Например, Анна Иванова"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                pattern=".*\S.*"
              />
            </label>
            <label>
              Электронная почта
              <input
                type="email"
                required
                placeholder="name@company.ru"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
            <div className="form-row">
              <label>
                Компания
                <input
                  required
                  maxLength={80}
                  placeholder="Название компании"
                  value={draft.company}
                  onChange={(e) =>
                    setDraft({ ...draft, company: e.target.value })
                  }
                  pattern=".*\S.*"
                />
              </label>
              <label>
                Тариф
                <select
                  value={draft.plan}
                  onChange={(e) => setDraft({ ...draft, plan: e.target.value })}
                >
                  {["Базовый", "Про", "Бизнес"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="modal-footer">
              <Button size="l" view="outlined" onClick={() => setModal(null)}>
                Отмена
              </Button>
              <Button size="l" className="primary-button" type="submit">
                <Icon name="plus" size={16} />
                Добавить клиента
              </Button>
            </div>
          </form>
        )}
        {modal === "help" && (
          <div className="modal-body help-content">
            <p>Небольшой гид по вашей клиентской базе.</p>
            <h3>Сортировка и поиск</h3>
            <p>
              Нажмите на заголовок столбца, чтобы изменить порядок. Повторное
              нажатие меняет направление сортировки. Поиск работает по имени,
              почте и компании.
            </p>
            <h3>Работа с несколькими клиентами</h3>
            <p>
              Отмечайте клиентов чекбоксами. Чекбокс в шапке выбирает всю
              текущую страницу. Выбор сохраняется при переходе на другие
              страницы.
            </p>
            <h3>Экспорт данных</h3>
            <p>
              Кнопка «Экспорт» скачивает CSV с выбранными клиентами. Если никто
              не выбран, экспортируются все клиенты с учётом фильтров.
            </p>
          </div>
        )}
        {modal === "overview" && (
          <div className="modal-body">
            <p>Ваш бизнес в цифрах на сегодня.</p>
            <div className="overview-grid">
              <div>
                <small>Всего клиентов</small>
                <strong>{counts.all}</strong>
              </div>
              <div>
                <small>Активные</small>
                <strong>{counts.active}</strong>
              </div>
              <div>
                <small>Новые</small>
                <strong>{counts.new}</strong>
              </div>
              <div>
                <small>В архиве</small>
                <strong>{counts.archived}</strong>
              </div>
            </div>
            <div className="overview-revenue">
              Общая выручка <strong>{money(totalRevenue)}</strong>
            </div>
            <Button
              className="primary-button"
              size="l"
              width="max"
              onClick={() => setModal(null)}
            >
              Перейти к клиентам
            </Button>
          </div>
        )}
        {modal === "reports" && (
          <div className="modal-body">
            <p>Скачайте актуальные данные для анализа вашего бизнеса.</p>
            {["Базовый", "Про", "Бизнес"].map((p) => (
              <div className="report-row" key={p}>
                <span>
                  <strong>{p}</strong>
                  <small>
                    {clients.filter((c) => c.plan === p).length} клиентов
                  </small>
                </span>
                <strong>
                  {money(
                    clients
                      .filter((c) => c.plan === p)
                      .reduce((a, c) => a + c.revenue, 0),
                  )}
                </strong>
                <button
                  className="icon-button"
                  aria-label={`Экспорт клиентов тарифа ${p}`}
                  onClick={() => exportCsv(clients.filter((c) => c.plan === p))}
                >
                  <Icon name="download" />
                </button>
              </div>
            ))}
            <Button
              className="primary-button"
              width="max"
              size="l"
              onClick={() => exportCsv(clients)}
            >
              <Icon name="download" size={16} />
              Скачать полный отчёт
            </Button>
          </div>
        )}
        {modal === "settings" && (
          <div className="modal-body">
            <div className="setting-row">
              <div>
                <strong>Компактная таблица</strong>
                <p>Уменьшить высоту строк в клиентской базе</p>
              </div>
              <Checkbox
                checked={compact}
                onUpdate={setCompact}
                controlProps={{ "aria-label": "Компактная таблица" }}
              />
            </div>
            <h3>Ваш тариф</h3>
            <div className="current-plan">
              <span className="plan-badge plan-pro">Про</span>
              <strong>Всё для работы с клиентами</strong>
              <p>
                Неограниченная база клиентов, фильтры и экспорт данных включены
                в ваше пространство.
              </p>
            </div>
            <Button
              size="l"
              className="primary-button"
              onClick={() => setModal(null)}
              width="max"
            >
              Готово
            </Button>
          </div>
        )}
        {modal === "profile" && (
          <div className="modal-body">
            <div className="profile-detail">
              <span className="profile-avatar">АС</span>
              <h3>Алексей Соколов</h3>
              <p>alexey@folio.ru</p>
              <span className="plan-badge plan-pro">Администратор</span>
            </div>
            <div className="overview-revenue">
              Рабочее пространство<strong>{workspace}</strong>
            </div>
            <p className="profile-note">
              Вы управляете клиентами и настройками этого пространства.
            </p>
          </div>
        )}
      </Modal>
      <Modal
        open={detail !== null}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
        contentClassName="app-modal"
        aria-label="Карточка клиента"
      >
        {detail && (
          <>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">КАРТОЧКА КЛИЕНТА</span>
                <h2>{detail.name}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setDetail(null)}
                aria-label="Закрыть карточку"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="client-detail-top">
                <span className={`client-avatar avatar-${detail.color}`}>
                  {initials(detail.name)}
                </span>
                <span className={`status-badge status-${detail.status}`}>
                  <i />
                  {statuses[detail.status]}
                </span>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>Электронная почта</dt>
                  <dd>{detail.email}</dd>
                </div>
                <div>
                  <dt>Компания</dt>
                  <dd>{detail.company}</dd>
                </div>
                <div>
                  <dt>Тариф</dt>
                  <dd>{detail.plan}</dd>
                </div>
                <div>
                  <dt>Выручка</dt>
                  <dd>{money(detail.revenue)}</dd>
                </div>
                <div>
                  <dt>Дата добавления</dt>
                  <dd>{dateLabel(detail.date)}</dd>
                </div>
              </dl>
              <div className="detail-actions">
                <Button
                  size="l"
                  view="outlined"
                  onClick={() => exportCsv([detail])}
                >
                  <Icon name="download" size={16} />
                  Экспорт
                </Button>
                <Button
                  size="l"
                  className="primary-button"
                  onClick={() =>
                    updateStatus(
                      new Set([detail.id]),
                      detail.status === "archived" ? "active" : "archived",
                    )
                  }
                >
                  <Icon
                    name={detail.status === "archived" ? "check" : "archive"}
                    size={16}
                  />
                  {detail.status === "archived" ? "Восстановить" : "В архив"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
          <button onClick={() => setToast("")} aria-label="Скрыть уведомление">
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
