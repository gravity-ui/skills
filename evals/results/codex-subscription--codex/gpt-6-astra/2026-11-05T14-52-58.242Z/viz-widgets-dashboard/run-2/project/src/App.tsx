import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "chart"
  | "folder"
  | "users"
  | "plus"
  | "chevron"
  | "search"
  | "bell"
  | "arrow"
  | "calendar"
  | "sliders"
  | "grip"
  | "more"
  | "close"
  | "check"
  | "external"
  | "help"
  | "logout"
  | "wallet"
  | "cart"
  | "target"
  | "clock"
  | "download"
  | "star";
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
        <rect x="3" y="3" width="7" height="7" rx="1.6" />
        <rect x="14" y="3" width="7" height="7" rx="1.6" />
        <rect x="3" y="14" width="7" height="7" rx="1.6" />
        <rect x="14" y="14" width="7" height="7" rx="1.6" />
      </>
    ),
    chart: (
      <>
        <path d="M4 4v16h16M8 15l4-5 4 3 5-7" />
      </>
    ),
    folder: (
      <path d="M3 7V5a2 2 0 0 1 2-2h5l3 4h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
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
    arrow: <path d="M5 17 18 4M6 4h12v12" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 11h18m-12 5h.01m4 0h.01m4 0h.01" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 7h7m4 0h5M4 17h3m4 0h9" />
        <circle cx="13" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
      </>
    ),
    grip: (
      <>
        {[7, 12, 17].map((y) => (
          <g key={y}>
            <circle cx="9" cy={y} r=".7" />
            <circle cx="15" cy={y} r=".7" />
          </g>
        ))}
      </>
    ),
    more: (
      <>
        {[5, 12, 19].map((x) => (
          <circle key={x} cx={x} cy="12" r="1" />
        ))}
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3h.01" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5m5-13 5 5-5 5m-6-5h11" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M3 8V5l13-3v3m5 7h-6v5h6m-3-2.5h.01" />
      </>
    ),
    cart: (
      <>
        <path d="M2 3h3l3 12h11l3-9H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 15v6h16v-6" />
      </>
    ),
    star: <path d="m12 3 3 6 6 1-4.5 4.5 1 6.5L12 18l-5.5 3 1-6.5L3 10l6-1Z" />,
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
type WidgetType =
  | "revenue"
  | "orders"
  | "customers"
  | "conversion"
  | "chart"
  | "traffic"
  | "projects"
  | "activity";
type Widget = {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
};
const titles: Record<WidgetType, string> = {
  revenue: "Общая выручка",
  orders: "Заказы",
  customers: "Новые клиенты",
  conversion: "Конверсия",
  chart: "Динамика выручки",
  traffic: "Источники трафика",
  projects: "Проекты",
  activity: "Последняя активность",
};
const defaults: Widget[] = [
  ...(["revenue", "orders", "customers", "conversion"] as WidgetType[]).map(
    (type, i) => ({ id: type, type, x: i * 3, y: 0, w: 3, h: 1 }),
  ),
  { id: "chart", type: "chart", x: 0, y: 1, w: 8, h: 2 },
  { id: "traffic", type: "traffic", x: 8, y: 1, w: 4, h: 2 },
  { id: "projects", type: "projects", x: 0, y: 3, w: 8, h: 2 },
  { id: "activity", type: "activity", x: 8, y: 3, w: 4, h: 2 },
];
const overlap = (a: Widget, b: Widget) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function relocate(items: Widget[], id: string, x: number, y: number) {
  const original = items.find((i) => i.id === id)!;
  const moved = {
    ...original,
    x: Math.max(0, Math.min(12 - original.w, x)),
    y: Math.max(0, y),
  };
  const next = items.map((i) => (i.id === id ? moved : { ...i }));
  const collisions = next.filter((i) => i.id !== id && overlap(i, moved));
  if (
    collisions.length === 1 &&
    collisions[0].w === original.w &&
    collisions[0].h === original.h
  ) {
    collisions[0].x = original.x;
    collisions[0].y = original.y;
  } else {
    const placed = [
      moved,
      ...next.filter((i) => i.id !== id && !collisions.includes(i)),
    ];
    for (const c of collisions) {
      c.y = moved.y + moved.h;
      while (placed.some((p) => overlap(c, p))) c.y++;
      placed.push(c);
    }
  }
  return next;
}
const projects = [
  {
    name: "Редизайн сайта",
    caption: "Дизайн и разработка",
    icon: "↗",
    color: "purple",
    people: ["АК", "МС", "ДВ"],
    progress: 72,
    status: "В работе",
    date: "28 июня",
  },
  {
    name: "Летняя кампания",
    caption: "Маркетинг",
    icon: "◈",
    color: "orange",
    people: ["ЕП", "АН"],
    progress: 45,
    status: "В работе",
    date: "30 июня",
  },
  {
    name: "Мобильное приложение",
    caption: "Разработка продукта",
    icon: "▤",
    color: "blue",
    people: ["ДВ", "АК", "МС"],
    progress: 90,
    status: "На проверке",
    date: "25 июня",
  },
];
const activity = [
  {
    initial: "АК",
    name: "Анна Кузнецова",
    action: "завершила задачу",
    subject: "Дизайн главной страницы",
    time: "5 минут назад",
    color: "purple",
  },
  {
    initial: "МС",
    name: "Михаил Соколов",
    action: "добавил новый проект",
    subject: "Летняя кампания",
    time: "24 минуты назад",
    color: "peach",
  },
  {
    initial: "ЕП",
    name: "Елена Петрова",
    action: "обновила отчёт",
    subject: "Аналитика за июнь",
    time: "1 час назад",
    color: "green",
  },
];
function Sparkline({ variant = 0 }: { variant?: number }) {
  const lines = [
    "0,38 10,32 20,34 30,27 40,30 50,15 60,19 70,10 80,15 90,5 100,9 110,1",
    "0,35 10,36 20,24 30,29 40,19 50,24 60,12 70,17 80,8 90,11 100,3 110,6",
    "0,35 10,29 20,32 30,19 40,25 50,16 60,21 70,10 80,15 90,3 100,8 110,1",
    "0,34 10,25 20,30 30,20 40,26 50,12 60,17 70,9 80,16 90,8 100,12 110,3",
  ];
  return (
    <svg className="sparkline" viewBox="0 0 110 45">
      <defs>
        <linearGradient id={`spark${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#159778" stopOpacity=".14" />
          <stop offset="1" stopColor="#159778" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,45 ${lines[variant]} 110,45`}
        fill={`url(#spark${variant})`}
      />
      <polyline
        points={lines[variant]}
        fill="none"
        stroke="#249b7e"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function RevenueChart({ period }: { period: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const factor = period === "7 дней" ? 0.72 : period === "90 дней" ? 1.15 : 1;
  const vals = [
    94, 119, 107, 92, 119, 169, 136, 155, 142, 112, 134, 181, 169, 205, 162,
    188, 221, 203, 245, 227, 239, 273, 235, 260, 298, 263, 277, 314, 286, 325,
  ];
  const pts = vals.map(
    (v, i) => `${42 + i * 21.25},${213 - v * 0.54 * factor}`,
  );
  const prior = vals.map(
    (v, i) => `${42 + i * 21.25},${226 - (v * 0.35 + (i % 3) * 16) * factor}`,
  );
  return (
    <>
      <div className="chart-summary">
        <span className="chart-total">
          {period === "7 дней"
            ? "₽ 328 450"
            : period === "90 дней"
              ? "₽ 3 846 280"
              : "₽ 1 284 560"}
        </span>
        <span className="trend">↗ 12,8%</span>
        <span className="chart-comparison">к прошлому периоду</span>
        <div className="legend">
          <span>
            <i />
            Текущий период
          </span>
          <span>
            <i className="previous" />
            Прошлый период
          </span>
        </div>
      </div>
      <div className="chart-plot" onMouseLeave={() => setHover(null)}>
        <svg
          viewBox="0 0 690 265"
          preserveAspectRatio="none"
          role="img"
          aria-label="График роста выручки за июнь"
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#249e81" stopOpacity=".15" />
              <stop offset="1" stopColor="#249e81" stopOpacity=".01" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((_, i) => (
            <g key={i}>
              <line
                x1="42"
                x2="667"
                y1={25 + i * 49}
                y2={25 + i * 49}
                stroke="#ebeeed"
                strokeDasharray="3 4"
              />
              <text x="0" y={29 + i * 49} fill="#939b98" fontSize="10">
                {160 - i * 40} тыс.
              </text>
            </g>
          ))}
          <polygon
            points={`42,221 ${pts.join(" ")} 658,221`}
            fill="url(#chart-fill)"
          />
          <polyline
            points={prior.join(" ")}
            fill="none"
            stroke="#c6cfca"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <polyline
            points={pts.join(" ")}
            fill="none"
            stroke="#279a7c"
            strokeWidth="2.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {[
            "1 июн",
            "5 июн",
            "10 июн",
            "15 июн",
            "20 июн",
            "25 июн",
            "30 июн",
          ].map((v, i) => (
            <text
              key={v}
              x={42 + i * 102}
              y="251"
              fill="#939b98"
              fontSize="10"
              textAnchor={i === 6 ? "end" : "start"}
            >
              {v}
            </text>
          ))}
          {vals.map((v, i) => (
            <rect
              key={i}
              x={32 + i * 21.25}
              y="5"
              width="22"
              height="220"
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
          {hover !== null && (
            <g>
              <line
                x1={42 + hover * 21.25}
                x2={42 + hover * 21.25}
                y1="15"
                y2="221"
                stroke="#279a7c"
                strokeDasharray="3 3"
              />
              <circle
                cx={42 + hover * 21.25}
                cy={213 - vals[hover] * 0.54 * factor}
                r="4"
                fill="#249a7c"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
        {hover !== null && (
          <div
            className="chart-tooltip"
            style={{ left: `${Math.min(75, 10 + hover * 2.5)}%` }}
          >
            {hover + 1} июня{" "}
            <strong>
              ₽ {Math.round(vals[hover] * factor * 430).toLocaleString("ru-RU")}
            </strong>
          </div>
        )}
      </div>
    </>
  );
}
function AppModal({
  title,
  children,
  close,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-title">
          <h2>{title}</h2>
          <button className="icon-button" onClick={close} aria-label="Закрыть">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function App() {
  const [board, setBoard] = useState("Обзор бизнеса");
  const [boards, setBoards] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("pulse-boards") || "null") || [
          "Обзор бизнеса",
          "Маркетинг",
          "Продажи",
        ]
      );
    } catch {
      return ["Обзор бизнеса", "Маркетинг", "Продажи"];
    }
  });
  const loadLayout = (name: string) => {
    try {
      const parsed = JSON.parse(
        localStorage.getItem(`pulse-layout-${name}`) || "null",
      );
      return Array.isArray(parsed) &&
        parsed.every(
          (w) =>
            w &&
            titles[w.type as WidgetType] &&
            Number.isFinite(w.x) &&
            Number.isFinite(w.y) &&
            w.w > 0 &&
            w.h > 0,
        )
        ? parsed
        : defaults.map((w) => ({ ...w }));
    } catch {
      return defaults.map((w) => ({ ...w }));
    }
  };
  const [widgets, setWidgets] = useState<Widget[]>(() =>
    loadLayout("Обзор бизнеса"),
  );
  const [editing, setEditing] = useState(false);
  const [period, setPeriod] = useState("30 дней");
  const [modal, setModal] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [newBoard, setNewBoard] = useState("");
  const [activeNav, setActiveNav] = useState("Дашборды");
  const [drag, setDrag] = useState<{
    id: string;
    x: number;
    y: number;
    dx: number;
    dy: number;
  } | null>(null);
  const [preview, setPreview] = useState<Widget | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [dateFrom, setDateFrom] = useState("2025-06-01");
  const [dateTo, setDateTo] = useState("2025-06-30");
  const [dateLabel, setDateLabel] = useState("1 июн — 30 июн, 2025");
  const [taskDone, setTaskDone] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    original: Widget;
    cell: number;
    row: number;
  } | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem(`pulse-layout-${board}`, JSON.stringify(widgets));
    } catch {
      setToast("Не удалось сохранить расположение в браузере");
    }
  }, [widgets, board]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setMenu(null);
        setDrag(null);
        setPreview(null);
        dragRef.current = null;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setModal("search");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  function switchBoard(name: string) {
    setBoard(name);
    setWidgets(loadLayout(name));
    setActiveNav("Дашборды");
    setMobileNav(false);
    setModal(null);
  }
  function startDrag(e: ReactPointerEvent, w: Widget) {
    if ((e.target as HTMLElement).closest("button") || window.innerWidth < 760)
      return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const gap = gridRef.current
      ? parseFloat(getComputedStyle(gridRef.current).columnGap)
      : 20;
    dragRef.current = {
      id: w.id,
      startX: e.clientX,
      startY: e.clientY,
      original: w,
      cell: ((gridRef.current?.clientWidth || 1000) + gap) / 12,
      row: 138 + gap,
    };
    setDrag({ id: w.id, x: w.x, y: w.y, dx: 0, dy: 0 });
    setMenu(null);
  }
  function moveDrag(e: ReactPointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX,
      dy = e.clientY - d.startY;
    const x = Math.max(
        0,
        Math.min(12 - d.original.w, d.original.x + Math.round(dx / d.cell)),
      ),
      y = Math.max(0, d.original.y + Math.round(dy / d.row));
    setDrag({ id: d.id, x, y, dx, dy });
    setPreview({ ...d.original, x, y });
  }
  function endDrag() {
    if (drag && preview) {
      setWidgets((items) => relocate(items, drag.id, preview.x, preview.y));
      if (drag.dx || drag.dy) setToast("Расположение виджетов сохранено");
    }
    setDrag(null);
    setPreview(null);
    dragRef.current = null;
  }
  function addWidget(type: WidgetType) {
    const metric = ["revenue", "orders", "customers", "conversion"].includes(
      type,
    );
    const w = metric ? 3 : ["chart", "projects"].includes(type) ? 8 : 4;
    const h = metric ? 1 : 2;
    let item: Widget = { id: `${type}-${Date.now()}`, type, x: 0, y: 0, w, h };
    outer: for (let y = 0; y < 100; y++)
      for (let x = 0; x <= 12 - w; x++) {
        item = { ...item, x, y };
        if (!widgets.some((other) => overlap(item, other))) break outer;
      }
    setWidgets([...widgets, item]);
    setModal(null);
    setToast("Виджет добавлен на дашборд");
  }
  function exportReport() {
    const blob = new Blob(
      [
        "\ufeffПоказатель;Значение\nВыручка;1284560\nЗаказы;1842\nНовые клиенты;648\nКонверсия;3,62%",
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pulse-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Отчёт скачан");
  }
  const metricData: Record<
    string,
    { value: string; change: string; icon: IconName; index: number }
  > = {
    revenue: {
      value:
        period === "7 дней"
          ? "₽ 328 450"
          : period === "90 дней"
            ? "₽ 3 846 280"
            : "₽ 1 284 560",
      change: "12,8",
      icon: "wallet",
      index: 0,
    },
    orders: {
      value:
        period === "7 дней" ? "462" : period === "90 дней" ? "5 526" : "1 842",
      change: "8,2",
      icon: "cart",
      index: 1,
    },
    customers: {
      value:
        period === "7 дней" ? "164" : period === "90 дней" ? "1 944" : "648",
      change: "16,4",
      icon: "users",
      index: 2,
    },
    conversion: { value: "3,62%", change: "2,1", icon: "target", index: 3 },
  };
  function renderWidget(w: Widget) {
    if (metricData[w.type]) {
      const m = metricData[w.type];
      return (
        <div className="metric-body">
          <div className="metric-value">{m.value}</div>
          <div className="metric-bottom">
            <span className="trend">↗ {m.change}%</span>
            <span>к прошлому периоду</span>
          </div>
          <Sparkline variant={m.index} />
        </div>
      );
    }
    if (w.type === "chart") return <RevenueChart period={period} />;
    if (w.type === "traffic")
      return (
        <div className="traffic-content">
          <div className="donut">
            <div>
              <strong>
                {period === "7 дней"
                  ? "6 202"
                  : period === "90 дней"
                    ? "74 430"
                    : "24 810"}
              </strong>
              <span>посетителей</span>
            </div>
          </div>
          <div className="traffic-legend">
            {[
              ["Органический поиск", "42%", "green"],
              ["Прямые переходы", "28%", "lime"],
              ["Социальные сети", "18%", "purple"],
              ["Другие", "12%", "gray"],
            ].map(([name, value, color]) => (
              <div key={name}>
                <span>
                  <i className={color} />
                  {name}
                </span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      );
    if (w.type === "projects")
      return (
        <div className="project-table">
          <div className="table-head">
            <span>Название проекта</span>
            <span>Команда</span>
            <span>Прогресс</span>
            <span>Статус</span>
          </div>
          {projects.map((p) => (
            <button
              className="project-row"
              key={p.name}
              onClick={() => setModal(`project:${p.name}`)}
            >
              <span className="project-name">
                <span className={`project-icon ${p.color}`}>{p.icon}</span>
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.caption}</small>
                </span>
              </span>
              <span className="avatar-stack">
                {p.people.map((a, i) => (
                  <span key={a} className={`mini-avatar color-${i}`}>
                    {a}
                  </span>
                ))}
              </span>
              <span className="progress-cell">
                <span>{p.progress}%</span>
                <span className="progress-track">
                  <i style={{ width: `${p.progress}%` }} />
                </span>
              </span>
              <span
                className={`status ${p.status === "На проверке" ? "review" : ""}`}
              >
                <i />
                {p.status}
              </span>
            </button>
          ))}
          <button
            className="card-footer-link"
            onClick={() => {
              setActiveNav("Проекты");
              setMobileNav(false);
            }}
          >
            Все проекты <Icon name="chevron" size={14} />
          </button>
        </div>
      );
    return (
      <div className="activity-list">
        {activity.map((a) => (
          <div className="activity-item" key={a.initial}>
            <span className={`activity-avatar ${a.color}`}>
              {a.initial}
              <i />
            </span>
            <div>
              <p>
                <strong>{a.name}</strong> {a.action}
              </p>
              <button onClick={() => setModal(`activity:${a.subject}`)}>
                {a.subject}
              </button>
              <small>{a.time}</small>
            </div>
          </div>
        ))}
        <button
          className="card-footer-link"
          onClick={() => setModal("activity")}
        >
          Вся активность <Icon name="chevron" size={14} />
        </button>
      </div>
    );
  }
  const visibleWidgets =
    activeNav === "Аналитика"
      ? widgets.filter((w) => ["chart", "traffic"].includes(w.type))
      : widgets;
  return (
    <div className="app-shell">
      {mobileNav && (
        <button
          className="sidebar-backdrop"
          aria-label="Закрыть меню"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            switchBoard("Обзор бизнеса");
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          pulse<span className="brand-dot">.</span>
        </a>
        <button
          className="workspace-switch"
          onClick={() => setModal("workspace")}
        >
          <span className="workspace-logo">
            S<span>✳</span>
          </span>
          <span>
            <strong>Studio Workspace</strong>
            <small>
              Pro план <span>PRO</span>
            </small>
          </span>
          <span className="double-chevron">
            ⌃<br />⌄
          </span>
        </button>
        <span className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</span>
        <nav>
          {(
            [
              ["Дашборды", "grid"],
              ["Аналитика", "chart"],
              ["Проекты", "folder"],
              ["Команда", "users"],
            ] as [string, IconName][]
          ).map(([name, icon]) => (
            <button
              className={`nav-item ${activeNav === name ? "active" : ""}`}
              key={name}
              onClick={() => {
                setActiveNav(name);
                setMobileNav(false);
              }}
            >
              <Icon name={icon} />
              <span>{name}</span>
              {name === "Дашборды" && (
                <span className="nav-count">{boards.length}</span>
              )}
              {name === "Проекты" && <span className="plain-count">3</span>}
            </button>
          ))}
        </nav>
        <div className="dashboards-label">
          <span className="nav-label">МОИ ДАШБОРДЫ</span>
          <button
            className="icon-button"
            aria-label="Создать дашборд"
            onClick={() => setModal("newboard")}
          >
            <Icon name="plus" size={16} />
          </button>
        </div>
        <div className="board-list">
          {boards.map((name: string, i: number) => (
            <button
              className={
                board === name && activeNav === "Дашборды" ? "selected" : ""
              }
              key={name}
              onClick={() => switchBoard(name)}
            >
              <span className={`board-dot dot-${i % 3}`} />
              {name}
              {board === name && <span className="board-selected-dot" />}
            </button>
          ))}
          <button
            className="new-dashboard"
            onClick={() => setModal("newboard")}
          >
            <Icon name="plus" size={15} />
            Новый дашборд
          </button>
        </div>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-star">✧</span>
            <strong>Больше возможностей</strong>
            <p>
              Все ваши данные.
              <br />
              Без ограничений.
            </p>
            <button onClick={() => setModal("plans")}>
              Посмотреть тарифы <Icon name="arrow" size={15} />
            </button>
          </div>
          <button className="help-button" onClick={() => setModal("help")}>
            <Icon name="help" size={18} />
            Помощь и поддержка
            <Icon name="external" size={13} />
          </button>
          <button className="profile" onClick={() => setModal("profile")}>
            <span className="profile-avatar">АС</span>
            <span>
              <strong>Александр Смирнов</strong>
              <small>Личный аккаунт</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Меню"
            >
              <Icon name="grid" />
            </button>
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={12} />
            <strong>{activeNav}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="search-button"
              onClick={() => setModal("search")}
            >
              <Icon name="search" size={17} />
              <span>Поиск</span>
              <kbd>⌘ K</kbd>
            </button>
            <span className="topbar-divider" />
            <button
              className="notification-button icon-button"
              onClick={() => setModal("notifications")}
              aria-label="Уведомления"
            >
              <Icon name="bell" />
              <i />
            </button>
            <button
              className="top-avatar"
              onClick={() => setModal("profile")}
              aria-label="Профиль"
            >
              АС
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span />
                ВАШ БИЗНЕС В ОДНОМ МЕСТЕ
              </div>
              <h1>{activeNav === "Дашборды" ? board : activeNav}</h1>
              <p>
                {activeNav === "Дашборды"
                  ? "Всё важное — на вашем дашборде. Настройте его под себя."
                  : activeNav === "Аналитика"
                    ? "Показатели, которые помогают принимать решения."
                    : activeNav === "Проекты"
                      ? "От идеи до результата. Следите за работой команды."
                      : "Люди, с которыми всё получается."}
              </p>
            </div>
            <div className="heading-actions">
              <span className="saved-label">
                <Icon name="check" size={14} />
                Все изменения сохранены
              </span>
              <button
                className="button primary"
                onClick={() => setModal("add")}
              >
                <Icon name="plus" size={17} />
                Добавить виджет
              </button>
            </div>
          </div>
          <div className="toolbar">
            <div className="view-tabs">
              <button
                className={activeNav !== "Аналитика" ? "selected" : ""}
                onClick={() => setActiveNav("Дашборды")}
              >
                <Icon name="grid" size={16} />
                Обзор
              </button>
              <button
                className={activeNav === "Аналитика" ? "selected" : ""}
                onClick={() => setActiveNav("Аналитика")}
              >
                <Icon name="chart" size={16} />
                Аналитика
              </button>
            </div>
            <div className="toolbar-right">
              <button
                className="button date-button"
                onClick={() => setModal("dates")}
              >
                <Icon name="calendar" size={16} />
                {dateLabel}
                <Icon name="chevron" size={12} className="rotate" />
              </button>
              <button
                className={`button customize ${editing ? "editing" : ""}`}
                onClick={() => {
                  setEditing(!editing);
                  if (!editing)
                    setToast("Перетаскивайте виджеты за верхнюю панель");
                }}
              >
                <Icon name={editing ? "check" : "sliders"} size={16} />
                {editing ? "Готово" : "Настроить"}
              </button>
              <div className="toolbar-more">
                <button
                  className="icon-button more-button"
                  aria-label="Действия с дашбордом"
                  onClick={() => setMenu(menu === "board" ? null : "board")}
                >
                  <Icon name="more" size={20} />
                </button>
                {menu === "board" && (
                  <div className="popover">
                    <button
                      onClick={() => {
                        exportReport();
                        setMenu(null);
                      }}
                    >
                      Скачать отчёт CSV
                    </button>
                    <button
                      onClick={() => {
                        setWidgets(defaults.map((w) => ({ ...w })));
                        setMenu(null);
                        setToast("Исходное расположение восстановлено");
                      }}
                    >
                      Сбросить расположение
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {editing && (
            <div className="editing-notice">
              <Icon name="grip" size={18} />
              Перетаскивайте виджеты по сетке. Изменения сохраняются
              автоматически.
              <button onClick={() => setModal("add")}>
                Добавить виджет <Icon name="plus" size={14} />
              </button>
            </div>
          )}
          {activeNav === "Команда" ? (
            <div className="team-grid">
              {activity.map((a) => (
                <div className="team-card" key={a.name}>
                  <span className={`activity-avatar ${a.color}`}>
                    {a.initial}
                  </span>
                  <h3>{a.name}</h3>
                  <p>
                    {a.initial === "АК"
                      ? "Дизайнер"
                      : a.initial === "МС"
                        ? "Менеджер проектов"
                        : "Маркетолог"}
                  </p>
                  <span className="status">
                    <i />В команде
                  </span>
                </div>
              ))}
            </div>
          ) : activeNav === "Проекты" ? (
            <section className="projects-page">
              <h2>
                Активные проекты <span>3</span>
              </h2>
              {renderWidget(defaults[6])}
            </section>
          ) : (
            <div
              ref={gridRef}
              className={`widget-grid ${editing ? "editing-grid" : ""} ${activeNav === "Аналитика" ? "analytics-grid" : ""}`}
              style={{
                gridTemplateRows: `repeat(${Math.max(5, ...visibleWidgets.map((w) => w.y + w.h), preview ? preview.y + preview.h : 0)}, 138px)`,
              }}
            >
              {preview && (
                <div
                  className="drop-preview"
                  style={{
                    gridColumn: `${preview.x + 1} / span ${preview.w}`,
                    gridRow: `${preview.y + 1} / span ${preview.h}`,
                  }}
                />
              )}
              {[...visibleWidgets]
                .sort((a, b) => a.y - b.y || a.x - b.x)
                .map((w) => (
                  <section
                    className={`widget widget-${w.type} ${drag?.id === w.id ? "dragging" : ""} ${editing ? "editable" : ""}`}
                    key={w.id}
                    style={{
                      gridColumn: `${w.x + 1} / span ${w.w}`,
                      gridRow: `${activeNav === "Аналитика" ? 1 : w.y + 1} / span ${w.h}`,
                      transform:
                        drag?.id === w.id
                          ? `translate(${drag.dx}px, ${drag.dy}px)`
                          : undefined,
                    }}
                  >
                    <div
                      className="widget-header"
                      onPointerDown={(e) => startDrag(e, w)}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={() => {
                        setDrag(null);
                        setPreview(null);
                        dragRef.current = null;
                      }}
                    >
                      <div className="widget-title">
                        {metricData[w.type] && (
                          <Icon name={metricData[w.type].icon} size={16} />
                        )}
                        <h2>{titles[w.type]}</h2>
                        {w.type === "projects" && (
                          <span className="small-count">3</span>
                        )}
                      </div>
                      <div className="widget-controls">
                        {w.type === "chart" && (
                          <div className="period-switch">
                            {["7 дней", "30 дней", "90 дней"].map((p) => (
                              <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={period === p ? "active" : ""}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        )}
                        <span
                          className="drag-handle"
                          role="button"
                          tabIndex={0}
                          aria-label={`Переместить ${titles[w.type]}`}
                          title="Перетащите или используйте стрелки"
                          onKeyDown={(e) => {
                            const delta: Record<string, [number, number]> = {
                              ArrowLeft: [-1, 0],
                              ArrowRight: [1, 0],
                              ArrowUp: [0, -1],
                              ArrowDown: [0, 1],
                            };
                            if (delta[e.key]) {
                              e.preventDefault();
                              setWidgets((items) =>
                                relocate(
                                  items,
                                  w.id,
                                  w.x + delta[e.key][0],
                                  w.y + delta[e.key][1],
                                ),
                              );
                            }
                          }}
                        >
                          <Icon name="grip" size={16} />
                        </span>
                        <button
                          className="icon-button widget-menu-button"
                          onClick={() => setMenu(menu === w.id ? null : w.id)}
                          aria-label={`Настройки: ${titles[w.type]}`}
                        >
                          <Icon name="more" size={16} />
                        </button>
                      </div>
                      {menu === w.id && (
                        <div className="popover widget-popover">
                          <button
                            onClick={() => {
                              setWidgets((items) =>
                                relocate(
                                  items,
                                  w.id,
                                  w.x,
                                  Math.max(0, w.y - 1),
                                ),
                              );
                              setMenu(null);
                            }}
                          >
                            Переместить выше
                          </button>
                          <button
                            onClick={() => {
                              setWidgets((items) =>
                                relocate(items, w.id, w.x, w.y + 1),
                              );
                              setMenu(null);
                            }}
                          >
                            Переместить ниже
                          </button>
                          <button
                            onClick={() => {
                              setWidgets((items) =>
                                items.filter((i) => i.id !== w.id),
                              );
                              setMenu(null);
                              setToast("Виджет удалён");
                            }}
                            className="danger"
                          >
                            Удалить виджет
                          </button>
                        </div>
                      )}
                    </div>
                    {renderWidget(w)}
                  </section>
                ))}
            </div>
          )}
          <footer className="page-footer">
            <span>
              <span className="live-dot" />
              Данные обновлены только что
              <span className="demo-label">Демо-данные</span>
            </span>
            <span>
              <Icon name="grip" size={14} />
              Ваш дашборд. Ваши правила.
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
      {modal && (
        <AppModal
          title={
            modal === "add"
              ? "Добавить виджет"
              : modal === "newboard"
                ? "Новый дашборд"
                : modal === "search"
                  ? "Поиск по рабочему пространству"
                  : modal === "dates"
                    ? "Период отчёта"
                    : modal === "help"
                      ? "Ваш дашборд — как вам удобно"
                      : modal === "plans"
                        ? "Возможности Pulse Pro"
                        : modal === "workspace"
                          ? "Рабочее пространство"
                          : modal === "profile"
                            ? "Ваш профиль"
                            : modal === "notifications"
                              ? "Уведомления"
                              : modal.startsWith("project:")
                                ? modal.slice(8)
                                : "Активность команды"
          }
          close={() => setModal(null)}
        >
          {modal === "add" ? (
            <>
              <p className="modal-description">
                Выберите, что хотите видеть на дашборде.
              </p>
              <div className="widget-catalog">
                {(Object.keys(titles) as WidgetType[]).map((type) => (
                  <button key={type} onClick={() => addWidget(type)}>
                    <span>
                      <Icon
                        name={
                          metricData[type]?.icon ||
                          (type === "chart"
                            ? "chart"
                            : type === "traffic"
                              ? "target"
                              : type === "projects"
                                ? "folder"
                                : "clock")
                        }
                        size={24}
                      />
                    </span>
                    <strong>{titles[type]}</strong>
                    <small>
                      {[
                        "revenue",
                        "orders",
                        "customers",
                        "conversion",
                      ].includes(type)
                        ? "Ключевой показатель"
                        : "Подробная сводка"}
                    </small>
                    <Icon name="plus" size={18} />
                  </button>
                ))}
              </div>
            </>
          ) : modal === "newboard" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBoard.trim()) return;
                if (boards.includes(newBoard.trim())) {
                  setToast("Дашборд с таким именем уже существует");
                  return;
                }
                const next = [...boards, newBoard.trim()];
                setBoards(next);
                localStorage.setItem("pulse-boards", JSON.stringify(next));
                switchBoard(newBoard.trim());
                setNewBoard("");
                setToast("Дашборд создан");
              }}
            >
              <label className="field-label">
                Название дашборда
                <input
                  autoFocus
                  placeholder="Например, Мой рабочий день"
                  maxLength={40}
                  value={newBoard}
                  onChange={(e) => setNewBoard(e.target.value)}
                  required
                />
              </label>
              <p className="modal-description">
                Начните с готового набора виджетов и настройте его под себя.
              </p>
              <button className="button primary" type="submit">
                Создать дашборд
              </button>
            </form>
          ) : modal === "search" ? (
            <>
              <div className="search-field">
                <Icon name="search" />
                <input
                  autoFocus
                  placeholder="Найти дашборд, виджет или проект…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="search-results">
                {boards
                  .filter((n: string) =>
                    n.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((n: string) => (
                    <button key={n} onClick={() => switchBoard(n)}>
                      <Icon name="grid" />
                      {n}
                      <small>Дашборд</small>
                    </button>
                  ))}
                {Object.entries(titles)
                  .filter(([, n]) =>
                    n.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map(([type, name]) => (
                    <button
                      key={type}
                      onClick={() => {
                        addWidget(type as WidgetType);
                        setActiveNav("Дашборды");
                      }}
                    >
                      <Icon name="plus" />
                      {name}
                      <small>Добавить виджет</small>
                    </button>
                  ))}
                {!boards.some((n: string) =>
                  n.toLowerCase().includes(query.toLowerCase()),
                ) &&
                  !Object.values(titles).some((n) =>
                    n.toLowerCase().includes(query.toLowerCase()),
                  ) && <p>Ничего не найдено. Попробуйте другой запрос.</p>}
              </div>
            </>
          ) : modal === "dates" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (dateFrom > dateTo) {
                  setToast("Дата начала должна быть раньше даты окончания");
                  return;
                }
                const fmt = (v: string) =>
                  new Date(v + "T12:00:00")
                    .toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                    })
                    .replace(".", "");
                setDateLabel(
                  `${fmt(dateFrom)} — ${fmt(dateTo)}, ${dateTo.slice(0, 4)}`,
                );
                const days =
                  (Date.parse(dateTo) - Date.parse(dateFrom)) / 86400000 + 1;
                setPeriod(
                  days <= 7 ? "7 дней" : days <= 31 ? "30 дней" : "90 дней",
                );
                setModal(null);
                setToast("Период отчёта обновлён");
              }}
            >
              <div className="date-fields">
                <label className="field-label">
                  Дата начала
                  <input
                    type="date"
                    required
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </label>
                <label className="field-label">
                  Дата окончания
                  <input
                    type="date"
                    required
                    min={dateFrom}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </label>
              </div>
              <p className="modal-description">
                Демо-показатели доступны в недельном, месячном и квартальном
                представлении.
              </p>
              <button className="button primary" type="submit">
                Применить
              </button>
            </form>
          ) : modal === "help" ? (
            <div className="help-content">
              <p>
                <b>1. Расположите по-своему.</b> Перетаскивайте виджеты за
                заголовок. Они автоматически встанут на сетку.
              </p>
              <p>
                <b>2. Оставьте нужное.</b> Добавьте виджеты кнопкой вверху или
                удалите через меню ⋯.
              </p>
              <p>
                <b>3. Создавайте дашборды.</b> Для каждого направления можно
                сохранить отдельное расположение.
              </p>
              <p>
                Для управления с клавиатуры выберите маркер перемещения клавишей
                Tab и используйте стрелки. Ваши настройки сохраняются в этом
                браузере.
              </p>
            </div>
          ) : modal === "profile" ? (
            <div className="profile-details">
              <span className="profile-avatar">АС</span>
              <h3>Александр Смирнов</h3>
              <p>Владелец Studio Workspace</p>
              <span className="status">Pro план активен</span>
            </div>
          ) : modal === "plans" ? (
            <div className="plans-content">
              <span className="plan-badge">ВАШ ТЕКУЩИЙ ПЛАН</span>
              <h3>
                Pulse Pro <span>Всё для вашей команды</span>
              </h3>
              <p>✓ Неограниченное количество дашбордов</p>
              <p>✓ Все аналитические виджеты</p>
              <p>✓ Экспорт отчётов в CSV</p>
              <p>✓ Сохранение персональных настроек</p>
              <button
                className="button primary"
                onClick={() => {
                  setModal(null);
                  setToast("Все возможности Pro уже доступны в демо");
                }}
              >
                Продолжить работу
              </button>
            </div>
          ) : modal === "workspace" ? (
            <>
              <div className="workspace-details">
                <span className="workspace-logo">S✳</span>
                <div>
                  <h3>Studio Workspace</h3>
                  <p>3 участника · {boards.length} дашборда · Pro</p>
                </div>
              </div>
              <button
                className="button"
                onClick={() => {
                  setActiveNav("Команда");
                  setModal(null);
                }}
              >
                Посмотреть команду <Icon name="users" size={16} />
              </button>
            </>
          ) : modal.startsWith("project:") ? (
            <div className="project-detail">
              <p className="modal-description">
                {projects.find((p) => p.name === modal.slice(8))?.caption} ·
                Срок: {projects.find((p) => p.name === modal.slice(8))?.date}
              </p>
              <h3>Задачи проекта</h3>
              {[
                "Подготовить концепцию",
                "Согласовать с командой",
                "Завершить финальную версию",
              ].map((task, i) => (
                <label className="task-row" key={task}>
                  <input
                    type="checkbox"
                    checked={taskDone.includes(modal + task) || i === 0}
                    disabled={i === 0}
                    onChange={() =>
                      setTaskDone((s) =>
                        s.includes(modal + task)
                          ? s.filter((t) => t !== modal + task)
                          : [...s, modal + task],
                      )
                    }
                  />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="modal-activity">
              {activity
                .filter(
                  (a) =>
                    !modal.startsWith("activity:") ||
                    a.subject === modal.slice(9),
                )
                .map((a) => (
                  <div className="activity-item" key={a.name}>
                    <span className={`activity-avatar ${a.color}`}>
                      {a.initial}
                    </span>
                    <div>
                      <p>
                        <strong>{a.name}</strong> {a.action}
                      </p>
                      <p>{a.subject}</p>
                      <small>{a.time}</small>
                    </div>
                  </div>
                ))}
              {modal === "notifications" && (
                <p className="modal-description">
                  Вы в курсе всех последних обновлений.
                </p>
              )}
            </div>
          )}
        </AppModal>
      )}
    </div>
  );
}
