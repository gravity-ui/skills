import { useState, useMemo, useEffect, useRef } from "react";
import type { CSSProperties, FormEvent } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "bag"
  | "settings"
  | "chevron"
  | "search"
  | "bell"
  | "plus"
  | "download"
  | "arrow"
  | "filter"
  | "calendar"
  | "group"
  | "columns"
  | "more"
  | "close"
  | "check"
  | "clock"
  | "truck"
  | "box"
  | "help"
  | "logout"
  | "collapse"
  | "grip"
  | "external"
  | "mail"
  | "sun"
  | "sort";
function Icon({
  name,
  size = 20,
  ...props
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
    bag: (
      <>
        <rect x="4" y="6" width="16" height="15" rx="3" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2m-7 5 2 2 4-4" />
      </>
    ),
    settings: (
      <>
        <path d="m9.5 3-.7 2.2-2 .9-2.1-.5-2.2 3.8L4 11v2l-1.5 1.6 2.2 3.8 2.1-.5 2 .9.7 2.2h5l.7-2.2 2-.9 2.1.5 2.2-3.8L20 13v-2l1.5-1.6-2.2-3.8-2.1.5-2-.9-.7-2.2z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    arrow: <path d="m5 16 14-9M9 7h10v10" />,
    filter: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="17" r="2" fill="currentColor" stroke="none" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 0h2" />
      </>
    ),
    group: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <path d="M14 5h7m-7 4h5M5 14h7m-7 4h7" />
        <rect x="16" y="14" width="5" height="7" rx="1" />
      </>
    ),
    columns: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16m6-16v16" />
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
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    truck: (
      <>
        <path d="M14 17H9m-5 0H2V5h12v12m0-10h4l4 5v5h-3m-5-5h8" />
        <circle cx="6.5" cy="17.5" r="2.5" />
        <circle cx="16.5" cy="17.5" r="2.5" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5m-9 5v9M7 5.8l9 5" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3h.01" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H4V3h5m5 5 4 4-4 4m-7-4h14" />
      </>
    ),
    collapse: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16m7-11-3 3 3 3" />
      </>
    ),
    grip: (
      <>
        <path
          d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"
          strokeWidth="3"
        />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14m-1-9H3v16h16v-6" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    sort: <path d="m8 9 4-4 4 4m-8 6 4 4 4-4" />,
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
type Status = "new" | "processing" | "shipping" | "done";
type Order = {
  id: number;
  name: string;
  email: string;
  initials: string;
  color: string;
  product: string;
  extra: string;
  date: string;
  amount: number;
  status: Status;
};
const statuses: {
  key: Status;
  label: string;
  icon: IconName;
  color: string;
}[] = [
  { key: "new", label: "Новые", icon: "box", color: "blue" },
  { key: "processing", label: "В обработке", icon: "clock", color: "orange" },
  { key: "shipping", label: "В доставке", icon: "truck", color: "purple" },
  { key: "done", label: "Завершены", icon: "check", color: "green" },
];
const initialOrders: Order[] = [
  {
    id: 1048,
    name: "Анна Смирнова",
    email: "anna.smirnova@mail.ru",
    initials: "АС",
    color: "lavender",
    product: "Кресло Lounge",
    extra: "Бежевый · 1 шт.",
    date: "2024-06-24",
    amount: 24900,
    status: "new",
  },
  {
    id: 1047,
    name: "Михаил Петров",
    email: "m.petrov@gmail.com",
    initials: "МП",
    color: "blue",
    product: "Настольная лампа Arc",
    extra: "Чёрный · 2 шт.",
    date: "2024-06-24",
    amount: 12800,
    status: "new",
  },
  {
    id: 1046,
    name: "Екатерина Иванова",
    email: "kate.ivanova@mail.ru",
    initials: "ЕИ",
    color: "pink",
    product: "Стол Oak",
    extra: "Натуральный дуб · 1 шт.",
    date: "2024-06-24",
    amount: 38500,
    status: "new",
  },
  {
    id: 1045,
    name: "Александр Соколов",
    email: "a.sokolov@yandex.ru",
    initials: "АС",
    color: "mint",
    product: "Диван Cloud",
    extra: "Светло-серый · 1 шт.",
    date: "2024-06-23",
    amount: 89900,
    status: "processing",
  },
  {
    id: 1044,
    name: "Мария Козлова",
    email: "maria.k@gmail.com",
    initials: "МК",
    color: "peach",
    product: "Стул Form",
    extra: "Терракотовый · 4 шт.",
    date: "2024-06-23",
    amount: 27600,
    status: "processing",
  },
  {
    id: 1043,
    name: "Дмитрий Волков",
    email: "d.volkov@mail.ru",
    initials: "ДВ",
    color: "lavender",
    product: "Торшер Line",
    extra: "Латунь · 1 шт.",
    date: "2024-06-23",
    amount: 15900,
    status: "processing",
  },
  {
    id: 1042,
    name: "Ольга Морозова",
    email: "olga.m@yandex.ru",
    initials: "ОМ",
    color: "pink",
    product: "Комод Frame",
    extra: "Молочный · 1 шт.",
    date: "2024-06-22",
    amount: 32900,
    status: "shipping",
  },
  {
    id: 1041,
    name: "Сергей Новиков",
    email: "sergey.n@gmail.com",
    initials: "СН",
    color: "blue",
    product: "Журнальный столик Pebble",
    extra: "Песочный · 1 шт.",
    date: "2024-06-22",
    amount: 18400,
    status: "shipping",
  },
  {
    id: 1040,
    name: "Полина Лебедева",
    email: "polina.l@mail.ru",
    initials: "ПЛ",
    color: "mint",
    product: "Кресло Soft",
    extra: "Оливковый · 1 шт.",
    date: "2024-06-21",
    amount: 29900,
    status: "shipping",
  },
  {
    id: 1039,
    name: "Артём Кузнецов",
    email: "artem.k@mail.ru",
    initials: "АК",
    color: "peach",
    product: "Полка Grid",
    extra: "Белый · 2 шт.",
    date: "2024-06-21",
    amount: 14800,
    status: "done",
  },
  {
    id: 1038,
    name: "Алиса Попова",
    email: "alisa.p@gmail.com",
    initials: "АП",
    color: "lavender",
    product: "Зеркало Round",
    extra: "Чёрный · 1 шт.",
    date: "2024-06-20",
    amount: 8900,
    status: "done",
  },
  {
    id: 1037,
    name: "Иван Васильев",
    email: "ivan.v@yandex.ru",
    initials: "ИВ",
    color: "blue",
    product: "Стул Form",
    extra: "Графит · 2 шт.",
    date: "2024-06-20",
    amount: 13800,
    status: "done",
  },
];
const columnLabels: Record<string, string> = {
  id: "Заказ",
  customer: "Покупатель",
  product: "Товары",
  date: "Дата",
  amount: "Сумма",
  status: "Статус",
};
const currency = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
function StatusBadge({ status }: { status: Status }) {
  const s = statuses.find((s) => s.key === status)!;
  return (
    <span className={`status-badge ${s.color}`}>
      <span className="status-dot" />
      {status === "new" ? "Новый" : status === "done" ? "Завершён" : s.label}
    </span>
  );
}
function Sparkline({ index }: { index: number }) {
  const paths = [
    "0,30 10,25 19,29 28,17 38,20 46,10 56,14 65,4 74,9 85,1",
    "0,28 9,30 18,18 28,24 38,12 48,19 58,8 68,15 77,4 85,8",
    "0,29 10,19 20,24 30,14 40,19 50,7 60,12 70,5 78,10 85,1",
    "0,28 10,24 20,28 30,18 40,22 50,12 60,17 70,7 79,10 85,3",
  ];
  return (
    <svg className="sparkline" viewBox="0 0 85 40">
      <defs>
        <linearGradient id={`spark-${index}`} x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor={index === 0 ? "#f0764b" : "#89b296"}
            stopOpacity=".17"
          />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,40 ${paths[index]} 85,40`}
        fill={`url(#spark-${index})`}
      />
      <polyline
        points={paths[index]}
        fill="none"
        stroke={index === 0 ? "#e88760" : "#7ca78b"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function App() {
  const [collapsed, setCollapsed] = useState(false),
    [page, setPage] = useState("Заказы"),
    [orders, setOrders] = useState<Order[]>(initialOrders),
    [tab, setTab] = useState("all"),
    [query, setQuery] = useState(""),
    [grouped, setGrouped] = useState(true),
    [closedGroups, setClosedGroups] = useState<Set<string>>(new Set()),
    [selected, setSelected] = useState<Set<number>>(new Set()),
    [columns, setColumns] = useState(Object.keys(columnLabels)),
    [hidden, setHidden] = useState<Set<string>>(new Set()),
    [dragging, setDragging] = useState<string | null>(null),
    [popover, setPopover] = useState<string | null>(null),
    [filterStatus, setFilterStatus] = useState<Status[]>([]),
    [dateFilter, setDateFilter] = useState("all"),
    [sort, setSort] = useState<"desc" | "asc">("desc"),
    [detail, setDetail] = useState<Order | null>(null),
    [creating, setCreating] = useState(false),
    [toast, setToast] = useState(""),
    [perPage, setPerPage] = useState(12),
    [currentPage, setCurrentPage] = useState(1),
    [saved, setSaved] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node))
        setPopover((prev) =>
          ["filters", "dates", "columns", "bulk"].includes(prev || "")
            ? null
            : prev,
        );
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCreating(false);
        setDetail(null);
        setPopover(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document
          .querySelector<HTMLInputElement>(".search-field input")
          ?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const filtered = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            (tab === "all" || o.status === tab) &&
            (!filterStatus.length || filterStatus.includes(o.status)) &&
            (dateFilter === "all" ||
              (dateFilter === "today"
                ? o.date === "2024-06-24"
                : o.date >= "2024-06-22")) &&
            `${o.id} ${o.name} ${o.email} ${o.product}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) => (sort === "desc" ? b.id - a.id : a.id - b.id)),
    [orders, tab, filterStatus, dateFilter, query, sort],
  );
  const visible = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );
  const allSelected =
    visible.length > 0 && visible.every((o) => selected.has(o.id));
  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((o) =>
        allSelected ? next.delete(o.id) : next.add(o.id),
      );
      return next;
    });
  }
  function togglePopover(name: string) {
    setPopover(popover === name ? null : name);
  }
  function changeStatus(status: Status) {
    setOrders((prev) =>
      prev.map((o) => (selected.has(o.id) ? { ...o, status } : o)),
    );
    setToast(`Статус обновлён для ${selected.size} заказов`);
    setSelected(new Set());
    setPopover(null);
  }
  function exportCsv() {
    const rows = [
      ["Заказ", "Покупатель", "Email", "Товар", "Дата", "Сумма", "Статус"],
      ...(selected.size
        ? orders.filter((o) => selected.has(o.id))
        : filtered
      ).map((o) => [
        o.id,
        o.name,
        o.email,
        o.product,
        o.date,
        o.amount,
        statuses.find((s) => s.key === o.status)!.label,
      ]),
    ];
    const csv =
      "\uFEFF" +
      rows
        .map((row) =>
          row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(";"),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "forma-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Заказы экспортированы в CSV");
  }
  function addOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name"));
    const order: Order = {
      id: Math.max(...orders.map((o) => o.id)) + 1,
      name,
      email: String(data.get("email")),
      initials: name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join(""),
      color: "lavender",
      product: String(data.get("product")),
      extra: "1 шт.",
      amount: Number(data.get("amount")),
      status: "new",
      date: "2024-06-24",
    };
    setOrders((prev) => [order, ...prev]);
    setCreating(false);
    setTab("all");
    setFilterStatus([]);
    setQuery("");
    setCurrentPage(1);
    setToast(`Заказ #${order.id} создан`);
  }
  function moveColumn(from: string, to: string) {
    setColumns((prev) => {
      const next = [...prev];
      next.splice(next.indexOf(from), 1);
      next.splice(next.indexOf(to), 0, from);
      return next;
    });
    setDragging(null);
  }
  function renderCell(o: Order, col: string) {
    switch (col) {
      case "id":
        return (
          <button className="order-link" onClick={() => setDetail(o)}>
            #{o.id}
          </button>
        );
      case "customer":
        return (
          <div className="customer">
            <span className={`avatar ${o.color}`}>{o.initials}</span>
            <span>
              <span className="cell-primary">{o.name}</span>
              <span className="cell-secondary">{o.email}</span>
            </span>
          </div>
        );
      case "product":
        return (
          <div>
            <span className="cell-primary">{o.product}</span>
            <span className="cell-secondary">{o.extra}</span>
          </div>
        );
      case "date":
        return (
          <span className="date-cell">
            {new Date(o.date)
              .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
              .replace(" г.", "")}
            , 2024
          </span>
        );
      case "amount":
        return <span className="amount-cell">{currency(o.amount)}</span>;
      case "status":
        return <StatusBadge status={o.status} />;
      default:
        return null;
    }
  }
  function renderRow(o: Order) {
    return (
      <tr key={o.id} className={selected.has(o.id) ? "selected-row" : ""}>
        <td className="checkbox-cell">
          <input
            type="checkbox"
            aria-label={`Выбрать заказ ${o.id}`}
            checked={selected.has(o.id)}
            onChange={() => toggleSelect(o.id)}
          />
        </td>
        {columns
          .filter((c) => !hidden.has(c))
          .map((c) => (
            <td key={c} className={`col-${c}`}>
              {renderCell(o, c)}
            </td>
          ))}
        <td className="row-actions">
          <button
            className="icon-button"
            aria-label={`Открыть заказ ${o.id}`}
            onClick={() => setDetail(o)}
          >
            <Icon name="more" size={18} />
          </button>
        </td>
      </tr>
    );
  }
  const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0);
  return (
    <div className={`app ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("Заказы");
          }}
          aria-label="Forma — заказы"
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="brand-name">
            forma<span>.</span>
          </span>
        </a>
        <button
          className="workspace-switch"
          aria-label="Рабочее пространство Forma Home"
          onClick={() => {
            setToast("Вы работаете в магазине Forma Home");
          }}
        >
          <span className="workspace-logo">f.</span>
          <span className="workspace-info">
            <strong>Forma Home</strong>
            <span>Рабочее пространство</span>
          </span>
          <Icon name="sort" size={15} />
        </button>
        <div className="nav-caption">УПРАВЛЕНИЕ</div>
        <nav>
          {(
            [
              { name: "Главная", icon: "grid" },
              { name: "Пользователи", icon: "users" },
              { name: "Заказы", icon: "bag" },
              { name: "Настройки", icon: "settings" },
            ] as { name: string; icon: IconName }[]
          ).map((item) => (
            <button
              key={item.name}
              aria-label={item.name}
              title={collapsed ? item.name : undefined}
              className={`nav-item ${page === item.name ? "active" : ""}`}
              onClick={() => setPage(item.name)}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.name}</span>
              {item.name === "Заказы" && (
                <span className="nav-count">{orders.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-orbit">
              <Icon name="sun" size={23} />
            </span>
            <strong>Место для больших идей</strong>
            <p>
              Растите вместе с вашим
              <br />
              бизнесом на тарифе Pro.
            </p>
            <button onClick={() => setPopover("upgrade")}>
              Узнать о Pro <Icon name="arrow" size={15} />
            </button>
          </div>
          <button
            className="support-link"
            onClick={() => setPopover("help")}
            title="Центр помощи"
          >
            <Icon name="help" size={19} />
            <span>Центр помощи</span>
            <Icon name="external" size={14} />
          </button>
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          >
            <Icon name="collapse" size={19} />
            <span>Свернуть меню</span>
          </button>
          <div className="sidebar-profile">
            <span className="profile-avatar">
              АЛ
              <span />
            </span>
            <span className="profile-info">
              <strong>Алексей Лебедев</strong>
              <span>Администратор</span>
            </span>
            <button
              className="icon-button"
              title="Профиль"
              onClick={() => setPage("Настройки")}
            >
              <Icon name="more" size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-layout">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{page}</strong>
          </div>
          <div className="topbar-right">
            <span className="live-indicator" />{" "}
            <span className="store-label">Магазин работает</span>
            <span className="topbar-divider" />
            <button
              className="icon-button notification-button"
              aria-label="Уведомления"
              onClick={() => togglePopover("notifications")}
            >
              <Icon name="bell" size={20} />
              <i />
            </button>
            <button
              className="top-profile"
              title="Настройки профиля"
              onClick={() => setPage("Настройки")}
            >
              АЛ
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС В ДЕТАЛЯХ</div>
              <h1>
                {page}
                {page === "Заказы" && (
                  <span className="heading-count">{orders.length}</span>
                )}
              </h1>
              <p>
                {page === "Заказы"
                  ? "Каждый заказ — начало красивой истории."
                  : page === "Главная"
                    ? "Всё самое важное о вашем магазине в одном месте."
                    : page === "Пользователи"
                      ? "Люди, которые выбирают ваш магазин."
                      : "Ваш магазин. Ваши правила."}
              </p>
            </div>
            <div className="heading-actions">
              {page !== "Настройки" && (
                <>
                  <button className="button" onClick={exportCsv}>
                    <Icon name="download" size={17} />
                    Экспорт
                  </button>
                  <button
                    className="button primary"
                    onClick={() => setCreating(true)}
                  >
                    <Icon name="plus" size={18} />
                    Новый заказ
                  </button>
                </>
              )}
            </div>
          </div>
          {(page === "Заказы" || page === "Главная") && (
            <>
              <section className="stats-grid">
                {[
                  {
                    label: "Всего заказов",
                    value: String(orders.length),
                    growth: "+12,8%",
                    note: "за этот месяц",
                    icon: "bag",
                  },
                  {
                    label: "Выручка",
                    value: currency(totalAmount),
                    growth: "+18,6%",
                    note: "за этот месяц",
                    icon: "arrow",
                  },
                  {
                    label: "Средний чек",
                    value: currency(Math.round(totalAmount / orders.length)),
                    growth: "+5,2%",
                    note: "за этот месяц",
                    icon: "box",
                  },
                  {
                    label: "В работе",
                    value: String(
                      orders.filter((o) => o.status !== "done").length,
                    ),
                    growth: "+8,4%",
                    note: "за этот месяц",
                    icon: "clock",
                  },
                ].map((s, i) => (
                  <article className="stat-card" key={s.label}>
                    <div className="stat-top">
                      <span>{s.label}</span>
                      <Icon name={s.icon as IconName} size={18} />
                    </div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-bottom">
                      <span className="growth">
                        <Icon name="arrow" size={12} />
                        {s.growth}
                      </span>
                      <span>{s.note}</span>
                    </div>
                    <Sparkline index={i} />
                  </article>
                ))}
              </section>
              <section className="orders-panel">
                <div className="panel-title">
                  <div>
                    <h2>
                      {page === "Главная" ? "Последние заказы" : "Все заказы"}
                    </h2>
                    <span>Управляйте заказами и отслеживайте их статус</span>
                  </div>
                  <span className="updated">
                    <span />
                    Обновлено только что
                  </span>
                </div>
                <div
                  className="tabs"
                  role="tablist"
                  aria-label="Статусы заказов"
                >
                  {[{ key: "all", label: "Все заказы" }, ...statuses].map(
                    (s) => (
                      <button
                        role="tab"
                        aria-selected={tab === s.key}
                        className={tab === s.key ? "active" : ""}
                        key={s.key}
                        onClick={() => {
                          setTab(s.key);
                          setCurrentPage(1);
                        }}
                      >
                        {s.key !== "all" && (
                          <span
                            className={`tab-dot ${statuses.find((x) => x.key === s.key)?.color}`}
                          />
                        )}{" "}
                        {s.label}
                        <span className="tab-count">
                          {s.key === "all"
                            ? orders.length
                            : orders.filter((o) => o.status === s.key).length}
                        </span>
                      </button>
                    ),
                  )}
                </div>
                <div className="table-toolbar" ref={popoverRef}>
                  <div className="toolbar-left">
                    <label className="search-field">
                      <Icon name="search" size={17} />
                      <input
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Поиск по заказам..."
                        aria-label="Поиск по заказам"
                      />
                      {query && (
                        <button
                          className="icon-button"
                          onClick={() => setQuery("")}
                          aria-label="Очистить поиск"
                        >
                          <Icon name="close" size={13} />
                        </button>
                      )}
                      <kbd>⌘ K</kbd>
                    </label>
                    <div className="popover-anchor">
                      <button
                        className={`button small ${filterStatus.length ? "filter-active" : ""}`}
                        onClick={() => togglePopover("filters")}
                      >
                        <Icon name="filter" size={16} />
                        Фильтры
                        {filterStatus.length > 0 && (
                          <span className="tiny-count">
                            {filterStatus.length}
                          </span>
                        )}
                      </button>
                      {popover === "filters" && (
                        <div className="popover">
                          <h4>Статус заказа</h4>
                          {statuses.map((s) => (
                            <label className="check-option" key={s.key}>
                              <input
                                type="checkbox"
                                checked={filterStatus.includes(s.key)}
                                onChange={() => {
                                  setFilterStatus((prev) =>
                                    prev.includes(s.key)
                                      ? prev.filter((x) => x !== s.key)
                                      : [...prev, s.key],
                                  );
                                  setCurrentPage(1);
                                }}
                              />
                              {s.label}
                            </label>
                          ))}
                          <button
                            className="text-button"
                            onClick={() => setFilterStatus([])}
                          >
                            Сбросить фильтры
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="popover-anchor date-control">
                      <button
                        className={`button small ${dateFilter !== "all" ? "filter-active" : ""}`}
                        onClick={() => togglePopover("dates")}
                      >
                        <Icon name="calendar" size={16} />
                        {dateFilter === "today"
                          ? "24 июня"
                          : dateFilter === "recent"
                            ? "22–24 июня"
                            : "20–24 июня, 2024"}
                        <Icon
                          name="chevron"
                          className="rotate-down"
                          size={12}
                        />
                      </button>
                      {popover === "dates" && (
                        <div className="popover">
                          {[
                            { key: "all", label: "Все даты" },
                            { key: "today", label: "24 июня 2024" },
                            { key: "recent", label: "Последние 3 дня" },
                          ].map((d) => (
                            <button
                              className="menu-option"
                              key={d.key}
                              onClick={() => {
                                setDateFilter(d.key);
                                setCurrentPage(1);
                                setPopover(null);
                              }}
                            >
                              {d.label}
                              {dateFilter === d.key && (
                                <Icon name="check" size={15} />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="toolbar-right">
                    <button
                      className={`button small group-button ${grouped ? "group-active" : ""}`}
                      aria-pressed={grouped}
                      onClick={() => setGrouped(!grouped)}
                    >
                      <Icon name="group" size={16} />
                      <span>По статусу</span>
                      <Icon name={grouped ? "close" : "plus"} size={12} />
                    </button>
                    <div className="toolbar-separator" />
                    <div className="popover-anchor">
                      <button
                        className="button small columns-button"
                        onClick={() => togglePopover("columns")}
                      >
                        <Icon name="columns" size={16} />
                        <span>Колонки</span>
                      </button>
                      {popover === "columns" && (
                        <div className="popover columns-popover">
                          <h4>Видимые колонки</h4>
                          <p>Перетаскивайте заголовки в таблице</p>
                          {columns.map((c, index) => (
                            <div className="column-option" key={c}>
                              <label className="check-option">
                                <input
                                  type="checkbox"
                                  checked={!hidden.has(c)}
                                  onChange={() =>
                                    setHidden((prev) => {
                                      const next = new Set(prev);
                                      next.has(c)
                                        ? next.delete(c)
                                        : next.size < columns.length - 1 &&
                                          next.add(c);
                                      return next;
                                    })
                                  }
                                />
                                {columnLabels[c]}
                              </label>
                              <button
                                className="icon-button"
                                disabled={index === 0}
                                title="Переместить влево"
                                onClick={() =>
                                  moveColumn(c, columns[index - 1])
                                }
                              >
                                <Icon
                                  name="chevron"
                                  size={12}
                                  style={{ transform: "rotate(180deg)" }}
                                />
                              </button>
                              <button
                                className="icon-button"
                                disabled={index === columns.length - 1}
                                title="Переместить вправо"
                                onClick={() =>
                                  moveColumn(c, columns[index + 1])
                                }
                              >
                                <Icon name="chevron" size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {selected.size > 0 && (
                    <div className="selection-bar">
                      <span>
                        <strong>{selected.size}</strong> выбрано
                      </span>
                      <button onClick={() => setSelected(new Set())}>
                        Снять выделение
                      </button>
                      <div className="popover-anchor">
                        <button onClick={() => togglePopover("bulk")}>
                          Изменить статус{" "}
                          <Icon
                            name="chevron"
                            className="rotate-down"
                            size={13}
                          />
                        </button>
                        {popover === "bulk" && (
                          <div className="popover">
                            {statuses.map((s) => (
                              <button
                                className="menu-option"
                                key={s.key}
                                onClick={() => changeStatus(s.key)}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={exportCsv}>
                        <Icon name="download" size={14} />
                        Экспорт
                      </button>
                    </div>
                  )}
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            aria-label="Выбрать все заказы"
                            ref={(element) => {
                              if (element) {
                                element.indeterminate =
                                  !allSelected &&
                                  visible.some((order) =>
                                    selected.has(order.id),
                                  );
                              }
                            }}
                            onChange={toggleAll}
                          />
                        </th>
                        {columns
                          .filter((c) => !hidden.has(c))
                          .map((c) => (
                            <th
                              key={c}
                              className={`col-${c} ${dragging === c ? "dragging" : ""}`}
                              draggable
                              onDragStart={(e) => {
                                setDragging(c);
                                e.dataTransfer.setData("text/plain", c);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const from =
                                  e.dataTransfer.getData("text/plain");
                                if (columns.includes(from)) moveColumn(from, c);
                              }}
                              onDragEnd={() => setDragging(null)}
                              title="Перетащите, чтобы изменить порядок"
                            >
                              <span className="th-content">
                                <Icon
                                  name="grip"
                                  className="column-grip"
                                  size={12}
                                />
                                {columnLabels[c]}
                                {c === "id" && (
                                  <button
                                    className="sort-button"
                                    aria-label="Изменить сортировку заказов"
                                    onClick={() =>
                                      setSort(sort === "desc" ? "asc" : "desc")
                                    }
                                  >
                                    <Icon name="sort" size={13} />
                                  </button>
                                )}
                              </span>
                            </th>
                          ))}
                        <th className="row-actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {grouped
                        ? statuses.map((s) => {
                            const rows = visible.filter(
                              (o) => o.status === s.key,
                            );
                            if (!rows.length) return null;
                            return (
                              <FragmentGroup key={s.key}>
                                <tr className={`group-row group-${s.color}`}>
                                  <td
                                    colSpan={columns.length - hidden.size + 2}
                                  >
                                    <button
                                      onClick={() =>
                                        setClosedGroups((prev) => {
                                          const next = new Set(prev);
                                          next.has(s.key)
                                            ? next.delete(s.key)
                                            : next.add(s.key);
                                          return next;
                                        })
                                      }
                                      aria-expanded={!closedGroups.has(s.key)}
                                    >
                                      <Icon
                                        name="chevron"
                                        size={13}
                                        className={
                                          closedGroups.has(s.key)
                                            ? ""
                                            : "rotate-down"
                                        }
                                      />
                                      <Icon name={s.icon} size={15} />
                                      <strong>{s.label}</strong>
                                      <span className="group-count">
                                        {rows.length}
                                      </span>
                                    </button>
                                    <span className="group-total">
                                      {currency(
                                        rows.reduce(
                                          (sum, o) => sum + o.amount,
                                          0,
                                        ),
                                      )}
                                    </span>
                                  </td>
                                </tr>
                                {!closedGroups.has(s.key) &&
                                  rows.map(renderRow)}
                              </FragmentGroup>
                            );
                          })
                        : visible.map(renderRow)}
                      {!visible.length && (
                        <tr>
                          <td colSpan={columns.length - hidden.size + 2}>
                            <div className="empty-state">
                              <Icon name="search" size={30} />
                              <h3>Заказы не найдены</h3>
                              <p>
                                Попробуйте изменить запрос или сбросить фильтры
                              </p>
                              <button
                                className="button"
                                onClick={() => {
                                  setQuery("");
                                  setTab("all");
                                  setFilterStatus([]);
                                  setDateFilter("all");
                                }}
                              >
                                Сбросить фильтры
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="table-footer">
                  <span>
                    Показано{" "}
                    <strong>
                      {filtered.length ? (currentPage - 1) * perPage + 1 : 0}–
                      {Math.min(currentPage * perPage, filtered.length)}
                    </strong>{" "}
                    из <strong>{filtered.length}</strong> заказов
                  </span>
                  <div>
                    <span className="rows-label">Строк на странице</span>
                    <select
                      aria-label="Строк на странице"
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                    </select>
                    <button
                      className="pagination-arrow"
                      aria-label="Предыдущая страница"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <Icon
                        name="chevron"
                        style={{ transform: "rotate(180deg)" }}
                        size={16}
                      />
                    </button>
                    {Array.from(
                      {
                        length: Math.max(
                          1,
                          Math.ceil(filtered.length / perPage),
                        ),
                      },
                      (_, i) => (
                        <button
                          className={`pagination-page ${currentPage === i + 1 ? "active" : ""}`}
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ),
                    )}
                    <button
                      className="pagination-arrow"
                      aria-label="Следующая страница"
                      disabled={
                        currentPage >= Math.ceil(filtered.length / perPage)
                      }
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <Icon name="chevron" size={16} />
                    </button>
                  </div>
                </div>
              </section>
              <div className="table-hint">
                <Icon name="grip" size={13} />
                Перетаскивайте заголовки, чтобы изменить порядок колонок
                <span>
                  Сделано с заботой о вашем бизнесе{" "}
                  <span className="footer-star">✳</span>
                </span>
              </div>
            </>
          )}
          {page === "Пользователи" && (
            <section className="orders-panel users-panel">
              <div className="panel-title">
                <div>
                  <h2>
                    Покупатели{" "}
                    <span className="heading-count">{orders.length}</span>
                  </h2>
                  <span>История заказов и контакты клиентов</span>
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Покупатель</th>
                      <th>Email</th>
                      <th>Последний заказ</th>
                      <th>Сумма покупок</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <div className="customer">
                            <span className={`avatar ${o.color}`}>
                              {o.initials}
                            </span>
                            <strong>{o.name}</strong>
                          </div>
                        </td>
                        <td>{o.email}</td>
                        <td>
                          <button
                            className="order-link"
                            onClick={() => setDetail(o)}
                          >
                            #{o.id}
                          </button>
                        </td>
                        <td className="amount-cell">{currency(o.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {page === "Настройки" && (
            <section className="settings-panel">
              <div className="panel-title">
                <div>
                  <h2>Основные настройки</h2>
                  <span>Информация о магазине и вашем профиле</span>
                </div>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSaved(true);
                  setToast("Настройки сохранены");
                }}
              >
                <h3>Магазин</h3>
                <label>
                  Название магазина
                  <input
                    required
                    defaultValue="Forma Home"
                    onChange={() => setSaved(false)}
                  />
                </label>
                <label>
                  Email для заказов
                  <input
                    type="email"
                    required
                    defaultValue="hello@forma.home"
                    onChange={() => setSaved(false)}
                  />
                </label>
                <h3>Профиль администратора</h3>
                <label>
                  Имя
                  <input
                    required
                    defaultValue="Алексей Лебедев"
                    onChange={() => setSaved(false)}
                  />
                </label>
                <label className="check-option">
                  <input type="checkbox" defaultChecked />
                  Получать уведомления о новых заказах
                </label>
                <button className="button primary" type="submit">
                  <Icon name="check" size={17} />
                  {saved ? "Изменения сохранены" : "Сохранить изменения"}
                </button>
              </form>
            </section>
          )}
          <footer className="page-footer">
            <span>© 2024 Forma. Всё в порядке.</span>
            <span>
              <span className="system-dot" />
              Все системы работают
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
            aria-label="Закрыть уведомление"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {creating && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCreating(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-title"
          >
            <div className="modal-heading">
              <div>
                <span className="modal-icon">
                  <Icon name="bag" size={23} />
                </span>
                <h2 id="create-title">Новый заказ</h2>
                <p>Добавьте детали — мы позаботимся об остальном.</p>
              </div>
              <button
                className="icon-button"
                aria-label="Закрыть"
                onClick={() => setCreating(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={addOrder}>
              <label>
                Имя покупателя
                <input
                  autoFocus
                  name="name"
                  required
                  placeholder="Анна Смирнова"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="anna@mail.ru"
                />
              </label>
              <label>
                Товар
                <input
                  name="product"
                  required
                  placeholder="Например, кресло Lounge"
                />
              </label>
              <label>
                Сумма, ₽
                <input
                  name="amount"
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="24 900"
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button"
                  onClick={() => setCreating(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="button primary">
                  <Icon name="plus" size={17} />
                  Создать заказ
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {detail && (
        <div
          className="drawer-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDetail(null);
          }}
        >
          <section
            className="detail-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Заказ ${detail.id}`}
          >
            <div className="drawer-heading">
              <span>ДЕТАЛИ ЗАКАЗА</span>
              <button
                className="icon-button"
                aria-label="Закрыть детали"
                onClick={() => setDetail(null)}
              >
                <Icon name="close" />
              </button>
            </div>
            <h2>Заказ #{detail.id}</h2>
            <p className="drawer-date">
              {new Date(detail.date).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <StatusBadge status={detail.status} />
            <div className="detail-section">
              <h3>Покупатель</h3>
              <div className="customer">
                <span className={`avatar ${detail.color}`}>
                  {detail.initials}
                </span>
                <div>
                  <strong>{detail.name}</strong>
                  <span className="cell-secondary">{detail.email}</span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h3>Состав заказа</h3>
              <div className="detail-product">
                <span className="product-symbol">
                  <Icon name="box" size={26} />
                </span>
                <div>
                  <strong>{detail.product}</strong>
                  <span className="cell-secondary">{detail.extra}</span>
                </div>
              </div>
              <div className="detail-total">
                <span>Итого</span>
                <strong>{currency(detail.amount)}</strong>
              </div>
            </div>
            <div className="detail-section">
              <h3>Статус заказа</h3>
              <select
                value={detail.status}
                onChange={(e) => {
                  const status = e.target.value as Status;
                  setOrders((prev) =>
                    prev.map((o) =>
                      o.id === detail.id ? { ...o, status } : o,
                    ),
                  );
                  setDetail({ ...detail, status });
                  setToast("Статус заказа обновлён");
                }}
              >
                {statuses.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="button"
              onClick={() => {
                setSelected(new Set([detail.id]));
                setDetail(null);
                setPage("Заказы");
              }}
            >
              <Icon name="check" size={16} />
              Выделить в таблице
            </button>
          </section>
        </div>
      )}
      {["help", "upgrade", "notifications"].includes(popover || "") && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPopover(null);
          }}
        >
          <section className="modal info-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <span className="modal-icon">
                <Icon
                  name={
                    popover === "notifications"
                      ? "bell"
                      : popover === "help"
                        ? "help"
                        : "sun"
                  }
                  size={24}
                />
              </span>
              <button
                className="icon-button"
                aria-label="Закрыть"
                onClick={() => setPopover(null)}
              >
                <Icon name="close" />
              </button>
            </div>
            <h2>
              {popover === "notifications"
                ? "Вы в курсе событий"
                : popover === "help"
                  ? "Всегда рядом"
                  : "Больше возможностей с Pro"}
            </h2>
            <p>
              {popover === "notifications"
                ? "Новые заказы и изменения статусов появятся здесь. Сейчас все уведомления прочитаны."
                : popover === "help"
                  ? "Выделяйте заказы галочками, меняйте их статусы вместе и перетаскивайте заголовки колонок. Нажмите на номер заказа, чтобы увидеть детали."
                  : "Расширенная аналитика, несколько магазинов и неограниченная команда. Оставьте заявку — расскажем все подробности."}
            </p>
            {popover === "upgrade" && (
              <a className="button primary" href="mailto:hello@forma.home">
                Связаться с нами <Icon name="arrow" size={16} />
              </a>
            )}
            <button className="button" onClick={() => setPopover(null)}>
              Понятно
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
function FragmentGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
