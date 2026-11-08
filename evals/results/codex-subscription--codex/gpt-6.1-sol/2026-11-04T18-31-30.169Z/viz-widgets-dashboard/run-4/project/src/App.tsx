import { useState, useEffect, useRef, type ReactNode } from "react";
import "./styles.css";

type IconName =
  | "grid"
  | "chart"
  | "users"
  | "bag"
  | "settings"
  | "help"
  | "search"
  | "bell"
  | "chevron"
  | "arrow"
  | "plus"
  | "download"
  | "calendar"
  | "sliders"
  | "grip"
  | "close"
  | "check"
  | "more"
  | "external"
  | "wallet"
  | "globe"
  | "target"
  | "logout";
function Icon({
  name,
  size = 20,
  ...props
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.8" />
      </>
    ),
    chart: (
      <>
        <path d="M4 4v16h17M8 15l4-5 4 3 5-7" />
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
        <path d="m9 3-1 3-3 1v3l-2 2 2 2v3l3 1 1 3h6l1-3 3-1v-3l2-2-2-2V7l-3-1-1-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 2-2.5 4M12 17h.01" />
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
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    plus: <path d="M12 5v14M5 12h14" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 11h18" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 7h9m4 0h3M4 17h3m4 0h9" />
        <circle cx="15" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
      </>
    ),
    grip: (
      <>
        {[5, 12, 19].map((y) => (
          <g key={y}>
            <circle cx="9" cy={y} r=".9" fill="currentColor" />
            <circle cx="15" cy={y} r=".9" fill="currentColor" />
          </g>
        ))}
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    more: (
      <>
        {[5, 12, 19].map((x) => (
          <circle key={x} cx={x} cy="12" r="1" fill="currentColor" />
        ))}
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14M10 3H4v17h17v-6" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M3 8V5a2 2 0 0 1 2-2h12m4 8h-5v5h5M17 13.5h.01" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5m6-13 5 5-5 5M9 12h11" />
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
type Widget = { id: string; type: string; span: number };
const initialWidgets: Widget[] = [
  { id: "revenue", type: "revenue", span: 3 },
  { id: "orders", type: "orders", span: 3 },
  { id: "customers", type: "customers", span: 3 },
  { id: "conversion", type: "conversion", span: 3 },
  { id: "sales", type: "sales", span: 8 },
  { id: "traffic", type: "traffic", span: 4 },
  { id: "transactions", type: "transactions", span: 8 },
  { id: "goal", type: "goal", span: 4 },
];
const widgetNames: Record<string, string> = {
  revenue: "Общая выручка",
  orders: "Заказы",
  customers: "Новые клиенты",
  conversion: "Конверсия",
  sales: "Динамика выручки",
  traffic: "Источники трафика",
  transactions: "Последние заказы",
  goal: "Цель месяца",
  visitors: "Посетители сайта",
};
const transactions = [
  {
    name: "Александр Петров",
    email: "alex.petrov@gmail.com",
    initials: "АП",
    color: "purple",
    id: "#FR-1048",
    date: "30 июн, 2025",
    amount: "12 490",
    status: "Оплачен",
  },
  {
    name: "Мария Иванова",
    email: "m.ivanova@gmail.com",
    initials: "МИ",
    color: "peach",
    id: "#FR-1047",
    date: "30 июн, 2025",
    amount: "8 250",
    status: "Оплачен",
  },
  {
    name: "Дмитрий Смирнов",
    email: "d.smirnov@icloud.com",
    initials: "ДС",
    color: "blue",
    id: "#FR-1046",
    date: "29 июн, 2025",
    amount: "24 900",
    status: "В обработке",
  },
  {
    name: "Анна Козлова",
    email: "anna.kozlova@gmail.com",
    initials: "АК",
    color: "pink",
    id: "#FR-1045",
    date: "29 июн, 2025",
    amount: "6 790",
    status: "Оплачен",
  },
];
function readLayout(): Widget[] {
  try {
    const value = JSON.parse(localStorage.getItem("forma-layout") || "null");
    return Array.isArray(value) &&
      value.every(
        (v) => v.id && widgetNames[v.type] && [3, 4, 6, 8, 12].includes(v.span),
      )
      ? value
      : initialWidgets;
  } catch {
    return initialWidgets;
  }
}
function Spark({ variant = 0 }: { variant?: number }) {
  const paths = [
    "M0 35 12 31 22 34 32 24 42 29 52 20 62 24 72 12 82 17 92 7 104 10",
    "M0 34 12 34 22 26 32 28 42 19 52 24 62 14 72 18 82 9 92 12 104 4",
    "M0 36 10 29 20 32 30 22 40 28 50 19 60 21 70 12 80 16 90 9 104 5",
    "M0 31 12 25 22 28 32 20 42 24 52 17 62 21 72 13 82 16 92 6 104 9",
  ];
  return (
    <svg className="spark" viewBox="0 0 106 46">
      <defs>
        <linearGradient id={`spark${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#84b799" stopOpacity=".18" />
          <stop offset="100%" stopColor="#84b799" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${paths[variant % 4]}V46H0Z`} fill={`url(#spark${variant})`} />
      <path
        d={paths[variant % 4]}
        fill="none"
        stroke="#72a586"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function RevenueChart({ period }: { period: string }) {
  const [point, setPoint] = useState<number | null>(null);
  const [chartType, setChartType] = useState("Выручка");
  return (
    <>
      <div className="card-heading">
        <div>
          <h3>Динамика выручки</h3>
          <p>Ваш бизнес в цифрах, день за днём</p>
        </div>
        <select
          className="small-select"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option>Выручка</option>
          <option>Заказы</option>
        </select>
      </div>
      <div className="chart-summary">
        <strong>
          {chartType === "Выручка"
            ? period === "week"
              ? "₽ 324 850"
              : "₽ 1 284 650"
            : "1 842"}
        </strong>
        <span className="growth">
          <Icon name="arrow" size={13} />
          18,6%
        </span>
        <span className="muted">
          к прошлому {period === "week" ? "периоду" : "месяцу"}
        </span>
      </div>
      <div className="line-chart">
        <div className="chart-y">
          {(chartType === "Выручка"
            ? ["60 тыс.", "45 тыс.", "30 тыс.", "15 тыс.", "0"]
            : ["100", "75", "50", "25", "0"]
          ).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="chart-plot" onMouseLeave={() => setPoint(null)}>
          <svg
            viewBox="0 0 640 190"
            preserveAspectRatio="none"
            aria-label="График выручки за июнь"
          >
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#b5cebc" stopOpacity=".45" />
                <stop offset="1" stopColor="#d7e6da" stopOpacity=".03" />
              </linearGradient>
            </defs>
            {[10, 52, 94, 136, 178].map((y) => (
              <line
                key={y}
                x1="0"
                x2="640"
                y1={y}
                y2={y}
                stroke="#ebeeeb"
                strokeDasharray="3 4"
              />
            ))}
            <path
              d="M0 150C12 150 15 127 29 130S50 148 63 130S80 131 94 119S108 131 122 119S141 131 155 106S175 119 188 103S208 121 223 95S241 105 256 84S275 94 289 75S306 82 321 68S339 98 354 82S372 96 387 65S404 65 420 47S438 61 453 43S469 61 484 38S506 48 519 29S538 43 551 24S572 35 585 19S608 38 621 13L640 8V190H0Z"
              fill="url(#chartFill)"
            />
            <path
              d="M0 162C23 159 25 144 45 151S73 140 94 145S113 133 135 139S157 121 178 131S201 119 223 126S245 108 267 119S287 106 309 115S333 106 354 117S377 95 398 109S419 93 441 103S465 85 486 95S510 84 532 92S553 77 575 88S611 69 640 76"
              fill="none"
              stroke="#c7ceca"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <path
              d="M0 150C12 150 15 127 29 130S50 148 63 130S80 131 94 119S108 131 122 119S141 131 155 106S175 119 188 103S208 121 223 95S241 105 256 84S275 94 289 75S306 82 321 68S339 98 354 82S372 96 387 65S404 65 420 47S438 61 453 43S469 61 484 38S506 48 519 29S538 43 551 24S572 35 585 19S608 38 621 13L640 8"
              fill="none"
              stroke="#6f9c7b"
              strokeWidth="2.5"
            />
            {Array.from({ length: 30 }, (_, i) => (
              <rect
                key={i}
                x={i * 21.33}
                y="0"
                width="21.33"
                height="190"
                fill="transparent"
                onMouseMove={() => setPoint(i)}
              />
            ))}
            {point !== null && (
              <>
                <line
                  x1={point * 21.33 + 10}
                  x2={point * 21.33 + 10}
                  y1="0"
                  y2="190"
                  stroke="#749e80"
                  strokeDasharray="4 3"
                />
                <circle
                  cx={point * 21.33 + 10}
                  cy={150 - point * 4.6}
                  r="4"
                  fill="#6f9c7b"
                  stroke="white"
                  strokeWidth="2"
                />
              </>
            )}
          </svg>
          {point !== null && (
            <div
              className="chart-tooltip"
              style={{ left: `${Math.min(75, (point / 30) * 100)}%` }}
            >
              {point + 1} июня
              <strong>
                {chartType === "Выручка"
                  ? `₽ ${(28000 + point * 1040).toLocaleString("ru-RU")}`
                  : 45 + point * 2}
              </strong>
            </div>
          )}
          <div className="chart-x">
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
      <div className="chart-legend">
        <span>
          <i className="legend-line green" />
          Текущий период
        </span>
        <span>
          <i className="legend-line dashed" />
          Предыдущий период
        </span>
      </div>
    </>
  );
}
function Traffic() {
  return (
    <>
      <div className="card-heading">
        <div>
          <h3>Источники трафика</h3>
          <p>Откуда приходят ваши клиенты</p>
        </div>
        <Icon name="globe" size={18} />
      </div>
      <div className="donut-wrap">
        <svg viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="76"
            fill="none"
            stroke="#eff1ed"
            strokeWidth="25"
          />
          {[
            { color: "#779b7e", dash: 211, offset: 0 },
            { color: "#b8c8a7", dash: 130, offset: -215 },
            { color: "#dfc7a5", dash: 78, offset: -349 },
            { color: "#e7e9e2", dash: 45, offset: -431 },
          ].map((a) => (
            <circle
              key={a.color}
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke={a.color}
              strokeWidth="25"
              strokeDasharray={`${a.dash} 478`}
              strokeDashoffset={a.offset}
              transform="rotate(-90 100 100)"
            />
          ))}
        </svg>
        <div className="donut-label">
          <span>Всего посещений</span>
          <strong>24 892</strong>
          <small>
            <Icon name="arrow" size={12} /> 12,8% за месяц
          </small>
        </div>
      </div>
      <div className="source-list">
        {[
          ["#779b7e", "Органический поиск", "45,2%"],
          ["#b8c8a7", "Прямые переходы", "28,4%"],
          ["#dfc7a5", "Социальные сети", "16,8%"],
          ["#e7e9e2", "Другое", "9,6%"],
        ].map(([c, n, p]) => (
          <div key={n}>
            <span>
              <i style={{ background: c }} />
              {n}
            </span>
            <strong>{p}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
export function App() {
  const [widgets, setWidgets] = useState<Widget[]>(readLayout);
  const [editing, setEditing] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [period, setPeriod] = useState("month");
  const [query, setQuery] = useState("");
  const [nav, setNav] = useState("Обзор");
  const [toast, setToast] = useState("");
  const [notification, setNotification] = useState(false);
  const [profile, setProfile] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<
    (typeof transactions)[0] | null
  >(null);
  const [allOrders, setAllOrders] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(
    () => localStorage.setItem("forma-layout", JSON.stringify(widgets)),
    [widgets],
  );
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setDrawer(false);
        setMenu(null);
        setProfile(false);
        setNotification(false);
        setSelectedOrder(null);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const reorder = (target: string) => {
    if (dragging && dragging !== target)
      setWidgets((old) => {
        const next = [...old];
        const from = next.findIndex((w) => w.id === dragging),
          to = next.findIndex((w) => w.id === target);
        next.splice(to, 0, next.splice(from, 1)[0]);
        return next;
      });
    setDragging(null);
    setDropTarget(null);
  };
  const download = () => {
    const rows = [
      ["Номер заказа", "Клиент", "Дата", "Сумма, ₽", "Статус"],
      ...transactions.map((t) => [t.id, t.name, t.date, t.amount, t.status]),
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + rows.map((r) => r.join(";")).join("\n")], {
        type: "text/csv;charset=utf-8;",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "forma-report-june-2025.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Отчёт выгружен в CSV");
  };
  const addWidget = (type: string) => {
    setWidgets((old) => [
      ...old,
      {
        id: type + "-" + Date.now(),
        type,
        span: ["sales", "transactions"].includes(type)
          ? 8
          : ["traffic", "goal"].includes(type)
            ? 4
            : 3,
      },
    ]);
    setToast("Виджет добавлен на дашборд");
    setDrawer(false);
  };
  const statData: Record<
    string,
    { value: string; growth: string; icon: IconName; index: number }
  > = {
    revenue: {
      value: period === "week" ? "324 850" : "1 284 650",
      growth: "18,6",
      icon: "wallet",
      index: 0,
    },
    orders: {
      value: period === "week" ? "462" : "1 842",
      growth: "12,8",
      icon: "bag",
      index: 1,
    },
    customers: {
      value: period === "week" ? "128" : "648",
      growth: "8,2",
      icon: "users",
      index: 2,
    },
    conversion: { value: "3,62", growth: "2,4", icon: "chart", index: 3 },
    visitors: { value: "24 892", growth: "12,8", icon: "globe", index: 1 },
  };
  const renderWidget = (w: Widget) => {
    if (statData[w.type]) {
      const d = statData[w.type];
      return (
        <>
          <div className="stat-top">
            <span>{widgetNames[w.type]}</span>
            <Icon name={d.icon} size={18} />
          </div>
          <div className="stat-value">
            {w.type === "revenue" && <span className="currency">₽ </span>}
            {d.value}
            {w.type === "conversion" && <span className="currency"> %</span>}
          </div>
          <div className="stat-bottom">
            <div>
              <span className="growth">
                <Icon name="arrow" size={12} />
                {d.growth}%
              </span>
              <span className="stat-comparison">к прошлому периоду</span>
            </div>
            <Spark variant={d.index} />
          </div>
        </>
      );
    }
    if (w.type === "sales") return <RevenueChart period={period} />;
    if (w.type === "traffic") return <Traffic />;
    if (w.type === "goal")
      return (
        <>
          <div className="card-heading">
            <div>
              <h3>Большие планы. Ближе каждый день.</h3>
              <p>Ваша цель по выручке на июнь</p>
            </div>
            <span className="goal-icon">
              <Icon name="target" size={21} />
            </span>
          </div>
          <div className="goal-amount">
            1 284 650 <span>/ 1 500 000 ₽</span>
          </div>
          <div className="progress-track">
            <div style={{ width: "85.6%" }} />
          </div>
          <div className="goal-progress">
            <span>85,6% выполнено</span>
            <strong>Осталось 215 350 ₽</strong>
          </div>
          <div className="goal-message">
            <span>✦</span>
            <p>
              Отличный темп! Вы на 18,6% впереди
              <br />
              результата прошлого месяца.
            </p>
          </div>
          <button
            className="goal-link"
            onClick={() => {
              setNav("Аналитика");
              setToast("Показаны показатели достижения цели");
            }}
          >
            Подробнее о результатах <Icon name="arrow" size={16} />
          </button>
        </>
      );
    return (
      <>
        <div className="card-heading">
          <div>
            <h3>{nav === "Клиенты" ? "Ваши клиенты" : "Последние заказы"}</h3>
            <p>
              {nav === "Клиенты"
                ? "Люди, которые выбирают ваш бизнес"
                : "Каждый заказ — маленькая победа"}
            </p>
          </div>
          <button
            className="text-button"
            onClick={() => setAllOrders(!allOrders)}
          >
            {allOrders ? "Свернуть" : "Все заказы"}
            <Icon name="chevron" size={14} />
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Заказ</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(allOrders
                ? [
                    ...transactions,
                    ...transactions.map((t, i) => ({
                      ...t,
                      id: `#FR-${1044 - i}`,
                      date: "28 июн, 2025",
                    })),
                  ]
                : transactions
              )
                .filter((t) =>
                  (t.name + t.email + t.id)
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedOrder(t)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedOrder(t)}
                  >
                    <td>
                      <div className="customer">
                        <span className={`avatar ${t.color}`}>
                          {t.initials}
                        </span>
                        <div>
                          <strong>{t.name}</strong>
                          <small>{t.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="order-id">{t.id}</td>
                    <td className="amount">{t.amount} ₽</td>
                    <td>
                      <span
                        className={`status ${t.status === "Оплачен" ? "paid" : "pending"}`}
                      >
                        <i />
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <Icon name="chevron" size={15} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {query &&
            !transactions.some((t) =>
              (t.name + t.email + t.id)
                .toLowerCase()
                .includes(query.toLowerCase()),
            ) && (
              <div className="no-results">
                По запросу «{query}» ничего не найдено
              </div>
            )}
        </div>
      </>
    );
  };
  const visibleWidgets = widgets.filter((w) =>
    nav === "Аналитика"
      ? [
          "sales",
          "traffic",
          "conversion",
          "visitors",
          "revenue",
          "goal",
        ].includes(w.type)
      : nav === "Заказы"
        ? ["orders", "revenue", "transactions"].includes(w.type)
        : nav === "Клиенты"
          ? ["customers", "conversion", "traffic", "transactions"].includes(
              w.type,
            )
          : true,
  );
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setNav("Обзор");
          }}
        >
          <span className="brand-symbol">✳</span>forma
          <span className="brand-dot">®</span>
        </a>
        <button
          className="workspace-selector"
          onClick={() => setProfile(!profile)}
        >
          <span className="workspace-logo">
            S<span>↗</span>
          </span>
          <span>
            <strong>Studio Store</strong>
            <small>Рабочее пространство</small>
          </span>
          <span className="double-chevron">
            ⌃<br />⌄
          </span>
        </button>
        <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          {(
            [
              { name: "Обзор", icon: "grid" },
              { name: "Аналитика", icon: "chart" },
              { name: "Заказы", icon: "bag" },
              { name: "Клиенты", icon: "users" },
            ] as { name: string; icon: IconName }[]
          ).map((item) => (
            <button
              key={item.name}
              className={`nav-item ${nav === item.name ? "active" : ""}`}
              onClick={() => {
                setNav(item.name);
                setMobileNav(false);
                setQuery("");
              }}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
              {item.name === "Заказы" && <span className="nav-badge">24</span>}
              {item.name === "Обзор" && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-symbol">✧</div>
            <strong>Больше возможностей</strong>
            <p>
              Ваши идеи. Наши инструменты.
              <br />
              Растите вместе с Forma Pro.
            </p>
            <button
              onClick={() => {
                setDrawer(true);
                setToast("Начните с новых виджетов для вашего бизнеса");
              }}
            >
              Открыть возможности <Icon name="arrow" size={15} />
            </button>
          </div>
          <button
            className="nav-item"
            onClick={() => {
              setEditing(true);
              setToast("Настройте дашборд: перетаскивайте виджеты за ручку");
            }}
          >
            <Icon name="settings" />
            <span>Настройки</span>
          </button>
          <button
            className="nav-item"
            onClick={() =>
              setToast(
                "Перетащите виджеты в режиме настройки. Используйте меню ⋯, чтобы менять ширину или удалять их.",
              )
            }
          >
            <Icon name="help" />
            <span>Помощь и поддержка</span>
            <Icon name="external" size={14} />
          </button>
          <div
            className="sidebar-user"
            onClick={() => setProfile(!profile)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setProfile(!profile)}
          >
            <span className="profile-avatar">АК</span>
            <div>
              <strong>Алексей Ким</strong>
              <small>Личный аккаунт</small>
            </div>
            <Icon name="chevron" size={16} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Открыть меню"
            >
              <Icon name="grid" />
            </button>
            <span>Рабочее пространство</span>
            <Icon name="chevron" size={13} />
            <strong>{nav}</strong>
          </div>
          <div className="topbar-actions">
            <div className="global-search">
              <Icon name="search" size={17} />
              <input
                ref={searchRef}
                placeholder="Поиск по дашборду"
                aria-label="Поиск по дашборду"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) setNav("Обзор");
                }}
              />
              <kbd>⌘ K</kbd>
            </div>
            <div className="popover-anchor">
              <button
                className="icon-button bell-button"
                onClick={() => setNotification(!notification)}
                aria-label="Уведомления"
              >
                <Icon name="bell" />
                <i />
              </button>
              {notification && (
                <div className="popover notifications">
                  <h3>
                    Уведомления <span>2 новых</span>
                  </h3>
                  <div>
                    <span className="notification-icon">
                      <Icon name="bag" size={17} />
                    </span>
                    <p>
                      <strong>Новый заказ #FR-1048</strong>
                      <small>Александр Петров · 12 490 ₽</small>
                      <small>5 минут назад</small>
                    </p>
                  </div>
                  <div>
                    <span className="notification-icon">
                      <Icon name="target" size={17} />
                    </span>
                    <p>
                      <strong>Цель почти достигнута</strong>
                      <small>Вы выполнили 85,6% плана июня.</small>
                      <small>Сегодня, 09:00</small>
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => {
                      setNotification(false);
                      setToast("Все уведомления отмечены прочитанными");
                    }}
                  >
                    Отметить всё прочитанным
                  </button>
                </div>
              )}
            </div>
            <span className="topbar-divider" />
            <button
              className="top-avatar"
              onClick={() => setProfile(!profile)}
              aria-label="Профиль Алексея Кима"
            >
              АК
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС В ОДНОМ МЕСТЕ</div>
              <h1>
                {nav}
                <span className="heading-dot">.</span>
              </h1>
              <p>Всё, что важно. Так, как удобно вам.</p>
            </div>
            <div className="heading-actions">
              <button
                className={`button ${editing ? "editing-button" : ""}`}
                onClick={() => {
                  setEditing(!editing);
                  if (editing) setToast("Расположение виджетов сохранено");
                }}
              >
                <Icon name={editing ? "check" : "sliders"} size={17} />
                {editing ? "Готово" : "Настроить"}
              </button>
              <button
                className="button primary"
                onClick={() => setDrawer(true)}
              >
                <Icon name="plus" size={18} />
                Добавить виджет
              </button>
            </div>
          </div>
          <div className="dashboard-toolbar">
            <div className="view-tabs">
              <button
                className={nav === "Обзор" ? "selected" : ""}
                onClick={() => setNav("Обзор")}
              >
                <Icon name="grid" size={15} />
                Мой дашборд<span>{visibleWidgets.length}</span>
              </button>
              <button
                onClick={() => {
                  setEditing(true);
                  setDrawer(true);
                }}
                className="new-dashboard"
                aria-label="Добавить виджет"
              >
                <Icon name="plus" size={17} />
              </button>
            </div>
            <div className="period-actions">
              <span className="live-indicator">
                <i />
                Обновлено только что
              </span>
              <div className="period-select">
                <Icon name="calendar" size={16} />
                <select
                  aria-label="Период отчёта"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="month">1–30 июн, 2025</option>
                  <option value="week">24–30 июн, 2025</option>
                </select>
                <Icon name="chevron" size={12} />
              </div>
              <button
                className="icon-button export-button"
                onClick={download}
                aria-label="Скачать отчёт"
                title="Скачать отчёт"
              >
                <Icon name="download" size={17} />
              </button>
            </div>
          </div>
          {editing && (
            <div className="edit-banner">
              <span>
                <Icon name="grip" size={18} />
                Перетаскивайте виджеты, чтобы создать своё пространство. Размер
                можно изменить в меню ⋯.
              </span>
              <button
                onClick={() => {
                  setWidgets(initialWidgets);
                  setToast("Исходное расположение восстановлено");
                }}
              >
                Сбросить
              </button>
            </div>
          )}
          <div
            className={`widget-grid ${editing ? "is-editing" : ""}`}
            onDragOver={(e) => e.preventDefault()}
          >
            {visibleWidgets.map((w) => (
              <section
                key={w.id}
                style={{ "--widget-span": w.span } as React.CSSProperties}
                className={`widget ${statData[w.type] ? "stat-card" : ""} ${w.type === "goal" ? "goal-card" : ""} ${w.type === "transactions" ? "transactions-card" : ""} ${dragging === w.id ? "dragging" : ""} ${dropTarget === w.id && dragging !== w.id ? "drop-target" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDropTarget(w.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  reorder(w.id);
                }}
              >
                {editing && (
                  <div className="widget-edit-tools">
                    <button
                      className="drag-handle"
                      draggable
                      onDragStart={(e) => {
                        setDragging(w.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", w.id);
                        const card = e.currentTarget.closest("section");
                        if (card) e.dataTransfer.setDragImage(card, 30, 20);
                      }}
                      onDragEnd={() => {
                        setDragging(null);
                        setDropTarget(null);
                      }}
                      title="Перетащить виджет"
                      aria-label={`Перетащить: ${widgetNames[w.type]}`}
                    >
                      <Icon name="grip" size={18} />
                    </button>
                    <button
                      className="widget-menu-button"
                      aria-label={`Настроить: ${widgetNames[w.type]}`}
                      onClick={() => setMenu(menu === w.id ? null : w.id)}
                    >
                      <Icon name="more" size={18} />
                    </button>
                    {menu === w.id && (
                      <div className="widget-menu">
                        <span>Ширина виджета</span>
                        <div className="size-options">
                          {[3, 4, 6, 8, 12].map((s) => (
                            <button
                              className={w.span === s ? "chosen" : ""}
                              key={s}
                              onClick={() => {
                                setWidgets((old) =>
                                  old.map((a) =>
                                    a.id === w.id ? { ...a, span: s } : a,
                                  ),
                                );
                                setMenu(null);
                              }}
                            >
                              {s === 12
                                ? "Вся"
                                : s === 8
                                  ? "⅔"
                                  : s === 6
                                    ? "½"
                                    : s === 4
                                      ? "⅓"
                                      : "¼"}
                            </button>
                          ))}
                        </div>
                        <div className="move-options">
                          <button
                            disabled={widgets[0]?.id === w.id}
                            onClick={() => {
                              setWidgets((old) => {
                                const next = [...old],
                                  i = next.findIndex((a) => a.id === w.id);
                                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                                return next;
                              });
                              setMenu(null);
                            }}
                          >
                            ← Раньше
                          </button>
                          <button
                            disabled={widgets[widgets.length - 1]?.id === w.id}
                            onClick={() => {
                              setWidgets((old) => {
                                const next = [...old],
                                  i = next.findIndex((a) => a.id === w.id);
                                [next[i + 1], next[i]] = [next[i], next[i + 1]];
                                return next;
                              });
                              setMenu(null);
                            }}
                          >
                            Позже →
                          </button>
                        </div>
                        <button
                          className="remove-widget"
                          onClick={() => {
                            setWidgets((old) =>
                              old.filter((a) => a.id !== w.id),
                            );
                            setMenu(null);
                          }}
                        >
                          <Icon name="close" size={14} />
                          Удалить виджет
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {renderWidget(w)}
              </section>
            ))}
          </div>
          {visibleWidgets.length === 0 && (
            <div className="empty-dashboard">
              <Icon name="grid" size={32} />
              <h3>Пространство для ваших идей</h3>
              <p>Добавьте первый виджет и соберите свой дашборд.</p>
              <button
                className="button primary"
                onClick={() => setDrawer(true)}
              >
                Добавить виджет
              </button>
            </div>
          )}
          <div className="dashboard-footer">
            <span>
              <span className="footer-symbol">✳</span> Немного ясности для
              больших решений.
            </span>
            <span>
              Сделано для вашего роста <span className="footer-star">✧</span>
            </span>
          </div>
        </main>
      </div>
      {profile && (
        <>
          <div
            className="invisible-backdrop"
            onClick={() => setProfile(false)}
          />
          <div className="profile-popover popover">
            <div className="profile-info">
              <span className="profile-avatar">АК</span>
              <div>
                <strong>Алексей Ким</strong>
                <small>alex@studiostore.ru</small>
              </div>
            </div>
            <p>
              Рабочее пространство <strong>Studio Store</strong>
            </p>
            <span className="plan-badge">Базовый план</span>
            <button
              className="button"
              onClick={() => {
                setProfile(false);
                setEditing(true);
              }}
            >
              <Icon name="settings" size={16} />
              Настроить пространство
            </button>
          </div>
        </>
      )}
      {drawer && (
        <div className="drawer-backdrop" onClick={() => setDrawer(false)}>
          <aside className="widget-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="eyebrow">ВАШЕ ПРОСТРАНСТВО</span>
              <button
                className="icon-button"
                aria-label="Закрыть"
                onClick={() => setDrawer(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <h2>
              Добавить виджет<span className="heading-dot">.</span>
            </h2>
            <p>
              Соберите картину вашего бизнеса из показателей, которые важны
              именно вам.
            </p>
            <div className="drawer-label">ПОКАЗАТЕЛИ И ОТЧЁТЫ</div>
            <div className="widget-catalog">
              {Object.entries(widgetNames).map(([type, name]) => (
                <button key={type} onClick={() => addWidget(type)}>
                  <span className="catalog-icon">
                    <Icon
                      name={
                        statData[type]?.icon ||
                        (
                          {
                            sales: "chart",
                            traffic: "globe",
                            transactions: "bag",
                            goal: "target",
                          } as Record<string, IconName>
                        )[type]
                      }
                    />
                  </span>
                  <span>
                    <strong>{name}</strong>
                    <small>
                      {["sales", "traffic"].includes(type)
                        ? "Наглядный отчёт о вашем бизнесе"
                        : type === "transactions"
                          ? "Покупки и статусы заказов"
                          : type === "goal"
                            ? "Прогресс на пути к результату"
                            : "Ключевой показатель и его динамика"}
                    </small>
                  </span>
                  <Icon name="plus" size={18} />
                </button>
              ))}
            </div>
            <div className="drawer-hint">
              <Icon name="grip" size={20} />
              <p>
                После добавления включите «Настроить», чтобы переместить виджет
                в удобное место.
              </p>
            </div>
          </aside>
        </div>
      )}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="icon-button modal-close"
              aria-label="Закрыть"
              onClick={() => setSelectedOrder(null)}
            >
              <Icon name="close" />
            </button>
            <span className="modal-order-icon">
              <Icon name="bag" size={26} />
            </span>
            <h2>Заказ {selectedOrder.id}</h2>
            <p>{selectedOrder.date}</p>
            <div className="order-details">
              <div>
                <span>Клиент</span>
                <strong>{selectedOrder.name}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{selectedOrder.email}</strong>
              </div>
              <div>
                <span>Сумма заказа</span>
                <strong>{selectedOrder.amount} ₽</strong>
              </div>
              <div>
                <span>Статус</span>
                <span
                  className={`status ${selectedOrder.status === "Оплачен" ? "paid" : "pending"}`}
                >
                  <i />
                  {selectedOrder.status}
                </span>
              </div>
            </div>
            <button
              className="button primary"
              onClick={() => setSelectedOrder(null)}
            >
              Готово
            </button>
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
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
