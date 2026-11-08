import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "layers"
  | "chart"
  | "chevron"
  | "plus"
  | "search"
  | "bell"
  | "arrow"
  | "grip"
  | "dots"
  | "check"
  | "close"
  | "settings"
  | "help"
  | "logout"
  | "calendar"
  | "users"
  | "wallet"
  | "bag"
  | "trend"
  | "clock"
  | "external"
  | "reset"
  | "note"
  | "task"
  | "activity";
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
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M8 15V9m5 6V5m5 10v-4" />
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
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    arrow: <path d="m6 16 12-12M7 4h11v11" />,
    grip: (
      <>
        {[8, 16].map((x) =>
          [5, 12, 19].map((y) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="1.4"
              fill="currentColor"
              stroke="none"
            />
          )),
        )}
      </>
    ),
    dots: (
      <>
        {[5, 12, 19].map((x) => (
          <circle key={x} cx={x} cy="12" r="1.5" fill="currentColor" />
        ))}
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    settings: (
      <>
        <path d="m9 3-1 3-3 1v4l-2 2 2 3 3 1 1 4h6l1-4 3-1 2-3-2-2V7l-3-1-1-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9a3 3 0 1 1 4 3v2m-1 3h.01" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H4v16h6m-1-8h12m-4-4 4 4-4 4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 20v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M3 8V5l14-3v3m-2 7h6v5h-6z" />
      </>
    ),
    bag: (
      <>
        <rect x="4" y="7" width="16" height="14" rx="2" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    trend: (
      <>
        <path d="m3 17 6-6 4 4 8-10m-6 0h6v6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    external: (
      <>
        <path d="M13 3h8v8m0-8L10 14M9 3H4v17h17v-5" />
      </>
    ),
    reset: (
      <>
        <path d="M3 11a9 9 0 1 1 2 7M3 4v7h7" />
      </>
    ),
    note: (
      <>
        <path d="M14 3H4v18h16V9l-6-6Zm0 0v6h6M8 13h8m-8 4h5" />
      </>
    ),
    task: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="m7 12 3 3 7-7" />
      </>
    ),
    activity: <path d="M2 12h5l3-8 4 16 3-8h5" />,
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
type Widget = {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
};
const defaults: Widget[] = [
  { id: "revenue", type: "revenue", x: 0, y: 0, w: 3, h: 2 },
  { id: "visitors", type: "visitors", x: 3, y: 0, w: 3, h: 2 },
  { id: "orders", type: "orders", x: 6, y: 0, w: 3, h: 2 },
  { id: "conversion", type: "conversion", x: 9, y: 0, w: 3, h: 2 },
  { id: "chart", type: "chart", x: 0, y: 2, w: 8, h: 4 },
  { id: "sources", type: "sources", x: 8, y: 2, w: 4, h: 4 },
  { id: "tasks", type: "tasks", x: 0, y: 6, w: 4, h: 4 },
  { id: "activity", type: "activity", x: 4, y: 6, w: 4, h: 4 },
  { id: "notes", type: "notes", x: 8, y: 6, w: 4, h: 4 },
];
const catalog: {
  type: string;
  title: string;
  description: string;
  icon: IconName;
  category: string;
}[] = [
  {
    type: "revenue",
    title: "Общая выручка",
    description: "Главный финансовый показатель",
    icon: "wallet",
    category: "Аналитика",
  },
  {
    type: "visitors",
    title: "Посетители",
    description: "Аудитория вашего проекта",
    icon: "users",
    category: "Аналитика",
  },
  {
    type: "orders",
    title: "Заказы",
    description: "Количество оформленных заказов",
    icon: "bag",
    category: "Аналитика",
  },
  {
    type: "conversion",
    title: "Конверсия",
    description: "Из посетителей в покупателей",
    icon: "trend",
    category: "Аналитика",
  },
  {
    type: "chart",
    title: "Динамика выручки",
    description: "Доходы на наглядном графике",
    icon: "chart",
    category: "Аналитика",
  },
  {
    type: "sources",
    title: "Источники трафика",
    description: "Откуда приходит ваша аудитория",
    icon: "layers",
    category: "Аналитика",
  },
  {
    type: "tasks",
    title: "Мои задачи",
    description: "Всё важное под рукой",
    icon: "task",
    category: "Продуктивность",
  },
  {
    type: "activity",
    title: "Активность",
    description: "Последние события команды",
    icon: "activity",
    category: "Продуктивность",
  },
  {
    type: "notes",
    title: "Быстрая заметка",
    description: "Место для идей и планов",
    icon: "note",
    category: "Продуктивность",
  },
];
function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
const initialTasks = [
  { id: 1, text: "Обновить дизайн главной", tag: "Дизайн", done: false },
  { id: 2, text: "Подготовить отчёт за месяц", tag: "Работа", done: false },
  { id: 3, text: "Обсудить запуск с командой", tag: "Встреча", done: false },
  { id: 4, text: "Проверить новые интеграции", tag: "Работа", done: true },
];
export function App() {
  const [widgets, setWidgets] = useState<Widget[]>(() =>
    read("orbit-layout-v1", defaults),
  );
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState<"library" | "settings" | "help" | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все виджеты");
  const [period, setPeriod] = useState("Последние 7 дней");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [tasks, setTasks] = useState(() => read("orbit-tasks", initialTasks));
  const [newTask, setNewTask] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [note, setNote] = useState(() =>
    read(
      "orbit-note",
      "Идеи на эту неделю ✦\n\n• Протестировать новую посадочную\n• Собрать обратную связь от клиентов\n• Посмотреть референсы для проекта",
    ),
  );
  const [title, setTitle] = useState(() => read("orbit-title", "Мой дашборд"));
  const [tab, setTab] = useState("Обзор");
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(
    null,
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoverChart, setHoverChart] = useState<number | null>(null);
  useEffect(() => {
    localStorage.setItem("orbit-layout-v1", JSON.stringify(widgets));
  }, [widgets]);
  useEffect(() => {
    localStorage.setItem("orbit-tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("orbit-note", JSON.stringify(note));
  }, [note]);
  useEffect(() => {
    localStorage.setItem("orbit-title", JSON.stringify(title));
  }, [title]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setMenu(null);
        setNotifications(false);
        setPeriodOpen(false);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const factor =
    period === "Последние 30 дней" ? 4.1 : period === "Этот месяц" ? 2.6 : 1;
  function moveWidget(id: string, x: number, y: number) {
    setWidgets((prev) => {
      const selected = prev.find((w) => w.id === id)!;
      const moved = {
        ...selected,
        x: Math.max(0, Math.min(12 - selected.w, x)),
        y: Math.max(0, y),
      };
      const others = prev
        .filter((w) => w.id !== id)
        .map((w) => ({ ...w }))
        .sort((a, b) => a.y - b.y || a.x - b.x);
      const placed = [moved];
      for (const item of others) {
        let collision;
        while (
          (collision = placed.find(
            (p) =>
              item.x < p.x + p.w &&
              item.x + item.w > p.x &&
              item.y < p.y + p.h &&
              item.y + item.h > p.y,
          ))
        ) {
          item.y = collision.y + collision.h;
        }
        placed.push(item);
      }
      return placed.sort((a, b) => a.y - b.y || a.x - b.x);
    });
  }
  function reorderWidget(id: string, targetId: string) {
    setWidgets((prev) => {
      const ordered = [...prev].sort((a, b) => a.y - b.y || a.x - b.x);
      const source = ordered.findIndex((item) => item.id === id);
      const target = ordered.findIndex((item) => item.id === targetId);
      if (source < 0 || target < 0 || source === target) return prev;
      const [item] = ordered.splice(source, 1);
      ordered.splice(target, 0, item);
      let x = 0,
        y = 0,
        bottom = 0;
      return ordered.map((widget) => {
        if (x + widget.w > 12) {
          x = 0;
          y = bottom;
        }
        const next = { ...widget, x, y };
        x += widget.w;
        bottom = Math.max(bottom, y + widget.h);
        return next;
      });
    });
  }
  function startDrag(e: ReactPointerEvent, w: Widget) {
    if (window.innerWidth < 850) {
      e.preventDefault();
      let targetId = w.id;
      setDrag({ id: w.id, x: w.x, y: w.y });
      const move = (event: PointerEvent) => {
        const sections = Array.from(
          gridRef.current!.querySelectorAll<HTMLElement>("[data-widget-id]"),
        );
        const under = sections.find((section) => {
          const rect = section.getBoundingClientRect();
          return (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
          );
        });
        if (under) targetId = under.dataset.widgetId!;
        sections.forEach((section) =>
          section.classList.toggle(
            "drop-target",
            section.dataset.widgetId === targetId && targetId !== w.id,
          ),
        );
      };
      const end = () => {
        reorderWidget(w.id, targetId);
        setDrag(null);
        gridRef.current
          ?.querySelectorAll(".drop-target")
          .forEach((section) => section.classList.remove("drop-target"));
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end, { once: true });
      window.addEventListener("pointercancel", end, { once: true });
      return;
    }
    e.preventDefault();
    const rect = gridRef.current!.getBoundingClientRect();
    const gridStyle = getComputedStyle(gridRef.current!);
    const gap = parseFloat(gridStyle.columnGap);
    const cell = (rect.width + gap) / 12;
    const rowHeight =
      parseFloat(gridStyle.gridTemplateRows) + parseFloat(gridStyle.rowGap);
    const sx = e.clientX,
      sy = e.clientY;
    let target = { id: w.id, x: w.x, y: w.y };
    setDrag(target);
    const move = (ev: PointerEvent) => {
      target = {
        id: w.id,
        x: Math.max(
          0,
          Math.min(12 - w.w, w.x + Math.round((ev.clientX - sx) / cell)),
        ),
        y: Math.max(0, w.y + Math.round((ev.clientY - sy) / rowHeight)),
      };
      setDrag(target);
    };
    const end = () => {
      moveWidget(w.id, target.x, target.y);
      setDrag(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
  }
  function addWidget(type: string) {
    const small = ["revenue", "visitors", "orders", "conversion"].includes(
      type,
    );
    const bottom = Math.max(0, ...widgets.map((w) => w.y + w.h));
    setWidgets([
      ...widgets,
      {
        id: `${type}-${Date.now()}`,
        type,
        x: 0,
        y: bottom,
        w: small ? 3 : type === "chart" ? 8 : 4,
        h: small ? 2 : 4,
      },
    ]);
    setModal(null);
    setTab("Обзор");
    setToast("Виджет добавлен на дашборд");
  }
  function submitTask() {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now(), text: newTask.trim(), tag: "Работа", done: false },
      ]);
      setNewTask("");
      setAddingTask(false);
    }
  }
  const visibleWidgets = widgets.filter(
    (w) =>
      tab === "Обзор" ||
      (tab === "Аналитика"
        ? catalog.find((c) => c.type === w.type)?.category === "Аналитика"
        : catalog.find((c) => c.type === w.type)?.category ===
          "Продуктивность"),
  );
  const filtered =
    tab === "Обзор"
      ? visibleWidgets
      : visibleWidgets.reduce<Widget[]>((acc, w) => {
          const last = acc[acc.length - 1];
          const x = last && last.x + last.w + w.w <= 12 ? last.x + last.w : 0;
          const y = last
            ? x === 0
              ? Math.max(...acc.map((i) => i.y + i.h))
              : last.y
            : 0;
          return [...acc, { ...w, x, y }];
        }, []);
  function controls(w: Widget) {
    return (
      <div className="widget-controls">
        <button
          className="icon-button drag-handle"
          style={{ display: tab === "Обзор" ? undefined : "none" }}
          aria-label={`Переместить: ${catalog.find((c) => c.type === w.type)?.title}`}
          title="Перетащите, чтобы переместить. Используйте стрелки на клавиатуре."
          onPointerDown={(e) => startDrag(e, w)}
          onKeyDown={(e) => {
            const delta: Record<string, [number, number]> = {
              ArrowLeft: [-1, 0],
              ArrowRight: [1, 0],
              ArrowUp: [0, -1],
              ArrowDown: [0, 1],
            };
            if (delta[e.key]) {
              e.preventDefault();
              moveWidget(w.id, w.x + delta[e.key][0], w.y + delta[e.key][1]);
            }
          }}
        >
          <Icon name="grip" size={15} />
        </button>
        <button
          className="icon-button"
          aria-label="Настройки виджета"
          onClick={() => setMenu(menu === w.id ? null : w.id)}
        >
          <Icon name="dots" size={17} />
        </button>
        {menu === w.id && (
          <div className="popup widget-menu">
            <button
              onClick={() => {
                setWidgets(widgets.filter((i) => i.id !== w.id));
                setMenu(null);
                setToast("Виджет удалён. Его можно добавить из библиотеки.");
              }}
            >
              <Icon name="close" size={16} />
              Удалить виджет
            </button>
            <button
              onClick={() => {
                setEditing(true);
                setTab("Обзор");
                setMenu(null);
                setToast("Перетаскивайте виджеты за значок из шести точек");
              }}
            >
              <Icon name="grid" size={16} />
              Изменить расположение
            </button>
          </div>
        )}
      </div>
    );
  }
  function content(w: Widget) {
    const meta = catalog.find((c) => c.type === w.type)!;
    const metricIndex = ["revenue", "visitors", "orders", "conversion"].indexOf(
      w.type,
    );
    if (metricIndex >= 0) {
      const values = [
        `${Math.round(284560 * factor).toLocaleString("ru-RU")} ₽`,
        Math.round(12486 * factor).toLocaleString("ru-RU"),
        Math.round(384 * factor).toLocaleString("ru-RU"),
        "3,08%",
      ];
      return (
        <>
          <div className="metric-label">
            <span className={`metric-icon metric-${metricIndex}`}>
              <Icon name={meta.icon} size={16} />
            </span>
            {meta.title}
            {controls(w)}
          </div>
          <div className="metric-bottom">
            <div>
              <div className="metric-value">{values[metricIndex]}</div>
              <div className="metric-comparison">
                <span>
                  <Icon name="trend" size={12} />{" "}
                  {["12,8", "8,2", "16,4", "2,1"][metricIndex]}%
                </span>
                <span>к прошлому периоду</span>
              </div>
            </div>
            <svg
              className={`sparkline spark-${metricIndex}`}
              viewBox="0 0 92 36"
            >
              <path
                d={
                  [
                    "M1 32 10 26 19 29 28 18 37 23 46 16 55 19 64 7 73 12 82 5 91 7",
                    "M1 30 10 29 19 19 28 25 37 16 46 19 55 9 64 16 73 4 82 9 91 3",
                    "M1 31 10 24 19 28 28 21 37 25 46 12 55 19 64 7 73 14 82 5 91 2",
                    "M1 30 10 26 19 28 28 22 37 25 46 14 55 17 64 10 73 14 82 7 91 5",
                  ][metricIndex]
                }
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </>
      );
    }
    return (
      <>
        <div className="widget-heading">
          <h2>{meta.title}</h2>
          {w.type === "tasks" && (
            <span className="count-badge">
              {tasks.filter((t) => !t.done).length}
            </span>
          )}
          {w.type === "chart" && (
            <span className="live-label">
              <i />В реальном времени
            </span>
          )}
          {controls(w)}
        </div>
        {w.type === "chart" && (
          <>
            <div className="chart-top">
              <span className="chart-total">
                {Math.round(284560 * factor).toLocaleString("ru-RU")}{" "}
                <span>₽</span>
              </span>
              <span className="positive-pill">↗ 12,8%</span>
              <div className="chart-legend">
                <i />
                Текущий период
                <span />
                <i />
                Предыдущий
              </div>
            </div>
            <div
              className="line-chart"
              onMouseLeave={() => setHoverChart(null)}
            >
              <div className="y-labels">
                <span>100 тыс.</span>
                <span>75 тыс.</span>
                <span>50 тыс.</span>
                <span>25 тыс.</span>
                <span>0</span>
              </div>
              <svg
                viewBox="0 0 700 140"
                preserveAspectRatio="none"
                role="img"
                aria-label="График роста выручки за неделю"
              >
                <defs>
                  <linearGradient
                    id={`fill-${w.id}`}
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#8864ec" stopOpacity=".2" />
                    <stop offset="1" stopColor="#8864ec" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[5, 36, 67, 98, 129].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="700"
                    y1={y}
                    y2={y}
                    stroke="#f0eff3"
                    strokeDasharray="4 4"
                  />
                ))}
                <path
                  d="M0 118 C40 119 70 79 112 88 S186 111 226 78 S300 91 343 72 S416 53 460 65 S526 70 575 40 S650 44 700 24"
                  fill="none"
                  stroke="#d4c5f6"
                  strokeWidth="2"
                  strokeDasharray="6 5"
                />
                <path
                  d="M0 112 C40 115 67 66 112 77 S185 94 226 57 S300 76 343 42 S415 39 460 48 S536 48 575 17 S654 28 700 7 L700 140 L0 140Z"
                  fill={`url(#fill-${w.id})`}
                />
                <path
                  d="M0 112 C40 115 67 66 112 77 S185 94 226 57 S300 76 343 42 S415 39 460 48 S536 48 575 17 S654 28 700 7"
                  fill="none"
                  stroke="#8a60e6"
                  strokeWidth="3"
                />
                {[0, 112, 226, 343, 460, 575, 700].map((x, i) => (
                  <rect
                    key={i}
                    x={x - 45}
                    y="0"
                    width="95"
                    height="140"
                    fill="transparent"
                    onMouseEnter={() => setHoverChart(i)}
                  />
                ))}
              </svg>
              {hoverChart !== null && (
                <div
                  className="chart-tooltip"
                  style={{ left: `${Math.min(78, 12 + hoverChart * 12)}%` }}
                >
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][hoverChart]} ·{" "}
                  {Math.round(
                    [18200, 32400, 41600, 48200, 43800, 52160, 48200][
                      hoverChart
                    ] * factor,
                  ).toLocaleString("ru-RU")}{" "}
                  ₽
                </div>
              )}
              <div className="x-labels">
                {[
                  "Пн, 18",
                  "Вт, 19",
                  "Ср, 20",
                  "Чт, 21",
                  "Пт, 22",
                  "Сб, 23",
                  "Вс, 24",
                ].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </>
        )}
        {w.type === "sources" && (
          <>
            <p className="widget-subtitle">Как пользователи находят вас</p>
            <div className="sources-content">
              <div className="donut">
                <div>
                  <strong>
                    {(12.5 * factor).toFixed(1).replace(".", ",")}k
                  </strong>
                  <span>посетителей</span>
                </div>
              </div>
              <div className="sources-legend">
                {[
                  ["Поиск", "42%", "#8d67e6"],
                  ["Напрямую", "28%", "#b9a0ee"],
                  ["Соцсети", "18%", "#d5c6f4"],
                  ["Другое", "12%", "#ece6f7"],
                ].map(([label, value, color]) => (
                  <div key={label}>
                    <i style={{ background: color }} />
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="widget-footnote">
              <span className="tiny-dot" />
              Данные обновлены только что
            </div>
          </>
        )}
        {w.type === "tasks" && (
          <>
            <div className="tasks-list">
              {tasks.map((t) => (
                <label
                  key={t.id}
                  className={`task-row ${t.done ? "completed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() =>
                      setTasks(
                        tasks.map((i) =>
                          i.id === t.id ? { ...i, done: !i.done } : i,
                        ),
                      )
                    }
                  />
                  <span className="custom-check">
                    {t.done && <Icon name="check" size={12} />}
                  </span>
                  <span className="task-name">{t.text}</span>
                  <span
                    className={`task-tag tag-${t.tag === "Дизайн" ? "purple" : t.tag === "Встреча" ? "orange" : "blue"}`}
                  >
                    {t.tag}
                  </span>
                </label>
              ))}
            </div>
            {addingTask ? (
              <form
                className="task-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitTask();
                }}
              >
                <input
                  autoFocus
                  placeholder="Что нужно сделать?"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  aria-label="Название задачи"
                />
                <button
                  type="submit"
                  className="icon-button"
                  aria-label="Сохранить задачу"
                >
                  <Icon name="check" size={17} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Отмена"
                  onClick={() => setAddingTask(false)}
                >
                  <Icon name="close" size={16} />
                </button>
              </form>
            ) : (
              <button
                className="text-button add-task"
                onClick={() => setAddingTask(true)}
              >
                <Icon name="plus" size={16} />
                Добавить задачу
              </button>
            )}
          </>
        )}
        {w.type === "activity" && (
          <div className="activity-list">
            {[
              {
                initial: "АК",
                color: "purple",
                name: "Анна Ким",
                action: "завершила задачу",
                detail: "Дизайн личного кабинета",
                time: "5 минут назад",
              },
              {
                initial: "МС",
                color: "blue",
                name: "Максим Соколов",
                action: "добавил файл",
                detail: "Отчёт за май.pdf",
                time: "24 минуты назад",
              },
              {
                initial: "Д",
                color: "green",
                name: "Вы",
                action: "создали новый дашборд",
                detail: "Мой дашборд",
                time: "1 час назад",
              },
            ].map((a, i) => (
              <div className="activity-item" key={i}>
                <div className={`avatar avatar-${a.color}`}>{a.initial}</div>
                <div>
                  <p>
                    <strong>{a.name}</strong> {a.action}
                  </p>
                  <span className="activity-detail">{a.detail}</span>
                  <span className="activity-time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {w.type === "notes" && (
          <>
            <textarea
              className="note-text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Запишите что-нибудь важное…"
              aria-label="Текст заметки"
            />
            <div className="note-footer">
              <span>
                <Icon name="check" size={13} />
                Все изменения сохранены
              </span>
              <Icon name="note" size={15} />
            </div>
          </>
        )}
      </>
    );
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab("Обзор");
          }}
        >
          <span className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </span>
          orbit<span className="brand-dot">.</span>
        </a>
        <div className="workspace-wrap">
          <button
            className="workspace-switch"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
          >
            <span className="workspace-icon">
              S<span>✦</span>
            </span>
            <span>
              <strong>Моё пространство</strong>
              <small>Личный аккаунт</small>
            </span>
            <Icon name="chevron" size={14} />
          </button>
          {workspaceOpen && (
            <div className="popup workspace-popup">
              <strong>Рабочее пространство</strong>
              <span>
                Моё пространство <Icon name="check" size={15} />
              </span>
              <small>
                Все ваши виджеты и настройки сохраняются на этом устройстве.
              </small>
            </div>
          )}
        </div>
        <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          <button
            className="nav-item active"
            onClick={() => {
              setTab("Обзор");
              setModal(null);
            }}
          >
            <Icon name="grid" size={19} />
            Мой дашборд
            <span className="nav-active-dot" />
          </button>
          <button
            className="nav-item"
            onClick={() => {
              setSearch("");
              setModal("library");
            }}
          >
            <Icon name="layers" size={19} />
            Библиотека виджетов<span className="nav-number">9</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card">
            <span className="tip-icon">✦</span>
            <strong>Ваш дашборд. Ваши правила.</strong>
            <p>Добавляйте виджеты и собирайте пространство под себя.</p>
            <button
              onClick={() => {
                setSearch("");
                setModal("library");
              }}
            >
              Открыть библиотеку <Icon name="arrow" size={14} />
            </button>
            <div className="tip-decoration">✳</div>
          </div>
          <button className="nav-item" onClick={() => setModal("settings")}>
            <Icon name="settings" size={19} />
            Настройки
          </button>
          <button className="nav-item" onClick={() => setModal("help")}>
            <Icon name="help" size={19} />
            Помощь и поддержка
            <Icon name="external" size={13} />
          </button>
          <div className="profile">
            <div className="avatar profile-avatar">АС</div>
            <div>
              <strong>Александр Смирнов</strong>
              <span>Личный аккаунт</span>
            </div>
            <button
              className="icon-button"
              aria-label="Настройки профиля"
              onClick={() => setModal("settings")}
            >
              <Icon name="chevron" size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={12} />
            <strong>{title}</strong>
          </div>
          <div className="header-tools">
            <span className="today">Понедельник, 25 мая</span>
            <span className="header-divider" />
            <button
              className="icon-button"
              aria-label="Поиск виджетов"
              onClick={() => {
                setSearch("");
                setModal("library");
              }}
            >
              <Icon name="search" />
            </button>
            <div className="notification-wrap">
              <button
                className={`icon-button notification-button ${notifications ? "selected" : ""}`}
                aria-label="Уведомления"
                onClick={() => setNotifications(!notifications)}
              >
                <Icon name="bell" />
                <i />
              </button>
              {notifications && (
                <div className="popup notifications">
                  <strong>Уведомления</strong>
                  <div>
                    <span className="notification-symbol">
                      <Icon name="check" size={18} />
                    </span>
                    <p>
                      <b>Всё готово к работе</b>
                      <span>
                        Ваш дашборд создан. Добавьте виджеты и настройте их
                        расположение.
                      </span>
                      <small>Только что</small>
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button
              className="avatar top-avatar"
              aria-label="Профиль"
              onClick={() => setModal("settings")}
            >
              АС
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВСЁ ВАЖНОЕ — В ОДНОМ МЕСТЕ</div>
              <h1>
                {title}
                <span className="title-dot" />
              </h1>
              <p>
                Хорошего дня, Александр <span className="wave">✳</span> Вот что
                происходит в вашем пространстве.
              </p>
            </div>
            <div className="page-actions">
              <button
                className={`button ${editing ? "editing-button" : ""}`}
                onClick={() => {
                  setEditing(!editing);
                  setTab("Обзор");
                  if (editing) setToast("Расположение виджетов сохранено");
                }}
              >
                <Icon name={editing ? "check" : "grid"} size={16} />
                {editing ? "Готово" : "Настроить"}
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setSearch("");
                  setModal("library");
                }}
              >
                <Icon name="plus" size={17} />
                Добавить виджет
              </button>
            </div>
          </div>
          <div className="dashboard-toolbar">
            <div className="tabs">
              {["Обзор", "Аналитика", "Продуктивность"].map((t) => (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  onClick={() => setTab(t)}
                >
                  {t}
                  {t === "Обзор" && <span>{widgets.length}</span>}
                </button>
              ))}
            </div>
            <div className="toolbar-right">
              <span className="autosave">
                <i />
                Все изменения сохранены
              </span>
              <div className="period-wrap">
                <button
                  className="period-button"
                  onClick={() => setPeriodOpen(!periodOpen)}
                >
                  <Icon name="calendar" size={15} />
                  {period}
                  <Icon name="chevron" size={12} />
                </button>
                {periodOpen && (
                  <div className="popup period-popup">
                    {[
                      "Последние 7 дней",
                      "Последние 30 дней",
                      "Этот месяц",
                    ].map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setPeriod(p);
                          setPeriodOpen(false);
                        }}
                      >
                        {p}
                        {p === period && <Icon name="check" size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {editing && (
            <div className="edit-banner">
              <Icon name="grip" size={18} />
              <span>
                Перетаскивайте виджеты за <b>⠿</b>, чтобы расположить их
                по-своему
              </span>
              <button
                onClick={() => {
                  setWidgets(defaults);
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
            className={`widget-grid ${editing ? "is-editing" : ""} ${drag ? "is-dragging" : ""}`}
            style={
              {
                "--grid-rows": Math.max(
                  10,
                  ...filtered.map((w) => w.y + w.h),
                  drag ? drag.y + 4 : 0,
                ),
              } as CSSProperties
            }
          >
            {filtered.map((w) => (
              <section
                key={w.id}
                data-widget-id={w.id}
                className={`widget widget-${w.type} ${drag?.id === w.id ? "dragging" : ""}`}
                style={{
                  gridColumn: `${(drag?.id === w.id ? drag.x : w.x) + 1} / span ${w.w}`,
                  gridRow: `${(drag?.id === w.id ? drag.y : w.y) + 1} / span ${w.h}`,
                }}
              >
                {content(w)}
              </section>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">
                <Icon name="grid" size={36} />
                <h2>Пространство для ваших идей</h2>
                <p>Добавьте первый виджет, чтобы начать.</p>
                <button
                  className="button primary"
                  onClick={() => setModal("library")}
                >
                  <Icon name="plus" size={16} />
                  Добавить виджет
                </button>
              </div>
            )}
          </div>
          <footer className="dashboard-footer">
            <span>
              <Icon name="grip" size={14} />
              Перетаскивайте виджеты, чтобы настроить дашборд под себя
            </span>
            <span>
              Сделано для вашего фокуса <span className="footer-star">✦</span>
            </span>
          </footer>
        </main>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "library"
                ? "Библиотека виджетов"
                : modal === "settings"
                  ? "Настройки"
                  : "Помощь"
            }
            className={`modal ${modal === "library" ? "library-modal" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              onClick={() => setModal(null)}
              aria-label="Закрыть"
            >
              <Icon name="close" />
            </button>
            {modal === "library" ? (
              <>
                <span className="eyebrow">СОБЕРИТЕ СВОЁ ПРОСТРАНСТВО</span>
                <h2>Библиотека виджетов</h2>
                <p className="modal-description">
                  Немного аналитики, немного порядка. Выберите то, что нужно
                  вам.
                </p>
                <div className="search-field">
                  <Icon name="search" size={18} />
                  <input
                    autoFocus
                    placeholder="Найти виджет…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="library-tabs">
                  {["Все виджеты", "Аналитика", "Продуктивность"].map((c) => (
                    <button
                      className={category === c ? "active" : ""}
                      key={c}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="library-grid">
                  {catalog
                    .filter(
                      (c) =>
                        (category === "Все виджеты" ||
                          c.category === category) &&
                        `${c.title} ${c.description}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                    )
                    .map((c) => (
                      <button
                        className="library-card"
                        key={c.type}
                        onClick={() => addWidget(c.type)}
                      >
                        <span className="library-icon">
                          <Icon name={c.icon} size={23} />
                        </span>
                        <strong>{c.title}</strong>
                        <span>{c.description}</span>
                        <span className="library-add">
                          <Icon name="plus" size={14} />
                          Добавить
                        </span>
                      </button>
                    ))}
                </div>
                {!catalog.some(
                  (c) =>
                    (category === "Все виджеты" || c.category === category) &&
                    `${c.title} ${c.description}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                ) && (
                  <p className="no-results">
                    Ничего не найдено. Попробуйте другой запрос.
                  </p>
                )}
              </>
            ) : modal === "settings" ? (
              <>
                <span className="library-icon">
                  <Icon name="settings" size={25} />
                </span>
                <h2>Настройки пространства</h2>
                <p className="modal-description">Сделайте дашборд своим.</p>
                <label className="settings-label">
                  Название дашборда
                  <input
                    maxLength={40}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>
                <div className="settings-info">
                  <Icon name="check" size={18} />
                  <p>
                    Расположение виджетов, задачи и заметки автоматически
                    сохраняются в этом браузере.
                  </p>
                </div>
                <button
                  className="button"
                  onClick={() => {
                    setWidgets(defaults);
                    setToast("Расположение виджетов восстановлено");
                    setModal(null);
                  }}
                >
                  <Icon name="reset" size={16} />
                  Восстановить расположение
                </button>
                <button
                  className="button primary settings-done"
                  onClick={() => {
                    if (!title.trim()) setTitle("Мой дашборд");
                    setModal(null);
                    setToast("Настройки сохранены");
                  }}
                >
                  Сохранить
                </button>
              </>
            ) : (
              <>
                <span className="library-icon">
                  <Icon name="help" size={25} />
                </span>
                <h2>Освойтесь в orbit.</h2>
                <p className="modal-description">
                  Ваше пространство работает по вашим правилам.
                </p>
                <div className="help-step">
                  <span>1</span>
                  <div>
                    <strong>Добавляйте нужное</strong>
                    <p>
                      Откройте библиотеку и выберите виджеты аналитики или
                      продуктивности.
                    </p>
                  </div>
                </div>
                <div className="help-step">
                  <span>2</span>
                  <div>
                    <strong>Расставляйте по-своему</strong>
                    <p>
                      На вкладке «Обзор» перетаскивайте виджет за шесть точек в
                      его заголовке. Также можно выбрать ручку клавишей Tab и
                      использовать стрелки.
                    </p>
                  </div>
                </div>
                <div className="help-step">
                  <span>3</span>
                  <div>
                    <strong>Оставайтесь в фокусе</strong>
                    <p>
                      Отмечайте задачи, записывайте идеи и следите за
                      показателями. Изменения сохраняются автоматически.
                    </p>
                  </div>
                </div>
                <div className="demo-notice">
                  Показатели аналитики демонстрационные. Задачи, заметки и
                  расположение виджетов интерактивны.
                </div>
                <button
                  className="button primary"
                  onClick={() => setModal(null)}
                >
                  Всё понятно
                </button>
              </>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
