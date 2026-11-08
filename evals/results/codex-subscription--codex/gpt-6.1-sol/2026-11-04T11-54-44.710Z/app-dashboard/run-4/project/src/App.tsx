import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "users"
  | "bag"
  | "settings"
  | "chevron"
  | "arrow"
  | "search"
  | "bell"
  | "help"
  | "plus"
  | "download"
  | "filter"
  | "columns"
  | "group"
  | "calendar"
  | "close"
  | "check"
  | "more"
  | "logout"
  | "panel"
  | "trend"
  | "clock"
  | "truck"
  | "box"
  | "external"
  | "grip"
  | "mail";
function Icon({
  name,
  size = 18,
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
        <rect x="4" y="6" width="16" height="15" rx="3" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2M8 11v1m8-1v1" />
      </>
    ),
    settings: (
      <>
        <path d="m9.5 3-.8 2.2-2 .9-2.2-.5L2 9l1.5 1.8v2.4L2 15l2.5 3.4 2.2-.5 2 .9.8 2.2h5l.8-2.2 2-.9 2.2.5L22 15l-1.5-1.8v-2.4L22 9l-2.5-3.4-2.2.5-2-.9-.8-2.2z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-12 9h12m-8 4h4" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1-1.5 3m0 3h.01" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M7 12h10m-7 5h4" />
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
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <path d="M3 15h18M3 20h18" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    more: (
      <>
        <circle cx="5" cy="12" r=".8" />
        <circle cx="12" cy="12" r=".8" />
        <circle cx="19" cy="12" r=".8" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5m6-13 5 5-5 5m-7-5h12" />
      </>
    ),
    panel: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16m7-11-3 3 3 3" />
      </>
    ),
    trend: <path d="m3 17 6-6 4 4 8-10m-6 0h6v6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    truck: (
      <>
        <path d="M1 4h13v13H1zm13 5h4l4 5v3h-8" />
        <circle cx="5" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    box: (
      <>
        <path d="m12 2 9 5v10l-9 5-9-5V7zm-9 5 9 5 9-5m-9 5v10M7 4.5l10 5.5" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14m0-11H3v18h18v-7" />
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
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 5 9 8 9-8" />
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
const statusList = ["В обработке", "В пути", "Доставлен", "Отменён"] as const;
type Status = (typeof statusList)[number];
type Order = {
  id: number;
  name: string;
  email: string;
  initials: string;
  color: string;
  date: string;
  amount: number;
  status: Status;
  payment: string;
  items: number;
};
const people = [
  ["Александр Петров", "alex.petrov@gmail.com", "АП", "#e8e8f3"],
  ["Мария Иванова", "m.ivanova@yandex.ru", "МИ", "#f8e9dd"],
  ["Дмитрий Смирнов", "d.smirnov@gmail.com", "ДС", "#e4eee6"],
  ["Анна Кузнецова", "anna.k@gmail.com", "АК", "#efe7f2"],
  ["Михаил Соколов", "msokolov@mail.ru", "МС", "#e6edf4"],
  ["Екатерина Волкова", "kate.volkova@gmail.com", "ЕВ", "#f4e4e6"],
  ["Артём Козлов", "artem.k@yandex.ru", "АК", "#f3eedf"],
  ["Елена Новикова", "elena.n@gmail.com", "ЕН", "#e2efec"],
  ["Иван Морозов", "ivan.m@gmail.com", "ИМ", "#ece6f3"],
  ["Ольга Лебедева", "olga.l@mail.ru", "ОЛ", "#f3e7df"],
  ["Никита Попов", "nik.popov@gmail.com", "НП", "#e5eaf1"],
  ["София Васильева", "sofia.v@yandex.ru", "СВ", "#f1e6ee"],
];
function readSaved<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
const initialOrders: Order[] = Array.from({ length: 32 }, (_, i) => {
  const p = people[i % people.length];
  return {
    id: 1048 - i,
    name: p[0],
    email: p[1],
    initials: p[2],
    color: p[3],
    date: `${String(24 - Math.floor(i / 2)).padStart(2, "0")} июня 2025`,
    amount: [
      12900, 8450, 24300, 5790, 16700, 3200, 11450, 6900, 18900, 4250, 9400,
      14200,
    ][i % 12],
    status: statusList[i < 3 ? 0 : i < 5 ? 1 : i < 8 ? 2 : i % 4],
    payment:
      i % 7 === 2 ? "Ожидает оплаты" : i % 9 === 8 ? "Возврат" : "Оплачен",
    items: (i % 4) + 1,
  };
});
const columnLabels: Record<string, string> = {
  id: "Номер заказа",
  customer: "Клиент",
  date: "Дата",
  amount: "Сумма",
  status: "Статус",
  payment: "Оплата",
};
const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const statusClass = (status: Status) =>
  ["processing", "shipping", "delivered", "cancelled"][
    statusList.indexOf(status)
  ];
function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status ${statusClass(status)}`}>
      <span />
      {status}
    </span>
  );
}

export function App() {
  const [collapsed, setCollapsed] = useState(() =>
      readSaved("forma-sidebar", false),
    ),
    [section, setSection] = useState("Заказы");
  const [orders, setOrders] = useState<Order[]>(() =>
      readSaved("forma-orders", initialOrders),
    ),
    [search, setSearch] = useState(""),
    [tab, setTab] = useState("Все заказы"),
    [grouped, setGrouped] = useState(true),
    [selected, setSelected] = useState<Set<number>>(new Set()),
    [closedGroups, setClosedGroups] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<string[]>(() =>
      readSaved("forma-columns", Object.keys(columnLabels)),
    ),
    [hidden, setHidden] = useState<Set<string>>(
      () => new Set(readSaved<string[]>("forma-hidden", [])),
    ),
    [drag, setDrag] = useState<string | null>(null),
    [popover, setPopover] = useState<string | null>(null),
    [filter, setFilter] = useState<Status | "">(""),
    [dateRange, setDateRange] = useState("month"),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(8),
    [sort, setSort] = useState(false);
  const [modal, setModal] = useState<"new" | "detail" | "help" | null>(null),
    [detail, setDetail] = useState<Order | null>(null),
    [toast, setToast] = useState("");
  const [newName, setNewName] = useState(""),
    [newEmail, setNewEmail] = useState(""),
    [newAmount, setNewAmount] = useState(""),
    [shopName, setShopName] = useState(() =>
      readSaved("forma-shop", "Forma Store"),
    ),
    [savedName, setSavedName] = useState(() =>
      readSaved("forma-shop", "Forma Store"),
    ),
    [adminEmail, setAdminEmail] = useState(() =>
      readSaved("forma-email", "alexey@forma.store"),
    );
  const popRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem("forma-orders", JSON.stringify(orders));
      localStorage.setItem("forma-sidebar", JSON.stringify(collapsed));
      localStorage.setItem("forma-columns", JSON.stringify(columns));
      localStorage.setItem("forma-hidden", JSON.stringify([...hidden]));
      localStorage.setItem("forma-shop", JSON.stringify(savedName));
    } catch {}
  }, [orders, collapsed, columns, hidden, savedName]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (
        popRef.current &&
        !popRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest(".notification-wrap")
      )
        setPopover(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setPopover(null);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    setPage(1);
  }, [search, tab, filter, dateRange, pageSize]);
  const filtered = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            (!search ||
              `${o.id} ${o.name} ${o.email}`
                .toLowerCase()
                .includes(search.toLowerCase())) &&
            (!filter || o.status === filter) &&
            (tab === "Все заказы" ||
              (tab === "Не оплачены" && o.payment === "Ожидает оплаты") ||
              (tab === "В обработке" && o.status === "В обработке") ||
              (tab === "Доставлены" && o.status === "Доставлен")) &&
            (dateRange !== "week" || Number(o.date.slice(0, 2)) >= 18),
        )
        .sort((a, b) => (sort ? a.amount - b.amount : 0)),
    [orders, search, tab, filter, dateRange, sort],
  );
  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize)),
    safePage = Math.min(page, maxPage),
    shown = filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    visibleColumns = columns.filter((c) => !hidden.has(c));
  const groups = grouped
    ? statusList
        .map((status) => ({
          status,
          rows: shown.filter((o) => o.status === status),
        }))
        .filter((g) => g.rows.length)
    : [{ status: "", rows: shown }];
  const toggleSelected = (id: number) =>
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  const selectAll = () =>
    setSelected((prev) => {
      const s = new Set(prev);
      const all = shown.every((o) => s.has(o.id));
      shown.forEach((o) => (all ? s.delete(o.id) : s.add(o.id)));
      return s;
    });
  const exportOrders = () => {
    const data = selected.size
      ? orders.filter((o) => selected.has(o.id))
      : filtered;
    const csv =
      "\uFEFFНомер;Клиент;Email;Дата;Сумма;Статус;Оплата\n" +
      data
        .map((o) =>
          [o.id, o.name, o.email, o.date, o.amount, o.status, o.payment].join(
            ";",
          ),
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "forma-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast(`Экспортировано заказов: ${data.length}`);
  };
  const moveColumn = (target: string) => {
    if (!drag || drag === target) return;
    setColumns((prev) => {
      const next = prev.filter((c) => c !== drag);
      next.splice(next.indexOf(target), 0, drag);
      return next;
    });
    setDrag(null);
  };
  const openDetail = (order: Order) => {
    setDetail(order);
    setModal("detail");
  };
  const createOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order: Order = {
      id: Math.max(...orders.map((o) => o.id)) + 1,
      name: newName,
      email: newEmail,
      initials: newName
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      color: "#e8edf0",
      date: "24 июня 2025",
      amount: Number(newAmount),
      status: "В обработке",
      payment: "Ожидает оплаты",
      items: 1,
    };
    setOrders([order, ...orders]);
    setModal(null);
    setNewName("");
    setNewEmail("");
    setNewAmount("");
    setPage(1);
    setTab("Все заказы");
    setFilter("");
    setSearch("");
    setToast(`Заказ #${order.id} создан`);
  };
  function renderCell(o: Order, c: string) {
    switch (c) {
      case "id":
        return (
          <button className="order-id" onClick={() => openDetail(o)}>
            #{o.id}
          </button>
        );
      case "customer":
        return (
          <button className="customer" onClick={() => openDetail(o)}>
            <span className="avatar" style={{ background: o.color }}>
              {o.initials}
            </span>
            <span>
              <strong>{o.name}</strong>
              <small>{o.email}</small>
            </span>
          </button>
        );
      case "date":
        return <span className="date-cell">{o.date}</span>;
      case "amount":
        return <span className="amount">{money(o.amount)}</span>;
      case "status":
        return <StatusBadge status={o.status} />;
      case "payment":
        return (
          <span
            className={`payment ${o.payment === "Оплачен" ? "paid" : o.payment === "Возврат" ? "refund" : "pending"}`}
          >
            {o.payment === "Оплачен" && <Icon name="check" size={13} />}{" "}
            {o.payment}
          </span>
        );
    }
  }
  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <a
          className="brand"
          aria-label="Forma — главная"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSection("Заказы");
          }}
        >
          <span className="brand-symbol">
            <i />
            <i />
            <i />
          </span>
          {!collapsed && (
            <span>
              forma<span className="brand-period">.</span>
            </span>
          )}
        </a>
        <button
          className="workspace"
          onClick={() =>
            setToast("Вы работаете в пространстве «" + savedName + "»")
          }
          title={savedName}
        >
          <span className="workspace-logo">
            F<span>↗</span>
          </span>
          {!collapsed && (
            <>
              <span>
                <strong>{savedName}</strong>
                <small>Рабочее пространство</small>
              </span>
              <span className="workspace-arrows">
                <Icon name="chevron" size={12} className="down" />
              </span>
            </>
          )}
        </button>
        {!collapsed && <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>}
        <nav aria-label="Основная навигация">
          {(
            [
              { name: "Главная", icon: "grid" },
              { name: "Пользователи", icon: "users" },
              { name: "Заказы", icon: "bag" },
              { name: "Настройки", icon: "settings" },
            ] as { name: string; icon: IconName }[]
          ).map((item) => (
            <button
              title={collapsed ? item.name : undefined}
              key={item.name}
              className={`nav-item ${section === item.name ? "active" : ""}`}
              onClick={() => setSection(item.name)}
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
            <div className="upgrade">
              <span className="upgrade-icon">
                <Icon name="trend" size={22} />
              </span>
              <strong>Больше возможностей</strong>
              <p>
                Всё для роста вашего бизнеса
                <br />в одном месте.
              </p>
              <button
                onClick={() => {
                  setModal("help");
                }}
              >
                Открыть подсказки <Icon name="arrow" size={15} />
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
          <div className="profile">
            <span className="profile-avatar">
              АС
              <span />
            </span>
            {!collapsed && (
              <>
                <span>
                  <strong>Алексей Смирнов</strong>
                  <small>Администратор</small>
                </span>
                <button
                  className="icon-button"
                  title="Профиль администратора"
                  onClick={() => setSection("Настройки")}
                >
                  <Icon name="more" size={17} />
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
          <div className="header-actions">
            <span className="live-indicator" />{" "}
            <span className="all-working">Всё работает</span>
            <span className="header-divider" />
            <button
              className="icon-button"
              title="Помощь"
              onClick={() => setModal("help")}
            >
              <Icon name="help" size={19} />
            </button>
            <div className="notification-wrap">
              <button
                className="icon-button notification"
                title="Уведомления"
                onClick={() =>
                  setPopover(
                    popover === "notifications" ? null : "notifications",
                  )
                }
              >
                <Icon name="bell" size={19} />
                <i />
              </button>
              {popover === "notifications" && (
                <div className="popover notification-panel">
                  <strong>Уведомления</strong>
                  <p>Вы получили 3 новых заказа</p>
                  <small>Сегодня, 12:40</small>
                  <button
                    className="text-button"
                    onClick={() => {
                      setPopover(null);
                      setSection("Заказы");
                      setTab("В обработке");
                    }}
                  >
                    Посмотреть заказы <Icon name="arrow" size={14} />
                  </button>
                </div>
              )}
            </div>
            <span className="top-avatar">АС</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС ПОД КОНТРОЛЕМ</div>
              <h1>{section === "Главная" ? "Обзор магазина" : section}</h1>
              <p>
                {section === "Заказы"
                  ? "Управляйте заказами и следите за каждым этапом доставки."
                  : section === "Главная"
                    ? "Все важные показатели вашего магазина в одном месте."
                    : section === "Пользователи"
                      ? "Ваши клиенты и история взаимоотношений с ними."
                      : "Настройте рабочее пространство под себя."}
              </p>
            </div>
            {(section === "Заказы" || section === "Главная") && (
              <div className="heading-actions">
                <button className="button" onClick={exportOrders}>
                  <Icon name="download" size={16} />
                  Экспорт
                </button>
                <button
                  className="button primary"
                  onClick={() => setModal("new")}
                >
                  <Icon name="plus" size={18} />
                  Создать заказ
                </button>
              </div>
            )}
          </div>
          {(section === "Заказы" || section === "Главная") && (
            <>
              <section className="stats-grid">
                {[
                  {
                    label: "Всего заказов",
                    value: String(orders.length),
                    change: "+12,8%",
                    icon: "bag",
                    note: "за прошлый месяц",
                    chart: [12, 20, 16, 30, 25, 39, 34, 45, 41, 55, 48, 65],
                  },
                  {
                    label: "Выручка",
                    value: money(
                      orders
                        .filter((o) => o.payment === "Оплачен")
                        .reduce((s, o) => s + o.amount, 0),
                    ),
                    change: "+18,6%",
                    icon: "trend",
                    note: "за прошлый месяц",
                    chart: [12, 23, 17, 25, 36, 29, 40, 36, 51, 44, 57, 67],
                  },
                  {
                    label: "В обработке",
                    value: String(
                      orders.filter((o) => o.status === "В обработке").length,
                    ).padStart(2, "0"),
                    change: null,
                    icon: "clock",
                    note: "Ожидают вашего внимания",
                    chart: [40, 30, 39, 23, 27, 19, 31, 20, 25, 16, 26, 22],
                  },
                  {
                    label: "Доставлено",
                    value: String(
                      orders.filter((o) => o.status === "Доставлен").length,
                    ).padStart(2, "0"),
                    change: "+8,2%",
                    icon: "box",
                    note: "за прошлый месяц",
                    chart: [10, 20, 14, 31, 22, 35, 29, 43, 36, 49, 43, 59],
                  },
                ].map((stat, i) => (
                  <article className="stat-card" key={stat.label}>
                    <div className="stat-label">
                      {stat.label}
                      <Icon name={stat.icon as IconName} size={17} />
                    </div>
                    <div className="stat-value">
                      {stat.value}
                      <div className={`mini-chart chart-${i}`}>
                        {stat.chart.map((height, j) => (
                          <span key={j} style={{ height: height * 0.58 }} />
                        ))}
                      </div>
                    </div>
                    <div className="stat-foot">
                      {stat.change && (
                        <span className="stat-change">
                          <Icon name="trend" size={12} />
                          {stat.change}
                        </span>
                      )}
                      <span>{stat.note}</span>
                      {!stat.change && <span className="attention-dot" />}
                    </div>
                  </article>
                ))}
              </section>
              {section === "Главная" && (
                <div className="overview-note">
                  <span>
                    <Icon name="trend" size={20} />
                    <strong>Магазин растёт</strong> — выручка увеличилась на
                    18,6% за месяц.
                  </span>
                  <button
                    className="text-button"
                    onClick={() => setSection("Заказы")}
                  >
                    Все заказы <Icon name="arrow" size={15} />
                  </button>
                </div>
              )}
              <section className="orders-panel">
                <div className="tabs-row">
                  <div className="tabs">
                    {[
                      "Все заказы",
                      "В обработке",
                      "Доставлены",
                      "Не оплачены",
                    ].map((t) => (
                      <button
                        className={`tab ${tab === t ? "selected" : ""}`}
                        key={t}
                        onClick={() => setTab(t)}
                      >
                        {t}
                        {t === "Все заказы" && <span>{orders.length}</span>}
                        {t === "В обработке" && (
                          <span>
                            {
                              orders.filter((o) => o.status === "В обработке")
                                .length
                            }
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="updated">
                    <span />
                    Обновлено только что
                  </span>
                </div>
                <div className="table-toolbar" ref={popRef}>
                  <div className="search-box">
                    <Icon name="search" size={17} />
                    <input
                      placeholder="Поиск по номеру, имени или email"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Поиск заказов"
                    />
                    {search ? (
                      <button
                        title="Очистить поиск"
                        onClick={() => setSearch("")}
                      >
                        <Icon name="close" size={13} />
                      </button>
                    ) : null}
                  </div>
                  <div className="toolbar-control">
                    <button
                      className={`button small ${filter ? "is-active" : ""}`}
                      onClick={() =>
                        setPopover(popover === "filter" ? null : "filter")
                      }
                    >
                      <Icon name="filter" size={16} />
                      Фильтры{filter && <span className="filter-count">1</span>}
                    </button>
                    {popover === "filter" && (
                      <div className="popover filter-popover">
                        <strong>Статус заказа</strong>
                        {statusList.map((s) => (
                          <button
                            className="popover-option"
                            key={s}
                            onClick={() => {
                              setFilter(s);
                              setPopover(null);
                            }}
                          >
                            <StatusBadge status={s} />
                            {filter === s && <Icon name="check" size={15} />}
                          </button>
                        ))}
                        <button
                          className="text-button"
                          onClick={() => {
                            setFilter("");
                            setPopover(null);
                          }}
                        >
                          Сбросить фильтры
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="toolbar-control date-control">
                    <button
                      className="button small"
                      onClick={() =>
                        setPopover(popover === "date" ? null : "date")
                      }
                    >
                      <Icon name="calendar" size={15} />
                      {dateRange === "month"
                        ? "1–30 июня 2025"
                        : "18–24 июня 2025"}
                      <Icon name="chevron" size={12} className="down" />
                    </button>
                    {popover === "date" && (
                      <div className="popover">
                        <strong>Период заказов</strong>
                        <button
                          className="popover-option"
                          onClick={() => {
                            setDateRange("month");
                            setPopover(null);
                          }}
                        >
                          Весь месяц{" "}
                          {dateRange === "month" && (
                            <Icon name="check" size={15} />
                          )}
                        </button>
                        <button
                          className="popover-option"
                          onClick={() => {
                            setDateRange("week");
                            setPopover(null);
                          }}
                        >
                          Последние 7 дней{" "}
                          {dateRange === "week" && (
                            <Icon name="check" size={15} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="toolbar-spacer" />
                  <button
                    className={`button small group-button ${grouped ? "is-active" : ""}`}
                    onClick={() => {
                      setGrouped(!grouped);
                      setClosedGroups(new Set());
                    }}
                    title="Группировка по статусу"
                  >
                    <Icon name="group" size={15} />
                    <span>Группировка</span>
                    {grouped && <span className="active-indicator" />}
                  </button>
                  <div className="toolbar-control columns-control">
                    <button
                      className="button small"
                      onClick={() =>
                        setPopover(popover === "columns" ? null : "columns")
                      }
                    >
                      <Icon name="columns" size={15} />
                      <span>Колонки</span>
                    </button>
                    {popover === "columns" && (
                      <div className="popover columns-popover">
                        <strong>Видимые колонки</strong>
                        <small>Перетащите, чтобы изменить порядок</small>
                        {columns.map((c) => (
                          <label
                            className="column-option"
                            key={c}
                            draggable
                            onDragStart={() => setDrag(c)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => moveColumn(c)}
                          >
                            <Icon name="grip" size={14} />
                            <input
                              type="checkbox"
                              checked={!hidden.has(c)}
                              onChange={() =>
                                setHidden((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(c)) next.delete(c);
                                  else if (next.size < columns.length - 1)
                                    next.add(c);
                                  return next;
                                })
                              }
                            />
                            {columnLabels[c]}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {(filter || selected.size > 0) && (
                  <div className="selection-bar">
                    {selected.size > 0 ? (
                      <>
                        <strong>Выбрано: {selected.size}</strong>
                        <button onClick={exportOrders}>
                          <Icon name="download" size={14} />
                          Экспортировать
                        </button>
                        <button
                          onClick={() => {
                            setOrders((prev) =>
                              prev.map((o) =>
                                selected.has(o.id)
                                  ? { ...o, status: "В пути" }
                                  : o,
                              ),
                            );
                            setSelected(new Set());
                            setToast("Выбранные заказы переданы в доставку");
                          }}
                        >
                          <Icon name="truck" size={15} />
                          Передать в доставку
                        </button>
                        <button
                          className="clear-selection"
                          title="Снять выделение"
                          onClick={() => setSelected(new Set())}
                        >
                          <Icon name="close" size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span>Статус: {filter}</span>
                        <button onClick={() => setFilter("")}>
                          <Icon name="close" size={14} />
                          Сбросить
                        </button>
                      </>
                    )}
                  </div>
                )}
                <div className="table-scroll">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th className="checkbox-cell">
                          <input
                            aria-label="Выбрать все заказы на странице"
                            type="checkbox"
                            checked={
                              shown.length > 0 &&
                              shown.every((o) => selected.has(o.id))
                            }
                            ref={(el) => {
                              if (el)
                                el.indeterminate =
                                  shown.some((o) => selected.has(o.id)) &&
                                  !shown.every((o) => selected.has(o.id));
                            }}
                            onChange={selectAll}
                          />
                        </th>
                        {visibleColumns.map((c) => (
                          <th
                            key={c}
                            className={`column-${c} ${drag === c ? "dragging" : ""}`}
                            draggable
                            onDragStart={(e) => {
                              setDrag(c);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => setDrag(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => moveColumn(c)}
                            title="Перетащите, чтобы переместить колонку"
                          >
                            <span
                              onClick={() => c === "amount" && setSort(!sort)}
                            >
                              {columnLabels[c]}
                              {c === "date" ? (
                                <span className="sort-arrow">↓</span>
                              ) : c === "amount" ? (
                                <span className="sort-arrow">
                                  {sort ? "↑" : "↕"}
                                </span>
                              ) : null}
                              <Icon
                                name="grip"
                                size={12}
                                className="column-grip"
                              />
                            </span>
                          </th>
                        ))}
                        <th className="row-action-cell" />
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((group) => (
                        <FragmentGroup
                          key={group.status}
                          group={group}
                          grouped={grouped}
                          visibleColumns={visibleColumns}
                          closedGroups={closedGroups}
                          setClosedGroups={setClosedGroups}
                          selected={selected}
                          toggleSelected={toggleSelected}
                          renderCell={renderCell}
                          openDetail={openDetail}
                        />
                      ))}
                      {shown.length === 0 && (
                        <tr>
                          <td colSpan={visibleColumns.length + 2}>
                            <div className="empty-state">
                              <Icon name="search" size={30} />
                              <strong>Заказы не найдены</strong>
                              <p>
                                Попробуйте изменить запрос или сбросить фильтры.
                              </p>
                              <button
                                className="button"
                                onClick={() => {
                                  setSearch("");
                                  setFilter("");
                                  setTab("Все заказы");
                                  setDateRange("month");
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
                      {filtered.length ? (safePage - 1) * pageSize + 1 : 0}–
                      {Math.min(safePage * pageSize, filtered.length)}
                    </strong>{" "}
                    из <strong>{filtered.length}</strong> заказов
                  </span>
                  <div className="pagination">
                    <span className="rows-label">Строк на странице</span>
                    <select
                      aria-label="Строк на странице"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option value={8}>8</option>
                      <option value={16}>16</option>
                      <option value={32}>32</option>
                    </select>
                    <span className="pagination-divider" />
                    <button
                      className="page-button previous"
                      title="Предыдущая страница"
                      disabled={safePage === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <Icon name="chevron" size={14} />
                    </button>
                    {Array.from({ length: maxPage }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          className={`page-button ${p === safePage ? "current" : ""}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      className="page-button"
                      title="Следующая страница"
                      disabled={safePage === maxPage}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <Icon name="chevron" size={14} />
                    </button>
                  </div>
                </div>
              </section>
              <div className="bottom-note">
                <Icon name="grip" size={14} />
                <span>
                  Перетаскивайте заголовки колонок, чтобы настроить таблицу под
                  себя
                </span>
                <span className="secure-note">
                  <span />
                  Все изменения сохраняются автоматически
                </span>
              </div>
            </>
          )}
          {section === "Пользователи" && (
            <section className="users-panel">
              <div className="section-card-heading">
                <h2>
                  Клиенты магазина <span>{people.length}</span>
                </h2>
                <div className="search-box">
                  <Icon name="search" size={17} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Найти клиента"
                  />
                </div>
              </div>
              <div className="customer-grid">
                {people
                  .filter((p) =>
                    p.join(" ").toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((p) => (
                    <article className="customer-card" key={p[1]}>
                      <span className="avatar" style={{ background: p[3] }}>
                        {p[2]}
                      </span>
                      <h3>{p[0]}</h3>
                      <p>{p[1]}</p>
                      <div>
                        <span>
                          Заказов:{" "}
                          {orders.filter((o) => o.email === p[1]).length}
                        </span>
                        <strong>
                          {money(
                            orders
                              .filter((o) => o.email === p[1])
                              .reduce((s, o) => s + o.amount, 0),
                          )}
                        </strong>
                      </div>
                      <button
                        className="button small"
                        onClick={() => {
                          setSearch(p[1]);
                          setSection("Заказы");
                          setTab("Все заказы");
                          setFilter("");
                        }}
                      >
                        Посмотреть заказы <Icon name="arrow" size={13} />
                      </button>
                    </article>
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
                  setSavedName(shopName);
                  try {
                    localStorage.setItem(
                      "forma-email",
                      JSON.stringify(adminEmail),
                    );
                  } catch {}
                  setToast("Настройки сохранены");
                }}
              >
                <label>
                  Название магазина
                  <input
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </label>
                <label>
                  Email администратора
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Валюта магазина
                  <select defaultValue="RUB">
                    <option value="RUB">Российский рубль · ₽</option>
                  </select>
                </label>
                <button className="button primary" type="submit">
                  Сохранить изменения <Icon name="check" size={16} />
                </button>
              </form>
            </section>
          )}
        </main>
        <footer className="app-footer">
          <span>© 2025 Forma. Пространство для вашего бизнеса.</span>
          <span>
            Есть идея?{" "}
            <button onClick={() => setModal("help")}>
              Поделитесь с нами <Icon name="arrow" size={12} />
            </button>
          </span>
        </footer>
      </div>
      {modal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="modal"
          >
            <button
              className="modal-close icon-button"
              title="Закрыть"
              onClick={() => setModal(null)}
            >
              <Icon name="close" size={20} />
            </button>
            {modal === "new" ? (
              <>
                <span className="modal-icon">
                  <Icon name="bag" size={24} />
                </span>
                <h2 id="modal-title">Новый заказ</h2>
                <p>Заполните информацию о клиенте и заказе.</p>
                <form onSubmit={createOrder}>
                  <label>
                    Имя и фамилия клиента
                    <input
                      required
                      placeholder="Александр Петров"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </label>
                  <label>
                    Email клиента
                    <input
                      required
                      type="email"
                      placeholder="client@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </label>
                  <label>
                    Сумма заказа, ₽
                    <input
                      required
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="0"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </label>
                  <div className="modal-buttons">
                    <button
                      type="button"
                      className="button"
                      onClick={() => setModal(null)}
                    >
                      Отмена
                    </button>
                    <button type="submit" className="button primary">
                      <Icon name="plus" size={16} />
                      Создать заказ
                    </button>
                  </div>
                </form>
              </>
            ) : modal === "detail" && detail ? (
              <>
                <span className="modal-icon">
                  <Icon name="box" size={24} />
                </span>
                <h2 id="modal-title">Заказ #{detail.id}</h2>
                <p>
                  {detail.date} · {detail.items}{" "}
                  {detail.items === 1 ? "товар" : "товара"}
                </p>
                <div className="detail-customer">
                  <span className="avatar" style={{ background: detail.color }}>
                    {detail.initials}
                  </span>
                  <div>
                    <strong>{detail.name}</strong>
                    <small>{detail.email}</small>
                  </div>
                </div>
                <div className="detail-line">
                  <span>Сумма заказа</span>
                  <strong>{money(detail.amount)}</strong>
                </div>
                <div className="detail-line">
                  <span>Оплата</span>
                  <span>{detail.payment}</span>
                </div>
                <label className="status-select-label">
                  Статус заказа
                  <select
                    aria-label="Статус заказа"
                    value={detail.status}
                    onChange={(e) => {
                      const next = {
                        ...detail,
                        status: e.target.value as Status,
                      };
                      setDetail(next);
                      setOrders((prev) =>
                        prev.map((o) => (o.id === next.id ? next : o)),
                      );
                      setToast("Статус заказа обновлён");
                    }}
                  >
                    {statusList.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="button primary full-width"
                  onClick={() => setModal(null)}
                >
                  Готово <Icon name="check" size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="modal-icon">
                  <Icon name="help" size={24} />
                </span>
                <h2 id="modal-title">Добро пожаловать в Forma</h2>
                <p>Ваше пространство для управления магазином.</p>
                <div className="help-items">
                  <div>
                    <Icon name="bag" />
                    <span>
                      <strong>Управляйте заказами</strong>
                      <p>
                        Создавайте заказы и меняйте их статус, открыв номер
                        заказа.
                      </p>
                    </span>
                  </div>
                  <div>
                    <Icon name="columns" />
                    <span>
                      <strong>Настройте таблицу</strong>
                      <p>
                        Перетаскивайте заголовки колонок и выбирайте, какие из
                        них показывать.
                      </p>
                    </span>
                  </div>
                  <div>
                    <Icon name="group" />
                    <span>
                      <strong>Работайте быстрее</strong>
                      <p>
                        Группируйте заказы по статусу, выделяйте строки для
                        массовых действий и выгружайте их в CSV.
                      </p>
                    </span>
                  </div>
                </div>
                <button
                  className="button primary full-width"
                  onClick={() => setModal(null)}
                >
                  Всё понятно <Icon name="check" size={16} />
                </button>
              </>
            )}
          </section>
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

function FragmentGroup({
  group,
  grouped,
  visibleColumns,
  closedGroups,
  setClosedGroups,
  selected,
  toggleSelected,
  renderCell,
  openDetail,
}: {
  group: { status: string; rows: Order[] };
  grouped: boolean;
  visibleColumns: string[];
  closedGroups: Set<string>;
  setClosedGroups: React.Dispatch<React.SetStateAction<Set<string>>>;
  selected: Set<number>;
  toggleSelected: (id: number) => void;
  renderCell: (o: Order, c: string) => React.ReactNode;
  openDetail: (o: Order) => void;
}) {
  return (
    <>
      {grouped && (
        <tr
          className={`group-row group-${statusClass(group.status as Status)}`}
        >
          <td colSpan={visibleColumns.length + 2}>
            <button
              onClick={() =>
                setClosedGroups((prev) => {
                  const s = new Set(prev);
                  s.has(group.status)
                    ? s.delete(group.status)
                    : s.add(group.status);
                  return s;
                })
              }
              aria-expanded={!closedGroups.has(group.status)}
            >
              <Icon
                name="chevron"
                size={12}
                className={closedGroups.has(group.status) ? "" : "down"}
              />
              <span
                className={`group-status-dot ${statusClass(group.status as Status)}`}
              />
              <strong>{group.status}</strong>
              <span className="group-count">{group.rows.length}</span>
              <span className="group-total">
                {money(group.rows.reduce((s, o) => s + o.amount, 0))}
              </span>
            </button>
          </td>
        </tr>
      )}
      {!closedGroups.has(group.status) &&
        group.rows.map((o) => (
          <tr key={o.id} className={selected.has(o.id) ? "selected-row" : ""}>
            <td className="checkbox-cell">
              <input
                aria-label={`Выбрать заказ ${o.id}`}
                type="checkbox"
                checked={selected.has(o.id)}
                onChange={() => toggleSelected(o.id)}
              />
            </td>
            {visibleColumns.map((c) => (
              <td key={c} className={`column-${c}`}>
                {renderCell(o, c)}
              </td>
            ))}
            <td className="row-action-cell">
              <button
                className="icon-button"
                title={`Открыть заказ ${o.id}`}
                onClick={() => openDetail(o)}
              >
                <Icon name="more" size={17} />
              </button>
            </td>
          </tr>
        ))}
    </>
  );
}
