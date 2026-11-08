import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "bag"
  | "settings"
  | "chevron"
  | "collapse"
  | "search"
  | "bell"
  | "plus"
  | "download"
  | "arrow"
  | "trend"
  | "clock"
  | "check"
  | "wallet"
  | "filter"
  | "group"
  | "columns"
  | "more"
  | "close"
  | "help"
  | "logout"
  | "calendar"
  | "grip"
  | "external"
  | "mail"
  | "box"
  | "refresh";
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
        <rect x="3.5" y="3.5" width="6" height="6" rx="1.5" />
        <rect x="14.5" y="3.5" width="6" height="6" rx="1.5" />
        <rect x="3.5" y="14.5" width="6" height="6" rx="1.5" />
        <rect x="14.5" y="14.5" width="6" height="6" rx="1.5" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
    settings: (
      <>
        <path d="m10 3-1 3-3 1-3-1-1 3 2 2v3l-2 2 2 3 3-1 2 1 1 3h4l1-3 3-1 3 1 1-3-2-2v-3l2-2-2-3-3 1-2-1-1-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    collapse: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M9 4v16m7-11-3 3 3 3" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-9 12a3 3 0 0 0 6 0" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    trend: (
      <>
        <path d="m3 17 6-6 4 3 8-9m-6 0h6v6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    wallet: (
      <>
        <path d="M20 7H5a2 2 0 0 1 0-4h13v4M4 7v13h16V7m0 5h-6v4h6" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16M7 12h10m-7 6h4" />
        <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
      </>
    ),
    group: (
      <>
        <rect x="3" y="4" width="18" height="5" rx="1.5" />
        <rect x="3" y="13" width="7" height="7" rx="1.5" />
        <rect x="14" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
    columns: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M10 4v16m5-16v16" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16v.1" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5m5-13 5 5-5 5m-6-5h13" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2" />
      </>
    ),
    grip: (
      <>
        <path
          d="M9 5v.1M15 5v.1M9 12v.1M15 12v.1M9 19v.1M15 19v.1"
          strokeWidth="3"
        />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 9 9-4m-9 4L3 8m9 4v10M7.5 5.5l9 5" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 10a8 8 0 0 0-14-5L3 8m0-5v5h5m-4 6a8 8 0 0 0 14 5l3-3m0 5v-5h-5" />
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
type Status = "new" | "processing" | "completed" | "cancelled";
type Order = {
  id: string;
  name: string;
  email: string;
  date: string;
  status: Status;
  amount: number;
  paid: boolean;
  color: string;
  items: number;
};
const statusInfo: Record<Status, { label: string; color: string }> = {
  new: { label: "Новый", color: "blue" },
  processing: { label: "В обработке", color: "orange" },
  completed: { label: "Выполнен", color: "green" },
  cancelled: { label: "Отменён", color: "gray" },
};
const initialOrders: Order[] = [
  {
    id: "ORD-2028",
    name: "Александр Иванов",
    email: "alex.ivanov@mail.ru",
    date: "2026-11-04",
    status: "new",
    amount: 12500,
    paid: true,
    color: "lavender",
    items: 3,
  },
  {
    id: "ORD-2027",
    name: "Мария Смирнова",
    email: "m.smirnova@gmail.com",
    date: "2026-11-04",
    status: "new",
    amount: 8240,
    paid: true,
    color: "rose",
    items: 2,
  },
  {
    id: "ORD-2026",
    name: "Дмитрий Козлов",
    email: "d.kozlov@yandex.ru",
    date: "2026-11-04",
    status: "new",
    amount: 3490,
    paid: false,
    color: "sand",
    items: 1,
  },
  {
    id: "ORD-2025",
    name: "Анна Петрова",
    email: "anna.petrova@mail.ru",
    date: "2026-11-03",
    status: "processing",
    amount: 21900,
    paid: true,
    color: "sage",
    items: 4,
  },
  {
    id: "ORD-2024",
    name: "Михаил Соколов",
    email: "m.sokolov@gmail.com",
    date: "2026-11-03",
    status: "processing",
    amount: 5670,
    paid: true,
    color: "sky",
    items: 2,
  },
  {
    id: "ORD-2023",
    name: "Екатерина Волкова",
    email: "kate.volkova@mail.ru",
    date: "2026-11-03",
    status: "processing",
    amount: 14800,
    paid: false,
    color: "lavender",
    items: 3,
  },
  {
    id: "ORD-2022",
    name: "Иван Морозов",
    email: "ivan.m@yandex.ru",
    date: "2026-11-02",
    status: "completed",
    amount: 7490,
    paid: true,
    color: "sand",
    items: 2,
  },
  {
    id: "ORD-2021",
    name: "Ольга Новикова",
    email: "o.novikova@gmail.com",
    date: "2026-11-02",
    status: "completed",
    amount: 18300,
    paid: true,
    color: "rose",
    items: 5,
  },
  {
    id: "ORD-2020",
    name: "Сергей Лебедев",
    email: "s.lebedev@mail.ru",
    date: "2026-11-01",
    status: "completed",
    amount: 4200,
    paid: true,
    color: "sage",
    items: 1,
  },
  {
    id: "ORD-2019",
    name: "Наталья Орлова",
    email: "n.orlova@yandex.ru",
    date: "2026-11-01",
    status: "cancelled",
    amount: 9600,
    paid: false,
    color: "sky",
    items: 2,
  },
  {
    id: "ORD-2018",
    name: "Артём Васильев",
    email: "artem.v@mail.ru",
    date: "2026-10-31",
    status: "completed",
    amount: 6900,
    paid: true,
    color: "lavender",
    items: 2,
  },
  {
    id: "ORD-2017",
    name: "Полина Фёдорова",
    email: "p.fedorova@gmail.com",
    date: "2026-10-30",
    status: "new",
    amount: 11200,
    paid: false,
    color: "rose",
    items: 3,
  },
  {
    id: "ORD-2016",
    name: "Максим Егоров",
    email: "max.egorov@mail.ru",
    date: "2026-10-29",
    status: "completed",
    amount: 2850,
    paid: true,
    color: "sage",
    items: 1,
  },
  {
    id: "ORD-2015",
    name: "Алиса Белова",
    email: "alisa.b@gmail.com",
    date: "2026-10-28",
    status: "processing",
    amount: 16400,
    paid: true,
    color: "sand",
    items: 4,
  },
  {
    id: "ORD-2014",
    name: "Андрей Титов",
    email: "a.titov@yandex.ru",
    date: "2026-10-27",
    status: "completed",
    amount: 5320,
    paid: true,
    color: "sky",
    items: 2,
  },
  {
    id: "ORD-2013",
    name: "Вера Павлова",
    email: "vera.p@mail.ru",
    date: "2026-10-26",
    status: "cancelled",
    amount: 8700,
    paid: false,
    color: "rose",
    items: 2,
  },
  {
    id: "ORD-2012",
    name: "Роман Алексеев",
    email: "roman.a@mail.ru",
    date: "2026-10-25",
    status: "completed",
    amount: 13600,
    paid: true,
    color: "sage",
    items: 3,
  },
  {
    id: "ORD-2011",
    name: "София Сергеева",
    email: "sofia.s@gmail.com",
    date: "2026-10-24",
    status: "new",
    amount: 4100,
    paid: false,
    color: "lavender",
    items: 1,
  },
];
const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const initials = (s: string) =>
  s
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
type Col = "id" | "client" | "date" | "status" | "amount" | "payment";
const colNames: Record<Col, string> = {
  id: "Номер заказа",
  client: "Клиент",
  date: "Дата",
  status: "Статус",
  amount: "Сумма",
  payment: "Оплата",
};
const allCols: Col[] = ["id", "client", "date", "status", "amount", "payment"];

export function App() {
  const [collapsed, setCollapsed] = useState(false),
    [section, setSection] = useState("Заказы"),
    [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState(""),
    [tab, setTab] = useState("all"),
    [grouped, setGrouped] = useState(true),
    [closedGroups, setClosedGroups] = useState<Status[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set()),
    [columns, setColumns] = useState<Col[]>(allCols),
    [hidden, setHidden] = useState<Col[]>([]);
  const [dragging, setDragging] = useState<Col | null>(null),
    [dragOver, setDragOver] = useState<Col | null>(null),
    [popover, setPopover] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState("all"),
    [period, setPeriod] = useState("month"),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState(""),
    [modal, setModal] = useState(false),
    [detail, setDetail] = useState<Order | null>(null),
    [notifications, setNotifications] = useState(false);
  const [sort, setSort] = useState<{ col: Col; asc: boolean } | null>(null),
    [storeName, setStoreName] = useState("Мой магазин"),
    [savedName, setSavedName] = useState("Мой магазин");
  const searchRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const notify = (message: string) => setToast(message);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setPopover(null);
        setModal(false);
        setDetail(null);
        setNotifications(false);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node))
        setPopover((prev) => (prev === "help" ? prev : null));
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  useEffect(() => setPage(1), [query, tab, paymentFilter, period, pageSize]);
  const filtered = useMemo(() => {
    let result = orders.filter(
      (o) =>
        (tab === "all" || o.status === tab) &&
        `${o.id} ${o.name} ${o.email}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (paymentFilter === "all" || o.paid === (paymentFilter === "paid")) &&
        (period !== "today" || o.date === "2026-11-04") &&
        (period !== "week" || o.date >= "2026-10-29"),
    );
    if (sort) {
      result = [...result].sort((a, b) => {
        const av =
          sort.col === "client"
            ? a.name
            : sort.col === "payment"
              ? Number(a.paid)
              : a[sort.col];
        const bv =
          sort.col === "client"
            ? b.name
            : sort.col === "payment"
              ? Number(b.paid)
              : b[sort.col];
        return (
          (typeof av === "number"
            ? av - Number(bv)
            : String(av).localeCompare(String(bv), "ru")) * (sort.asc ? 1 : -1)
        );
      });
    }
    return result;
  }, [orders, tab, query, paymentFilter, period, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages),
    shown = filtered.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    ),
    visibleCols = columns.filter((c) => !hidden.includes(c));
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allSelected =
    shown.length > 0 && shown.every((o) => selected.has(o.id));
  const selectAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      shown.forEach((o) => (allSelected ? next.delete(o.id) : next.add(o.id)));
      return next;
    });
  const exportOrders = () => {
    const rows = selected.size
      ? orders.filter((o) => selected.has(o.id))
      : filtered;
    const csv =
      "\uFEFF" +
      [
        "Номер;Клиент;Email;Дата;Статус;Сумма;Оплата",
        ...rows.map((o) =>
          [
            o.id,
            o.name,
            o.email,
            o.date,
            statusInfo[o.status].label,
            o.amount,
            o.paid ? "Оплачен" : "Ожидает",
          ].join(";"),
        ),
      ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    notify(`Экспортировано заказов: ${rows.length}`);
  };
  const changeStatus = (id: string, status: Status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setDetail((prev) => (prev?.id === id ? { ...prev, status } : prev));
    notify("Статус заказа обновлён");
  };
  const togglePop = (id: string) => setPopover(popover === id ? null : id);
  const dropCol = (target: Col) => {
    if (dragging && dragging !== target) {
      const next = columns.filter((c) => c !== dragging);
      next.splice(next.indexOf(target), 0, dragging);
      setColumns(next);
    }
    setDragging(null);
    setDragOver(null);
  };
  const statCards = [
    {
      label: "Всего заказов",
      value: String(orders.length).padStart(2, "0"),
      change: "+12,8%",
      icon: "bag" as IconName,
      tone: "coral",
      sub: "за последний месяц",
      line: "0,27 8,24 15,28 23,17 31,20 39,14 47,18 55,7 63,10 72,2",
    },
    {
      label: "В обработке",
      value: String(
        orders.filter((o) => o.status === "processing").length,
      ).padStart(2, "0"),
      change: "+8,2%",
      icon: "clock" as IconName,
      tone: "amber",
      sub: "за последний месяц",
      line: "0,28 8,26 16,19 24,21 32,13 40,18 48,10 56,12 64,4 72,6",
    },
    {
      label: "Выполнено",
      value: String(
        orders.filter((o) => o.status === "completed").length,
      ).padStart(2, "0"),
      change: "+18,6%",
      icon: "check" as IconName,
      tone: "mint",
      sub: "за последний месяц",
      line: "0,29 8,23 16,25 24,18 32,21 40,10 48,13 56,5 64,9 72,2",
    },
    {
      label: "Выручка",
      value: money(
        orders
          .filter((o) => o.paid && o.status !== "cancelled")
          .reduce((s, o) => s + o.amount, 0),
      ),
      change: "+15,3%",
      icon: "wallet" as IconName,
      tone: "violet",
      sub: "за последний месяц",
      line: "0,27 8,29 16,22 24,23 32,15 40,18 48,8 56,12 64,5 72,2",
    },
  ];
  function renderCell(o: Order, c: Col) {
    switch (c) {
      case "id":
        return (
          <button className="order-link" onClick={() => setDetail(o)}>
            #{o.id}
          </button>
        );
      case "client":
        return (
          <div className="client">
            <span className={`avatar ${o.color}`}>{initials(o.name)}</span>
            <span>
              <span className="client-name">{o.name}</span>
              <span className="client-email">{o.email}</span>
            </span>
          </div>
        );
      case "date":
        return (
          <span className="date-cell">
            {new Date(o.date + "T12:00:00")
              .toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })
              .replace(".", "")}
            , 2026
          </span>
        );
      case "status":
        return (
          <span className={`status ${statusInfo[o.status].color}`}>
            <i />
            {statusInfo[o.status].label}
          </span>
        );
      case "amount":
        return <strong className="amount">{money(o.amount)}</strong>;
      case "payment":
        return (
          <span className={`payment ${o.paid ? "paid" : ""}`}>
            <Icon name={o.paid ? "check" : "clock"} size={14} />
            {o.paid ? "Оплачен" : "Ожидает"}
          </span>
        );
    }
  }
  function renderRow(o: Order) {
    return (
      <tr
        key={o.id}
        className={selected.has(o.id) ? "selected" : ""}
        onClick={() => toggleSelect(o.id)}
      >
        <td className="check-cell" onClick={(e) => e.stopPropagation()}>
          <input
            aria-label={`Выбрать ${o.id}`}
            type="checkbox"
            checked={selected.has(o.id)}
            onChange={() => toggleSelect(o.id)}
          />
        </td>
        {visibleCols.map((c) => (
          <td
            key={c}
            className={`cell-${c}`}
            onClick={c === "id" ? (e) => e.stopPropagation() : undefined}
          >
            {renderCell(o, c)}
          </td>
        ))}
        <td className="row-menu-cell" onClick={(e) => e.stopPropagation()}>
          <button
            className="icon-button row-more"
            aria-label={`Открыть заказ ${o.id}`}
            onClick={() => setDetail(o)}
          >
            <Icon name="more" size={18} />
          </button>
        </td>
      </tr>
    );
  }
  return (
    <div className={`app ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSection("Заказы");
          }}
        >
          <span className="brand-symbol">
            <span />
            <span />
            <span />
          </span>
          {!collapsed && (
            <span>
              orderly<span className="brand-dot">.</span>
            </span>
          )}
        </a>
        <button
          className="workspace-switch"
          onClick={() => {
            setSection("Настройки");
          }}
          title={savedName}
        >
          <span className="workspace-icon">
            <Icon name="bag" size={18} />
          </span>
          {!collapsed && (
            <>
              <span className="workspace-text">
                <strong>{savedName}</strong>
                <small>Рабочее пространство</small>
              </span>
              <Icon name="chevron" size={14} />
            </>
          )}
        </button>
        <div className="nav-label">{collapsed ? "•••" : "УПРАВЛЕНИЕ"}</div>
        <nav>
          {(
            [
              { label: "Главная", icon: "grid" },
              { label: "Пользователи", icon: "users" },
              { label: "Заказы", icon: "bag" },
              { label: "Настройки", icon: "settings" },
            ] as { label: string; icon: IconName }[]
          ).map((item) => (
            <button
              key={item.label}
              aria-label={item.label}
              title={item.label}
              className={`nav-item ${section === item.label ? "active" : ""}`}
              onClick={() => {
                setSection(item.label);
                setQuery("");
              }}
            >
              <Icon name={item.icon} />
              {!collapsed && (
                <>
                  <span>{item.label}</span>
                  {item.label === "Заказы" && (
                    <span className="nav-count">{orders.length}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="help-card">
              <span className="help-icon">
                <Icon name="box" size={21} />
              </span>
              <strong>Всё под контролем</strong>
              <p>
                Ваш бизнес — в одном месте.
                <br />
                Мы рядом, если нужна помощь.
              </p>
              <button
                onClick={() => {
                  setPopover("help");
                }}
              >
                Центр помощи <Icon name="external" size={13} />
              </button>
            </div>
          )}
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          >
            <Icon name="collapse" size={19} />
            {!collapsed && <span>Свернуть меню</span>}
          </button>
          <div className="sidebar-profile">
            <span className="avatar profile-avatar">АС</span>
            {!collapsed && (
              <>
                <span>
                  <strong>Алексей Смирнов</strong>
                  <small>Администратор</small>
                </span>
                <button
                  className="icon-button"
                  aria-label="Профиль"
                  onClick={() => setSection("Настройки")}
                >
                  <Icon name="more" size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{section}</strong>
          </div>
          <div className="topbar-right">
            <span className="live-status">
              <i />
              Магазин работает
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button notification-button"
              aria-label="Уведомления"
              onClick={() => setNotifications(!notifications)}
            >
              <Icon name="bell" />
              <i />
            </button>
            <button
              className="avatar top-avatar"
              aria-label="Настройки профиля"
              onClick={() => setSection("Настройки")}
            >
              АС
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="heading-eyebrow">ВАШ БИЗНЕС В ДЕТАЛЯХ</div>
              <h1>{section === "Главная" ? "Обзор магазина" : section}</h1>
              <p>
                {section === "Заказы"
                  ? "Управляйте заказами и следите за каждым этапом."
                  : section === "Главная"
                    ? "Главные показатели и последние события вашего магазина."
                    : section === "Пользователи"
                      ? "Ваши клиенты и история взаимодействий с ними."
                      : "Настройте рабочее пространство под себя."}
              </p>
            </div>
            <div className="heading-actions">
              {(section === "Заказы" || section === "Главная") && (
                <>
                  <button className="button" onClick={exportOrders}>
                    <Icon name="download" size={17} />
                    Экспорт
                  </button>
                  <button
                    className="button primary"
                    onClick={() => setModal(true)}
                  >
                    <Icon name="plus" size={18} />
                    Создать заказ
                  </button>
                </>
              )}
            </div>
          </div>
          {(section === "Заказы" || section === "Главная") && (
            <>
              <div className="stats-grid">
                {statCards.map((s, i) => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-top">
                      <span>{s.label}</span>
                      <span className={`stat-icon ${s.tone}`}>
                        <Icon name={s.icon} size={18} />
                      </span>
                    </div>
                    <div className={`stat-value ${i === 3 ? "revenue" : ""}`}>
                      {s.value}
                      <svg
                        className={`sparkline ${s.tone}`}
                        viewBox="0 0 74 34"
                      >
                        <polyline
                          points={s.line}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="stat-bottom">
                      <span className="stat-change">
                        <Icon name="trend" size={12} />
                        {s.change}
                      </span>
                      <span>{s.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
              <section className="orders-panel">
                <div className="panel-title">
                  <div>
                    <h2>
                      {section === "Главная"
                        ? "Последние заказы"
                        : "Все заказы"}
                      <span className="total-pill">{orders.length}</span>
                    </h2>
                    <p>Все заказы вашего магазина в одном месте.</p>
                  </div>
                  <div className="period-wrap">
                    <Icon name="calendar" size={16} />
                    <select
                      aria-label="Период"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                    >
                      <option value="month">Последние 30 дней</option>
                      <option value="week">Последние 7 дней</option>
                      <option value="today">Сегодня</option>
                    </select>
                  </div>
                </div>
                <div className="tabs">
                  {[
                    { id: "all", label: "Все заказы" },
                    { id: "new", label: "Новые" },
                    { id: "processing", label: "В обработке" },
                    { id: "completed", label: "Выполненные" },
                    { id: "cancelled", label: "Отменённые" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      className={tab === t.id ? "active" : ""}
                      onClick={() => setTab(t.id)}
                    >
                      {t.label}
                      <span>
                        {t.id === "all"
                          ? orders.length
                          : orders.filter((o) => o.status === t.id).length}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="table-toolbar" ref={popoverRef}>
                  <div className="search-field">
                    <Icon name="search" size={17} />
                    <input
                      ref={searchRef}
                      placeholder="Поиск по номеру, имени или email..."
                      aria-label="Поиск заказов"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query ? (
                      <button
                        className="clear-search"
                        aria-label="Очистить поиск"
                        onClick={() => setQuery("")}
                      >
                        <Icon name="close" size={14} />
                      </button>
                    ) : (
                      <kbd>⌘ K</kbd>
                    )}
                  </div>
                  <div className="toolbar-actions">
                    <div className="popover-anchor">
                      <button
                        className={`button toolbar-button ${paymentFilter !== "all" ? "filter-active" : ""}`}
                        aria-label="Фильтры"
                        onClick={() => togglePop("filter")}
                      >
                        <Icon name="filter" size={17} />
                        <span>Фильтры</span>
                        {paymentFilter !== "all" && (
                          <span className="filter-dot" />
                        )}
                      </button>
                      {popover === "filter" && (
                        <div className="popover filter-popover">
                          <h4>Статус оплаты</h4>
                          {[
                            { id: "all", label: "Все заказы" },
                            { id: "paid", label: "Оплаченные" },
                            { id: "unpaid", label: "Ожидают оплаты" },
                          ].map((f) => (
                            <button
                              className="popover-option"
                              key={f.id}
                              onClick={() => {
                                setPaymentFilter(f.id);
                                setPopover(null);
                              }}
                            >
                              {f.label}
                              {paymentFilter === f.id && (
                                <Icon name="check" size={15} />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="popover-anchor">
                      <button
                        className={`button toolbar-button group-button ${grouped ? "group-active" : ""}`}
                        onClick={() => togglePop("group")}
                      >
                        <Icon name="group" size={16} />
                        <span>
                          Группировка
                          {grouped && (
                            <>
                              <b>:</b> Статус
                            </>
                          )}
                        </span>
                        <Icon
                          name="chevron"
                          size={12}
                          className="chevron-down"
                        />
                      </button>
                      {popover === "group" && (
                        <div className="popover">
                          <h4>Группировать заказы</h4>
                          <button
                            className="popover-option"
                            onClick={() => {
                              setGrouped(true);
                              setPopover(null);
                            }}
                          >
                            По статусу
                            {grouped && <Icon name="check" size={15} />}
                          </button>
                          <button
                            className="popover-option"
                            onClick={() => {
                              setGrouped(false);
                              setPopover(null);
                            }}
                          >
                            Без группировки
                            {!grouped && <Icon name="check" size={15} />}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="popover-anchor">
                      <button
                        className="button toolbar-button"
                        onClick={() => togglePop("columns")}
                      >
                        <Icon name="columns" size={17} />
                        <span>Колонки</span>
                      </button>
                      {popover === "columns" && (
                        <div className="popover columns-popover">
                          <h4>Видимые колонки</h4>
                          {columns.map((c, i) => (
                            <div className="column-option" key={c}>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={!hidden.includes(c)}
                                  onChange={() =>
                                    setHidden((prev) =>
                                      prev.includes(c)
                                        ? prev.filter((x) => x !== c)
                                        : [...prev, c],
                                    )
                                  }
                                />
                                {colNames[c]}
                              </label>
                              <button
                                title="Переместить влево"
                                disabled={i === 0}
                                onClick={() =>
                                  setColumns((prev) => {
                                    const next = [...prev];
                                    [next[i], next[i - 1]] = [
                                      next[i - 1],
                                      next[i],
                                    ];
                                    return next;
                                  })
                                }
                              >
                                <Icon
                                  name="chevron"
                                  size={12}
                                  className="rotate-180"
                                />
                              </button>
                              <button
                                title="Переместить вправо"
                                disabled={i === columns.length - 1}
                                onClick={() =>
                                  setColumns((prev) => {
                                    const next = [...prev];
                                    [next[i], next[i + 1]] = [
                                      next[i + 1],
                                      next[i],
                                    ];
                                    return next;
                                  })
                                }
                              >
                                <Icon name="chevron" size={12} />
                              </button>
                            </div>
                          ))}
                          <p className="popover-hint">
                            Перетаскивайте заголовки в таблице,
                            <br />
                            чтобы изменить порядок.
                          </p>
                        </div>
                      )}
                    </div>
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
                    <span>
                      <button onClick={exportOrders}>
                        <Icon name="download" size={15} />
                        Экспорт
                      </button>
                      <button
                        onClick={() => {
                          setOrders((prev) =>
                            prev.map((o) =>
                              selected.has(o.id)
                                ? { ...o, status: "completed" }
                                : o,
                            ),
                          );
                          setSelected(new Set());
                          notify("Выбранные заказы выполнены");
                        }}
                      >
                        <Icon name="check" size={15} />
                        Выполнить
                      </button>
                    </span>
                  </div>
                )}
                <div className="table-scroll">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th className="check-cell">
                          <input
                            aria-label="Выбрать все заказы на странице"
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => {
                              if (el)
                                el.indeterminate =
                                  !allSelected &&
                                  shown.some((o) => selected.has(o.id));
                            }}
                            onChange={selectAll}
                          />
                        </th>
                        {visibleCols.map((c) => (
                          <th
                            key={c}
                            draggable
                            onDragStart={(e) => {
                              setDragging(c);
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", c);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOver(c);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              dropCol(c);
                            }}
                            onDragEnd={() => {
                              setDragging(null);
                              setDragOver(null);
                            }}
                            className={`col-${c} ${dragOver === c ? "drag-over" : ""} ${dragging === c ? "dragging" : ""}`}
                            title="Перетащите, чтобы переместить колонку"
                          >
                            <button
                              className="column-heading"
                              onClick={() =>
                                setSort({
                                  col: c,
                                  asc: sort?.col === c ? !sort.asc : true,
                                })
                              }
                            >
                              {colNames[c]}
                              <span className="sort-indicator">
                                {sort?.col === c ? (sort.asc ? "↑" : "↓") : "↕"}
                              </span>
                              <Icon name="grip" size={12} />
                            </button>
                          </th>
                        ))}
                        <th className="row-menu-cell" />
                      </tr>
                    </thead>
                    <tbody>
                      {grouped
                        ? (
                            [
                              "new",
                              "processing",
                              "completed",
                              "cancelled",
                            ] as Status[]
                          ).map((status) => {
                            const rows = shown.filter(
                              (o) => o.status === status,
                            );
                            if (!rows.length) return null;
                            const isClosed = closedGroups.includes(status);
                            return (
                              <React.Fragment key={status}>
                                <tr className="group-row">
                                  <td colSpan={visibleCols.length + 2}>
                                    <button
                                      onClick={() =>
                                        setClosedGroups((prev) =>
                                          prev.includes(status)
                                            ? prev.filter((s) => s !== status)
                                            : [...prev, status],
                                        )
                                      }
                                    >
                                      <Icon
                                        name="chevron"
                                        size={13}
                                        className={
                                          isClosed ? "" : "chevron-down"
                                        }
                                      />
                                      <i
                                        className={`group-dot ${statusInfo[status].color}`}
                                      />
                                      <strong>
                                        {status === "new"
                                          ? "Новые"
                                          : status === "completed"
                                            ? "Выполненные"
                                            : status === "cancelled"
                                              ? "Отменённые"
                                              : "В обработке"}
                                      </strong>
                                      <span className="group-count">
                                        {rows.length}
                                      </span>
                                      <span className="group-total">
                                        {money(
                                          rows.reduce(
                                            (s, o) => s + o.amount,
                                            0,
                                          ),
                                        )}
                                      </span>
                                    </button>
                                  </td>
                                </tr>
                                {!isClosed && rows.map(renderRow)}
                              </React.Fragment>
                            );
                          })
                        : shown.map(renderRow)}
                    </tbody>
                  </table>
                  {shown.length === 0 && (
                    <div className="empty-state">
                      <span>
                        <Icon name="search" size={30} />
                      </span>
                      <h3>Заказы не найдены</h3>
                      <p>Попробуйте изменить запрос или сбросить фильтры.</p>
                      <button
                        className="button"
                        onClick={() => {
                          setQuery("");
                          setTab("all");
                          setPaymentFilter("all");
                          setPeriod("month");
                        }}
                      >
                        Сбросить фильтры
                      </button>
                    </div>
                  )}
                </div>
                <div className="table-footer">
                  <span>
                    Показано{" "}
                    <strong>
                      {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                      {Math.min(currentPage * pageSize, filtered.length)}
                    </strong>{" "}
                    из <strong>{filtered.length}</strong> заказов
                  </span>
                  <div className="pagination">
                    <span className="per-page">
                      На странице:{" "}
                      <select
                        value={pageSize}
                        aria-label="Заказов на странице"
                        onChange={(e) => setPageSize(Number(e.target.value))}
                      >
                        <option>10</option>
                        <option>15</option>
                        <option>20</option>
                      </select>
                    </span>
                    <button
                      className="pagination-button"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                      aria-label="Предыдущая страница"
                    >
                      <Icon name="chevron" size={15} className="rotate-180" />
                    </button>
                    {Array.from({ length: pages }, (_, i) => (
                      <button
                        key={i}
                        className={`pagination-button ${currentPage === i + 1 ? "current" : ""}`}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="pagination-button"
                      disabled={currentPage === pages}
                      onClick={() => setPage(currentPage + 1)}
                      aria-label="Следующая страница"
                    >
                      <Icon name="chevron" size={15} />
                    </button>
                  </div>
                </div>
              </section>
              <div className="page-footnote">
                <span>
                  <Icon name="refresh" size={13} />
                  Данные обновлены только что
                </span>
                <span>Порядок в заказах. Простор для роста.</span>
              </div>
            </>
          )}
          {section === "Пользователи" && (
            <section className="users-panel">
              <div className="section-search search-field">
                <Icon name="search" size={18} />
                <input
                  placeholder="Найти клиента..."
                  aria-label="Поиск клиентов"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="customer-grid">
                {orders
                  .filter((o) =>
                    (o.name + " " + o.email)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((o) => (
                    <button
                      key={o.id}
                      className="customer-card"
                      onClick={() => setDetail(o)}
                    >
                      <span className={`avatar ${o.color}`}>
                        {initials(o.name)}
                      </span>
                      <strong>{o.name}</strong>
                      <span>{o.email}</span>
                      <div>
                        Последний заказ <b>#{o.id}</b>
                        <Icon name="chevron" size={14} />
                      </div>
                    </button>
                  ))}
              </div>
            </section>
          )}
          {section === "Настройки" && (
            <section className="settings-panel">
              <h2>Рабочее пространство</h2>
              <p>Основная информация о вашем магазине.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSavedName(storeName);
                  notify("Настройки сохранены");
                }}
              >
                <label>
                  Название магазина
                  <input
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </label>
                <label>
                  Email администратора
                  <input
                    type="email"
                    defaultValue="alexey@orderly.ru"
                    required
                  />
                </label>
                <label>
                  Валюта
                  <select defaultValue="rub">
                    <option value="rub">Российский рубль (₽)</option>
                  </select>
                </label>
                <label>
                  Часовой пояс
                  <select>
                    <option>Москва (UTC+3)</option>
                    <option>Екатеринбург (UTC+5)</option>
                    <option>Новосибирск (UTC+7)</option>
                  </select>
                </label>
                <button className="button primary" type="submit">
                  Сохранить изменения
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
          <button aria-label="Закрыть уведомление" onClick={() => setToast("")}>
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {notifications && (
        <>
          <div
            className="popover-dismiss"
            onClick={() => setNotifications(false)}
          />
          <div className="notifications-panel">
            <div className="floating-heading">
              <h3>
                Уведомления <span>2</span>
              </h3>
              <button
                className="icon-button"
                aria-label="Закрыть уведомления"
                onClick={() => setNotifications(false)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="notification-item">
              <span className="stat-icon coral">
                <Icon name="bag" size={17} />
              </span>
              <div>
                <strong>Новый заказ #{orders[0].id}</strong>
                <p>
                  {orders[0].name} · {money(orders[0].amount)}
                </p>
                <small>Только что</small>
              </div>
            </div>
            <div className="notification-item">
              <span className="stat-icon mint">
                <Icon name="check" size={17} />
              </span>
              <div>
                <strong>Оплата получена</strong>
                <p>Заказ #ORD-2027 успешно оплачен</p>
                <small>15 минут назад</small>
              </div>
            </div>
          </div>
        </>
      )}
      {popover === "help" && (
        <div className="modal-backdrop" onClick={() => setPopover(null)}>
          <div
            className="modal help-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Закрыть"
              onClick={() => setPopover(null)}
            >
              <Icon name="close" />
            </button>
            <span className="help-modal-icon">
              <Icon name="help" size={30} />
            </span>
            <h2>Всегда рядом</h2>
            <p>
              Выделяйте заказы чекбоксами для массовых действий. Перетаскивайте
              заголовки колонок, чтобы настроить таблицу. Нажмите на номер
              заказа для просмотра деталей.
            </p>
            <a className="button primary" href="mailto:support@orderly.ru">
              <Icon name="mail" size={17} />
              Написать в поддержку
            </a>
          </div>
        </div>
      )}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Создать заказ"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Закрыть"
              onClick={() => setModal(false)}
            >
              <Icon name="close" />
            </button>
            <div className="modal-eyebrow">НОВЫЙ ЗАКАЗ</div>
            <h2>Начнём с деталей</h2>
            <p>Добавьте информацию о клиенте и заказе.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const newOrder: Order = {
                  id: `ORD-${Math.max(...orders.map((o) => Number(o.id.split("-")[1]))) + 1}`,
                  name: String(f.get("name")),
                  email: String(f.get("email")),
                  amount: Number(f.get("amount")),
                  items: Number(f.get("items")),
                  date: "2026-11-04",
                  status: "new",
                  paid: f.get("paid") === "on",
                  color: "lavender",
                };
                setOrders((prev) => [newOrder, ...prev]);
                setModal(false);
                setTab("all");
                setQuery("");
                setPage(1);
                setPeriod("month");
                setPaymentFilter("all");
                notify(`Заказ #${newOrder.id} создан`);
              }}
            >
              <label>
                Имя и фамилия
                <input
                  name="name"
                  placeholder="Например, Алексей Смирнов"
                  required
                  autoFocus
                />
              </label>
              <label>
                Email клиента
                <input
                  name="email"
                  type="email"
                  placeholder="client@example.ru"
                  required
                />
              </label>
              <div className="form-row">
                <label>
                  Сумма, ₽
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0"
                    required
                  />
                </label>
                <label>
                  Товаров
                  <input
                    name="items"
                    type="number"
                    min="1"
                    defaultValue="1"
                    required
                  />
                </label>
              </div>
              <label className="checkbox-label">
                <input name="paid" type="checkbox" />
                Заказ уже оплачен
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button"
                  onClick={() => setModal(false)}
                >
                  Отмена
                </button>
                <button className="button primary" type="submit">
                  <Icon name="plus" size={17} />
                  Создать заказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {detail && (
        <div className="drawer-backdrop" onClick={() => setDetail(null)}>
          <aside className="order-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="floating-heading">
              <span className="modal-eyebrow">ДЕТАЛИ ЗАКАЗА</span>
              <button
                className="icon-button"
                aria-label="Закрыть заказ"
                onClick={() => setDetail(null)}
              >
                <Icon name="close" />
              </button>
            </div>
            <h2>#{detail.id}</h2>
            <span className={`status ${statusInfo[detail.status].color}`}>
              <i />
              {statusInfo[detail.status].label}
            </span>
            <div className="drawer-section">
              <h3>Клиент</h3>
              <div className="client">
                <span className={`avatar ${detail.color}`}>
                  {initials(detail.name)}
                </span>
                <span>
                  <span className="client-name">{detail.name}</span>
                  <a className="client-email" href={`mailto:${detail.email}`}>
                    {detail.email}
                  </a>
                </span>
              </div>
            </div>
            <div className="drawer-section">
              <h3>Информация о заказе</h3>
              <div className="detail-line">
                <span>Дата создания</span>
                <strong>
                  {new Date(detail.date).toLocaleDateString("ru-RU")}
                </strong>
              </div>
              <div className="detail-line">
                <span>Количество товаров</span>
                <strong>{detail.items}</strong>
              </div>
              <div className="detail-line">
                <span>Оплата</span>
                <span className={`payment ${detail.paid ? "paid" : ""}`}>
                  {detail.paid ? "Оплачен" : "Ожидает оплаты"}
                </span>
              </div>
              <div className="detail-line detail-total">
                <span>Итого</span>
                <strong>{money(detail.amount)}</strong>
              </div>
            </div>
            <label className="status-select-label">
              Статус заказа
              <select
                value={detail.status}
                onChange={(e) =>
                  changeStatus(detail.id, e.target.value as Status)
                }
              >
                {Object.entries(statusInfo).map(([s, v]) => (
                  <option key={s} value={s}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
            {!detail.paid && (
              <button
                className="button primary drawer-pay"
                onClick={() => {
                  setOrders((prev) =>
                    prev.map((o) =>
                      o.id === detail.id ? { ...o, paid: true } : o,
                    ),
                  );
                  setDetail({ ...detail, paid: true });
                  notify("Заказ отмечен оплаченным");
                }}
              >
                <Icon name="check" size={18} />
                Отметить оплаченным
              </button>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
