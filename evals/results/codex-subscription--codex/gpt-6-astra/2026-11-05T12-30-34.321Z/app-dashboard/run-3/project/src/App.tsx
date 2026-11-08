import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "orders"
  | "settings"
  | "chevron"
  | "search"
  | "bell"
  | "plus"
  | "arrow"
  | "download"
  | "filter"
  | "group"
  | "columns"
  | "more"
  | "close"
  | "check"
  | "clock"
  | "box"
  | "wallet"
  | "help"
  | "logout"
  | "panel"
  | "calendar"
  | "grip"
  | "external"
  | "mail";
function Icon({
  name,
  size = 18,
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
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5" />
      </>
    ),
    orders: (
      <>
        <path d="M6 4h12a2 2 0 0 1 2 2v15l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z" />
        <path d="M9 3v3m6-3v3M8 11h8m-8 4h5" />
      </>
    ),
    settings: (
      <>
        <path d="m10 3-1 3-3 1-3 3 2 2-1 4 3 1 2 4h5l1-3 4-1 2-4-2-2 1-4-4-1-1-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bell: (
      <>
        <path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Zm5 3h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 17 18 4M6 4h12v12" />,
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="2" fill="currentColor" />
        <circle cx="15" cy="17" r="2" fill="currentColor" />
      </>
    ),
    group: (
      <>
        <rect x="3" y="4" width="18" height="5" rx="1.5" />
        <path d="M7 13h14M7 18h14M3 13h.1M3 18h.1" />
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
    box: (
      <>
        <path d="m12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v9M7 5.5l9 5" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M16 5V3H7a4 4 0 0 0-4 4m18 4h-6v5h6" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1 1-1 2.2M12 17h.01" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H4v16h6m4-12 4 4-4 4M8 12h12" />
      </>
    ),
    panel: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16m7-11-3 3 3 3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18" />
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
        <path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
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
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
type Status = "new" | "processing" | "done" | "cancelled";
type Order = {
  id: number;
  name: string;
  email: string;
  date: string;
  amount: number;
  status: Status;
  payment: string;
  items: number;
};
const statuses: Record<
  Status,
  { label: string; plural: string; icon: IconName }
> = {
  new: { label: "Новый", plural: "Новые", icon: "box" },
  processing: { label: "В обработке", plural: "В обработке", icon: "clock" },
  done: { label: "Выполнен", plural: "Выполненные", icon: "check" },
  cancelled: { label: "Отменён", plural: "Отменённые", icon: "close" },
};
const people = [
  ["Александр Иванов", "alex.ivanov@gmail.com"],
  ["Мария Смирнова", "m.smirnova@mail.ru"],
  ["Дмитрий Козлов", "d.kozlov@gmail.com"],
  ["Анна Петрова", "anna.petrova@yandex.ru"],
  ["Михаил Соколов", "m.sokolov@mail.ru"],
  ["Екатерина Волкова", "kate.volkova@gmail.com"],
  ["Андрей Морозов", "andrey.m@yandex.ru"],
  ["Ольга Новикова", "olga.novikova@mail.ru"],
  ["Сергей Попов", "s.popov@gmail.com"],
  ["Елена Васильева", "elena.v@mail.ru"],
  ["Иван Фёдоров", "ivan.f@gmail.com"],
  ["Анастасия Орлова", "a.orlova@yandex.ru"],
];
const initialOrders: Order[] = Array.from({ length: 48 }, (_, i) => ({
  id: 1048 - i,
  name: people[i % 12][0],
  email: people[i % 12][1],
  date: `2026-11-${String(5 - Math.floor(i / 12)).padStart(2, "0")}`,
  amount: [
    12900, 8450, 24990, 5600, 18300, 7990, 34500, 4200, 15800, 9800, 21500,
    6400,
  ][i % 12],
  status: (["new", "processing", "done", "cancelled"] as Status[])[
    Math.floor(i / 3) % 4
  ],
  payment: i % 7 === 0 ? "Ожидает оплаты" : i % 12 >= 9 ? "Возврат" : "Оплачен",
  items: (i % 4) + 1,
}));
type Col = "id" | "customer" | "date" | "amount" | "status" | "payment";
const allColumns: Col[] = [
  "id",
  "customer",
  "date",
  "amount",
  "status",
  "payment",
];
const columnNames: Record<Col, string> = {
  id: "Заказ",
  customer: "Клиент",
  date: "Дата создания",
  amount: "Сумма",
  status: "Статус",
  payment: "Оплата",
};
const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .join("");
function Badge({ status }: { status: Status }) {
  return (
    <span className={`badge ${status}`}>
      <span className="status-dot" />
      {statuses[status].label}
    </span>
  );
}
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function App() {
  const [collapsed, setCollapsed] = useState(() =>
    read("orbit-sidebar", false),
  );
  const [section, setSection] = useState("Заказы");
  const [orders, setOrders] = useState<Order[]>(() =>
    read("orbit-orders", initialOrders),
  );
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Status | "all">("all");
  const [grouped, setGrouped] = useState(true);
  const [closedGroups, setClosedGroups] = useState<Status[]>([]);
  const [columns, setColumns] = useState<Col[]>(allColumns);
  const [hidden, setHidden] = useState<Col[]>([]);
  const [dragged, setDragged] = useState<Col | null>(null);
  const [overCol, setOverCol] = useState<Col | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [popup, setPopup] = useState<string | null>(null);
  const [paidOnly, setPaidOnly] = useState(false);
  const [recentOnly, setRecentOnly] = useState(false);
  const [detail, setDetail] = useState<Order | null>(null);
  const [create, setCreate] = useState(false);
  const [toast, setToast] = useState("");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [workspace, setWorkspace] = useState(() =>
    read("orbit-name", "Мой магазин"),
  );
  const [emailAlerts, setEmailAlerts] = useState(() =>
    read("orbit-alerts", true),
  );
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    localStorage.setItem("orbit-sidebar", JSON.stringify(collapsed));
  }, [collapsed]);
  useEffect(() => {
    localStorage.setItem("orbit-orders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    setPage(1);
  }, [query, tab, paidOnly, recentOnly, pageSize]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setPopup(null);
        setDetail(null);
        setCreate(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (!popup) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(
          ".floating, .popup-anchor, .workspace, .profile, .notification-button, .support-card",
        )
      ) {
        setPopup(null);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [popup]);
  const modalOpen = create || Boolean(detail);
  useEffect(() => {
    if (!modalOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]',
        ) || [],
      );
    if (!dialog?.contains(document.activeElement)) focusable()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trap);
      previousFocus?.focus();
    };
  }, [modalOpen]);
  const filtered = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            (tab === "all" || o.status === tab) &&
            (!paidOnly || o.payment === "Оплачен") &&
            (!recentOnly || o.date === "2026-11-05") &&
            `${o.id} ${o.name} ${o.email}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) => (sort === "desc" ? b.id - a.id : a.id - b.id)),
    [orders, query, tab, paidOnly, recentOnly, sort],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleOrders = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const visibleColumns = columns.filter((c) => !hidden.includes(c));
  const groups = grouped
    ? (Object.keys(statuses) as Status[])
        .map((status) => ({
          status,
          rows: visibleOrders.filter((o) => o.status === status),
        }))
        .filter((g) => g.rows.length)
    : [{ status: null, rows: visibleOrders }];
  const allSelected =
    visibleOrders.length > 0 &&
    visibleOrders.every((o) => selected.includes(o.id));
  const toggleAll = () =>
    setSelected(
      allSelected
        ? selected.filter((id) => !visibleOrders.some((o) => o.id === id))
        : [...new Set([...selected, ...visibleOrders.map((o) => o.id)])],
    );
  const toggleRow = (id: number) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  const togglePopup = (name: string) =>
    setPopup((p) => (p === name ? null : name));
  const exportCSV = () => {
    const list = selected.length
      ? orders.filter((o) => selected.includes(o.id))
      : filtered;
    const rows = [
      ["Заказ", "Клиент", "Email", "Дата", "Сумма", "Статус"],
      ...list.map((o) => [
        o.id,
        o.name,
        o.email,
        o.date,
        o.amount,
        statuses[o.status].label,
      ]),
    ];
    const blob = new Blob(
      [
        "\ufeff" +
          rows
            .map((row) =>
              row
                .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
                .join(";"),
            )
            .join("\n"),
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "orders.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    setToast(`Экспортировано заказов: ${list.length}`);
  };
  const changeStatus = (order: Order, status: Status) => {
    const updated = { ...order, status };
    setOrders((list) => list.map((o) => (o.id === order.id ? updated : o)));
    setDetail(updated);
    setToast("Статус заказа обновлён");
  };
  const renderCell = (order: Order, column: Col) => {
    switch (column) {
      case "id":
        return <span className="order-id">#{order.id}</span>;
      case "customer":
        return (
          <div className="customer">
            <span className={`avatar color-${order.id % 6}`}>
              {initials(order.name)}
            </span>
            <div>
              <strong>{order.name}</strong>
              <small>{order.email}</small>
            </div>
          </div>
        );
      case "date":
        return (
          <span className="date-cell">
            {new Date(order.date + "T12:00:00")
              .toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .replace(" г.", "")}
          </span>
        );
      case "amount":
        return <strong className="amount">{money(order.amount)}</strong>;
      case "status":
        return <Badge status={order.status} />;
      case "payment":
        return (
          <span
            className={`payment ${order.payment === "Оплачен" ? "paid" : ""}`}
          >
            <span />
            {order.payment}
          </span>
        );
    }
  };
  return (
    <div className={`app ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSection("Главная");
          }}
        >
          <span className="brand-symbol">
            <i />
            <i />
            <i />
          </span>
          {!collapsed && (
            <span>
              orbit<span className="brand-period">.</span>
            </span>
          )}
        </a>
        <button
          className="workspace"
          onClick={() => togglePopup("workspace")}
          title={workspace}
        >
          <span className="store-icon">
            <Icon name="box" size={19} />
          </span>
          {!collapsed && (
            <>
              <span>
                <strong>{workspace}</strong>
                <small>Рабочее пространство</small>
              </span>
              <Icon name="chevron" size={13} />
            </>
          )}
        </button>
        {popup === "workspace" && (
          <div className="workspace-pop floating">
            <strong>{workspace}</strong>
            <p>Ваше рабочее пространство</p>
            <button
              onClick={() => {
                setSection("Настройки");
                setPopup(null);
              }}
            >
              Настроить магазин <Icon name="settings" size={15} />
            </button>
          </div>
        )}
        {!collapsed && <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>}
        <nav>
          {(
            [
              { name: "Главная", icon: "grid" },
              { name: "Пользователи", icon: "users" },
              { name: "Заказы", icon: "orders" },
              { name: "Настройки", icon: "settings" },
            ] as { name: string; icon: IconName }[]
          ).map((item) => (
            <button
              key={item.name}
              className={`nav-item ${section === item.name ? "active" : ""}`}
              onClick={() => {
                setSection(item.name);
                setPopup(null);
              }}
              title={collapsed ? item.name : undefined}
            >
              <Icon name={item.icon} />
              {!collapsed && (
                <>
                  <span>{item.name}</span>
                  {item.name === "Заказы" && (
                    <span className="nav-count">{orders.length}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="support-card">
              <span className="support-icon">
                <Icon name="help" size={20} />
              </span>
              <strong>Всё под контролем</strong>
              <p>
                Мы рядом, если нужна помощь
                <br />с вашим магазином.
              </p>
              <button onClick={() => togglePopup("help")}>
                Центр помощи <Icon name="external" size={13} />
              </button>
            </div>
          )}
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          >
            <Icon name="panel" />
            {!collapsed && <span>Свернуть меню</span>}
          </button>
          <button
            className="profile"
            onClick={() => togglePopup("profile")}
            title="Профиль администратора"
          >
            <span className="profile-avatar">АК</span>
            {!collapsed && (
              <>
                <span>
                  <strong>Алексей Ковалёв</strong>
                  <small>Администратор</small>
                </span>
                <Icon name="more" size={18} />
              </>
            )}
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <Icon name="grid" size={16} />
            <span>Рабочее пространство</span>
            <span className="slash">/</span>
            <strong>{section}</strong>
          </div>
          <div className="top-actions">
            <button
              className="quick-search"
              onClick={() => {
                setSection("Заказы");
                setTimeout(() => searchRef.current?.focus(), 0);
              }}
            >
              <Icon name="search" size={16} />
              <span>Быстрый поиск</span>
              <kbd>⌘ K</kbd>
            </button>
            <span className="top-divider" />
            <button
              className="icon-button notification-button"
              title="Уведомления"
              onClick={() => togglePopup("notifications")}
            >
              <Icon name="bell" size={20} />
              <i />
            </button>
            <span className="small-profile">АК</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ МАГАЗИН В ДЕТАЛЯХ</div>
              <h1>{section === "Главная" ? "Обзор магазина" : section}</h1>
              <p>
                {section === "Заказы"
                  ? "Управляйте заказами и следите за каждым этапом."
                  : section === "Пользователи"
                    ? "Ваши клиенты и история их покупок."
                    : section === "Настройки"
                      ? "Настройте рабочее пространство под себя."
                      : "Все ключевые показатели в одном месте."}
              </p>
            </div>
            {(section === "Заказы" || section === "Главная") && (
              <button
                className="button primary"
                onClick={() => setCreate(true)}
              >
                <Icon name="plus" size={18} />
                Создать заказ
              </button>
            )}
          </div>
          {(section === "Заказы" || section === "Главная") && (
            <>
              <div className="metrics">
                {[
                  {
                    title: "Всего заказов",
                    value: String(orders.length),
                    icon: "orders",
                    change: "+12,8%",
                    note: "за этот месяц",
                    color: "neutral",
                  },
                  {
                    title: "В обработке",
                    value: String(
                      orders.filter((o) => o.status === "processing").length,
                    ),
                    icon: "clock",
                    change: "+4",
                    note: "сегодня",
                    color: "orange",
                  },
                  {
                    title: "Выполнено",
                    value: String(
                      orders.filter((o) => o.status === "done").length,
                    ),
                    icon: "check",
                    change: "+18,6%",
                    note: "за этот месяц",
                    color: "green",
                  },
                  {
                    title: "Выручка",
                    value: money(
                      orders
                        .filter((o) => o.payment === "Оплачен")
                        .reduce((sum, o) => sum + o.amount, 0),
                    ),
                    icon: "wallet",
                    change: "+8,2%",
                    note: "за этот месяц",
                    color: "purple",
                  },
                ].map((metric, i) => (
                  <div className="metric-card" key={metric.title}>
                    <div className="metric-top">
                      <span>{metric.title}</span>
                      <span className={`metric-icon ${metric.color}`}>
                        <Icon name={metric.icon as IconName} size={18} />
                      </span>
                    </div>
                    <div className="metric-value">
                      {metric.value}
                      <svg
                        className={`sparkline spark-${i}`}
                        viewBox="0 0 90 32"
                      >
                        <path
                          d={
                            [
                              "M1 29 12 21 22 25 33 14 44 19 56 10 67 13 79 3 89 6",
                              "M1 22 12 26 22 18 33 21 44 11 56 17 67 7 79 13 89 6",
                              "M1 29 12 24 22 27 33 16 44 20 56 9 67 13 79 4 89 7",
                              "M1 27 12 20 22 24 33 13 44 17 56 6 67 12 79 4 89 7",
                            ][i]
                          }
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="metric-foot">
                      <span
                        className={i === 1 ? "change-orange" : "change-green"}
                      >
                        <Icon name="arrow" size={12} />
                        {metric.change}
                      </span>
                      <span>{metric.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {section === "Главная" && (
            <div className="overview-card">
              <div>
                <h2>Заказы за неделю</h2>
                <p>Активность покупателей вашего магазина</p>
              </div>
              <div className="bar-chart">
                {[35, 52, 42, 73, 59, 92, 66].map((height, i) => (
                  <div key={i}>
                    <span className="bar-value">{Math.round(height / 4)}</span>
                    <div style={{ height: height * 2.3 }} />
                    <small>
                      {["Пт", "Сб", "Вс", "Пн", "Вт", "Ср", "Чт"][i]}
                    </small>
                  </div>
                ))}
              </div>
              <button className="button" onClick={() => setSection("Заказы")}>
                Перейти к заказам <Icon name="chevron" size={14} />
              </button>
            </div>
          )}
          {section === "Заказы" && (
            <section className="orders-card">
              <div className="table-card-header">
                <div className="table-title">
                  <h2>Все заказы</h2>
                  <span className="total-badge">{orders.length}</span>
                </div>
                <button className="button export-button" onClick={exportCSV}>
                  <Icon name="download" size={16} />
                  Экспорт
                </button>
              </div>
              <div className="tabs" role="tablist">
                {(
                  ["all", "new", "processing", "done", "cancelled"] as const
                ).map((status) => (
                  <button
                    role="tab"
                    aria-selected={tab === status}
                    key={status}
                    onClick={() => setTab(status)}
                    className={tab === status ? "selected-tab" : ""}
                  >
                    {status === "all" ? "Все заказы" : statuses[status].plural}
                    <span>
                      {status === "all"
                        ? orders.length
                        : orders.filter((o) => o.status === status).length}
                    </span>
                  </button>
                ))}
              </div>
              <div className="table-toolbar">
                <div className="search-field">
                  <Icon name="search" size={17} />
                  <input
                    ref={searchRef}
                    placeholder="Поиск по номеру или клиенту..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Поиск заказов"
                  />
                  {query && (
                    <button title="Очистить поиск" onClick={() => setQuery("")}>
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>
                <div className="toolbar-actions">
                  <div className="popup-anchor">
                    <button
                      className={`button ${paidOnly || recentOnly ? "filter-active" : ""}`}
                      onClick={() => togglePopup("filters")}
                    >
                      <Icon name="filter" size={16} />
                      Фильтры
                      {(paidOnly || recentOnly) && (
                        <span className="filter-dot" />
                      )}
                    </button>
                    {popup === "filters" && (
                      <div className="floating filter-pop">
                        <h3>Фильтры заказов</h3>
                        <label>
                          <input
                            type="checkbox"
                            checked={paidOnly}
                            onChange={(e) => setPaidOnly(e.target.checked)}
                          />
                          Только оплаченные
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={recentOnly}
                            onChange={(e) => setRecentOnly(e.target.checked)}
                          />
                          Созданы сегодня
                        </label>
                        <button
                          className="text-button"
                          onClick={() => {
                            setPaidOnly(false);
                            setRecentOnly(false);
                          }}
                        >
                          Сбросить фильтры
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="popup-anchor">
                    <button
                      className={`button group-button ${grouped ? "is-grouped" : ""}`}
                      onClick={() => togglePopup("group")}
                    >
                      <Icon name="group" size={16} />
                      <span>{grouped ? "По статусу" : "Без группировки"}</span>
                      <Icon name="chevron" size={12} className="rotate-down" />
                    </button>
                    {popup === "group" && (
                      <div className="floating menu-pop">
                        <span className="popover-label">ГРУППИРОВКА</span>
                        {[true, false].map((value) => (
                          <button
                            key={String(value)}
                            onClick={() => {
                              setGrouped(value);
                              setPopup(null);
                            }}
                          >
                            {value ? "По статусу заказа" : "Без группировки"}
                            {grouped === value && (
                              <Icon name="check" size={15} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="popup-anchor">
                    <button
                      className="button"
                      onClick={() => togglePopup("columns")}
                    >
                      <Icon name="columns" size={16} />
                      <span className="columns-label">Колонки</span>
                    </button>
                    {popup === "columns" && (
                      <div className="floating columns-pop">
                        <h3>Видимые колонки</h3>
                        <p>Перетащите заголовок, чтобы изменить порядок.</p>
                        {columns.map((col) => (
                          <label key={col}>
                            <input
                              type="checkbox"
                              checked={!hidden.includes(col)}
                              disabled={
                                !hidden.includes(col) &&
                                visibleColumns.length === 1
                              }
                              onChange={(e) =>
                                setHidden(
                                  e.target.checked
                                    ? hidden.filter((c) => c !== col)
                                    : [...hidden, col],
                                )
                              }
                            />
                            {columnNames[col]}
                          </label>
                        ))}
                        <button
                          className="text-button"
                          onClick={() => {
                            setColumns(allColumns);
                            setHidden([]);
                          }}
                        >
                          Сбросить настройки
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {selected.length > 0 && (
                <div className="selection-bar">
                  <span>
                    <Icon name="check" size={15} />
                    Выбрано: {selected.length}
                  </span>
                  <button onClick={exportCSV}>Экспортировать</button>
                  <button
                    onClick={() => {
                      setOrders((list) =>
                        list.map((o) =>
                          selected.includes(o.id)
                            ? { ...o, status: "processing" }
                            : o,
                        ),
                      );
                      setSelected([]);
                      setToast("Выбранные заказы переданы в обработку");
                    }}
                  >
                    В обработку
                  </button>
                  <button
                    title="Снять выделение"
                    onClick={() => setSelected([])}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              )}
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <input
                          type="checkbox"
                          aria-label="Выбрать все заказы на странице"
                          checked={allSelected}
                          ref={(el) => {
                            if (el)
                              el.indeterminate =
                                !allSelected &&
                                visibleOrders.some((o) =>
                                  selected.includes(o.id),
                                );
                          }}
                          onChange={toggleAll}
                        />
                      </th>
                      {visibleColumns.map((col) => (
                        <th
                          key={col}
                          draggable
                          onDragStart={(e) => {
                            setDragged(col);
                            e.dataTransfer.setData("text/plain", col);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setOverCol(col);
                          }}
                          onDragLeave={() => setOverCol(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (dragged && dragged !== col) {
                              const next = columns.filter((c) => c !== dragged);
                              next.splice(next.indexOf(col), 0, dragged);
                              setColumns(next);
                            }
                            setDragged(null);
                            setOverCol(null);
                          }}
                          onDragEnd={() => {
                            setDragged(null);
                            setOverCol(null);
                          }}
                          className={`${overCol === col ? "drag-over" : ""} col-${col}`}
                          title="Перетащите для изменения порядка"
                        >
                          <span>
                            {columnNames[col]}
                            {col === "id" ? (
                              <button
                                className="sort-button"
                                title="Изменить сортировку заказов"
                                onClick={() =>
                                  setSort(sort === "desc" ? "asc" : "desc")
                                }
                              >
                                {sort === "desc" ? "↓" : "↑"}
                              </button>
                            ) : (
                              <Icon
                                name="grip"
                                size={12}
                                className="column-grip"
                              />
                            )}
                          </span>
                        </th>
                      ))}
                      <th className="row-actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => (
                      <OrderGroup
                        key={group.status || "all"}
                        status={group.status}
                        count={group.rows.length}
                        colspan={visibleColumns.length + 2}
                        closed={
                          group.status
                            ? closedGroups.includes(group.status)
                            : false
                        }
                        toggle={() =>
                          group.status &&
                          setClosedGroups((s) =>
                            s.includes(group.status!)
                              ? s.filter((x) => x !== group.status)
                              : [...s, group.status!],
                          )
                        }
                      >
                        {group.rows.map((order) => (
                          <tr
                            key={order.id}
                            className={`order-row ${selected.includes(order.id) ? "row-selected" : ""}`}
                            onClick={() => setDetail(order)}
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (
                                event.target === event.currentTarget &&
                                event.key === "Enter"
                              )
                                setDetail(order);
                            }}
                          >
                            <td
                              className="checkbox-cell"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={selected.includes(order.id)}
                                onChange={() => toggleRow(order.id)}
                                aria-label={`Выбрать заказ ${order.id}`}
                              />
                            </td>
                            {visibleColumns.map((col) => (
                              <td key={col}>{renderCell(order, col)}</td>
                            ))}
                            <td className="row-actions">
                              <button
                                className="icon-button"
                                title={`Открыть заказ ${order.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetail(order);
                                }}
                              >
                                <Icon name="more" size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </OrderGroup>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={visibleColumns.length + 2}>
                          <div className="empty-state">
                            <Icon name="search" size={30} />
                            <h3>Заказы не найдены</h3>
                            <p>
                              Попробуйте другой запрос или измените фильтры.
                            </p>
                            <button
                              className="button"
                              onClick={() => {
                                setQuery("");
                                setTab("all");
                                setPaidOnly(false);
                                setRecentOnly(false);
                              }}
                            >
                              Сбросить поиск
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
                    {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                    {Math.min(currentPage * pageSize, filtered.length)}
                  </strong>{" "}
                  из <strong>{filtered.length}</strong> заказов
                </span>
                <div className="pagination">
                  <span className="page-size-label">На странице</span>
                  <select
                    aria-label="Заказов на странице"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={9}>9</option>
                    <option value={18}>18</option>
                    <option value={48}>48</option>
                  </select>
                  <button
                    disabled={currentPage === 1}
                    title="Предыдущая страница"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <Icon name="chevron" size={13} className="rotate-back" />
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        className={currentPage === n ? "current-page" : ""}
                        key={n}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    disabled={currentPage === pageCount}
                    title="Следующая страница"
                    onClick={() => setPage(currentPage + 1)}
                  >
                    <Icon name="chevron" size={13} />
                  </button>
                </div>
              </div>
            </section>
          )}
          {section === "Пользователи" && (
            <section className="users-card">
              <div className="section-card-heading">
                <h2>
                  Клиенты магазина{" "}
                  <span className="total-badge">
                    {new Set(orders.map((o) => o.email)).size}
                  </span>
                </h2>
              </div>
              <div className="user-grid">
                {[...new Map(orders.map((o) => [o.email, o])).values()].map(
                  (person, i) => (
                    <button
                      className="user-card"
                      key={person.email}
                      onClick={() => {
                        setQuery(person.email);
                        setTab("all");
                        setSection("Заказы");
                      }}
                    >
                      <span className={`avatar color-${i % 6}`}>
                        {initials(person.name)}
                      </span>
                      <strong>{person.name}</strong>
                      <small>{person.email}</small>
                      <span>
                        {orders.filter((o) => o.email === person.email).length}{" "}
                        заказа <Icon name="chevron" size={12} />
                      </span>
                    </button>
                  ),
                )}
              </div>
            </section>
          )}
          {section === "Настройки" && (
            <section className="settings-card">
              <h2>Основные настройки</h2>
              <p>Информация о вашем рабочем пространстве</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  localStorage.setItem("orbit-name", JSON.stringify(workspace));
                  localStorage.setItem(
                    "orbit-alerts",
                    JSON.stringify(emailAlerts),
                  );
                  setToast("Настройки сохранены");
                }}
              >
                <label className="form-label">
                  Название магазина
                  <input
                    required
                    value={workspace}
                    onChange={(e) => setWorkspace(e.target.value)}
                  />
                </label>
                <label className="settings-switch">
                  <span>
                    <strong>Уведомления о новых заказах</strong>
                    <small>Получать уведомления по электронной почте</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                  />
                </label>
                <button className="button primary" type="submit">
                  Сохранить изменения
                </button>
              </form>
            </section>
          )}
          <div className="page-bottom">
            <span>
              <span className="live-dot" />
              Все изменения сохранены
            </span>
            <span>
              Сделано для вашего бизнеса{" "}
              <span className="tiny-brand">orbit.</span>
            </span>
          </div>
        </main>
      </div>
      {["notifications", "help", "profile"].includes(popup || "") && (
        <>
          <div className="popup-backdrop" onClick={() => setPopup(null)} />
          <div
            className={`floating global-pop ${popup === "help" ? "help-pop" : ""}`}
          >
            <button
              className="icon-button pop-close"
              title="Закрыть"
              onClick={() => setPopup(null)}
            >
              <Icon name="close" />
            </button>
            {popup === "notifications" ? (
              <>
                <h3>Уведомления</h3>
                <div className="notification-item">
                  <span className="metric-icon green">
                    <Icon name="orders" />
                  </span>
                  <div>
                    <strong>Добро пожаловать в Orbit</strong>
                    <p>
                      У вас {orders.filter((o) => o.status === "new").length}{" "}
                      новых заказов. Самое время проверить их.
                    </p>
                    <small>Сегодня, 09:00</small>
                  </div>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setSection("Заказы");
                    setTab("new");
                    setPopup(null);
                  }}
                >
                  Посмотреть новые заказы →
                </button>
              </>
            ) : popup === "help" ? (
              <>
                <h3>Как работать с заказами</h3>
                <p>
                  Отмечайте заказы флажками для массовой обработки и экспорта.
                </p>
                <p>
                  Перетащите заголовок колонки, чтобы изменить её положение.
                  Нажмите «По статусу», чтобы включить или выключить
                  группировку.
                </p>
                <p>
                  Нажмите на заказ, чтобы посмотреть подробности и изменить
                  статус.
                </p>
                <span className="help-tip">Быстрый поиск: Ctrl / ⌘ + K</span>
              </>
            ) : (
              <>
                <span className="profile-avatar">АК</span>
                <h3>Алексей Ковалёв</h3>
                <p>Администратор · {workspace}</p>
                <button
                  className="button"
                  onClick={() => {
                    setSection("Настройки");
                    setPopup(null);
                  }}
                >
                  <Icon name="settings" size={16} />
                  Настройки профиля
                </button>
              </>
            )}
          </div>
        </>
      )}
      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <aside
            className="detail-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Заказ ${detail.id}`}
          >
            <div className="drawer-header">
              <span>ПОДРОБНОСТИ ЗАКАЗА</span>
              <button
                className="icon-button"
                title="Закрыть карточку"
                onClick={() => setDetail(null)}
              >
                <Icon name="close" />
              </button>
            </div>
            <h2>Заказ #{detail.id}</h2>
            <Badge status={detail.status} />
            <div className="detail-section">
              <h3>Клиент</h3>
              <div className="customer">
                <span className={`avatar color-${detail.id % 6}`}>
                  {initials(detail.name)}
                </span>
                <div>
                  <strong>{detail.name}</strong>
                  <small>{detail.email}</small>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h3>Информация о заказе</h3>
              <dl>
                <div>
                  <dt>Дата создания</dt>
                  <dd>{new Date(detail.date).toLocaleDateString("ru-RU")}</dd>
                </div>
                <div>
                  <dt>Количество товаров</dt>
                  <dd>{detail.items}</dd>
                </div>
                <div>
                  <dt>Оплата</dt>
                  <dd>{detail.payment}</dd>
                </div>
                <div className="detail-total">
                  <dt>Итого</dt>
                  <dd>{money(detail.amount)}</dd>
                </div>
              </dl>
            </div>
            <label className="form-label">
              Статус заказа
              <select
                value={detail.status}
                onChange={(e) => changeStatus(detail, e.target.value as Status)}
              >
                {(Object.keys(statuses) as Status[]).map((s) => (
                  <option value={s} key={s}>
                    {statuses[s].label}
                  </option>
                ))}
              </select>
            </label>
            <p className="drawer-note">
              <Icon name="check" size={14} />
              Изменения сохраняются автоматически
            </p>
          </aside>
        </div>
      )}
      {create && (
        <div
          className="modal-backdrop centered"
          onClick={() => setCreate(false)}
        >
          <div
            className="create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">НОВАЯ ПРОДАЖА</span>
                <h2 id="create-title">Создать заказ</h2>
              </div>
              <button
                className="icon-button"
                title="Закрыть"
                onClick={() => setCreate(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const order: Order = {
                  id: Math.max(...orders.map((o) => o.id)) + 1,
                  name: String(data.get("name")).trim(),
                  email: String(data.get("email")).trim(),
                  amount: Number(data.get("amount")),
                  date: "2026-11-05",
                  status: "new",
                  payment: "Ожидает оплаты",
                  items: Number(data.get("items")),
                };
                setOrders([order, ...orders]);
                setCreate(false);
                setSection("Заказы");
                setTab("all");
                setQuery("");
                setPage(1);
                setSort("desc");
                setPaidOnly(false);
                setRecentOnly(false);
                setToast(`Заказ #${order.id} создан`);
              }}
            >
              <label className="form-label">
                Имя клиента
                <input
                  autoFocus
                  name="name"
                  required
                  placeholder="Например, Анна Петрова"
                />
              </label>
              <label className="form-label">
                Электронная почта
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="client@example.com"
                />
              </label>
              <div className="form-row">
                <label className="form-label">
                  Сумма, ₽
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="0"
                  />
                </label>
                <label className="form-label">
                  Количество товаров
                  <input
                    name="items"
                    type="number"
                    min="1"
                    defaultValue="1"
                    required
                  />
                </label>
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="button"
                  onClick={() => setCreate(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="button primary">
                  <Icon name="plus" size={16} />
                  Создать заказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
          <button title="Закрыть уведомление" onClick={() => setToast("")}>
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function OrderGroup({
  status,
  count,
  colspan,
  closed,
  toggle,
  children,
}: {
  status: Status | null;
  count: number;
  colspan: number;
  closed: boolean;
  toggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {status && (
        <tr className={`group-row group-${status}`}>
          <td colSpan={colspan}>
            <button onClick={toggle} aria-expanded={!closed}>
              <Icon
                name="chevron"
                size={12}
                className={closed ? "" : "rotate-down"}
              />
              <span className={`group-dot ${status}`} />
              <strong>{statuses[status].plural}</strong>
              <span className="group-count">{count}</span>
            </button>
          </td>
        </tr>
      )}
      {!closed && children}
    </>
  );
}
