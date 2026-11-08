import React, { useEffect, useMemo, useRef, useState } from "react";
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
  | "calendar"
  | "filter"
  | "columns"
  | "group"
  | "arrow"
  | "more"
  | "help"
  | "collapse"
  | "check"
  | "close"
  | "clock"
  | "truck"
  | "box"
  | "external"
  | "logout"
  | "grip";
function Icon({
  name,
  size = 20,
  ...props
}: { name: IconName; size?: number } & React.SVGProps<SVGSVGElement>) {
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
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 21v-2a6.5 6.5 0 0 1 13 0v2M16 4.7a3.5 3.5 0 0 1 0 6.6M18 15a5 5 0 0 1 3.5 5" />
      </>
    ),
    bag: (
      <>
        <rect x="4" y="7" width="16" height="14" rx="3" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2M9 12h6" />
      </>
    ),
    settings: (
      <>
        <path d="m10 3-1 3-3 .5-2 3 2 2v2l-2 2 2 3 3 .5 1 3h4l1-3 3-.5 2-3-2-2v-2l2-2-2-3-3-.5-1-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
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
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4M17 3v4M3 11h18M7 15h2M15 15h2" />
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
    group: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <path d="M14 5h7M14 9h5M6 14v5h5" />
        <rect x="14" y="15" width="7" height="6" rx="1.5" />
      </>
    ),
    arrow: <path d="M5 16 17 4M7 4h10v10" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01" />
      </>
    ),
    collapse: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16m7-12-3 4 3 4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    truck: (
      <>
        <path d="M3 5h12v12H3ZM15 10h4l3 4v3h-7" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 9 5v10l-9 4-9-4V8Zm0 9 9-4M12 12 3 8M12 12v10M7 5.5l9 4.5" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H4v16h6M9 12h12m-4-4 4 4-4 4" />
      </>
    ),
    grip: (
      <>
        <circle cx="9" cy="5" r=".7" />
        <circle cx="15" cy="5" r=".7" />
        <circle cx="9" cy="12" r=".7" />
        <circle cx="15" cy="12" r=".7" />
        <circle cx="9" cy="19" r=".7" />
        <circle cx="15" cy="19" r=".7" />
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
type Status = "new" | "processing" | "shipped" | "done" | "cancelled";
type Order = {
  id: number;
  name: string;
  email: string;
  date: string;
  total: number;
  items: number;
  status: Status;
  paid: boolean;
  color: string;
};
const statuses: Record<Status, { label: string; icon: IconName }> = {
  new: { label: "Новый", icon: "box" },
  processing: { label: "В обработке", icon: "clock" },
  shipped: { label: "В доставке", icon: "truck" },
  done: { label: "Завершён", icon: "check" },
  cancelled: { label: "Отменён", icon: "close" },
};
const seed: Order[] = [
  {
    id: 1048,
    name: "Анна Смирнова",
    email: "anna.smirnova@gmail.com",
    date: "2026-11-05",
    total: 12590,
    items: 3,
    status: "new",
    paid: true,
    color: "peach",
  },
  {
    id: 1047,
    name: "Михаил Козлов",
    email: "m.kozlov@mail.ru",
    date: "2026-11-05",
    total: 8450,
    items: 2,
    status: "new",
    paid: false,
    color: "blue",
  },
  {
    id: 1046,
    name: "Екатерина Волкова",
    email: "ek.volkova@yandex.ru",
    date: "2026-11-05",
    total: 24990,
    items: 5,
    status: "new",
    paid: true,
    color: "purple",
  },
  {
    id: 1045,
    name: "Дмитрий Соколов",
    email: "d.sokolov@gmail.com",
    date: "2026-11-04",
    total: 5690,
    items: 1,
    status: "processing",
    paid: true,
    color: "mint",
  },
  {
    id: 1044,
    name: "Ольга Попова",
    email: "olga.popova@mail.ru",
    date: "2026-11-04",
    total: 15780,
    items: 4,
    status: "processing",
    paid: true,
    color: "pink",
  },
  {
    id: 1043,
    name: "Александр Морозов",
    email: "a.morozov@yandex.ru",
    date: "2026-11-04",
    total: 3290,
    items: 1,
    status: "processing",
    paid: false,
    color: "sand",
  },
  {
    id: 1042,
    name: "Мария Лебедева",
    email: "m.lebedeva@gmail.com",
    date: "2026-11-03",
    total: 18350,
    items: 3,
    status: "shipped",
    paid: true,
    color: "purple",
  },
  {
    id: 1041,
    name: "Иван Новиков",
    email: "ivan.novikov@mail.ru",
    date: "2026-11-03",
    total: 7990,
    items: 2,
    status: "shipped",
    paid: true,
    color: "blue",
  },
  {
    id: 1040,
    name: "Анастасия Павлова",
    email: "a.pavlova@yandex.ru",
    date: "2026-11-02",
    total: 11490,
    items: 2,
    status: "shipped",
    paid: true,
    color: "peach",
  },
  {
    id: 1039,
    name: "Артём Васильев",
    email: "artem.v@gmail.com",
    date: "2026-11-02",
    total: 21600,
    items: 4,
    status: "done",
    paid: true,
    color: "mint",
  },
  {
    id: 1038,
    name: "Виктория Зайцева",
    email: "v.zaytseva@mail.ru",
    date: "2026-11-01",
    total: 4590,
    items: 1,
    status: "done",
    paid: true,
    color: "pink",
  },
  {
    id: 1037,
    name: "Николай Петров",
    email: "n.petrov@yandex.ru",
    date: "2026-11-01",
    total: 13980,
    items: 3,
    status: "done",
    paid: true,
    color: "sand",
  },
  ...Array.from({ length: 24 }, (_, i) => ({
    id: 1036 - i,
    name: ["София Белова", "Максим Орлов", "Алексей Иванов", "Полина Фомина"][
      i % 4
    ],
    email: [
      "sofia.b@mail.ru",
      "max.orlov@gmail.com",
      "alex.ivanov@mail.ru",
      "polina.f@yandex.ru",
    ][i % 4],
    date: `2026-10-${String(31 - Math.floor(i / 3)).padStart(2, "0")}`,
    total: [6490, 14590, 3290, 22450][i % 4],
    items: (i % 4) + 1,
    status: (["done", "shipped", "processing", "cancelled"] as Status[])[i % 4],
    paid: i % 4 !== 3,
    color: ["peach", "blue", "mint", "purple"][i % 4],
  })),
];
const money = (value: number) => value.toLocaleString("ru-RU") + " ₽";
const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
const colLabels: Record<string, string> = {
  id: "№ заказа",
  customer: "Покупатель",
  date: "Дата",
  total: "Сумма",
  items: "Товары",
  status: "Статус",
  payment: "Оплата",
};
function Checkbox({
  checked,
  onChange,
  label,
  indeterminate = false,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  indeterminate?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
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
function Sparkline({ variant = 0 }: { variant?: number }) {
  const lines = [
    "0,33 8,31 15,34 23,22 30,26 37,20 44,24 51,10 58,15 65,11 72,15 80,6 87,10 94,4 102,8 110,1",
    "0,34 9,28 18,31 26,21 34,24 43,14 51,18 59,11 68,15 76,9 84,11 93,3 102,8 110,2",
    "0,28 9,27 18,31 26,21 34,25 43,19 51,21 59,13 68,20 76,9 84,15 93,7 102,10 110,4",
    "0,30 9,25 18,29 26,18 34,22 43,12 51,16 59,9 68,15 76,8 84,12 93,4 102,9 110,1",
  ];
  return (
    <svg className="sparkline" viewBox="0 0 112 42">
      <defs>
        <linearGradient id={"fade" + variant} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#75bca5" stopOpacity=".24" />
          <stop offset="100%" stopColor="#75bca5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,42 ${lines[variant]} 110,42`}
        fill={`url(#fade${variant})`}
      />
      <polyline
        points={lines[variant]}
        fill="none"
        stroke="#72b79c"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function App() {
  const [collapsed, setCollapsed] = useState(false),
    [section, setSection] = useState("Заказы");
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("forma-orders") || "null") || seed;
    } catch {
      return seed;
    }
  });
  const [tab, setTab] = useState("all"),
    [search, setSearch] = useState(""),
    [grouped, setGrouped] = useState(true),
    [closedGroups, setClosedGroups] = useState<Status[]>([]),
    [selected, setSelected] = useState<number[]>([]);
  const [columns, setColumns] = useState(Object.keys(colLabels)),
    [hidden, setHidden] = useState<string[]>([]),
    [dragged, setDragged] = useState<string | null>(null),
    [menu, setMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(12),
    [paymentFilter, setPaymentFilter] = useState("all"),
    [period, setPeriod] = useState("month"),
    [sort, setSort] = useState<"desc" | "asc">("desc");
  const [modal, setModal] = useState<"new" | "help" | null>(null),
    [detail, setDetail] = useState<Order | null>(null),
    [toast, setToast] = useState(""),
    [storeName, setStoreName] = useState(
      () => localStorage.getItem("forma-store") || "Forma Store",
    ),
    [contactEmail, setContactEmail] = useState(
      () => localStorage.getItem("forma-email") || "admin@forma.store",
    ),
    [timezone, setTimezone] = useState(
      () => localStorage.getItem("forma-timezone") || "moscow",
    );
  useEffect(() => {
    localStorage.setItem("forma-orders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    setPage(1);
  }, [tab, search, paymentFilter, period, pageSize]);
  useEffect(() => {
    const dismissMenu = (event: PointerEvent) => {
      if (!(event.target as Element).closest('.menu-anchor, .notification-wrap, .workspace, .workspace-pop, .profile, .profile-pop')) setMenu(null);
    };
    document.addEventListener('pointerdown', dismissMenu);
    return () => document.removeEventListener('pointerdown', dismissMenu);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setDetail(null);
        setMenu(null);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const filtered = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            (tab === "all" || o.status === tab) &&
            (!search ||
              `${o.id} ${o.name} ${o.email}`
                .toLowerCase()
                .includes(search.toLowerCase())) &&
            (paymentFilter === "all" ||
              (paymentFilter === "paid" ? o.paid : !o.paid)) &&
            (period !== "today" || o.date === "2026-11-05") &&
            (period !== "week" || o.date >= "2026-10-30"),
        )
        .sort((a, b) => (sort === "desc" ? b.id - a.id : a.id - b.id)),
    [orders, tab, search, paymentFilter, period, sort],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const shownColumns = columns.filter((c) => !hidden.includes(c));
  const notify = (text: string) => {
    setToast(text);
    setMenu(null);
  };
  const toggleSelection = (id: number) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  const selectAll = () =>
    setSelected((s) =>
      visible.every((o) => s.includes(o.id))
        ? s.filter((id) => !visible.some((o) => o.id === id))
        : [...new Set([...s, ...visible.map((o) => o.id)])],
    );
  function exportOrders() {
    const list = selected.length
      ? orders.filter((o) => selected.includes(o.id))
      : filtered;
    const csv =
      "\uFEFF" +
      [
        ["Заказ", "Покупатель", "Email", "Дата", "Сумма", "Статус", "Оплата"],
        ...list.map((o) => [
          o.id,
          o.name,
          o.email,
          o.date,
          o.total,
          statuses[o.status].label,
          o.paid ? "Оплачен" : "Ожидает",
        ]),
      ]
        .map((r) =>
          r.map((x) => '"' + String(x).replaceAll('"', '""') + '"').join(";"),
        )
        .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    a.download = "forma-orders.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    notify(`Экспортировано заказов: ${list.length}`);
  }
  function moveColumn(from: string, to: string) {
    setColumns((cols) => {
      const next = cols.filter((c) => c !== from);
      next.splice(cols.indexOf(to), 0, from);
      return next;
    });
    setDragged(null);
  }
  function renderCell(order: Order, key: string) {
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
            <span className={"avatar " + order.color}>
              {initials(order.name)}
            </span>
            <div>
              <strong>{order.name}</strong>
              <span>{order.email}</span>
            </div>
          </div>
        );
      case "date":
        return (
          <span className="date-cell">
            {new Date(order.date + "T12:00:00")
              .toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })
              .replace(" г.", "")}
            <span>2026</span>
          </span>
        );
      case "total":
        return <strong className="amount">{money(order.total)}</strong>;
      case "items":
        return <span className="muted">{order.items} шт.</span>;
      case "status":
        return (
          <span className={"badge " + order.status}>
            <span className="status-dot" />
            {statuses[order.status].label}
          </span>
        );
      case "payment":
        return (
          <span className={"payment " + (order.paid ? "paid" : "pending")}>
            {order.paid ? (
              <Icon name="check" size={13} />
            ) : (
              <span className="tiny-dot" />
            )}
            {order.paid ? "Оплачен" : "Ожидает"}
          </span>
        );
    }
  }
  function renderRow(order: Order) {
    return (
      <tr
        key={order.id}
        className={selected.includes(order.id) ? "selected" : ""}
      >
        <td className="check-cell">
          <Checkbox
            checked={selected.includes(order.id)}
            onChange={() => toggleSelection(order.id)}
            label={`Выбрать заказ ${order.id}`}
          />
        </td>
        {shownColumns.map((c) => (
          <td key={c}>{renderCell(order, c)}</td>
        ))}
        <td className="row-end">
          <button
            className="icon-button"
            aria-label={`Открыть заказ ${order.id}`}
            onClick={() => setDetail(order)}
          >
            <Icon name="more" size={19} />
          </button>
        </td>
      </tr>
    );
  }
  const nav = [
    { name: "Главная", icon: "grid" },
    { name: "Пользователи", icon: "users" },
    { name: "Заказы", icon: "bag" },
    { name: "Настройки", icon: "settings" },
  ] as const;
  return (
    <div className={"app " + (collapsed ? "sidebar-collapsed" : "")}>
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
            <i />
            <i />
            <i />
          </span>
          {!collapsed && (
            <span>
              forma<span className="brand-dot">.</span>
            </span>
          )}
        </a>
        <button
          className="workspace"
          onClick={() => setMenu(menu === "workspace" ? null : "workspace")}
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
        {menu === "workspace" && !collapsed && (
          <div className="workspace-pop">
            Текущее пространство <strong>{storeName}</strong>
            <span className="online">● Все системы работают</span>
          </div>
        )}
        <div className="nav-label">{!collapsed ? "УПРАВЛЕНИЕ" : "···"}</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.name}
              title={collapsed ? n.name : undefined}
              aria-label={n.name}
              aria-current={section === n.name ? 'page' : undefined}
              className={"nav-item " + (section === n.name ? "active" : "")}
              onClick={() => {
                setSection(n.name);
                setMenu(null);
              }}
            >
              <Icon name={n.icon} />
              {!collapsed && (
                <>
                  <span>{n.name}</span>
                  {n.name === "Заказы" && (
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
              <button onClick={() => setModal("help")}>
                Центр помощи <Icon name="external" size={14} />
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
          <button
            className="profile"
            onClick={() => setMenu(menu === "profile" ? null : "profile")}
          >
            <span className="profile-avatar">
              АК
              <span />
            </span>
            {!collapsed && (
              <>
                <span>
                  <strong>Алексей Ким</strong>
                  <small>Администратор</small>
                </span>
                <Icon name="more" size={18} />
              </>
            )}
          </button>
          {menu === "profile" && (
            <div className="profile-pop">
              <strong>Алексей Ким</strong>
              <span>admin@forma.store</span>
              <button
                onClick={() => {
                  setSection("Настройки");
                  setMenu(null);
                }}
              >
                Настройки профиля <Icon name="settings" size={16} />
              </button>
            </div>
          )}
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
            <span className="live-dot" />{" "}
            <span className="live-text">Магазин работает</span>
            <span className="header-divider" />
            <button
              className="icon-button"
              aria-label="Помощь"
              onClick={() => setModal("help")}
            >
              <Icon name="help" size={19} />
            </button>
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Уведомления"
                onClick={() =>
                  setMenu(menu === "notifications" ? null : "notifications")
                }
              >
                <Icon name="bell" size={19} />
                <i />
              </button>
              {menu === "notifications" && (
                <div className="popover notifications">
                  <h4>Уведомления</h4>
                  <p>
                    <span className="notice-dot" /> Получено 3 новых заказа
                  </p>
                  <small>Сегодня, 12:45</small>
                  <p>
                    <Icon name="check" size={16} /> Все данные синхронизированы
                  </p>
                  <small>Только что</small>
                </div>
              )}
            </div>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ МАГАЗИН В ДЕТАЛЯХ</div>
              <h1>{section === "Главная" ? "Обзор магазина" : section}</h1>
              <p>
                {section === "Заказы"
                  ? "Управляйте заказами и держите каждый этап под контролем."
                  : section === "Главная"
                    ? "Всё, что нужно знать о вашем бизнесе сегодня."
                    : section === "Пользователи"
                      ? "Ваши покупатели и история взаимодействий."
                      : "Настройте рабочее пространство под себя."}
              </p>
            </div>
            {(section === "Заказы" || section === "Главная") && (
              <div className="heading-actions">
                <button className="button" onClick={exportOrders}>
                  <Icon name="download" size={17} />
                  Экспорт
                </button>
                <button
                  className="button primary"
                  onClick={() => setModal("new")}
                >
                  <Icon name="plus" size={18} />
                  Новый заказ
                </button>
              </div>
            )}
          </div>
          {(section === "Заказы" || section === "Главная") && (
            <>
              <div className="stats-grid">
                {[
                  {
                    label: "Всего заказов",
                    value: orders.length.toLocaleString("ru-RU"),
                    change: "12,8",
                    icon: "bag",
                    caption: "за последние 30 дней",
                  },
                  {
                    label: "Выручка",
                    value: money(
                      orders
                        .filter((o) => o.paid)
                        .reduce((s, o) => s + o.total, 0),
                    ),
                    change: "18,4",
                    icon: "arrow",
                    caption: "за последние 30 дней",
                  },
                  {
                    label: "Средний чек",
                    value: money(
                      Math.round(
                        orders.reduce((s, o) => s + o.total, 0) / orders.length,
                      ),
                    ),
                    change: "4,9",
                    icon: "box",
                    caption: "за последние 30 дней",
                  },
                  {
                    label: "Завершённые заказы",
                    value: String(
                      orders.filter((o) => o.status === "done").length,
                    ),
                    change: "8,2",
                    icon: "check",
                    caption: "за последние 30 дней",
                  },
                ].map((s, i) => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-label">
                      {s.label}
                      <Icon name={s.icon as IconName} size={18} />
                    </div>
                    <div className="stat-value">
                      {s.value}
                      <Sparkline variant={i} />
                    </div>
                    <div className="stat-foot">
                      <span>
                        <Icon name="arrow" size={12} />
                        {s.change}%
                      </span>
                      <small>{s.caption}</small>
                    </div>
                  </div>
                ))}
              </div>
              <section className="orders-panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      {section === "Главная"
                        ? "Последние заказы"
                        : "Все заказы"}
                      <span className="count-badge">{orders.length}</span>
                    </h2>
                    <p>Все заказы вашего магазина в одном месте.</p>
                  </div>
                  <div className="menu-anchor">
                    <button
                      className="button date-button"
                      onClick={() => setMenu(menu === "date" ? null : "date")}
                    >
                      <Icon name="calendar" size={16} />
                      {period === "today"
                        ? "Сегодня"
                        : period === "week"
                          ? "Последние 7 дней"
                          : "7 окт. – 5 нояб. 2026"}
                      <Icon name="chevron" size={13} className="rotate-down" />
                    </button>
                    {menu === "date" && (
                      <div className="popover date-menu">
                        {[
                          ["month", "Последние 30 дней"],
                          ["week", "Последние 7 дней"],
                          ["today", "Сегодня"],
                        ].map(([v, l]) => (
                          <button
                            key={v}
                            className={period === v ? "chosen" : ""}
                            onClick={() => {
                              setPeriod(v);
                              setMenu(null);
                            }}
                          >
                            {l}
                            {period === v && <Icon name="check" size={15} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="tabs">
                  {[
                    ["all", "Все заказы"],
                    ["new", "Новые"],
                    ["processing", "В обработке"],
                    ["shipped", "В доставке"],
                    ["done", "Завершённые"],
                    ["cancelled", "Отменённые"],
                  ].map(([v, l]) => (
                    <button
                      className={tab === v ? "active" : ""}
                      key={v}
                      onClick={() => setTab(v)}
                    >
                      {l}
                      <span>
                        {v === "all"
                          ? orders.length
                          : orders.filter((o) => o.status === v).length}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="table-toolbar">
                  <label className="search-field">
                    <Icon name="search" size={17} />
                    <input
                      placeholder="Поиск по номеру, имени или email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        aria-label="Очистить поиск"
                        onClick={() => setSearch("")}
                      >
                        <Icon name="close" size={14} />
                      </button>
                    )}
                  </label>
                  <div className="toolbar-actions">
                    <div className="menu-anchor">
                      <button
                        className={
                          "button " +
                          (paymentFilter !== "all" ? "filter-active" : "")
                        }
                        onClick={() =>
                          setMenu(menu === "filters" ? null : "filters")
                        }
                      >
                        <Icon name="filter" size={16} />
                        Фильтры
                        {paymentFilter !== "all" && (
                          <span className="small-count">1</span>
                        )}
                      </button>
                      {menu === "filters" && (
                        <div className="popover filters-menu">
                          <h4>Оплата заказа</h4>
                          {[
                            ["all", "Все заказы"],
                            ["paid", "Оплачен"],
                            ["unpaid", "Ожидает оплаты"],
                          ].map(([v, l]) => (
                            <button
                              key={v}
                              onClick={() => {
                                setPaymentFilter(v);
                                setMenu(null);
                              }}
                            >
                              {l}
                              {paymentFilter === v && (
                                <Icon name="check" size={16} />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="menu-anchor">
                      <button
                        className="button"
                        onClick={() =>
                          setMenu(menu === "columns" ? null : "columns")
                        }
                      >
                        <Icon name="columns" size={16} />
                        Колонки
                      </button>
                      {menu === "columns" && (
                        <div className="popover columns-menu">
                          <h4>Настройка колонок</h4>
                          <p>Перетащите заголовок в таблице</p>
                          {columns.map((c, i) => (
                            <div className="column-option" key={c}>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={!hidden.includes(c)}
                                  disabled={
                                    shownColumns.length === 1 &&
                                    !hidden.includes(c)
                                  }
                                  onChange={() =>
                                    setHidden((h) =>
                                      h.includes(c)
                                        ? h.filter((x) => x !== c)
                                        : [...h, c],
                                    )
                                  }
                                />
                                {colLabels[c]}
                              </label>
                              <button
                                aria-label={`Сдвинуть ${colLabels[c]} влево`}
                                disabled={i === 0}
                                onClick={() => moveColumn(c, columns[i - 1])}
                              >
                                <Icon
                                  name="chevron"
                                  className="rotate-left"
                                  size={13}
                                />
                              </button>
                              <button
                                aria-label={`Сдвинуть ${colLabels[c]} вправо`}
                                disabled={i === columns.length - 1}
                                onClick={() => moveColumn(c, columns[i + 1])}
                              >
                                <Icon name="chevron" size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className={
                        "button group-button " + (grouped ? "enabled" : "")
                      }
                      onClick={() => setGrouped(!grouped)}
                    >
                      <Icon name="group" size={16} />
                      <span>По статусу</span>
                      {grouped ? (
                        <Icon name="close" size={14} />
                      ) : (
                        <Icon name="plus" size={14} />
                      )}
                    </button>
                  </div>
                </div>
                {selected.length > 0 ? (
                  <div className="selection-bar">
                    <span>
                      <strong>Выбрано: {selected.length}</strong>
                      <button onClick={() => setSelected([])}>
                        Снять выделение
                      </button>
                    </span>
                    <div>
                      <button onClick={exportOrders}>
                        <Icon name="download" size={14} />
                        Экспорт
                      </button>
                      <select
                        aria-label="Изменить статус выбранных заказов"
                        value=""
                        onChange={(e) => {
                          const status = e.target.value as Status;
                          setOrders((o) =>
                            o.map((x) =>
                              selected.includes(x.id) ? { ...x, status } : x,
                            ),
                          );
                          notify(`Статус ${selected.length} заказов обновлён`);
                          setSelected([]);
                        }}
                      >
                        <option value="" disabled>
                          Изменить статус
                        </option>
                        {Object.entries(statuses).map(([s, v]) => (
                          <option key={s} value={s}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="table-hint">
                    <Icon name="grip" size={14} />
                    <span>
                      Перетаскивайте заголовки, чтобы изменить порядок колонок
                    </span>
                    <span className="group-hint">
                      {grouped ? "Сгруппировано по статусу" : "Без группировки"}
                    </span>
                  </div>
                )}
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th className="check-cell">
                          <Checkbox
                            label="Выбрать все заказы на странице"
                            checked={
                              visible.length > 0 &&
                              visible.every((o) => selected.includes(o.id))
                            }
                            indeterminate={
                              visible.some((o) => selected.includes(o.id)) &&
                              !visible.every((o) => selected.includes(o.id))
                            }
                            onChange={selectAll}
                          />
                        </th>
                        {shownColumns.map((c) => (
                          <th
                            key={c}
                            draggable
                            onDragStart={(e) => {
                              setDragged(c);
                              e.dataTransfer.setData("text/plain", c);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const from = e.dataTransfer.getData("text/plain");
                              if (columns.includes(from)) moveColumn(from, c);
                            }}
                            onDragEnd={() => setDragged(null)}
                            className={
                              (dragged === c ? "dragging " : "") + "col-" + c
                            }
                            title="Перетащите для изменения порядка"
                          >
                            <span>
                              {colLabels[c]}
                              {c === "id" ? (
                                <button
                                  className="sort-button"
                                  onClick={() =>
                                    setSort(sort === "desc" ? "asc" : "desc")
                                  }
                                  aria-label="Изменить сортировку заказов"
                                >
                                  {sort === "desc" ? "↓" : "↑"}
                                </button>
                              ) : (
                                <Icon
                                  className="column-grip"
                                  name="grip"
                                  size={12}
                                />
                              )}
                            </span>
                          </th>
                        ))}
                        <th className="row-end" />
                      </tr>
                    </thead>
                    <tbody>
                      {grouped
                        ? Object.entries(statuses).map(([s, info]) => {
                            const rows = visible.filter((o) => o.status === s);
                            if (!rows.length) return null;
                            return (
                              <React.Fragment key={s}>
                                <tr className={"group-row group-" + s}>
                                  <td colSpan={shownColumns.length + 2}>
                                    <button
                                      aria-expanded={!closedGroups.includes(s as Status)}
                                      onClick={() =>
                                        setClosedGroups((g) =>
                                          g.includes(s as Status)
                                            ? g.filter((x) => x !== s)
                                            : [...g, s as Status],
                                        )
                                      }
                                    >
                                      <Icon
                                        name="chevron"
                                        size={13}
                                        className={
                                          closedGroups.includes(s as Status)
                                            ? ""
                                            : "rotate-down"
                                        }
                                      />
                                      <span className={"group-status " + s}>
                                        <span className="status-dot" />
                                        {info.label}
                                      </span>
                                      <span className="group-count">
                                        {rows.length}
                                      </span>
                                      <span className="group-total">
                                        {money(
                                          rows.reduce(
                                            (sum, o) => sum + o.total,
                                            0,
                                          ),
                                        )}
                                      </span>
                                    </button>
                                  </td>
                                </tr>
                                {!closedGroups.includes(s as Status) &&
                                  rows.map(renderRow)}
                              </React.Fragment>
                            );
                          })
                        : visible.map(renderRow)}
                    </tbody>
                  </table>
                  {visible.length === 0 && (
                    <div className="empty-state">
                      <Icon name="search" size={32} />
                      <h3>Заказы не найдены</h3>
                      <p>Попробуйте изменить запрос или сбросить фильтры.</p>
                      <button
                        className="button"
                        onClick={() => {
                          setSearch("");
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
                <div className="pagination">
                  <span>
                    Показано{" "}
                    <strong>
                      {visible.length ? (currentPage - 1) * pageSize + 1 : 0}–
                      {Math.min(currentPage * pageSize, filtered.length)}
                    </strong>{" "}
                    из <strong>{filtered.length}</strong> заказов
                  </span>
                  <div className="page-controls">
                    <span>На странице</span>
                    <select
                      aria-label="Заказов на странице"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option>12</option>
                      <option>24</option>
                      <option>48</option>
                    </select>
                    <div className="page-buttons">
                      <button
                        disabled={currentPage === 1}
                        aria-label="Предыдущая страница"
                        onClick={() => setPage(currentPage - 1)}
                      >
                        <Icon
                          name="chevron"
                          className="rotate-left"
                          size={14}
                        />
                      </button>
                      {Array.from({ length: pages }, (_, i) => (
                        <button
                          key={i}
                          className={currentPage === i + 1 ? "active" : ""}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        disabled={currentPage === pages}
                        aria-label="Следующая страница"
                        onClick={() => setPage(currentPage + 1)}
                      >
                        <Icon name="chevron" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              <footer className="page-footer">
                <span>
                  <span className="sync-dot" />
                  Данные обновлены только что
                </span>
                <span>
                  Сделано для вашего бизнеса{" "}
                  <span className="footer-star">✳</span>
                </span>
              </footer>
            </>
          )}
          {section === "Пользователи" && (
            <section className="users-panel">
              <div className="panel-heading">
                <h2>
                  Покупатели{" "}
                  <span className="count-badge">
                    {new Set(orders.map((o) => o.email)).size}
                  </span>
                </h2>
                <label className="search-field">
                  <Icon name="search" size={17} />
                  <input
                    placeholder="Найти покупателя..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Покупатель</th>
                    <th>Заказов</th>
                    <th>Общая сумма</th>
                    <th>Последний заказ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter(
                      (o, i, a) =>
                        a.findIndex((x) => x.email === o.email) === i,
                    )
                    .filter((o) =>
                      (o.name + o.email)
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map((o) => (
                      <tr key={o.email}>
                        <td>{renderCell(o, "customer")}</td>
                        <td>
                          {orders.filter((x) => x.email === o.email).length}
                        </td>
                        <td>
                          {money(
                            orders
                              .filter((x) => x.email === o.email)
                              .reduce((sum, x) => sum + x.total, 0),
                          )}
                        </td>
                        <td>
                          <button
                            className="order-link"
                            onClick={() => setDetail(o)}
                          >
                            #{o.id}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </section>
          )}
          {section === "Настройки" && (
            <section className="settings-panel">
              <h2>Рабочее пространство</h2>
              <p className="muted">Основные данные вашего магазина</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  setStoreName(String(data.get("store")));
                  setContactEmail(String(data.get("email")));
                  setTimezone(String(data.get("timezone")));
                  localStorage.setItem(
                    "forma-store",
                    String(data.get("store")),
                  );
                  localStorage.setItem(
                    "forma-email",
                    String(data.get("email")),
                  );
                  localStorage.setItem(
                    "forma-timezone",
                    String(data.get("timezone")),
                  );
                  notify("Настройки сохранены");
                }}
              >
                <label>
                  Название магазина
                  <input name="store" defaultValue={storeName} required />
                </label>
                <label>
                  Контактный email
                  <input
                    name="email"
                    type="email"
                    defaultValue={contactEmail}
                    required
                  />
                </label>
                <label>
                  Часовой пояс
                  <select name="timezone" defaultValue={timezone}>
                    <option value="moscow">Москва (UTC+3)</option>
                    <option value="utc">UTC</option>
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
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={modal === "new" ? "Новый заказ" : "Центр помощи"}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              onClick={() => setModal(null)}
              aria-label="Закрыть"
            >
              <Icon name="close" />
            </button>
            {modal === "new" ? (
              <>
                <span className="modal-icon">
                  <Icon name="bag" size={26} />
                </span>
                <h2>Новый заказ</h2>
                <p className="muted">Добавьте заказ в ваш магазин.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    const order: Order = {
                      id: Math.max(...orders.map((o) => o.id)) + 1,
                      name: String(data.get("name")).trim(),
                      email: String(data.get("email")),
                      total: Number(data.get("total")),
                      items: Number(data.get("items")),
                      date: "2026-11-05",
                      status: "new",
                      paid: data.get("paid") === "on",
                      color: "mint",
                    };
                    setOrders((o) => [order, ...o]);
                    setModal(null);
                    setTab("all");
                    setSearch("");
                    setPaymentFilter("all");
                    setPage(1);
                    notify(`Заказ #${order.id} создан`);
                  }}
                >
                  <label>
                    Имя покупателя
                    <input
                      autoFocus
                      name="name"
                      required
                      placeholder="Например, Анна Смирнова"
                      pattern=".*\S.*"
                    />
                  </label>
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="name@example.com"
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Сумма, ₽
                      <input
                        name="total"
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        placeholder="0"
                      />
                    </label>
                    <label>
                      Количество товаров
                      <input
                        name="items"
                        type="number"
                        min="1"
                        step="1"
                        defaultValue="1"
                        required
                      />
                    </label>
                  </div>
                  <label className="check-label">
                    <input type="checkbox" name="paid" />
                    Заказ оплачен
                  </label>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="button"
                      onClick={() => setModal(null)}
                    >
                      Отмена
                    </button>
                    <button className="button primary" type="submit">
                      Создать заказ
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <span className="modal-icon">
                  <Icon name="help" size={26} />
                </span>
                <h2>Центр помощи</h2>
                <p className="muted">Быстрый старт с Forma</p>
                <div className="help-item">
                  <h3>Как изменить порядок колонок?</h3>
                  <p>
                    Зажмите заголовок колонки и перетащите его на новое место.
                    Или используйте стрелки в меню «Колонки».
                  </p>
                </div>
                <div className="help-item">
                  <h3>Как управлять несколькими заказами?</h3>
                  <p>
                    Выберите заказы галочками слева. На панели над таблицей
                    появятся экспорт и изменение статуса.
                  </p>
                </div>
                <div className="help-item">
                  <h3>Как отключить группировку?</h3>
                  <p>
                    Нажмите «По статусу» над таблицей. Нажатие на название
                    группы сворачивает её заказы.
                  </p>
                </div>
                <button
                  className="button primary full-width"
                  onClick={() => setModal(null)}
                >
                  Всё понятно
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {detail && (
        <div
          className="modal-backdrop drawer-backdrop"
          onClick={() => setDetail(null)}
        >
          <aside
            className="order-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Заказ ${detail.id}`}
          >
            <button
              className="icon-button modal-close"
              aria-label="Закрыть заказ"
              onClick={() => setDetail(null)}
            >
              <Icon name="close" />
            </button>
            <div className="eyebrow">ДЕТАЛИ ЗАКАЗА</div>
            <h2>Заказ #{detail.id}</h2>
            <p className="muted">
              {new Date(detail.date).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="drawer-customer">
              {renderCell(detail, "customer")}
            </div>
            <div className="detail-line">
              <span>Сумма заказа</span>
              <strong>{money(detail.total)}</strong>
            </div>
            <div className="detail-line">
              <span>Товары</span>
              <strong>{detail.items} шт.</strong>
            </div>
            <label className="detail-label">
              Статус заказа
              <select
                value={detail.status}
                onChange={(e) => {
                  const updated = {
                    ...detail,
                    status: e.target.value as Status,
                  };
                  setDetail(updated);
                  setOrders((o) =>
                    o.map((x) => (x.id === updated.id ? updated : x)),
                  );
                  notify("Статус заказа обновлён");
                }}
              >
                {Object.entries(statuses).map(([v, s]) => (
                  <option value={v} key={v}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="detail-line">
              <span>Оплата</span>
              {renderCell(detail, "payment")}
            </div>
            {!detail.paid && (
              <button
                className="button primary full-width"
                onClick={() => {
                  const updated = { ...detail, paid: true };
                  setDetail(updated);
                  setOrders((o) =>
                    o.map((x) => (x.id === updated.id ? updated : x)),
                  );
                  notify("Заказ отмечен как оплаченный");
                }}
              >
                Отметить оплаченным
              </button>
            )}
            <div className="drawer-note">
              <Icon name="check" size={18} />
              <span>Изменения сохраняются автоматически</span>
            </div>
          </aside>
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
            aria-label="Скрыть уведомление"
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
