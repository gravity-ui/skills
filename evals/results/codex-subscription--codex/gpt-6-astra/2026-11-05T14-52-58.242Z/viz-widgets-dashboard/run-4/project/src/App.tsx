import { useState, useEffect, useRef, type ReactNode } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "chart"
  | "report"
  | "users"
  | "settings"
  | "help"
  | "chevron"
  | "plus"
  | "search"
  | "bell"
  | "arrow"
  | "download"
  | "calendar"
  | "sliders"
  | "more"
  | "grip"
  | "close"
  | "check"
  | "wallet"
  | "bag"
  | "target"
  | "external"
  | "clock"
  | "logout"
  | "reset";
const paths: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h17M8 15l4-5 4 3 5-7" />
    </>
  ),
  report: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  users: (
    <>
      <circle cx="10" cy="8" r="3" />
      <path d="M4 20v-2a6 6 0 0112 0v2M17 5a3 3 0 010 6m2 4a5 5 0 012 5" />
    </>
  ),
  settings: (
    <>
      <path d="m10 3-.7 2.2-2 .9-2.1-.5-2 3.4 1.5 1.7v2.6L3.2 15l2 3.4 2.2-.5 2 .9.6 2.2h4l.7-2.2 2-.9 2.1.5 2-3.4-1.5-1.7v-2.6L20.8 9l-2-3.4-2.2.5-2-.9L14 3z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 015 0c0 2-2.5 2-2.5 4m0 3h.01" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  arrow: <path d="m6 15 5-5 4 3 5-7m-5 0h5v5" />,
  download: (
    <>
      <path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4m10-4v4M3 10h18m-14 4h2m3 0h2m3 0h1m-11 3h2m3 0h2" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h9m4 0h3M4 17h3m4 0h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  grip: (
    <>
      {[8, 16].map((x) =>
        [5, 12, 19].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1" />),
      )}
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  wallet: (
    <>
      <rect x="3" y="5" width="18" height="15" rx="3" />
      <path d="M3 8V5a2 2 0 012-2h12M21 11h-6v5h6m-3-2.5h.01" />
    </>
  ),
  bag: (
    <>
      <path d="M5 7h14l2 14H3L5 7Z M8 8V6a4 4 0 018 0v2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  external: (
    <>
      <path d="M14 3h7v7m0-7L10 14M10 5H4v15h15v-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  logout: (
    <>
      <path d="M9 4H4v16h5m6-13 5 5-5 5m-7-5h12" />
    </>
  ),
  reset: (
    <>
      <path d="M4 10a8 8 0 118 10M4 4v6h6" />
    </>
  ),
};
function Icon({
  name,
  size = 20,
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

type WidgetKind =
  | "revenue"
  | "visitors"
  | "orders"
  | "conversion"
  | "chart"
  | "traffic"
  | "recent"
  | "activity"
  | "goal"
  | "notes";
type Widget = {
  id: string;
  kind: WidgetKind;
  x: number;
  y: number;
  w: number;
  h: number;
};
const initial: Widget[] = [
  { id: "revenue", kind: "revenue", x: 0, y: 0, w: 3, h: 2 },
  { id: "visitors", kind: "visitors", x: 3, y: 0, w: 3, h: 2 },
  { id: "orders", kind: "orders", x: 6, y: 0, w: 3, h: 2 },
  { id: "conversion", kind: "conversion", x: 9, y: 0, w: 3, h: 2 },
  { id: "chart", kind: "chart", x: 0, y: 2, w: 8, h: 4 },
  { id: "traffic", kind: "traffic", x: 8, y: 2, w: 4, h: 4 },
  { id: "recent", kind: "recent", x: 0, y: 6, w: 8, h: 4 },
  { id: "activity", kind: "activity", x: 8, y: 6, w: 4, h: 4 },
];
const titles: Record<WidgetKind, string> = {
  revenue: "Общая выручка",
  visitors: "Посетители",
  orders: "Заказы",
  conversion: "Конверсия",
  chart: "Динамика выручки",
  traffic: "Источники трафика",
  recent: "Последние заказы",
  activity: "Активность",
  goal: "Цель месяца",
  notes: "Заметки",
};
const kindIcons: Record<WidgetKind, IconName> = {
  revenue: "wallet",
  visitors: "users",
  orders: "bag",
  conversion: "target",
  chart: "chart",
  traffic: "users",
  recent: "report",
  activity: "clock",
  goal: "target",
  notes: "report",
};
const orders = [
  {
    id: "#ORD-1028",
    name: "Александр Иванов",
    email: "alex.ivanov@mail.ru",
    initials: "АИ",
    color: "lavender",
    product: "Тариф «Бизнес»",
    date: "24 июн, 14:32",
    amount: "12 900 ₽",
    status: "Оплачен",
  },
  {
    id: "#ORD-1027",
    name: "Мария Смирнова",
    email: "m.smirnova@gmail.com",
    initials: "МС",
    color: "peach",
    product: "Тариф «Команда»",
    date: "24 июн, 13:18",
    amount: "6 900 ₽",
    status: "Оплачен",
  },
  {
    id: "#ORD-1026",
    name: "Дмитрий Козлов",
    email: "d.kozlov@mail.ru",
    initials: "ДК",
    color: "blue",
    product: "Тариф «Старт»",
    date: "24 июн, 12:45",
    amount: "2 900 ₽",
    status: "В обработке",
  },
  {
    id: "#ORD-1025",
    name: "Анна Петрова",
    email: "anna.p@yandex.ru",
    initials: "АП",
    color: "pink",
    product: "Тариф «Бизнес»",
    date: "24 июн, 11:06",
    amount: "12 900 ₽",
    status: "Оплачен",
  },
];
function loadLayout(): Widget[] {
  try {
    const a = JSON.parse(localStorage.getItem("forma-layout") || "null");
    if (
      Array.isArray(a) &&
      a.every(
        (w) =>
          titles[w.kind as WidgetKind] &&
          Number.isFinite(w.x) &&
          Number.isFinite(w.y) &&
          w.w >= 2 &&
          w.w <= 12 &&
          w.h >= 2 &&
          w.x >= 0 &&
          w.x + w.w <= 12 &&
          w.y >= 0,
      )
    )
      return a;
  } catch {}
  return initial;
}
function overlaps(a: Widget, b: Widget) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}
function resolveLayout(layout: Widget[], moved: Widget) {
  const result = layout.map((w) => (w.id === moved.id ? moved : { ...w }));
  const queue = [moved];
  let count = 0;
  while (queue.length && count++ < 100) {
    const a = queue.shift()!;
    for (const b of result) {
      if (b.id !== a.id && b.id !== moved.id && overlaps(a, b)) {
        b.y = a.y + a.h;
        queue.push(b);
      }
    }
  }
  return result;
}
function Sparkline({ variant = 0 }: { variant?: number }) {
  const points = [
    "0,34 9,31 17,33 27,23 36,25 45,19 55,23 64,10 73,13 82,6 91,9 100,2",
    "0,33 10,30 20,32 30,22 39,25 49,17 58,20 67,10 78,14 88,5 100,8",
    "0,34 11,28 20,30 31,21 42,26 51,14 62,18 72,8 84,13 92,3 100,6",
    "0,34 10,29 20,31 32,21 41,24 52,18 63,22 73,10 84,14 93,5 100,7",
  ][variant];
  return (
    <svg className="sparkline" viewBox="0 0 100 42">
      <defs>
        <linearGradient id={`spark${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#9a79ed" stopOpacity=".15" />
          <stop offset="1" stopColor="#9a79ed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,42 ${points} 100,42`}
        fill={`url(#spark${variant})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke="#9672e8"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function App() {
  const [layout, setLayout] = useState<Widget[]>(loadLayout);
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [popover, setPopover] = useState<string | null>(null);
  const [period, setPeriod] = useState("month");
  const [activeNav, setActiveNav] = useState("Мой дашборд");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [widgetSearch, setWidgetSearch] = useState("");
  const [chartPeriod, setChartPeriod] = useState("День");
  const [notes, setNotes] = useState(
    () =>
      localStorage.getItem("forma-notes") ||
      "Запустить новую кампанию ✨\nОбсудить результаты месяца с командой",
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);
  const [settingsName, setSettingsName] = useState(
    () => localStorage.getItem("forma-name") || "Мой дашборд",
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(1000);
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    original: Widget;
    layout: Widget[];
    resize: boolean;
    current: Widget;
  } | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem("forma-layout", JSON.stringify(layout));
    } catch {}
  }, [layout]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new ResizeObserver((e) =>
      setGridWidth(e[0].contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setModal("search");
      }
      if (e.key === "Escape") {
        setModal(null);
        setPopover(null);
        setEditing(false);
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const narrow = gridWidth < 650;
  const step = (gridWidth + 18) / 12;
  function startDrag(e: React.PointerEvent, w: Widget, resize = false) {
    if (narrow) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      id: w.id,
      startX: e.clientX,
      startY: e.clientY,
      original: { ...w },
      layout: layout.map((i) => ({ ...i })),
      resize,
      current: w,
    };
    setDragId(w.id);
    setEditing(true);
  }
  function moveDrag(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = Math.round((e.clientX - d.startX) / step),
      dy = Math.round((e.clientY - d.startY) / 82);
    const w = d.resize
      ? {
          ...d.original,
          w: Math.max(3, Math.min(12 - d.original.x, d.original.w + dx)),
          h: Math.max(2, Math.min(8, d.original.h + dy)),
        }
      : {
          ...d.original,
          x: Math.max(0, Math.min(12 - d.original.w, d.original.x + dx)),
          y: Math.max(0, d.original.y + dy),
        };
    d.current = w;
    setLayout(resolveLayout(d.layout, w));
  }
  function endDrag() {
    if (drag.current) {
      drag.current = null;
      setDragId(null);
    }
  }
  function moveKeyboard(e: React.KeyboardEvent, w: Widget) {
    if (!e.key.startsWith("Arrow")) return;
    e.preventDefault();
    setEditing(true);
    setLayout(
      resolveLayout(layout, {
        ...w,
        x: Math.min(
          12 - w.w,
          Math.max(
            0,
            w.x + (e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0),
          ),
        ),
        y: Math.max(
          0,
          w.y + (e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0),
        ),
      }),
    );
  }
  function addWidget(kind: WidgetKind) {
    const y = Math.max(0, ...layout.map((w) => w.y + w.h));
    const stat = ["revenue", "visitors", "orders", "conversion"].includes(kind);
    setLayout([
      ...layout,
      {
        id: `${kind}-${Date.now()}`,
        kind,
        x: 0,
        y,
        w: stat ? 3 : kind === "chart" || kind === "recent" ? 8 : 4,
        h: stat ? 2 : 4,
      },
    ]);
    setModal(null);
    setEditing(true);
    setToast("Виджет добавлен на дашборд");
  }
  function exportData() {
    const csv =
      "\uFEFFЗаказ;Клиент;Тариф;Сумма;Статус\n" +
      orders
        .map((o) => [o.id, o.name, o.product, o.amount, o.status].join(";"))
        .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    a.download = "forma-orders.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    setToast("Отчёт экспортирован в CSV");
    setPopover(null);
  }
  const factor = period === "week" ? 0.26 : period === "today" ? 0.042 : 1;
  const metrics: Record<
    string,
    { value: string; change: string; foot: string; variant: number }
  > = {
    revenue: {
      value: `${Math.round(1245800 * factor).toLocaleString("ru-RU")} ₽`,
      change: "+18,6%",
      foot: "к прошлому периоду",
      variant: 0,
    },
    visitors: {
      value: Math.round(24892 * factor).toLocaleString("ru-RU"),
      change: "+12,8%",
      foot: "к прошлому периоду",
      variant: 1,
    },
    orders: {
      value: Math.round(1432 * factor).toLocaleString("ru-RU"),
      change: "+8,2%",
      foot: "к прошлому периоду",
      variant: 2,
    },
    conversion: {
      value:
        period === "week" ? "5,42%" : period === "today" ? "5,68%" : "5,75%",
      change: "+1,2%",
      foot: "к прошлому периоду",
      variant: 3,
    },
  };
  const displayed = layout.filter((w) =>
    activeNav === "Аналитика"
      ? [
          "chart",
          "traffic",
          "revenue",
          "visitors",
          "conversion",
          "goal",
        ].includes(w.kind)
      : activeNav === "Отчёты"
        ? ["recent", "revenue", "orders"].includes(w.kind)
        : true,
  );
  const visibleLayout =
    activeNav === "Аналитика" || activeNav === "Отчёты"
      ? displayed.map((w, i) => ({
          ...w,
          x: 0,
          y: displayed.slice(0, i).reduce((n, v) => n + v.h, 0),
          w: 12,
        }))
      : displayed;
  function navigate(name: string) {
    setActiveNav(name);
    setMobileNav(false);
    setPopover(null);
  }
  function renderWidget(w: Widget) {
    if (metrics[w.kind]) {
      const m = metrics[w.kind];
      return (
        <>
          <div className="metric-title">
            <span className={`metric-icon ${w.kind}`}>
              <Icon name={kindIcons[w.kind]} size={17} />
            </span>
            <span>{titles[w.kind]}</span>
          </div>
          <div className="metric-value">{m.value}</div>
          <div className="metric-bottom">
            <span className="positive">
              <Icon name="arrow" size={13} />
              {m.change}
            </span>
            <span className="metric-foot">{m.foot}</span>
          </div>
          <Sparkline variant={m.variant} />
        </>
      );
    }
    if (w.kind === "chart")
      return (
        <>
          <div className="card-heading">
            <div>
              <h3>Динамика выручки</h3>
              <p>Ваш бизнес в цифрах</p>
            </div>
            <div className="segmented">
              {["День", "Неделя", "Месяц"].map((t) => (
                <button
                  key={t}
                  className={chartPeriod === t ? "selected" : ""}
                  onClick={() => setChartPeriod(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-summary">
            <strong>{metrics.revenue.value}</strong>
            <span className="growth-badge">
              <Icon name="arrow" size={13} />
              18,6%
            </span>
            <div className="chart-legend">
              <span>
                <i />
                Текущий период
              </span>
              <span>
                <i />
                Прошлый период
              </span>
            </div>
          </div>
          <RevenueChart period={chartPeriod} factor={factor} />
        </>
      );
    if (w.kind === "traffic")
      return (
        <>
          <div className="card-heading">
            <div>
              <h3>Источники трафика</h3>
              <p>Откуда приходят посетители</p>
            </div>
          </div>
          <div className="traffic-content">
            <div className="donut">
              <svg viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="61"
                  fill="none"
                  stroke="#f2f0f6"
                  strokeWidth="19"
                />
                {[
                  { color: "#8b5de0", n: 44, offset: 0 },
                  { color: "#b49ae9", n: 28, offset: 44 },
                  { color: "#d4c3f1", n: 18, offset: 72 },
                  { color: "#ece5f7", n: 10, offset: 90 },
                ].map((s) => (
                  <circle
                    key={s.color}
                    cx="80"
                    cy="80"
                    r="61"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="19"
                    pathLength="100"
                    strokeDasharray={`${s.n - 1.5} ${101.5 - s.n}`}
                    strokeDashoffset={-s.offset}
                    transform="rotate(-90 80 80)"
                  />
                ))}
              </svg>
              <div>
                <strong>{metrics.visitors.value}</strong>
                <span>посетителей</span>
              </div>
            </div>
            <div className="traffic-legend">
              {[
                ["Поиск", "44%", "#8b5de0"],
                ["Прямые", "28%", "#b49ae9"],
                ["Соцсети", "18%", "#d4c3f1"],
                ["Другое", "10%", "#ece5f7"],
              ].map((r) => (
                <div key={r[0]}>
                  <span>
                    <i style={{ background: r[2] }} />
                    {r[0]}
                  </span>
                  <b>{r[1]}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <span>
              <span className="tiny-dot" />4 активных источника
            </span>
            <button onClick={() => setModal("traffic")}>
              Подробнее <Icon name="chevron" size={14} />
            </button>
          </div>
        </>
      );
    if (w.kind === "recent")
      return (
        <>
          <div className="card-heading">
            <div className="heading-inline">
              <h3>Последние заказы</h3>
              <span className="count-badge">
                {Math.round(1432 * factor).toLocaleString("ru-RU")}
              </span>
            </div>
            <button className="text-button" onClick={() => setModal("orders")}>
              Все заказы <Icon name="chevron" size={14} />
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Заказ</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => {
                      setSelectedOrder(o);
                      setModal("order");
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSelectedOrder(o);
                        setModal("order");
                      }
                    }}
                  >
                    <td>
                      <div className="customer">
                        <span className={`avatar ${o.color}`}>
                          {o.initials}
                        </span>
                        <div>
                          <strong>{o.name}</strong>
                          <small>{o.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="order-id">
                      {o.id}
                      <small>{o.date}</small>
                    </td>
                    <td className="amount">{o.amount}</td>
                    <td>
                      <span
                        className={`status ${o.status === "Оплачен" ? "paid" : "pending"}`}
                      >
                        <i />
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    if (w.kind === "activity")
      return (
        <>
          <div className="card-heading">
            <h3>Активность</h3>
            <span className="live">
              <i />В реальном времени
            </span>
          </div>
          <div className="activity-list">
            {[
              {
                icon: "bag" as IconName,
                color: "lavender",
                title: "Новый заказ",
                desc: "Александр Иванов · 12 900 ₽",
                time: "2 минуты назад",
              },
              {
                icon: "users" as IconName,
                color: "blue",
                title: "Новый пользователь",
                desc: "Мария присоединилась к команде",
                time: "18 минут назад",
              },
              {
                icon: "target" as IconName,
                color: "green",
                title: "Цель достигнута",
                desc: "Более 1 000 заказов в этом месяце",
                time: "1 час назад",
              },
            ].map((a, i) => (
              <div className="activity-item" key={a.title}>
                <span className={`activity-icon ${a.color}`}>
                  <Icon name={a.icon} size={17} />
                </span>
                <div>
                  <strong>
                    {a.title}
                    {i === 0 && <i className="new-dot" />}
                  </strong>
                  <p>{a.desc}</p>
                  <small>{a.time}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="card-footer activity-footer">
            <button onClick={() => setModal("activity")}>
              Вся активность <Icon name="chevron" size={14} />
            </button>
          </div>
        </>
      );
    if (w.kind === "goal")
      return (
        <>
          <div className="card-heading">
            <h3>Цель месяца</h3>
            <Icon name="target" />
          </div>
          <div className="goal-body">
            <span className="goal-icon">
              <Icon name="target" size={38} />
            </span>
            <strong>83%</strong>
            <p>До цели осталось совсем немного</p>
            <div className="progress">
              <i />
            </div>
            <span>
              1 245 800 ₽ <b>из 1 500 000 ₽</b>
            </span>
          </div>
        </>
      );
    return (
      <>
        <div className="card-heading">
          <h3>Заметки</h3>
          <Icon name="report" size={18} />
        </div>
        <textarea
          className="notes"
          aria-label="Ваши заметки"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            localStorage.setItem("forma-notes", e.target.value);
          }}
          placeholder="Запишите что-нибудь важное…"
        />
        <div className="notes-saved">
          <Icon name="check" size={13} />
          Сохраняется автоматически
        </div>
      </>
    );
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Мой дашборд");
          }}
        >
          <span className="brand-symbol">
            <i />
            <i />
            <i />
            <i />
          </span>
          forma<span className="brand-dot">.</span>
        </a>
        <button
          className="workspace"
          onClick={() =>
            setPopover(popover === "workspace" ? null : "workspace")
          }
        >
          <span className="workspace-logo">
            S<span>✦</span>
          </span>
          <span>
            <strong>Studio workspace</strong>
            <small>
              Тариф Pro <span className="pro-dot" />
            </small>
          </span>
          <Icon name="chevron" size={15} />
        </button>
        {popover === "workspace" && (
          <div className="workspace-pop popover">
            <strong>Рабочие пространства</strong>
            <button
              onClick={() => {
                setPopover(null);
                setToast("Вы в рабочем пространстве Studio");
              }}
            >
              <Icon name="check" size={16} />
              Studio workspace
            </button>
            <button
              onClick={() => {
                setPopover(null);
                setModal("workspace");
              }}
            >
              <Icon name="plus" size={16} />
              Новое пространство
            </button>
          </div>
        )}
        <div className="nav-section-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          {(
            [
              ["Мой дашборд", "grid"],
              ["Аналитика", "chart"],
              ["Отчёты", "report"],
            ] as [string, IconName][]
          ).map(([label, icon]) => (
            <button
              key={label}
              className={activeNav === label ? "active" : ""}
              onClick={() => navigate(label)}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {label === "Мой дашборд" && (
                <span className="nav-count">{layout.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-section-label favorite-label">
          ИЗБРАННОЕ
          <button
            aria-label="Добавить дашборд"
            onClick={() => setModal("new-dashboard")}
          >
            <Icon name="plus" size={15} />
          </button>
        </div>
        <nav className="favorite-nav">
          {["Маркетинг", "Продажи"].map((n, i) => (
            <button
              className={activeNav === n ? "active" : ""}
              key={n}
              onClick={() => navigate(n)}
            >
              <i className={`favorite-dot dot-${i}`} />
              {n}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-title">
              <span>✧</span>Больше возможностей
            </div>
            <p>
              Все инструменты для роста
              <br />
              вашего бизнеса.
            </p>
            <button onClick={() => setModal("pro")}>
              Открыть Pro <Icon name="external" size={13} />
            </button>
            <div className="upgrade-decoration">✧</div>
          </div>
          <nav>
            <button onClick={() => setModal("settings")}>
              <Icon name="settings" />
              Настройки
            </button>
            <button onClick={() => setModal("help")}>
              <Icon name="help" />
              Помощь и поддержка
              <Icon name="external" size={14} />
            </button>
          </nav>
          <button className="profile" onClick={() => setModal("profile")}>
            <span className="profile-avatar">АК</span>
            <span>
              <strong>Алексей Ковалёв</strong>
              <small>Личный аккаунт</small>
            </span>
            <Icon name="chevron" size={15} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Открыть меню"
              onClick={() => setMobileNav(!mobileNav)}
            >
              <Icon name="grid" />
            </button>
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{activeNav}</strong>
          </div>
          <div className="top-actions">
            <button
              className="search-trigger"
              onClick={() => setModal("search")}
            >
              <Icon name="search" size={18} />
              <span>Поиск...</span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Уведомления"
                onClick={() =>
                  setPopover(
                    popover === "notifications" ? null : "notifications",
                  )
                }
              >
                <Icon name="bell" size={20} />
                <i />
              </button>
              {popover === "notifications" && (
                <div className="popover notification-pop">
                  <strong>
                    Уведомления <span className="count-badge">2</span>
                  </strong>
                  <p>🎉 Цель в 1 000 заказов достигнута!</p>
                  <small>Сегодня, 13:00</small>
                  <p>Отчёт за июнь готов к экспорту</p>
                  <button onClick={exportData}>
                    <Icon name="download" size={16} />
                    Скачать отчёт
                  </button>
                </div>
              )}
            </div>
            <span className="topbar-divider" />
            <button
              className="profile-avatar top-avatar"
              aria-label="Мой профиль"
              onClick={() => setModal("profile")}
            >
              АК
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="page-eyebrow">ВАШ БИЗНЕС. ВСЯ КАРТИНА.</div>
              <h1>
                {activeNav === "Мой дашборд" ? settingsName : activeNav}
                <span className="title-dot" />
              </h1>
              <p>Все важные показатели — в одном месте.</p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                setWidgetSearch("");
                setModal("widgets");
              }}
            >
              <Icon name="plus" size={18} />
              Добавить виджет
            </button>
          </div>
          <div className="dashboard-toolbar">
            <div className="dashboard-tabs">
              <button
                className="current"
                onClick={() => navigate("Мой дашборд")}
              >
                <Icon name="grid" size={16} />
                Обзор<span>{layout.length}</span>
              </button>
              <button
                className="tab-add"
                aria-label="Создать новый дашборд"
                onClick={() => setModal("new-dashboard")}
              >
                <Icon name="plus" size={16} />
              </button>
            </div>
            <div className="toolbar-actions">
              <div className="period-wrap">
                <button
                  className="secondary-button date-button"
                  onClick={() =>
                    setPopover(popover === "period" ? null : "period")
                  }
                >
                  <Icon name="calendar" size={16} />
                  {period === "month"
                    ? "1 – 30 июня 2025"
                    : period === "week"
                      ? "18 – 24 июня 2025"
                      : "24 июня 2025"}
                  <Icon name="chevron" size={12} className="rotate" />
                </button>
                {popover === "period" && (
                  <div className="popover period-pop">
                    {[
                      ["today", "Сегодня"],
                      ["week", "Последние 7 дней"],
                      ["month", "Этот месяц"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        className={period === value ? "chosen" : ""}
                        onClick={() => {
                          setPeriod(value);
                          setPopover(null);
                        }}
                      >
                        {label}
                        {period === value && <Icon name="check" size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="secondary-button export-button"
                onClick={exportData}
              >
                <Icon name="download" size={16} />
                Экспорт
              </button>
              <div className="toolbar-divider" />
              <button
                className={`secondary-button customize ${editing ? "editing" : ""}`}
                onClick={() => {
                  setEditing(!editing);
                  if (editing) setToast("Расположение виджетов сохранено");
                }}
              >
                <Icon name={editing ? "check" : "sliders"} size={16} />
                {editing ? "Готово" : "Настроить"}
              </button>
            </div>
          </div>
          {editing && (
            <div className="edit-banner">
              <span>
                <Icon name="grip" size={17} />
                {narrow
                  ? "Добавляйте и удаляйте виджеты. Перемещение доступно на широком экране."
                  : "Перетаскивайте виджеты за ⋮⋮. Потяните за угол, чтобы изменить размер."}
              </span>
              <button
                onClick={() => {
                  setLayout(initial);
                  setToast("Исходное расположение восстановлено");
                }}
              >
                <Icon name="reset" size={14} />
                Сбросить
              </button>
            </div>
          )}
          <div
            ref={gridRef}
            className={`dashboard-grid ${editing ? "is-editing" : ""} ${narrow ? "is-narrow" : ""}`}
            style={
              narrow
                ? undefined
                : {
                    height:
                      Math.max(4, ...visibleLayout.map((w) => w.y + w.h)) * 82 -
                      18,
                  }
            }
          >
            {visibleLayout.map((w) => (
              <article
                key={w.id}
                data-widget={w.id}
                className={`widget widget-${w.kind} ${metrics[w.kind] ? "metric-card" : ""} ${dragId === w.id ? "dragging" : ""}`}
                style={
                  narrow
                    ? undefined
                    : {
                        left: w.x * step,
                        top: w.y * 82,
                        width: w.w * step - 18,
                        height: w.h * 82 - 18,
                      }
                }
              >
                <div className="widget-controls">
                  <button
                    className="drag-handle"
                    aria-label={`Переместить: ${titles[w.kind]}`}
                    title="Перетащите или используйте стрелки"
                    onPointerDown={(e) => startDrag(e, w)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onKeyDown={(e) => moveKeyboard(e, w)}
                  >
                    <Icon name="grip" size={16} />
                  </button>
                  <button
                    className="widget-more"
                    aria-label={`Меню: ${titles[w.kind]}`}
                    onClick={() => setPopover(popover === w.id ? null : w.id)}
                  >
                    <Icon name="more" size={18} />
                  </button>
                </div>
                {popover === w.id && (
                  <div className="popover widget-pop">
                    <button
                      onClick={() => {
                        setEditing(true);
                        setPopover(null);
                      }}
                    >
                      <Icon name="sliders" size={15} />
                      Настроить расположение
                    </button>
                    <button
                      className="danger"
                      onClick={() => {
                        setLayout(layout.filter((i) => i.id !== w.id));
                        setPopover(null);
                        setToast("Виджет удалён. Его можно добавить снова.");
                      }}
                    >
                      <Icon name="close" size={15} />
                      Удалить виджет
                    </button>
                  </div>
                )}
                {renderWidget(w)}
                {editing && !narrow && (
                  <button
                    className="resize-handle"
                    aria-label={`Изменить размер: ${titles[w.kind]}`}
                    onPointerDown={(e) => startDrag(e, w, true)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                  >
                    ⌟
                  </button>
                )}
              </article>
            ))}
            {!layout.length && (
              <div className="empty-state">
                <Icon name="grid" size={40} />
                <h3>Ваш дашборд начинается здесь</h3>
                <p>Добавьте первый виджет и настройте пространство под себя.</p>
                <button
                  className="primary-button"
                  onClick={() => setModal("widgets")}
                >
                  Добавить виджет
                </button>
              </div>
            )}
          </div>
          <footer className="page-footer">
            <span>
              <span className="tiny-dot" />
              Демо-данные · Обновлено сегодня в 14:32
            </span>
            <span>
              <Icon name="grip" size={14} />
              Ваш дашборд, ваши правила
            </span>
          </footer>
        </main>
      </div>
      {modal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className={`modal ${modal === "widgets" ? "widget-library" : ""} ${modal === "orders" ? "wide-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={modal === "widgets" ? "Библиотека виджетов" : "Панель"}
          >
            <button
              className="modal-close icon-button"
              aria-label="Закрыть"
              onClick={() => setModal(null)}
            >
              <Icon name="close" />
            </button>
            {modal === "widgets" ? (
              <>
                <span className="modal-eyebrow">
                  СОЗДАЙТЕ СВОЁ ПРОСТРАНСТВО
                </span>
                <h2>Библиотека виджетов</h2>
                <p className="modal-description">
                  Выберите то, что важно для вас. Остальное — за нами.
                </p>
                <div className="search-input">
                  <Icon name="search" size={18} />
                  <input
                    autoFocus
                    placeholder="Найти виджет…"
                    value={widgetSearch}
                    onChange={(e) => setWidgetSearch(e.target.value)}
                  />
                </div>
                <div className="widget-options">
                  {(Object.keys(titles) as WidgetKind[])
                    .filter((k) =>
                      titles[k]
                        .toLowerCase()
                        .includes(widgetSearch.toLowerCase()),
                    )
                    .map((k) => (
                      <button key={k} onClick={() => addWidget(k)}>
                        <span className="library-icon">
                          <Icon name={kindIcons[k]} size={24} />
                        </span>
                        <strong>{titles[k]}</strong>
                        <small>
                          {[
                            "revenue",
                            "visitors",
                            "orders",
                            "conversion",
                          ].includes(k)
                            ? "Ключевой показатель"
                            : k === "notes"
                              ? "Ваши идеи и планы"
                              : "Детальная статистика"}
                        </small>
                        <span className="library-add">
                          <Icon name="plus" size={16} />
                        </span>
                      </button>
                    ))}
                </div>
                {!Object.values(titles).some((t) =>
                  t.toLowerCase().includes(widgetSearch.toLowerCase()),
                ) && (
                  <p className="empty-search">
                    Виджеты не найдены. Попробуйте другой запрос.
                  </p>
                )}
              </>
            ) : modal === "search" ? (
              <>
                <h2>Поиск по пространству</h2>
                <div className="search-input">
                  <Icon name="search" />
                  <input
                    autoFocus
                    placeholder="Виджет, клиент или номер заказа…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="search-results">
                  {layout
                    .filter((w) =>
                      titles[w.kind]
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          navigate("Мой дашборд");
                          setModal(null);
                          setTimeout(
                            () =>
                              document
                                .querySelector(`[data-widget="${w.id}"]`)
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                }),
                            80,
                          );
                        }}
                      >
                        <Icon name={kindIcons[w.kind]} />
                        <span>
                          {titles[w.kind]}
                          <small>Виджет на дашборде</small>
                        </span>
                        <Icon name="chevron" size={15} />
                      </button>
                    ))}
                  {orders
                    .filter((o) =>
                      (o.name + o.id)
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSelectedOrder(o);
                          setModal("order");
                        }}
                      >
                        <Icon name="bag" />
                        <span>
                          {o.name}
                          <small>
                            {o.id} · {o.amount}
                          </small>
                        </span>
                        <Icon name="chevron" size={15} />
                      </button>
                    ))}
                  {search &&
                    !layout.some((w) =>
                      titles[w.kind]
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    ) &&
                    !orders.some((o) =>
                      (o.name + o.id)
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    ) && <p>Ничего не найдено. Попробуйте другой запрос.</p>}
                </div>
              </>
            ) : modal === "order" ? (
              <>
                <span className="modal-eyebrow">ДЕТАЛИ ЗАКАЗА</span>
                <h2>{selectedOrder.id}</h2>
                <div className="order-detail">
                  <div className="customer">
                    <span className={`avatar ${selectedOrder.color}`}>
                      {selectedOrder.initials}
                    </span>
                    <div>
                      <strong>{selectedOrder.name}</strong>
                      <small>{selectedOrder.email}</small>
                    </div>
                  </div>
                  {[
                    ["Тариф", selectedOrder.product],
                    ["Создан", selectedOrder.date],
                    ["Сумма", selectedOrder.amount],
                    ["Статус", selectedOrder.status],
                  ].map(([a, b]) => (
                    <div className="detail-row" key={a}>
                      <span>{a}</span>
                      <strong>{b}</strong>
                    </div>
                  ))}
                </div>
                <button className="secondary-button" onClick={exportData}>
                  <Icon name="download" size={16} />
                  Экспорт заказов
                </button>
              </>
            ) : modal === "orders" ? (
              <>
                <h2>Все заказы</h2>
                <p className="modal-description">
                  Последние заказы в демонстрационном пространстве
                </p>
                <div className="all-orders">
                  {orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setSelectedOrder(o);
                        setModal("order");
                      }}
                    >
                      <span className={`avatar ${o.color}`}>{o.initials}</span>
                      <span>
                        <strong>{o.name}</strong>
                        <small>
                          {o.id} · {o.product}
                        </small>
                      </span>
                      <b>{o.amount}</b>
                      <span
                        className={`status ${o.status === "Оплачен" ? "paid" : "pending"}`}
                      >
                        {o.status}
                      </span>
                    </button>
                  ))}
                </div>
                <button className="secondary-button" onClick={exportData}>
                  <Icon name="download" size={16} />
                  Экспортировать CSV
                </button>
              </>
            ) : modal === "settings" ? (
              <>
                <h2>Настройки дашборда</h2>
                <p className="modal-description">
                  Сделайте это пространство своим.
                </p>
                <label className="field-label">
                  Название дашборда
                  <input
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                  />
                </label>
                <button
                  className="primary-button"
                  onClick={() => {
                    setSettingsName(settingsName.trim() || "Мой дашборд");
                    localStorage.setItem(
                      "forma-name",
                      settingsName.trim() || "Мой дашборд",
                    );
                    setModal(null);
                    setToast("Настройки сохранены");
                  }}
                >
                  Сохранить изменения
                </button>
                <button
                  className="reset-settings"
                  onClick={() => {
                    setLayout(initial);
                    setToast("Расположение восстановлено");
                  }}
                >
                  <Icon name="reset" size={16} />
                  Восстановить исходные виджеты
                </button>
              </>
            ) : modal === "help" ? (
              <>
                <span className="library-icon">
                  <Icon name="help" size={28} />
                </span>
                <h2>Пространство под ваши задачи</h2>
                <div className="help-list">
                  <div>
                    <b>01</b>
                    <span>
                      <strong>Добавляйте виджеты</strong>
                      <p>
                        Откройте библиотеку кнопкой «Добавить виджет» и выберите
                        нужные показатели.
                      </p>
                    </span>
                  </div>
                  <div>
                    <b>02</b>
                    <span>
                      <strong>Меняйте расположение</strong>
                      <p>
                        Нажмите «Настроить». Перетаскивайте виджеты за шесть
                        точек или используйте стрелки клавиатуры, выбрав ручку
                        переноса.
                      </p>
                    </span>
                  </div>
                  <div>
                    <b>03</b>
                    <span>
                      <strong>Настраивайте размер</strong>
                      <p>
                        Потяните за нижний правый угол. Расположение и заметки
                        сохраняются в этом браузере автоматически.
                      </p>
                    </span>
                  </div>
                </div>
              </>
            ) : modal === "traffic" ? (
              <>
                <h2>Источники трафика</h2>
                <p className="modal-description">
                  Распределение {metrics.visitors.value} посетителей за
                  выбранный период
                </p>
                {[
                  ["Поисковые системы", 44],
                  ["Прямые переходы", 28],
                  ["Социальные сети", 18],
                  ["Другие источники", 10],
                ].map(([n, v]) => (
                  <div className="source-detail" key={n}>
                    <div>
                      <strong>{n}</strong>
                      <span>
                        {Math.round(
                          (24892 * factor * Number(v)) / 100,
                        ).toLocaleString("ru-RU")}{" "}
                        · {v}%
                      </span>
                    </div>
                    <div className="progress">
                      <i style={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
              </>
            ) : modal === "activity" ? (
              <>
                <h2>Лента активности</h2>
                <p className="modal-description">Сегодня, 24 июня 2025</p>
                {[
                  "14:32 — Новый заказ от Александра Иванова · 12 900 ₽",
                  "14:16 — Мария присоединилась к команде",
                  "13:30 — Достигнута цель: 1 000 заказов за месяц",
                  "12:45 — Заказ Дмитрия Козлова ожидает оплаты",
                  "11:06 — Анна Петрова приобрела тариф «Бизнес»",
                ].map((s) => (
                  <div className="detail-row" key={s}>
                    <Icon name="clock" size={18} />
                    <span>{s}</span>
                  </div>
                ))}
              </>
            ) : modal === "profile" ? (
              <>
                <span className="profile-avatar big-avatar">АК</span>
                <h2>Алексей Ковалёв</h2>
                <p className="modal-description">alexey@studio.ru</p>
                <div className="detail-row">
                  <span>Рабочее пространство</span>
                  <strong>Studio workspace</strong>
                </div>
                <div className="detail-row">
                  <span>Роль</span>
                  <strong>Владелец</strong>
                </div>
                <div className="detail-row">
                  <span>Тариф</span>
                  <span className="growth-badge">Pro</span>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setModal("settings")}
                >
                  Настроить дашборд
                </button>
              </>
            ) : modal === "pro" ? (
              <>
                <span className="pro-large">✧</span>
                <h2>Больше пространства для идей</h2>
                <p className="modal-description">
                  В вашем демонстрационном пространстве уже доступны возможности
                  Pro.
                </p>
                <div className="pro-features">
                  {[
                    "Неограниченное количество виджетов",
                    "Гибкая сетка и изменение размеров",
                    "Экспорт отчётов в CSV",
                    "Автоматическое сохранение",
                  ].map((t) => (
                    <p key={t}>
                      <Icon name="check" size={18} />
                      {t}
                    </p>
                  ))}
                </div>
                <button
                  className="primary-button"
                  onClick={() => setModal("widgets")}
                >
                  Попробовать возможности
                </button>
              </>
            ) : (
              <>
                <h2>
                  {modal === "workspace"
                    ? "Новое пространство"
                    : "Новый дашборд"}
                </h2>
                <p className="modal-description">
                  Начните с чистого листа и добавьте нужные виджеты.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    const name = String(data.get("name")).trim();
                    if (name) {
                      setSettingsName(name);
                      localStorage.setItem("forma-name", name);
                      setLayout([]);
                      navigate("Мой дашборд");
                      setModal("widgets");
                      setToast("Новый дашборд создан");
                    }
                  }}
                >
                  <label className="field-label">
                    Название
                    <input
                      name="name"
                      autoFocus
                      required
                      placeholder="Например, Обзор проекта"
                    />
                  </label>
                  <p className="form-note">
                    Новый дашборд заменит текущую сетку. Исходные виджеты можно
                    восстановить в настройках.
                  </p>
                  <button className="primary-button" type="submit">
                    <Icon name="plus" size={17} />
                    Создать дашборд
                  </button>
                </form>
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
          <button aria-label="Закрыть уведомление" onClick={() => setToast("")}>
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function RevenueChart({ period, factor }: { period: string; factor: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const paths =
    period === "День"
      ? [
          "M0 125 C14 124 15 145 32 139 S48 110 64 113 S86 132 104 116 S128 106 143 110 S160 83 179 85 S202 107 219 96 S234 67 252 76 S273 98 291 73 S310 50 328 61 S347 60 364 39 S385 62 403 43 S423 34 441 19 S467 31 486 17 S508 22 530 4",
          "M0 146 C25 148 31 130 49 138 S70 126 91 140 S116 132 136 134 S159 111 179 121 S206 111 224 123 S249 102 270 113 S293 96 315 106 S335 97 357 102 S378 83 398 93 S422 78 442 91 S470 74 491 87 S511 68 530 74",
        ]
      : period === "Неделя"
        ? [
            "M0 140 C90 130 90 125 177 95 S270 110 354 52 S440 72 530 10",
            "M0 150 C90 145 100 135 177 130 S270 120 354 104 S440 108 530 74",
          ]
        : [
            "M0 142 C140 135 170 100 260 90 S410 45 530 8",
            "M0 150 C140 140 170 138 260 120 S410 100 530 74",
          ];
  return (
    <div className="revenue-chart">
      <div className="y-labels">
        {[60, 45, 30, 15, 0].map((n) => (
          <span key={n}>{Math.round(n * factor)} тыс.</span>
        ))}
      </div>
      <div className="chart-plot" onMouseLeave={() => setHover(null)}>
        <svg
          viewBox="0 0 530 170"
          preserveAspectRatio="none"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHover(
              Math.max(
                0,
                Math.min(29, Math.floor(((e.clientX - r.left) / r.width) * 30)),
              ),
            );
          }}
        >
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#a27be5" stopOpacity=".18" />
              <stop offset="1" stopColor="#b59be9" stopOpacity=".015" />
            </linearGradient>
          </defs>
          {[10, 48, 86, 124, 163].map((y) => (
            <line
              key={y}
              x1="0"
              x2="530"
              y1={y}
              y2={y}
              stroke="#ecebf0"
              strokeDasharray="3 5"
            />
          ))}
          <path
            d={`${paths[0]} L530 170 L0 170Z`}
            fill="url(#chart-gradient)"
          />
          <path
            d={paths[1]}
            fill="none"
            stroke="#d3c5ee"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <path d={paths[0]} fill="none" stroke="#9062de" strokeWidth="2.6" />
          {hover !== null && (
            <line
              x1={(hover * 530) / 29}
              x2={(hover * 530) / 29}
              y1="0"
              y2="170"
              stroke="#8b5de0"
              strokeDasharray="3 3"
            />
          )}
        </svg>
        {hover !== null && (
          <div
            className="chart-tooltip"
            style={{ left: `${Math.min(75, (hover / 29) * 100)}%` }}
          >
            <small>{hover + 1} июня</small>
            <strong>
              {Math.round((21000 + hover * 1320) * factor).toLocaleString(
                "ru-RU",
              )}{" "}
              ₽
            </strong>
          </div>
        )}
        <div className="x-labels">
          {[
            "1 июн",
            "5 июн",
            "10 июн",
            "15 июн",
            "20 июн",
            "25 июн",
            "30 июн",
          ].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
