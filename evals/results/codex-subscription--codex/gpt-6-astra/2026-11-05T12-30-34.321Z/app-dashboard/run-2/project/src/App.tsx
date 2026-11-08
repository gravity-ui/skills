import { useEffect, useMemo, useRef, useState } from "react";
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
  | "filter"
  | "columns"
  | "group"
  | "arrow"
  | "help"
  | "logout"
  | "collapse"
  | "close"
  | "check"
  | "calendar"
  | "clock"
  | "box"
  | "wallet"
  | "dots"
  | "grip"
  | "external";
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
    bag: (
      <>
        <rect x="4" y="7" width="16" height="14" rx="3" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-1 3-3 1-2 3 2 2-1 3 2 3 3-1 2 3h3l1-3 3-1 2-3-2-2 1-3-2-3-3 1-2-3Z" />
        <circle cx="11.5" cy="11.5" r="3" />
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
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M7 12h10m-7 5h4" />
        <circle cx="8" cy="7" r="2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
      </>
    ),
    columns: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16m6-16v16" />
      </>
    ),
    group: (
      <>
        <rect x="4" y="3" width="16" height="5" rx="1" />
        <rect x="4" y="12" width="6" height="8" rx="1" />
        <rect x="14" y="12" width="6" height="8" rx="1" />
      </>
    ),
    arrow: <path d="m5 16 6-6 4 3 5-8m-5 0h5v5" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5.7-1.5 1.5-1.5 2M12 17h.01" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5m6-12 4 4-4 4M8 12h11" />
      </>
    ),
    collapse: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16m7-11-3 3 3 3" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18m-13 4h.01m4 0h.01m4 0h.01" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    box: (
      <>
        <path d="m3 7 9-5 9 5v10l-9 5-9-5Zm0 0 9 5 9-5M12 12v10M7 4.8l10 5.5" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M3 9h18m-5 5h5M6 5V3h11" />
      </>
    ),
    dots: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
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
type Status = "В обработке" | "В доставке" | "Выполнен" | "Отменён";
type Order = {
  id: string;
  name: string;
  email: string;
  date: string;
  sum: number;
  status: Status;
  paid: boolean;
  items: number;
  color: string;
};
const initialOrders: Order[] = [
  [
    "1048",
    "Анна Смирнова",
    "anna.smirnova@mail.ru",
    "2024-06-24",
    12450,
    "В обработке",
    true,
    3,
    "purple",
  ],
  [
    "1047",
    "Михаил Козлов",
    "m.kozlov@gmail.com",
    "2024-06-24",
    5890,
    "В обработке",
    false,
    2,
    "blue",
  ],
  [
    "1046",
    "Елена Волкова",
    "elena.volkova@mail.ru",
    "2024-06-24",
    23100,
    "В обработке",
    true,
    5,
    "rose",
  ],
  [
    "1045",
    "Дмитрий Соколов",
    "d.sokolov@yandex.ru",
    "2024-06-23",
    8750,
    "В доставке",
    true,
    2,
    "blue",
  ],
  [
    "1044",
    "Ольга Новикова",
    "olga.novikova@gmail.com",
    "2024-06-23",
    15600,
    "В доставке",
    true,
    4,
    "pink",
  ],
  [
    "1043",
    "Алексей Морозов",
    "a.morozov@mail.ru",
    "2024-06-23",
    3200,
    "В доставке",
    true,
    1,
    "mint",
  ],
  [
    "1042",
    "Мария Петрова",
    "m.petrova@yandex.ru",
    "2024-06-22",
    7990,
    "Выполнен",
    true,
    2,
    "peach",
  ],
  [
    "1041",
    "Иван Васильев",
    "ivan.v@gmail.com",
    "2024-06-22",
    18900,
    "Выполнен",
    true,
    3,
    "purple",
  ],
  [
    "1040",
    "Екатерина Орлова",
    "e.orlova@mail.ru",
    "2024-06-22",
    6450,
    "Выполнен",
    true,
    2,
    "pink",
  ],
  [
    "1039",
    "Сергей Попов",
    "sergey.p@mail.ru",
    "2024-06-21",
    4290,
    "Отменён",
    false,
    1,
    "blue",
  ],
  [
    "1038",
    "Виктория Белова",
    "v.belova@gmail.com",
    "2024-06-21",
    11200,
    "Выполнен",
    true,
    3,
    "mint",
  ],
  [
    "1037",
    "Андрей Лебедев",
    "a.lebedev@mail.ru",
    "2024-06-20",
    9300,
    "Выполнен",
    true,
    2,
    "peach",
  ],
  [
    "1036",
    "Дарья Павлова",
    "d.pavlova@mail.ru",
    "2024-06-20",
    2190,
    "В обработке",
    false,
    1,
    "rose",
  ],
  [
    "1035",
    "Никита Фёдоров",
    "n.fedorov@gmail.com",
    "2024-06-19",
    14500,
    "В доставке",
    true,
    4,
    "blue",
  ],
  [
    "1034",
    "София Алексеева",
    "s.alexeeva@mail.ru",
    "2024-06-19",
    6700,
    "Выполнен",
    true,
    2,
    "purple",
  ],
].map(
  (a) =>
    ({
      id: a[0],
      name: a[1],
      email: a[2],
      date: a[3],
      sum: a[4],
      status: a[5],
      paid: a[6],
      items: a[7],
      color: a[8],
    }) as Order,
);
const statusClass: Record<Status, string> = {
  "В обработке": "processing",
  "В доставке": "shipping",
  Выполнен: "completed",
  Отменён: "cancelled",
};
const columnsInitial = [
  { key: "id", label: "Заказ" },
  { key: "customer", label: "Клиент" },
  { key: "date", label: "Дата" },
  { key: "sum", label: "Сумма" },
  { key: "status", label: "Статус" },
  { key: "payment", label: "Оплата" },
  { key: "items", label: "Товары" },
];
function saved<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem("orbit-" + key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const dateFormat = (date: string) =>
  new Date(date + "T12:00:00")
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(" г.", "");
function Avatar({ name, color = "purple" }: { name: string; color?: string }) {
  return (
    <span className={"avatar " + color}>
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
function AppButton({
  children,
  icon,
  onClick,
  primary = false,
  className = "",
  title,
}: {
  children?: React.ReactNode;
  icon?: IconName;
  onClick?: () => void;
  primary?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <button
      title={title}
      className={`button ${primary ? "primary" : ""} ${className}`}
      onClick={onClick}
    >
      {icon && <Icon name={icon} size={17} />} {children}
    </button>
  );
}
export function App() {
  const [collapsed, setCollapsed] = useState(() => saved("collapsed", false)),
    [section, setSection] = useState("Заказы"),
    [orders, setOrders] = useState<Order[]>(() =>
      saved("orders", initialOrders),
    ),
    [search, setSearch] = useState(""),
    [tab, setTab] = useState("Все заказы"),
    [grouped, setGrouped] = useState(() => saved("grouped", true)),
    [selected, setSelected] = useState<Set<string>>(new Set()),
    [columns, setColumns] = useState(() => saved("columns", columnsInitial)),
    [hidden, setHidden] = useState<string[]>(() => saved("hidden", [])),
    [closed, setClosed] = useState<string[]>([]),
    [popup, setPopup] = useState<string | null>(null),
    [modal, setModal] = useState<"create" | "help" | null>(null),
    [detail, setDetail] = useState<Order | null>(null),
    [statusFilter, setStatusFilter] = useState("Все статусы"),
    [paymentFilter, setPaymentFilter] = useState("Любая оплата"),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10),
    [toast, setToast] = useState(""),
    [sort, setSort] = useState({ key: "date", asc: false }),
    [dragged, setDragged] = useState<string | null>(null),
    [storeName, setStoreName] = useState(() => saved("store", "Мой магазин")),
    [notifications, setNotifications] = useState(() =>
      saved("notifications", true),
    );
  const popupRef = useRef<HTMLDivElement>(null);
  const dialogOpen = Boolean(modal || detail);
  useEffect(() => {
    if (!dialogOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]',
        ) || [],
      );
    if (!dialog?.contains(document.activeElement)) focusable()[0]?.focus();
    const trapFocus = (event: KeyboardEvent) => {
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trapFocus);
      previousFocus?.focus();
    };
  }, [dialogOpen]);
  useEffect(() => {
    try {
      for (const [key, value] of Object.entries({
        orders,
        columns,
        hidden,
        grouped,
        collapsed,
        store: storeName,
        notifications,
      }))
        localStorage.setItem("orbit-" + key, JSON.stringify(value));
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  }, [orders, columns, hidden, grouped, collapsed, storeName, notifications]);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document
          .querySelector<HTMLInputElement>(".search-field input")
          ?.focus();
      }
      if (e.key === "Escape") {
        setModal(null);
        setDetail(null);
        setPopup(null);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    function close(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node))
        setPopup(null);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  useEffect(
    () => setPage(1),
    [search, tab, statusFilter, paymentFilter, pageSize],
  );
  const filtered = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            `${o.id} ${o.name} ${o.email}`
              .toLowerCase()
              .includes(search.toLowerCase()) &&
            (tab === "Все заказы" || o.status === tab) &&
            (statusFilter === "Все статусы" || o.status === statusFilter) &&
            (paymentFilter === "Любая оплата" ||
              o.paid === (paymentFilter === "Оплачено")),
        )
        .sort((a, b) => {
          let av: any =
            sort.key === "customer"
              ? a.name
              : sort.key === "payment"
                ? a.paid
                : a[sort.key as keyof Order];
          let bv: any =
            sort.key === "customer"
              ? b.name
              : sort.key === "payment"
                ? b.paid
                : b[sort.key as keyof Order];
          return (av > bv ? 1 : av < bv ? -1 : 0) * (sort.asc ? 1 : -1);
        }),
    [orders, search, tab, statusFilter, paymentFilter, sort],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleOrders = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const visibleColumns = columns.filter((c) => !hidden.includes(c.key));
  const groups = grouped
    ? (Object.keys(statusClass) as Status[])
        .map((s) => ({
          name: s,
          orders: visibleOrders.filter((o) => o.status === s),
        }))
        .filter((g) => g.orders.length)
    : [{ name: "", orders: visibleOrders }];
  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function selectAll() {
    setSelected((s) => {
      const next = new Set(s);
      const all = visibleOrders.every((o) => s.has(o.id));
      visibleOrders.forEach((o) => (all ? next.delete(o.id) : next.add(o.id)));
      return next;
    });
  }
  function exportOrders() {
    const data = selected.size
      ? filtered.filter((o) => selected.has(o.id))
      : filtered;
    const blob = new Blob(
      [
        "\uFEFFЗаказ;Клиент;Email;Дата;Сумма;Статус;Оплата\n" +
          data
            .map((o) =>
              [
                o.id,
                o.name,
                o.email,
                o.date,
                o.sum,
                o.status,
                o.paid ? "Оплачено" : "Ожидает оплаты",
              ]
                .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
                .join(";"),
            )
            .join("\n"),
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast(`Экспортировано заказов: ${data.length}`);
  }
  function createOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const order: Order = {
      id: String(Math.max(...orders.map((o) => +o.id)) + 1),
      name: String(data.get("name")),
      email: String(data.get("email")),
      date: new Date().toISOString().slice(0, 10),
      sum: Number(data.get("sum")),
      items: Number(data.get("items")),
      status: "В обработке",
      paid: false,
      color: "purple",
    };
    setOrders([order, ...orders]);
    setTab("Все заказы");
    setStatusFilter("Все статусы");
    setPaymentFilter("Любая оплата");
    setSearch("");
    setPage(1);
    setSort({ key: "date", asc: false });
    setModal(null);
    setToast(`Заказ #${order.id} создан`);
  }
  function cell(order: Order, key: string) {
    switch (key) {
      case "id":
        return (
          <button className="order-link" onClick={() => setDetail(order)}>
            #{order.id}
          </button>
        );
      case "customer":
        return (
          <div className="customer">
            <Avatar name={order.name} color={order.color} />
            <div>
              <span>{order.name}</span>
              <small>{order.email}</small>
            </div>
          </div>
        );
      case "date":
        return <span className="date-cell">{dateFormat(order.date)}</span>;
      case "sum":
        return <strong className="amount">{money(order.sum)}</strong>;
      case "status":
        return (
          <span className={"badge " + statusClass[order.status]}>
            <i />
            {order.status}
          </span>
        );
      case "payment":
        return (
          <span className={"payment " + (order.paid ? "paid" : "waiting")}>
            <span>
              {order.paid ? (
                <Icon name="check" size={11} />
              ) : (
                <Icon name="clock" size={12} />
              )}
            </span>
            {order.paid ? "Оплачено" : "Ожидает оплаты"}
          </span>
        );
      case "items":
        return <span className="item-count">{order.items} шт.</span>;
    }
  }
  const tabs = [
    "Все заказы",
    "В обработке",
    "В доставке",
    "Выполнен",
    "Отменён",
  ];
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
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          {!collapsed && (
            <>
              orbit<span className="brand-dot">.</span>
            </>
          )}
        </a>
        <button
          className="workspace-switch"
          onClick={() => setPopup(popup === "workspace" ? null : "workspace")}
          title={storeName}
        >
          <span className="store-icon">
            <Icon name="bag" size={19} />
          </span>
          {!collapsed && (
            <>
              <span>
                <strong>{storeName}</strong>
                <small>Рабочее пространство</small>
              </span>
              <span className="double-chevron">
                ⌃<br />⌄
              </span>
            </>
          )}
        </button>
        {popup === "workspace" && !collapsed && (
          <div className="workspace-info">
            Вы в пространстве «{storeName}»<small>Тариф Pro · 1 участник</small>
          </div>
        )}
        <div className="nav-caption">
          {collapsed ? "•••" : "РАБОЧЕЕ ПРОСТРАНСТВО"}
        </div>
        <nav>
          {(["Главная", "Пользователи", "Заказы", "Настройки"] as const).map(
            (name, i) => (
              <button
                key={name}
                title={name}
                className={"nav-item " + (section === name ? "active" : "")}
                onClick={() => {
                  setSection(name);
                  setSearch("");
                  setPopup(null);
                }}
              >
                <Icon
                  name={(["grid", "users", "bag", "settings"] as IconName[])[i]}
                />
                {!collapsed && (
                  <>
                    <span>{name}</span>
                    {name === "Заказы" && (
                      <span className="nav-count">{orders.length}</span>
                    )}
                  </>
                )}
              </button>
            ),
          )}
        </nav>
        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="pro-card">
              <span className="pro-spark">✧</span>
              <strong>Больше возможностей</strong>
              <p>
                Все инструменты для роста
                <br />
                вашего бизнеса — в одном месте.
              </p>
              <button onClick={() => setModal("help")}>
                Узнать о Pro <Icon name="external" size={14} />
              </button>
            </div>
          )}
          <button
            className="nav-item"
            title="Помощь и поддержка"
            onClick={() => setModal("help")}
          >
            <Icon name="help" />
            {!collapsed && <span>Помощь и поддержка</span>}
          </button>
          <button
            className="nav-item collapse-button"
            title={collapsed ? "Развернуть меню" : "Свернуть меню"}
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon name="collapse" />
            {!collapsed && <span>Свернуть меню</span>}
          </button>
          <div className="sidebar-profile">
            <Avatar name="Александр Ким" color="profile-avatar" />
            {!collapsed && (
              <>
                <div>
                  <strong>Александр Ким</strong>
                  <small>Администратор</small>
                </div>
                <button
                  title="Настройки профиля"
                  onClick={() => setSection("Настройки")}
                >
                  <Icon name="settings" size={17} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{section}</strong>
          </div>
          <div className="topbar-right">
            <span className="live-dot" />{" "}
            <span className="system-status">Все системы работают</span>
            <span className="topbar-divider" />
            <button
              className="notification-button"
              aria-label="Уведомления"
              onClick={() =>
                setPopup(popup === "notifications" ? null : "notifications")
              }
            >
              <Icon name="bell" />
              {notifications && <i />}
            </button>
            <button
              className="top-avatar"
              title="Профиль"
              onClick={() => setSection("Настройки")}
            >
              <Avatar name="Александр Ким" color="profile-avatar" />
            </button>
          </div>
          {popup === "notifications" && (
            <div className="notification-panel">
              <strong>Уведомления</strong>
              <p>
                <span className="live-dot" /> Все заказы синхронизированы
              </p>
              <small>Новых уведомлений пока нет</small>
              <button onClick={() => setPopup(null)}>Закрыть</button>
            </div>
          )}
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС ПОД КОНТРОЛЕМ</div>
              <h1>{section === "Главная" ? "Обзор магазина" : section}</h1>
              <p>
                {section === "Заказы"
                  ? "Управляйте заказами и следите за каждым этапом."
                  : section === "Главная"
                    ? "Всё самое важное о вашем бизнесе — в одном месте."
                    : section === "Пользователи"
                      ? "Ваши клиенты и история их покупок."
                      : "Управляйте рабочим пространством и личными предпочтениями."}
              </p>
            </div>
            {(section === "Заказы" || section === "Главная") && (
              <div className="heading-actions">
                <AppButton icon="download" onClick={exportOrders}>
                  Экспорт
                </AppButton>
                <AppButton
                  icon="plus"
                  primary
                  onClick={() => setModal("create")}
                >
                  Создать заказ
                </AppButton>
              </div>
            )}
          </div>
          {(section === "Заказы" || section === "Главная") && (
            <>
              <div className="stats-grid">
                {[
                  {
                    label: "Всего заказов",
                    value: "1 248",
                    change: "+12,8%",
                    icon: "bag",
                    type: "purple",
                    line: "0,35 10,32 20,36 30,23 40,27 50,21 60,24 70,10 80,15 90,6 100,9",
                  },
                  {
                    label: "В обработке",
                    value: String(
                      orders.filter((o) => o.status === "В обработке").length +
                        38,
                    ),
                    change: "+8,2%",
                    icon: "clock",
                    type: "amber",
                    line: "0,36 10,28 20,32 30,19 40,23 50,15 60,24 70,17 80,19 90,9 100,7",
                  },
                  {
                    label: "Выполнено",
                    value: "1 086",
                    change: "+16,4%",
                    icon: "box",
                    type: "green",
                    line: "0,38 10,31 20,34 30,26 40,29 50,16 60,22 70,12 80,17 90,5 100,8",
                  },
                  {
                    label: "Выручка",
                    value: "2 458 900 ₽",
                    change: "+18,6%",
                    icon: "wallet",
                    type: "purple",
                    line: "0,38 10,36 20,27 30,31 40,22 50,27 60,15 70,19 80,9 90,15 100,3",
                  },
                ].map((stat) => (
                  <div className="stat-card" key={stat.label}>
                    <div className="stat-top">
                      <span>{stat.label}</span>
                      <span className={"stat-icon " + stat.type}>
                        <Icon name={stat.icon as IconName} size={17} />
                      </span>
                    </div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-bottom">
                      <span className="stat-change">
                        <Icon name="arrow" size={13} />
                        {stat.change}
                      </span>
                      <span>к прошлому месяцу</span>
                    </div>
                    <svg
                      className={"sparkline " + stat.type}
                      width="106"
                      height="47"
                      viewBox="0 0 104 47"
                    >
                      <defs>
                        <linearGradient
                          id={"gradient" + stat.icon}
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="currentColor"
                            stopOpacity=".12"
                          />
                          <stop
                            offset="100%"
                            stopColor="currentColor"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d={
                          "M" +
                          stat.line.replaceAll(" ", " L") +
                          " L100,47 L0,47 Z"
                        }
                        fill={"url(#gradient" + stat.icon + ")"}
                      />
                      <polyline
                        points={stat.line}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ))}
              </div>
              <section className="orders-card">
                <div className="orders-title">
                  <div>
                    <h2>
                      {section === "Главная"
                        ? "Последние заказы"
                        : "Все заказы"}{" "}
                      <span>{orders.length}</span>
                    </h2>
                    <p>
                      Просматривайте, фильтруйте и управляйте вашими заказами
                    </p>
                  </div>
                  <button
                    className="period"
                    onClick={() =>
                      setPopup(popup === "period" ? null : "period")
                    }
                  >
                    <Icon name="calendar" size={16} /> Июнь, 2024{" "}
                    <Icon name="chevron" size={13} />
                  </button>
                  {popup === "period" && (
                    <div className="period-popover">
                      <strong>Период заказов</strong>
                      <p>Показаны все доступные заказы.</p>
                      <button
                        onClick={() => {
                          setSort({ key: "date", asc: !sort.asc });
                          setPopup(null);
                        }}
                      >
                        Сначала {sort.asc ? "новые" : "старые"}
                      </button>
                    </div>
                  )}
                </div>
                <div className="tabs" role="tablist">
                  {tabs.map((t) => (
                    <button
                      role="tab"
                      aria-selected={tab === t}
                      key={t}
                      onClick={() => setTab(t)}
                      className={tab === t ? "selected" : ""}
                    >
                      {t}
                      <span>
                        {t === "Все заказы"
                          ? orders.length
                          : orders.filter((o) => o.status === t).length}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="table-toolbar" ref={popupRef}>
                  <div className="search-field">
                    <Icon name="search" size={18} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Поиск по номеру, имени или email…"
                      aria-label="Поиск заказов"
                    />
                    {search ? (
                      <button
                        title="Очистить поиск"
                        onClick={() => setSearch("")}
                      >
                        <Icon name="close" size={14} />
                      </button>
                    ) : (
                      <kbd>⌘ K</kbd>
                    )}
                  </div>
                  <div className="toolbar-buttons">
                    <div className="popover-anchor">
                      <AppButton
                        icon="filter"
                        className={
                          statusFilter !== "Все статусы" ||
                          paymentFilter !== "Любая оплата"
                            ? "active-control"
                            : ""
                        }
                        onClick={() =>
                          setPopup(popup === "filters" ? null : "filters")
                        }
                      >
                        Фильтры
                        {(statusFilter !== "Все статусы" ||
                          paymentFilter !== "Любая оплата") && (
                          <span className="filter-dot" />
                        )}
                      </AppButton>
                      {popup === "filters" && (
                        <div className="popover">
                          <strong>Фильтры заказов</strong>
                          <label>
                            Статус
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                            >
                              {["Все статусы", ...Object.keys(statusClass)].map(
                                (s) => (
                                  <option key={s}>{s}</option>
                                ),
                              )}
                            </select>
                          </label>
                          <label>
                            Оплата
                            <select
                              value={paymentFilter}
                              onChange={(e) => setPaymentFilter(e.target.value)}
                            >
                              {[
                                "Любая оплата",
                                "Оплачено",
                                "Ожидает оплаты",
                              ].map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </label>
                          <button
                            className="reset"
                            onClick={() => {
                              setStatusFilter("Все статусы");
                              setPaymentFilter("Любая оплата");
                            }}
                          >
                            Сбросить фильтры
                          </button>
                        </div>
                      )}
                    </div>
                    <AppButton
                      icon="group"
                      className={grouped ? "group-active" : ""}
                      onClick={() => {
                        setGrouped(!grouped);
                        setClosed([]);
                      }}
                    >
                      По статусу <span className="tiny-chevron">⌄</span>
                    </AppButton>
                    <div className="popover-anchor">
                      <AppButton
                        icon="columns"
                        onClick={() =>
                          setPopup(popup === "columns" ? null : "columns")
                        }
                      >
                        Колонки
                      </AppButton>
                      {popup === "columns" && (
                        <div className="popover columns-popover">
                          <strong>Настройка колонок</strong>
                          <small>Перетаскивайте за значок слева</small>
                          {columns.map((c, i) => (
                            <div
                              className="column-option"
                              key={c.key}
                              draggable
                              onDragStart={() => setDragged(c.key)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => {
                                if (dragged) {
                                  const next = [...columns];
                                  const from = next.findIndex(
                                    (c) => c.key === dragged,
                                  );
                                  next.splice(i, 0, ...next.splice(from, 1));
                                  setColumns(next);
                                  setDragged(null);
                                }
                              }}
                            >
                              <Icon name="grip" size={14} />
                              <label>
                                <input
                                  type="checkbox"
                                  checked={!hidden.includes(c.key)}
                                  onChange={() =>
                                    setHidden(
                                      hidden.includes(c.key)
                                        ? hidden.filter((k) => k !== c.key)
                                        : visibleColumns.length > 1
                                          ? [...hidden, c.key]
                                          : hidden,
                                    )
                                  }
                                />
                                {c.label}
                              </label>
                            </div>
                          ))}
                          <button
                            className="reset"
                            onClick={() => {
                              setColumns(columnsInitial);
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
                {selected.size > 0 && (
                  <div className="selection-bar">
                    <span>
                      Выбрано заказов: <strong>{selected.size}</strong>
                    </span>
                    <button onClick={exportOrders}>
                      <Icon name="download" size={14} /> Экспортировать
                    </button>
                    <button onClick={() => setSelected(new Set())}>
                      Снять выделение <Icon name="close" size={14} />
                    </button>
                  </div>
                )}
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th className="checkbox-cell">
                          <input
                            aria-label="Выбрать все заказы на странице"
                            type="checkbox"
                            checked={
                              visibleOrders.length > 0 &&
                              visibleOrders.every((o) => selected.has(o.id))
                            }
                            ref={(el) => {
                              if (el)
                                el.indeterminate =
                                  visibleOrders.some((o) =>
                                    selected.has(o.id),
                                  ) &&
                                  !visibleOrders.every((o) =>
                                    selected.has(o.id),
                                  );
                            }}
                            onChange={selectAll}
                          />
                        </th>
                        {visibleColumns.map((c) => (
                          <th
                            key={c.key}
                            className={`col-${c.key} ${dragged === c.key ? "dragging" : ""}`}
                            draggable
                            onDragStart={(e) => {
                              setDragged(c.key);
                              e.dataTransfer.setData("text/plain", c.key);
                            }}
                            onDragEnd={() => setDragged(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (!dragged || dragged === c.key) return;
                              const next = [...columns];
                              const from = next.findIndex(
                                (c) => c.key === dragged,
                              );
                              const to = next.findIndex((x) => x.key === c.key);
                              next.splice(to, 0, ...next.splice(from, 1));
                              setColumns(next);
                              setDragged(null);
                            }}
                            title="Перетащите, чтобы изменить порядок"
                          >
                            <button
                              onClick={() =>
                                setSort({
                                  key: c.key,
                                  asc: sort.key === c.key ? !sort.asc : true,
                                })
                              }
                            >
                              {c.label}
                              {c.key === "date" ? (
                                <span className="sort-arrow">
                                  {sort.key === "date" && sort.asc ? "↑" : "↓"}
                                </span>
                              ) : (
                                <span className="header-grip">
                                  <Icon name="grip" size={12} />
                                </span>
                              )}
                            </button>
                          </th>
                        ))}
                        <th className="row-actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((g) => (
                        <FragmentGroup
                          key={g.name}
                          name={g.name}
                          orders={g.orders}
                          columnsCount={visibleColumns.length + 2}
                          closed={closed.includes(g.name)}
                          onToggle={() =>
                            setClosed(
                              closed.includes(g.name)
                                ? closed.filter((s) => s !== g.name)
                                : [...closed, g.name],
                            )
                          }
                        >
                          {g.orders.map((o) => (
                            <tr
                              key={o.id}
                              className={
                                selected.has(o.id) ? "selected-row" : ""
                              }
                            >
                              <td className="checkbox-cell">
                                <input
                                  type="checkbox"
                                  checked={selected.has(o.id)}
                                  aria-label={"Выбрать заказ " + o.id}
                                  onChange={() => toggleSelect(o.id)}
                                />
                              </td>
                              {visibleColumns.map((c) => (
                                <td key={c.key} className={"col-" + c.key}>
                                  {cell(o, c.key)}
                                </td>
                              ))}
                              <td className="row-actions">
                                <button
                                  title={"Открыть заказ " + o.id}
                                  onClick={() => setDetail(o)}
                                >
                                  <Icon name="dots" size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </FragmentGroup>
                      ))}
                    </tbody>
                  </table>
                  {!filtered.length && (
                    <div className="empty-state">
                      <Icon name="search" size={32} />
                      <h3>Заказы не найдены</h3>
                      <p>Попробуйте изменить запрос или сбросить фильтры.</p>
                      <AppButton
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("Все статусы");
                          setPaymentFilter("Любая оплата");
                          setTab("Все заказы");
                        }}
                      >
                        Сбросить фильтры
                      </AppButton>
                    </div>
                  )}
                </div>
                <div className="table-footer">
                  <span>
                    Показано{" "}
                    <strong>
                      {filtered.length ? (safePage - 1) * pageSize + 1 : 0}–
                      {Math.min(safePage * pageSize, filtered.length)}
                    </strong>{" "}
                    из <strong>{filtered.length}</strong> заказов
                  </span>
                  <div className="pagination">
                    <span>На странице</span>
                    <select
                      aria-label="Заказов на странице"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option>10</option>
                      <option>20</option>
                      <option>50</option>
                    </select>
                    <button
                      aria-label="Предыдущая страница"
                      disabled={safePage === 1}
                      onClick={() => setPage(safePage - 1)}
                    >
                      <Icon name="chevron" className="rotate" size={14} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        className={safePage === i + 1 ? "current-page" : ""}
                        key={i}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      aria-label="Следующая страница"
                      disabled={safePage === totalPages}
                      onClick={() => setPage(safePage + 1)}
                    >
                      <Icon name="chevron" size={14} />
                    </button>
                  </div>
                </div>
              </section>
              <div className="table-tip">
                <Icon name="grip" size={15} />
                <span>
                  Настройте таблицу под себя: перетаскивайте колонки и
                  группируйте заказы по статусу.
                </span>
                <span className="autosave">
                  <span className="live-dot" /> Все изменения сохранены
                </span>
              </div>
            </>
          )}
          {section === "Пользователи" && (
            <section className="users-card">
              <div className="search-field">
                <Icon name="search" size={18} />
                <input
                  placeholder="Найти клиента…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="users-grid">
                {orders
                  .filter(
                    (o, i, a) => a.findIndex((x) => x.email === o.email) === i,
                  )
                  .filter((o) =>
                    (o.name + o.email)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((o) => (
                    <button
                      className="user-card"
                      key={o.email}
                      onClick={() => setDetail(o)}
                    >
                      <Avatar name={o.name} color={o.color} />
                      <strong>{o.name}</strong>
                      <span>{o.email}</span>
                      <small>
                        Последний заказ #{o.id} · {money(o.sum)}
                      </small>
                    </button>
                  ))}
              </div>
            </section>
          )}
          {section === "Настройки" && (
            <section className="settings-card">
              <h2>Рабочее пространство</h2>
              <p>Основная информация о вашем магазине</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setToast("Настройки сохранены");
                }}
              >
                <label>
                  Название магазина
                  <input
                    value={storeName}
                    required
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </label>
                <label>
                  Email администратора
                  <input
                    defaultValue="alex.kim@orbit.ru"
                    required
                    type="email"
                  />
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  Уведомления о новых заказах
                </label>
                <button className="button primary" type="submit">
                  Сохранить изменения
                </button>
              </form>
            </section>
          )}
          <footer className="page-footer">
            <span>© 2024 Orbit. Всё под контролем.</span>
            <div>
              <span className="footer-dot" /> Последнее обновление: только что
            </div>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
          <button onClick={() => setToast("")} aria-label="Закрыть">
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {(modal || detail) && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setModal(null);
              setDetail(null);
            }
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              detail
                ? "Детали заказа"
                : modal === "create"
                  ? "Создать заказ"
                  : "Помощь"
            }
          >
            <button
              className="modal-close"
              aria-label="Закрыть окно"
              onClick={() => {
                setModal(null);
                setDetail(null);
              }}
            >
              <Icon name="close" />
            </button>
            {modal === "create" ? (
              <>
                <span className="modal-icon">
                  <Icon name="bag" size={24} />
                </span>
                <h2>Новый заказ</h2>
                <p>Заполните информацию о клиенте и заказе.</p>
                <form onSubmit={createOrder}>
                  <label>
                    Имя клиента
                    <input
                      name="name"
                      placeholder="Иван Иванов"
                      required
                      autoFocus
                    />
                  </label>
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      placeholder="ivan@example.com"
                      required
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Сумма, ₽
                      <input
                        name="sum"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="0"
                        required
                      />
                    </label>
                    <label>
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
                  <button type="submit" className="button primary">
                    <Icon name="plus" size={17} />
                    Создать заказ
                  </button>
                </form>
              </>
            ) : detail ? (
              <>
                <span className="eyebrow">ДЕТАЛИ ЗАКАЗА</span>
                <h2>Заказ #{detail.id}</h2>
                <p>Создан {dateFormat(detail.date)}</p>
                <div className="detail-customer">
                  <Avatar name={detail.name} color={detail.color} />
                  <div>
                    <strong>{detail.name}</strong>
                    <small>{detail.email}</small>
                  </div>
                </div>
                <div className="detail-summary">
                  <span>
                    Количество товаров<strong>{detail.items} шт.</strong>
                  </span>
                  <span>
                    Сумма заказа<strong>{money(detail.sum)}</strong>
                  </span>
                </div>
                <label>
                  Статус заказа
                  <select
                    value={detail.status}
                    onChange={(e) => {
                      const updated = {
                        ...detail,
                        status: e.target.value as Status,
                      };
                      setDetail(updated);
                      setOrders(
                        orders.map((o) => (o.id === detail.id ? updated : o)),
                      );
                      setToast("Статус заказа обновлён");
                    }}
                  >
                    {Object.keys(statusClass).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={detail.paid}
                    onChange={(e) => {
                      const updated = { ...detail, paid: e.target.checked };
                      setDetail(updated);
                      setOrders(
                        orders.map((o) => (o.id === detail.id ? updated : o)),
                      );
                      setToast("Статус оплаты обновлён");
                    }}
                  />
                  Заказ оплачен
                </label>
                <AppButton primary onClick={() => setDetail(null)}>
                  Готово
                </AppButton>
              </>
            ) : (
              <>
                <span className="modal-icon">
                  <Icon name="help" size={25} />
                </span>
                <h2>Всё под контролем с Orbit</h2>
                <p>Ваше пространство для управления магазином.</p>
                <div className="help-list">
                  <div>
                    <Icon name="bag" />
                    <span>
                      <strong>Управляйте заказами</strong>Создавайте заказы и
                      меняйте их статус в карточке.
                    </span>
                  </div>
                  <div>
                    <Icon name="columns" />
                    <span>
                      <strong>Настройте таблицу</strong>Перетащите заголовок
                      колонки, чтобы изменить порядок.
                    </span>
                  </div>
                  <div>
                    <Icon name="group" />
                    <span>
                      <strong>Работайте с группами</strong>Нажмите «По статусу»
                      и сворачивайте группы заказов.
                    </span>
                  </div>
                </div>
                <AppButton primary onClick={() => setModal(null)}>
                  Всё понятно
                </AppButton>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function FragmentGroup({
  name,
  orders,
  columnsCount,
  closed,
  onToggle,
  children,
}: {
  name: string;
  orders: Order[];
  columnsCount: number;
  closed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {name && (
        <tr className={"group-row " + statusClass[name as Status]}>
          <td colSpan={columnsCount}>
            <button onClick={onToggle} aria-expanded={!closed}>
              <Icon name="chevron" size={13} className={closed ? "" : "down"} />
              <span className="group-dot" />
              <strong>{name}</strong>
              <span className="group-count">{orders.length}</span>
              <span className="group-total">
                {money(orders.reduce((a, o) => a + o.sum, 0))}
              </span>
            </button>
          </td>
        </tr>
      )}
      {!closed && children}
    </>
  );
}
