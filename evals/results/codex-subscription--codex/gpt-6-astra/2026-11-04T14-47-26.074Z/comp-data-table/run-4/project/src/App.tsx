import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "building"
  | "chevron"
  | "plus"
  | "search"
  | "filter"
  | "columns"
  | "download"
  | "arrow"
  | "more"
  | "close"
  | "check"
  | "help"
  | "settings"
  | "logout"
  | "mail"
  | "archive"
  | "spark"
  | "clock";
function Icon({
  name,
  size = 20,
  ...props
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
    building: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1m-4 6v-3h2v3" />
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
    filter: (
      <>
        <path d="M4 7h16M4 17h16" />
        <rect
          x="7"
          y="4"
          width="4"
          height="6"
          rx="1"
          fill="currentColor"
          stroke="none"
        />
        <rect
          x="14"
          y="14"
          width="4"
          height="6"
          rx="1"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),
    columns: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16m6-16v16" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" />
      </>
    ),
    arrow: (
      <>
        <path d="M8 19V5m-4 4 4-4 4 4m4-4v14m-4-4 4 4 4-4" />
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
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1.5-1.5 2.5M12 17h.01" />
      </>
    ),
    settings: (
      <>
        <path d="m10 3-1 3-3 1-3 3 2 2-1 4 4 1 2 4 3-2 4 1 1-4 3-2-2-3 1-4-4-1-2-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H4v16h6m5-12 4 4-4 4m-7-4h11" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    archive: (
      <>
        <rect x="3" y="3" width="18" height="5" rx="1" />
        <path d="M5 8v13h14V8m-10 4h6" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 2.8 6.2L21 12l-6.2 2.8L12 21l-2.8-6.2L3 12l6.2-2.8Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
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
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

type Status = "Активный" | "Новый" | "В архиве";
type Client = {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  status: Status;
  date: string;
  amount: number;
  color: number;
};
const seed = [
  [
    "Александр Петров",
    "alex.petrov@gmail.com",
    "Яндекс",
    "Продуктовый дизайнер",
    "Активный",
    "2026-10-24",
    128500,
  ],
  [
    "Мария Иванова",
    "m.ivanova@ozon.ru",
    "Ozon",
    "Маркетинг-директор",
    "Активный",
    "2026-10-23",
    94200,
  ],
  [
    "Дмитрий Смирнов",
    "d.smirnov@avito.ru",
    "Авито",
    "Руководитель проектов",
    "Новый",
    "2026-10-22",
    67500,
  ],
  [
    "Анна Козлова",
    "anna.kozlova@mail.ru",
    "Т-Банк",
    "Аналитик",
    "Активный",
    "2026-10-21",
    215000,
  ],
  [
    "Михаил Соколов",
    "m.sokolov@vk.com",
    "VK",
    "Разработчик",
    "Активный",
    "2026-10-20",
    48300,
  ],
  [
    "Екатерина Волкова",
    "kate.volkova@gmail.com",
    "Сбер",
    "HR-менеджер",
    "Новый",
    "2026-10-19",
    156800,
  ],
  [
    "Андрей Морозов",
    "a.morozov@tut.ru",
    "Самокат",
    "Операционный директор",
    "В архиве",
    "2026-10-18",
    82900,
  ],
  [
    "Ольга Новикова",
    "o.novikova@lamoda.ru",
    "Lamoda",
    "Бренд-менеджер",
    "Активный",
    "2026-10-17",
    112400,
  ],
  [
    "Никита Лебедев",
    "n.lebedev@yandex.ru",
    "Яндекс",
    "Разработчик",
    "Активный",
    "2026-10-16",
    73000,
  ],
  [
    "Елена Орлова",
    "e.orlova@ozon.ru",
    "Ozon",
    "Аналитик",
    "Новый",
    "2026-10-15",
    58600,
  ],
  [
    "Артём Павлов",
    "a.pavlov@vk.com",
    "VK",
    "Дизайнер",
    "Активный",
    "2026-10-14",
    127000,
  ],
  [
    "София Белова",
    "s.belova@sber.ru",
    "Сбер",
    "Руководитель проектов",
    "В архиве",
    "2026-10-13",
    91300,
  ],
  [
    "Иван Фёдоров",
    "i.fedorov@avito.ru",
    "Авито",
    "Маркетолог",
    "Активный",
    "2026-10-12",
    187000,
  ],
  [
    "Алиса Власова",
    "a.vlasova@tbank.ru",
    "Т-Банк",
    "Менеджер",
    "Новый",
    "2026-10-11",
    47000,
  ],
  [
    "Павел Макаров",
    "p.makarov@samokat.ru",
    "Самокат",
    "Аналитик",
    "Активный",
    "2026-10-10",
    96500,
  ],
  [
    "Виктория Захарова",
    "v.zakharova@lamoda.ru",
    "Lamoda",
    "Дизайнер",
    "Активный",
    "2026-10-09",
    134000,
  ],
  [
    "Роман Васильев",
    "r.vasilev@gmail.com",
    "Яндекс",
    "Менеджер",
    "В архиве",
    "2026-10-08",
    64000,
  ],
  [
    "Полина Алексеева",
    "p.alexeeva@ozon.ru",
    "Ozon",
    "Дизайнер",
    "Активный",
    "2026-10-07",
    112000,
  ],
  [
    "Максим Николаев",
    "m.nikolaev@vk.com",
    "VK",
    "Аналитик",
    "Новый",
    "2026-10-06",
    98000,
  ],
  [
    "Дарья Михайлова",
    "d.mikhailova@sber.ru",
    "Сбер",
    "Менеджер",
    "Активный",
    "2026-10-05",
    87000,
  ],
  [
    "Сергей Егоров",
    "s.egorov@avito.ru",
    "Авито",
    "Разработчик",
    "Активный",
    "2026-10-04",
    145000,
  ],
  [
    "Юлия Андреева",
    "j.andreeva@tbank.ru",
    "Т-Банк",
    "Маркетолог",
    "Новый",
    "2026-10-03",
    72000,
  ],
  [
    "Денис Степанов",
    "d.stepanov@gmail.com",
    "Самокат",
    "Менеджер",
    "В архиве",
    "2026-10-02",
    59000,
  ],
  [
    "Ксения Романова",
    "k.romanova@lamoda.ru",
    "Lamoda",
    "Дизайнер",
    "Активный",
    "2026-10-01",
    106000,
  ],
];
const initialClients: Client[] = seed.map((r, i) => ({
  id: i + 1,
  name: String(r[0]),
  email: String(r[1]),
  company: String(r[2]),
  role: String(r[3]),
  status: r[4] as Status,
  date: String(r[5]),
  amount: Number(r[6]),
  color: i % 8,
}));
const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const shortDate = (d: string) =>
  new Date(d + "T12:00:00")
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(" г.", "");
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0])
    .join("");
const columnDefs = [
  { key: "name", label: "Клиент" },
  { key: "company", label: "Компания" },
  { key: "status", label: "Статус" },
  { key: "date", label: "Дата добавления" },
  { key: "amount", label: "Сумма сделок" },
] as const;
type SortKey = (typeof columnDefs)[number]["key"];
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
      const saved = JSON.parse(
        localStorage.getItem("kontur-clients-v1") || "null",
      );
      if (
        Array.isArray(saved) &&
        saved.every(
          (c) =>
            typeof c.id === "number" &&
            typeof c.name === "string" &&
            typeof c.email === "string" &&
            typeof c.company === "string" &&
            typeof c.role === "string" &&
            typeof c.date === "string" &&
            Number.isFinite(c.amount) &&
            Number.isInteger(c.color) &&
            ["Активный", "Новый", "В архиве"].includes(c.status),
        )
      )
        return saved;
    } catch {
      /* Fall back to example data when storage is unavailable. */
    }
    return initialClients;
  });
  const [savedLocally, setSavedLocally] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem("kontur-clients-v1", JSON.stringify(clients));
      setSavedLocally(true);
    } catch {
      setSavedLocally(false);
    }
  }, [clients]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Все клиенты");
  const [filter, setFilter] = useState("Все статусы");
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({
    key: "date",
    asc: false,
  });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [popover, setPopover] = useState<string | null>(null);
  const [modal, setModal] = useState<"add" | "help" | "settings" | null>(null);
  const [detail, setDetail] = useState<Client | null>(null);
  const [toast, setToast] = useState("");
  const [section, setSection] = useState("Клиенты");
  const [workspaceName, setWorkspaceName] = useState("Моя команда");
  const [editing, setEditing] = useState<Client | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!modal && !detail) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>(".modal");
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input:not(:disabled), select, a[href]",
        ) ?? [],
      );
    if (!dialog?.contains(document.activeElement)) focusable()[0]?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trapFocus);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", trapFocus);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [modal, detail]);
  const counts = {
    active: clients.filter((c) => c.status === "Активный").length,
    new: clients.filter((c) => c.status === "Новый").length,
    archive: clients.filter((c) => c.status === "В архиве").length,
  };
  const filtered = useMemo(
    () =>
      clients
        .filter((c) => {
          const matchesTab =
            tab === "Все клиенты" ||
            (tab === "Активные" && c.status === "Активный") ||
            (tab === "Новые" && c.status === "Новый") ||
            (tab === "Архив" && c.status === "В архиве");
          return (
            matchesTab &&
            (filter === "Все статусы" || c.status === filter) &&
            `${c.name} ${c.email} ${c.company} ${c.role}`
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
              : String(x).localeCompare(String(y), "ru")) * (sort.asc ? 1 : -1)
          );
        }),
    [clients, query, filter, tab, sort],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const allChecked = rows.length > 0 && rows.every((c) => selected.has(c.id));
  const someChecked = rows.some((c) => selected.has(c.id));
  useEffect(() => {
    setPage(1);
  }, [query, filter, tab, pageSize]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setPopover(null);
        setModal(null);
        setDetail(null);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const toggleSelection = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((c) => (allChecked ? next.delete(c.id) : next.add(c.id)));
      return next;
    });
  const exportCsv = () => {
    const exportRows = selected.size
      ? clients.filter((c) => selected.has(c.id))
      : filtered;
    const csv =
      "\uFEFF" +
      [
        ["Имя", "Email", "Компания", "Должность", "Статус", "Дата", "Сумма"],
        ...exportRows.map((c) => [
          c.name,
          c.email,
          c.company,
          c.role,
          c.status,
          c.date,
          c.amount,
        ]),
      ]
        .map((row) =>
          row
            .map(
              (v) =>
                '"' +
                String(v)
                  .replace(/^[=+@-]/, "'$&")
                  .replaceAll('"', '""') +
                '"',
            )
            .join(";"),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast(`Экспортировано записей: ${exportRows.length}`);
  };
  const setStatus = (id: number, status: Status) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    setPopover(null);
    setDetail(null);
    setToast("Статус клиента обновлён");
  };
  const openAdd = () => {
    setEditing(null);
    setModal("add");
  };
  const switchSection = (name: string) => {
    setSection(name);
    setPopover(null);
    setQuery("");
    setFilter("Все статусы");
    setTab(name === "Архив" ? "Архив" : "Все клиенты");
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            switchSection("Клиенты");
          }}
        >
          <span className="brand-symbol">
            <span />
            <span />
            <span />
            <span />
          </span>
          контур<span className="brand-period">.</span>
        </a>
        <button className="workspace" onClick={() => setModal("settings")}>
          <span className="workspace-icon">М</span>
          <span>
            <strong>{workspaceName}</strong>
            <small>Рабочее пространство</small>
          </span>
          <Icon name="chevron" size={14} className="down" />
        </button>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          {(
            [
              { name: "Обзор", icon: "grid" },
              { name: "Клиенты", icon: "users" },
              { name: "Компании", icon: "building" },
              { name: "Архив", icon: "archive" },
            ] as { name: string; icon: IconName }[]
          ).map((item) => (
            <button
              key={item.name}
              className={`nav-item ${section === item.name ? "active" : ""}`}
              onClick={() => switchSection(item.name)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.name}</span>
              {item.name === "Клиенты" && (
                <span className="nav-count">{clients.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="team-card">
            <span className="team-spark">
              <Icon name="spark" size={18} />
            </span>
            <strong>Всё начинается с людей</strong>
            <p>
              Соберите клиентов и важные
              <br />
              контакты в одном месте.
            </p>
            <button onClick={openAdd}>
              Добавить клиента <Icon name="plus" size={15} />
            </button>
          </div>
          <button className="nav-item muted" onClick={() => setModal("help")}>
            <Icon name="help" size={19} />
            Помощь и поддержка
            <Icon name="chevron" size={14} />
          </button>
          <button
            className="nav-item muted"
            onClick={() => setModal("settings")}
          >
            <Icon name="settings" size={19} />
            Настройки
          </button>
          <div className="profile">
            <span className="profile-avatar">АС</span>
            <span>
              <strong>Алексей Соколов</strong>
              <small>Личный аккаунт</small>
            </span>
            <button
              aria-label="Настройки аккаунта"
              onClick={() => setModal("settings")}
            >
              <Icon name="chevron" size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <Icon name="grid" size={17} />
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{section}</strong>
          </div>
          <div className="header-right">
            <span className="live-dot" />
            {savedLocally
              ? "Изменения сохранены в браузере"
              : "Изменения сохранены на время сеанса"}
            <span className="top-divider" />
            <button
              className="icon-button"
              aria-label="Справка"
              onClick={() => setModal("help")}
            >
              <Icon name="help" size={19} />
            </button>
            <span className="mini-avatar">АС</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШИ КОНТАКТЫ. НОВЫЕ ВОЗМОЖНОСТИ.</div>
              <h1>{section}</h1>
              <p>
                {section === "Компании"
                  ? "Компании, с которыми вы строите долгосрочные отношения."
                  : section === "Обзор"
                    ? "Всё, что важно знать о вашей клиентской базе."
                    : section === "Архив"
                      ? "Архивные контакты — всегда под рукой."
                      : "Управляйте клиентами и развивайте отношения в одном месте."}
              </p>
            </div>
            <div className="heading-actions">
              <button className="button" onClick={exportCsv}>
                <Icon name="download" size={17} />
                Экспорт
              </button>
              <button className="button primary" onClick={openAdd}>
                <Icon name="plus" size={18} />
                Добавить клиента
              </button>
            </div>
          </div>
          <div className="stats-grid">
            {[
              {
                label: "Всего клиентов",
                value: clients.length,
                icon: "users",
                note: "В вашей клиентской базе",
                cls: "purple",
              },
              {
                label: "Активные клиенты",
                value: counts.active,
                icon: "check",
                note: `${Math.round((counts.active / (clients.length || 1)) * 100)}% от общего числа`,
                cls: "green",
              },
              {
                label: "Новые клиенты",
                value: counts.new,
                icon: "spark",
                note: "Готовы к знакомству",
                cls: "blue",
              },
              {
                label: "Сумма сделок",
                value: money(clients.reduce((sum, c) => sum + c.amount, 0)),
                icon: "building",
                note: "За всё время",
                cls: "orange",
              },
            ].map((stat, i) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-top">
                  <span>{stat.label}</span>
                  <span className={`stat-icon ${stat.cls}`}>
                    <Icon name={stat.icon as IconName} size={17} />
                  </span>
                </div>
                <div className={`stat-value ${i === 3 ? "money-stat" : ""}`}>
                  {stat.value}
                  <span className="stat-dash">
                    {i === 0 && (
                      <span className="stat-count">+{counts.new} новых</span>
                    )}
                  </span>
                </div>
                <div className="stat-note">{stat.note}</div>
              </div>
            ))}
          </div>
          {section === "Компании" ? (
            <section className="company-grid">
              {Array.from(new Set(clients.map((c) => c.company))).map(
                (company, i) => {
                  const members = clients.filter((c) => c.company === company);
                  return (
                    <button
                      className="company-card"
                      key={company}
                      onClick={() => {
                        switchSection("Клиенты");
                        setQuery(company);
                      }}
                    >
                      <span className={`avatar color-${i % 8}`}>
                        <Icon name="building" />
                      </span>
                      <h3>{company}</h3>
                      <p>Контактов: {members.length}</p>
                      <strong>
                        {money(members.reduce((sum, c) => sum + c.amount, 0))}
                      </strong>
                      <span className="company-link">
                        Посмотреть клиентов <Icon name="chevron" size={14} />
                      </span>
                    </button>
                  );
                },
              )}
            </section>
          ) : (
            <section className="table-card">
              <div
                className="tabs"
                role="tablist"
                aria-label="Категории клиентов"
              >
                {[
                  ["Все клиенты", clients.length],
                  ["Активные", counts.active],
                  ["Новые", counts.new],
                  ["Архив", counts.archive],
                ].map(([label, count]) => (
                  <button
                    role="tab"
                    aria-selected={tab === label}
                    key={label}
                    className={`tab ${tab === label ? "chosen" : ""}`}
                    onClick={() => setTab(String(label))}
                  >
                    {label}
                    <span>{count}</span>
                  </button>
                ))}
                <span className="table-records">Клиентская база</span>
              </div>
              <div className="table-toolbar">
                <div className="search-box">
                  <Icon name="search" size={18} />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск по имени, почте или компании"
                    aria-label="Поиск клиентов"
                  />
                  {query ? (
                    <button
                      onClick={() => setQuery("")}
                      aria-label="Очистить поиск"
                    >
                      <Icon name="close" size={15} />
                    </button>
                  ) : (
                    <kbd>⌘ K</kbd>
                  )}
                </div>
                <div className="toolbar-buttons">
                  <div className="popover-wrapper">
                    <button
                      className={`button ${filter !== "Все статусы" ? "filter-active" : ""}`}
                      onClick={() =>
                        setPopover(popover === "filter" ? null : "filter")
                      }
                    >
                      <Icon name="filter" size={17} />
                      Фильтры
                      {filter !== "Все статусы" && (
                        <span className="filter-dot" />
                      )}
                    </button>
                    {popover === "filter" && (
                      <div className="dropdown filter-dropdown">
                        <strong>Статус клиента</strong>
                        {["Все статусы", "Активный", "Новый", "В архиве"].map(
                          (s) => (
                            <button
                              key={s}
                              className={s === filter ? "selected-option" : ""}
                              onClick={() => {
                                setFilter(s);
                                setPopover(null);
                              }}
                            >
                              {s}
                              {s === filter && <Icon name="check" size={15} />}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                  <div className="popover-wrapper">
                    <button
                      className="button"
                      onClick={() =>
                        setPopover(popover === "columns" ? null : "columns")
                      }
                    >
                      <Icon name="columns" size={17} />
                      Столбцы
                    </button>
                    {popover === "columns" && (
                      <div className="dropdown columns-dropdown">
                        <strong>Отображаемые столбцы</strong>
                        {columnDefs.map((col) => (
                          <label key={col.key}>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={!hidden.has(col.key)}
                              disabled={col.key === "name"}
                              onChange={() =>
                                setHidden((prev) => {
                                  const next = new Set(prev);
                                  next.has(col.key)
                                    ? next.delete(col.key)
                                    : next.add(col.key);
                                  return next;
                                })
                              }
                            />
                            {col.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {(selected.size > 0 || filter !== "Все статусы") && (
                <div className="selection-toolbar">
                  {selected.size > 0 ? (
                    <>
                      <span>
                        <strong>Выбрано: {selected.size}</strong>
                      </span>
                      <button onClick={exportCsv}>
                        <Icon name="download" size={15} />
                        Экспортировать
                      </button>
                      <button
                        onClick={() => {
                          setClients((prev) =>
                            prev.map((c) =>
                              selected.has(c.id)
                                ? { ...c, status: "В архиве" }
                                : c,
                            ),
                          );
                          setSelected(new Set());
                          setToast("Выбранные клиенты перемещены в архив");
                        }}
                      >
                        <Icon name="archive" size={15} />В архив
                      </button>
                      <button
                        className="clear-selection"
                        onClick={() => setSelected(new Set())}
                      >
                        Снять выделение
                        <Icon name="close" size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span>Статус: {filter}</span>
                      <button onClick={() => setFilter("Все статусы")}>
                        Сбросить
                        <Icon name="close" size={14} />
                      </button>
                    </>
                  )}
                </div>
              )}
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <Checkbox
                          checked={allChecked}
                          mixed={!allChecked && someChecked}
                          onChange={togglePage}
                          label="Выбрать все строки на странице"
                        />
                      </th>
                      {columnDefs
                        .filter((c) => !hidden.has(c.key))
                        .map((col) => (
                          <th
                            key={col.key}
                            className={
                              col.key === "amount" ? "amount-column" : ""
                            }
                            aria-sort={
                              sort.key === col.key
                                ? sort.asc
                                  ? "ascending"
                                  : "descending"
                                : "none"
                            }
                          >
                            <button
                              className={`sort-button ${sort.key === col.key ? "sorted" : ""}`}
                              onClick={() =>
                                setSort({
                                  key: col.key,
                                  asc: sort.key === col.key ? !sort.asc : true,
                                })
                              }
                            >
                              {col.label}
                              {sort.key === col.key ? (
                                <span
                                  className="sort-direction"
                                  aria-hidden="true"
                                >
                                  {sort.asc ? "↑" : "↓"}
                                </span>
                              ) : (
                                <Icon name="arrow" size={12} />
                              )}
                            </button>
                          </th>
                        ))}
                      <th className="actions-cell">
                        <span className="sr-only">Действия</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((client) => (
                      <tr
                        key={client.id}
                        className={
                          selected.has(client.id) ? "selected-row" : ""
                        }
                      >
                        <td className="checkbox-cell">
                          <Checkbox
                            checked={selected.has(client.id)}
                            onChange={() => toggleSelection(client.id)}
                            label={`Выбрать: ${client.name}`}
                          />
                        </td>
                        <td>
                          <button
                            className="client-info"
                            onClick={() => setDetail(client)}
                          >
                            <span className={`avatar color-${client.color}`}>
                              {initials(client.name)}
                            </span>
                            <span>
                              <strong>{client.name}</strong>
                              <small>{client.email}</small>
                            </span>
                          </button>
                        </td>
                        {!hidden.has("company") && (
                          <td>
                            <div className="company-info">
                              <strong>{client.company}</strong>
                              <small>{client.role}</small>
                            </div>
                          </td>
                        )}
                        {!hidden.has("status") && (
                          <td>
                            <span
                              className={`status-badge ${client.status === "Активный" ? "status-active" : client.status === "Новый" ? "status-new" : "status-archived"}`}
                            >
                              <span />
                              {client.status}
                            </span>
                          </td>
                        )}
                        {!hidden.has("date") && (
                          <td className="date-cell">
                            {shortDate(client.date)}
                          </td>
                        )}
                        {!hidden.has("amount") && (
                          <td className="amount-cell">
                            {money(client.amount)}
                          </td>
                        )}
                        <td className="actions-cell">
                          <div className="popover-wrapper">
                            <button
                              className={`icon-button row-more ${popover === "row-" + client.id ? "pressed" : ""}`}
                              aria-label={`Действия: ${client.name}`}
                              onClick={() =>
                                setPopover(
                                  popover === "row-" + client.id
                                    ? null
                                    : "row-" + client.id,
                                )
                              }
                            >
                              <Icon name="more" size={19} />
                            </button>
                            {popover === "row-" + client.id && (
                              <div className="dropdown row-dropdown">
                                <button
                                  onClick={() => {
                                    setDetail(client);
                                    setPopover(null);
                                  }}
                                >
                                  Открыть карточку
                                </button>
                                <button
                                  onClick={() => {
                                    setEditing(client);
                                    setModal("add");
                                    setPopover(null);
                                  }}
                                >
                                  Редактировать
                                </button>
                                <button
                                  onClick={() =>
                                    setStatus(
                                      client.id,
                                      client.status === "В архиве"
                                        ? "Активный"
                                        : "В архиве",
                                    )
                                  }
                                >
                                  {client.status === "В архиве"
                                    ? "Восстановить"
                                    : "Переместить в архив"}
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
                        setFilter("Все статусы");
                        setTab("Все клиенты");
                      }}
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                )}
              </div>
              <div className="pagination">
                <span className="results-count">
                  Показано{" "}
                  <strong>
                    {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                    {Math.min(currentPage * pageSize, filtered.length)}
                  </strong>{" "}
                  из <strong>{filtered.length}</strong> клиентов
                </span>
                <div className="pagination-right">
                  <label className="page-size">
                    Строк на странице
                    <select
                      aria-label="Строк на странице"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option>8</option>
                      <option>16</option>
                      <option>24</option>
                    </select>
                  </label>
                  <div className="page-buttons">
                    <button
                      aria-label="Предыдущая страница"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      <Icon name="chevron" className="rotate" size={16} />
                    </button>
                    {Array.from({ length: pageCount }, (_, i) => (
                      <button
                        key={i}
                        aria-label={`Страница ${i + 1}`}
                        aria-current={
                          currentPage === i + 1 ? "page" : undefined
                        }
                        className={currentPage === i + 1 ? "current-page" : ""}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      aria-label="Следующая страница"
                      disabled={currentPage === pageCount}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      <Icon name="chevron" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
          <div className="page-footer">
            <span>
              <Icon name="help" size={14} />
              Нажмите на заголовок столбца, чтобы изменить сортировку
            </span>
            <span>Порядок в контактах. Простор для роста.</span>
          </div>
        </main>
      </div>
      {popover && (
        <div className="popover-backdrop" onClick={() => setPopover(null)} />
      )}
      {(modal || detail) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setModal(null);
            setDetail(null);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              detail
                ? "Карточка клиента"
                : modal === "add"
                  ? "Данные клиента"
                  : modal === "help"
                    ? "Помощь"
                    : "Настройки"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Закрыть"
              onClick={() => {
                setModal(null);
                setDetail(null);
              }}
            >
              <Icon name="close" />
            </button>
            {modal === "add" ? (
              <>
                <span className="modal-icon">
                  <Icon name="users" size={24} />
                </span>
                <h2>{editing ? "Редактировать клиента" : "Новый клиент"}</h2>
                <p>Каждое знакомство — начало новых возможностей.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const entry: Client = {
                      id: editing?.id ?? Date.now(),
                      name: String(f.get("name")).trim(),
                      email: String(f.get("email")).trim(),
                      company: String(f.get("company")).trim(),
                      role: String(f.get("role")).trim(),
                      status: f.get("status") as Status,
                      date:
                        editing?.date ?? new Date().toISOString().slice(0, 10),
                      amount: Number(f.get("amount")),
                      color: editing?.color ?? clients.length % 8,
                    };
                    if (!entry.name || !entry.company) return;
                    setClients((prev) =>
                      editing
                        ? prev.map((c) => (c.id === editing.id ? entry : c))
                        : [entry, ...prev],
                    );
                    setModal(null);
                    setToast(
                      editing ? "Данные клиента сохранены" : "Клиент добавлен",
                    );
                    if (!editing) {
                      switchSection("Клиенты");
                      setSort({ key: "date", asc: false });
                      setPage(1);
                    }
                  }}
                >
                  <label>
                    Имя и фамилия
                    <input
                      name="name"
                      autoFocus
                      required
                      maxLength={80}
                      defaultValue={editing?.name}
                      placeholder="Например, Иван Петров"
                    />
                  </label>
                  <label>
                    Электронная почта
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue={editing?.email}
                      placeholder="ivan@company.ru"
                    />
                  </label>
                  <div className="form-columns">
                    <label>
                      Компания
                      <input
                        name="company"
                        required
                        maxLength={80}
                        defaultValue={editing?.company}
                        placeholder="Название компании"
                      />
                    </label>
                    <label>
                      Должность
                      <input
                        name="role"
                        maxLength={80}
                        defaultValue={editing?.role}
                        placeholder="Менеджер"
                      />
                    </label>
                  </div>
                  <div className="form-columns">
                    <label>
                      Статус
                      <select
                        name="status"
                        defaultValue={editing?.status ?? "Новый"}
                      >
                        <option>Новый</option>
                        <option>Активный</option>
                        <option>В архиве</option>
                      </select>
                    </label>
                    <label>
                      Сумма сделок, ₽
                      <input
                        name="amount"
                        type="number"
                        min="0"
                        max="999999999999"
                        step="0.01"
                        defaultValue={editing?.amount ?? 0}
                        required
                      />
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
                    <button type="submit" className="button primary">
                      {editing ? "Сохранить изменения" : "Добавить клиента"}
                    </button>
                  </div>
                </form>
              </>
            ) : modal === "help" ? (
              <>
                <span className="modal-icon">
                  <Icon name="help" size={24} />
                </span>
                <h2>Всё под рукой</h2>
                <p>Небольшая памятка по работе с клиентами.</p>
                <div className="help-list">
                  <div>
                    <Icon name="arrow" />
                    <span>
                      <strong>Сортируйте по любому столбцу</strong>
                      <p>Повторное нажатие меняет порядок сортировки.</p>
                    </span>
                  </div>
                  <div>
                    <Icon name="check" />
                    <span>
                      <strong>Выбирайте и действуйте</strong>
                      <p>
                        Чекбокс в заголовке выбирает текущую страницу. Выбор
                        сохраняется при переходе между страницами.
                      </p>
                    </span>
                  </div>
                  <div>
                    <Icon name="search" />
                    <span>
                      <strong>Находите нужные контакты</strong>
                      <p>
                        Ищите по имени, почте или компании. Используйте ⌘ K или
                        Ctrl K для быстрого поиска.
                      </p>
                    </span>
                  </div>
                  <div>
                    <Icon name="download" />
                    <span>
                      <strong>Скачивайте данные</strong>
                      <p>
                        Экспорт сохраняет выбранные строки или все
                        отфильтрованные записи в CSV.
                      </p>
                    </span>
                  </div>
                </div>
              </>
            ) : modal === "settings" ? (
              <>
                <span className="modal-icon">
                  <Icon name="settings" size={24} />
                </span>
                <h2>Рабочее пространство</h2>
                <p>Настройте пространство для вашей команды.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    setWorkspaceName(
                      String(f.get("workspace")).trim() || "Моя команда",
                    );
                    setModal(null);
                    setToast("Настройки сохранены");
                  }}
                >
                  <label>
                    Название команды
                    <input
                      autoFocus
                      name="workspace"
                      required
                      maxLength={28}
                      defaultValue={workspaceName}
                    />
                  </label>
                  <label>
                    Строк на странице по умолчанию
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option>8</option>
                      <option>16</option>
                      <option>24</option>
                    </select>
                  </label>
                  <div className="modal-actions">
                    <button type="submit" className="button primary">
                      Сохранить
                    </button>
                  </div>
                </form>
              </>
            ) : (
              detail && (
                <>
                  <span
                    className={`avatar detail-avatar color-${detail.color}`}
                  >
                    {initials(detail.name)}
                  </span>
                  <h2>{detail.name}</h2>
                  <p>
                    {detail.role} · {detail.company}
                  </p>
                  <dl className="detail-list">
                    <div>
                      <dt>Электронная почта</dt>
                      <dd>
                        <a href={`mailto:${detail.email}`}>{detail.email}</a>
                      </dd>
                    </div>
                    <div>
                      <dt>Статус</dt>
                      <dd>{detail.status}</dd>
                    </div>
                    <div>
                      <dt>Дата добавления</dt>
                      <dd>{shortDate(detail.date)}</dd>
                    </div>
                    <div>
                      <dt>Сумма сделок</dt>
                      <dd>{money(detail.amount)}</dd>
                    </div>
                  </dl>
                  <div className="modal-actions">
                    <button
                      className="button"
                      onClick={() =>
                        setStatus(
                          detail.id,
                          detail.status === "В архиве"
                            ? "Активный"
                            : "В архиве",
                        )
                      }
                    >
                      {detail.status === "В архиве"
                        ? "Восстановить"
                        : "В архив"}
                    </button>
                    <button
                      className="button primary"
                      onClick={() => {
                        setEditing(detail);
                        setDetail(null);
                        setModal("add");
                      }}
                    >
                      Редактировать
                    </button>
                  </div>
                </>
              )
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
          <button aria-label="Закрыть уведомление" onClick={() => setToast("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
