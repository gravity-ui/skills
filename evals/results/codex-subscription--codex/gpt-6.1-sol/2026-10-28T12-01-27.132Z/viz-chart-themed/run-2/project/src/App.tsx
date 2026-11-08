import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ThemeProvider, useTheme, useThemeType } from "@gravity-ui/uikit";
import "./App.css";

type IconName =
  | "chart"
  | "grid"
  | "arrow"
  | "chevron"
  | "calendar"
  | "download"
  | "sun"
  | "moon"
  | "monitor"
  | "users"
  | "activity"
  | "target"
  | "help"
  | "close"
  | "check"
  | "globe"
  | "link";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    chart: (
      <>
        <path d="M4 4v16h16" />
        <path d="m8 14 4-5 4 3 5-7" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    arrow: (
      <>
        <path d="M7 17 17 7M7 7h10v10" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 11h18m-14 4h2m3 0h2" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
      </>
    ),
    moon: <path d="M20.5 14a9 9 0 0 1-10.5-10.5A9 9 0 1 0 20.5 14Z" />,
    monitor: (
      <>
        <rect x="3" y="3" width="18" height="13" rx="2" />
        <path d="M12 16v5m-5 0h10" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5" />
      </>
    ),
    activity: (
      <>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-1 .7-2 1-2 3M12 17h.01" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    link: (
      <>
        <path
          d="m10 14 4-4m-5 6-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 0 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"
          transform="translate(1 0)"
        />
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
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
const number = (value: number) => new Intl.NumberFormat("ru-RU").format(value);
const dateLabel = (
  date: Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
) => date.toLocaleDateString("ru-RU", options).replace(".", "");
const daily = [
  1420, 1650, 1520, 2020, 1920, 1750, 1820, 2450, 2320, 1950, 2180, 2620, 2470,
  2270, 2900, 3020, 2660, 2820, 2510, 2700, 3200, 3450, 3090, 2820, 3050, 3420,
  3230, 3700, 3510, 3860,
];
type Datum = { date: Date; current: number; previous: number };
function getData(days: number): Datum[] {
  return Array.from({ length: days }, (_, i) => {
    const offset = days - 1 - i;
    const date = new Date(2026, 8, 30 - offset);
    const index = (((29 - offset) % 30) + 30) % 30;
    const factor = 1 - Math.floor(offset / 30) * 0.13;
    return {
      date,
      current: Math.round(daily[index] * factor),
      previous: Math.round(
        daily[index] * factor * (0.72 + Math.sin(index * 1.8) * 0.12),
      ),
    };
  });
}
function linePath(points: [number, number][]) {
  if (!points.length) return "";
  return points.reduce((path, point, i) => {
    if (!i) return `M${point[0]},${point[1]}`;
    const previous = points[i - 1];
    const middle = (previous[0] + point[0]) / 2;
    return `${path} C${middle},${previous[1]} ${middle},${point[1]} ${point[0]},${point[1]}`;
  }, "");
}
function Sparkline({
  values,
  variant = 0,
}: {
  values: number[];
  variant?: number;
}) {
  const max = Math.max(...values),
    min = Math.min(...values);
  const points = values.map(
    (v, i) =>
      [
        (i / (values.length - 1)) * 100,
        32 - ((v - min) / (max - min || 1)) * 27,
      ] as [number, number],
  );
  return (
    <svg
      className={`sparkline sparkline-${variant}`}
      viewBox="0 0 104 38"
      aria-hidden="true"
    >
      <path
        d={linePath(points)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LineChart({
  data,
  showCurrent,
  showPrevious,
}: {
  data: Datum[];
  showCurrent: boolean;
  showPrevious: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  useEffect(() => {
    const element = plotRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(
        Math.max(250, Math.min(1000, Math.round(entry.contentRect.width))),
      ),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const height = width < 600 ? 240 : 310,
    left = width < 600 ? 42 : 53,
    right = 20,
    top = 18,
    bottom = 42;
  const plotWidth = width - left - right,
    plotHeight = height - top - bottom;
  const maxY =
    Math.ceil(
      Math.max(...data.flatMap((d) => [d.current, d.previous])) / 1000,
    ) * 1000;
  const x = (i: number) => left + (i / (data.length - 1)) * plotWidth;
  const y = (value: number) => top + plotHeight - (value / maxY) * plotHeight;
  const current = data.map((d, i) => [x(i), y(d.current)] as [number, number]);
  const previous = data.map(
    (d, i) => [x(i), y(d.previous)] as [number, number],
  );
  const active = hovered === null ? null : data[hovered];
  const tickCount = width < 600 ? 4 : 7;
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    Math.round((i * (data.length - 1)) / (tickCount - 1)),
  );
  return (
    <div className="chart-plot" ref={plotRef}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        tabIndex={0}
        aria-label="Линейный график за выбранный период. Сплошная зелёная линия — текущий период, пунктирная — предыдущий. Используйте стрелки для просмотра значений."
        onFocus={() => setHovered(0)}
        onBlur={() => setHovered(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            setHovered((i) =>
              Math.max(
                0,
                Math.min(
                  data.length - 1,
                  (i ?? 0) + (e.key === "ArrowRight" ? 1 : -1),
                ),
              ),
            );
          }
        }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHovered(
            Math.max(
              0,
              Math.min(
                data.length - 1,
                Math.round(
                  ((((e.clientX - rect.left) / rect.width) * width - left) /
                    plotWidth) *
                    (data.length - 1),
                ),
              ),
            ),
          );
        }}
        onPointerLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--chart-current)"
              stopOpacity=".14"
            />
            <stop
              offset="100%"
              stopColor="var(--chart-current)"
              stopOpacity=".005"
            />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }, (_, i) => (i * maxY) / 4).map((value) => (
          <g key={value}>
            <line
              x1={left}
              x2={width - right}
              y1={y(value)}
              y2={y(value)}
              className="grid-line"
            />
            <text
              x={left - 15}
              y={y(value) + 4}
              textAnchor="end"
              className="axis-label"
            >
              {number(value)}
            </text>
          </g>
        ))}
        {ticks.map((i, n) => (
          <text
            key={i}
            x={x(i)}
            y={height - 12}
            textAnchor={
              n === 0 ? "start" : n === tickCount - 1 ? "end" : "middle"
            }
            className="axis-label"
          >
            {dateLabel(data[i].date)}
          </text>
        ))}
        {showCurrent && (
          <path
            d={`${linePath(current)} L${x(data.length - 1)},${y(0)} L${left},${y(0)} Z`}
            fill={`url(#${id})`}
          />
        )}
        {showPrevious && (
          <path d={linePath(previous)} className="previous-line" />
        )}
        {showCurrent && <path d={linePath(current)} className="current-line" />}
        {active && hovered !== null && (
          <g>
            <line
              x1={x(hovered)}
              x2={x(hovered)}
              y1={top}
              y2={y(0)}
              className="hover-line"
            />
            {showCurrent && (
              <circle
                cx={x(hovered)}
                cy={y(active.current)}
                r="5"
                className="current-dot"
              />
            )}
            {showPrevious && (
              <circle
                cx={x(hovered)}
                cy={y(active.previous)}
                r="4"
                className="previous-dot"
              />
            )}
          </g>
        )}
      </svg>
      {active && hovered !== null && (
        <div
          className="chart-tooltip"
          role="status"
          style={{
            left: `clamp(0px, ${(x(hovered) / width) * 100}%, calc(100% - 220px))`,
          }}
        >
          <strong>
            {dateLabel(active.date, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>
          {showCurrent && (
            <span>
              <i className="dot green" />
              Текущий период <b>{number(active.current)}</b>
            </span>
          )}
          {showPrevious && (
            <span>
              <i className="dot lavender" />
              Предыдущий <b>{number(active.previous)}</b>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function App() {
  const parentTheme = useTheme();
  const [theme, setTheme] = useState<string | null>(null);
  return (
    <ThemeProvider theme={theme ?? parentTheme}>
      <Dashboard themeChoice={theme ?? parentTheme} onThemeChange={setTheme} />
    </ThemeProvider>
  );
}
function Dashboard({
  themeChoice,
  onThemeChange,
}: {
  themeChoice: string;
  onThemeChange: (theme: string) => void;
}) {
  const themeType = useThemeType();
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState("visitors");
  const [showCurrent, setShowCurrent] = useState(true);
  const [showPrevious, setShowPrevious] = useState(true);
  const [help, setHelp] = useState(false);
  const [table, setTable] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  const [exported, setExported] = useState(false);
  const modalRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!help && !table) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const modal = modalRef.current;
    modal?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelp(false);
        setTable(false);
      }
      if (e.key === "Tab" && modal) {
        const buttons = modal.querySelectorAll<HTMLButtonElement>("button");
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = oldOverflow;
      previousFocus?.focus();
    };
  }, [help, table]);
  const rawData = useMemo(() => getData(days), [days]);
  const data = useMemo(
    () =>
      rawData.map((d) => ({
        ...d,
        current: Math.round(d.current * (metric === "sessions" ? 1.32 : 1)),
        previous: Math.round(d.previous * (metric === "sessions" ? 1.32 : 1)),
      })),
    [rawData, metric],
  );
  const total = rawData.reduce((s, d) => s + d.current, 0);
  const previousTotal = rawData.reduce((s, d) => s + d.previous, 0);
  const growth = ((total / previousTotal - 1) * 100).toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  });
  const range = `${dateLabel(data[0].date)} — ${dateLabel(data.at(-1)!.date)} 2026`;
  function exportData() {
    const csv =
      "\uFEFFДата;Посетители;Предыдущий период;Сессии\n" +
      rawData
        .map(
          (d) =>
            `${dateLabel(d.date, { day: "2-digit", month: "2-digit", year: "numeric" })};${d.current};${d.previous};${Math.round(d.current * 1.32)}`,
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `pulse-analytics-${days}-days.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setExported(true);
    window.setTimeout(() => setExported(false), 2500);
  }
  const scrollTo = (id: string) => {
    setActiveNav(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="app-shell" data-theme={themeType}>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          aria-label="Pulse — главная"
          onClick={() => scrollTo("overview")}
        >
          <span className="brand-symbol">
            <svg viewBox="0 0 28 28" fill="none">
              <path
                d="M3 15h5l4-9 5 17 4-11h4"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          pulse<span className="brand-point">.</span>
        </a>
        <div className="workspace">
          <div className="workspace-icon">
            S<span />
          </div>
          <div>
            <strong>Мой проект</strong>
            <span>Рабочее пространство</span>
          </div>
          <span className="workspace-chevron">
            <Icon name="chevron" size={14} />
          </span>
        </div>
        <div className="nav-caption">АНАЛИТИКА</div>
        <nav aria-label="Основная навигация">
          <button
            className={`nav-item ${activeNav === "overview" ? "active" : ""}`}
            onClick={() => scrollTo("overview")}
          >
            <Icon name="grid" />
            Обзор
            <span className="active-mark" />
          </button>
          <button
            className={`nav-item ${activeNav === "sources" ? "active" : ""}`}
            onClick={() => scrollTo("sources")}
          >
            <Icon name="globe" />
            Источники трафика
          </button>
          <button
            className={`nav-item ${activeNav === "reports" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("reports");
              setTable(true);
            }}
          >
            <Icon name="chart" />
            Отчёты<span className="small-badge">CSV</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="theme-label">
            Внешний вид{" "}
            <span>
              {themeType === "light" ? "Светлая тема" : "Тёмная тема"}
            </span>
          </div>
          <div className="theme-switch" aria-label="Тема приложения">
            {(
              [
                { value: "light", icon: "sun", label: "Светлая" },
                { value: "dark", icon: "moon", label: "Тёмная" },
                { value: "system", icon: "monitor", label: "Системная" },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                className={themeChoice === item.value ? "selected" : ""}
                aria-label={`${item.label} тема`}
                title={`${item.label} тема`}
                aria-pressed={themeChoice === item.value}
                onClick={() => onThemeChange(item.value)}
              >
                <Icon name={item.icon} size={17} />
              </button>
            ))}
          </div>
          <button className="help-button" onClick={() => setHelp(true)}>
            <Icon name="help" size={18} />
            Помощь и поддержка
            <Icon name="arrow" size={14} />
          </button>
          <div className="profile">
            <div className="avatar">АК</div>
            <div>
              <strong>Александр К.</strong>
              <span>Личный аккаунт</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            Рабочее пространство
            <Icon name="chevron" size={13} />
            <span>Обзор</span>
          </div>
          <div className="site-indicator">
            <span className="status-dot" />
            Демо-проект
            <span className="topbar-divider" />
            <Icon name="globe" size={15} />
            my-project.ru
          </div>
        </header>
        <main id="overview">
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВСЁ ПОД КОНТРОЛЕМ</div>
              <h1>
                Обзор аналитики
                <span className="heading-dot" />
              </h1>
              <p>Ваши данные. Ясная картина. Уверенные решения.</p>
            </div>
            <button className="button export-button" onClick={exportData}>
              <Icon name={exported ? "check" : "download"} size={17} />
              {exported ? "Скачано" : "Экспорт отчёта"}
            </button>
          </div>
          <div className="filter-bar">
            <div className="period-tabs" aria-label="Период">
              {[7, 30, 90].map((value) => (
                <button
                  key={value}
                  className={days === value ? "selected" : ""}
                  aria-pressed={days === value}
                  onClick={() => setDays(value)}
                >
                  {value} дней
                </button>
              ))}
            </div>
            <div className="date-range">
              <Icon name="calendar" size={17} />
              {range}
            </div>
            <span className="comparison-note">
              В сравнении с предыдущим периодом
            </span>
          </div>
          <section className="stats-grid" aria-label="Ключевые показатели">
            <StatCard
              label="Посетители"
              value={number(total)}
              growth={`+${growth}%`}
              icon="users"
              values={daily}
              selected={metric === "visitors"}
              onClick={() => setMetric("visitors")}
            />
            <StatCard
              label="Сессии"
              value={number(
                rawData.reduce(
                  (sum, d) => sum + Math.round(d.current * 1.32),
                  0,
                ),
              )}
              growth={`+${growth}%`}
              icon="activity"
              values={[...daily.slice(4), ...daily.slice(-4)]}
              selected={metric === "sessions"}
              onClick={() => setMetric("sessions")}
            />
            <div className="stat-card conversion">
              <div className="stat-top">
                <span>Конверсия</span>
                <span className="stat-icon">
                  <Icon name="target" size={18} />
                </span>
              </div>
              <div className="stat-main">
                <strong>
                  3,62<span className="percent-sign">%</span>
                </strong>
                <Sparkline
                  values={[10, 12, 11, 14, 13, 13, 16, 14, 18, 17, 19, 22]}
                  variant={2}
                />
              </div>
              <div className="stat-bottom">
                <span className="growth">
                  <Icon name="arrow" size={12} />
                  +0,48 п. п.
                </span>
                <span>к прошлому периоду</span>
              </div>
            </div>
          </section>
          <section className="chart-card" aria-labelledby="chart-heading">
            <div className="chart-heading">
              <div>
                <h2 id="chart-heading">
                  Динамика {metric === "visitors" ? "посетителей" : "сессий"}
                </h2>
                <p>Как менялась активность вашей аудитории</p>
              </div>
              <div className="chart-type">
                <Icon name="chart" size={16} />
                Линейный график
              </div>
            </div>
            <div className="chart-summary">
              <strong>{number(data.reduce((s, d) => s + d.current, 0))}</strong>
              <span className="growth">
                <Icon name="arrow" size={13} /> {growth}%
              </span>
              <span className="chart-summary-label">за {days} дней</span>
            </div>
            <div className="chart-legend">
              <button
                onClick={() => setShowCurrent((v) => !v)}
                aria-pressed={showCurrent}
                className={!showCurrent ? "legend-disabled" : ""}
              >
                <span className="legend-line green" />
                Текущий период
              </button>
              <button
                onClick={() => setShowPrevious((v) => !v)}
                aria-pressed={showPrevious}
                className={!showPrevious ? "legend-disabled" : ""}
              >
                <span className="legend-line lavender" />
                Предыдущий период
              </button>
              <span className="chart-unit">
                {metric === "visitors" ? "Посетители, чел." : "Сессии"}
              </span>
            </div>
            <LineChart
              data={data}
              showCurrent={showCurrent}
              showPrevious={showPrevious}
            />
            <div className="chart-footer">
              <span>
                <span className="status-dot" />
                Демонстрационные данные
              </span>
              <button onClick={() => setTable(true)}>
                Посмотреть данные
                <Icon name="chevron" size={14} />
              </button>
            </div>
          </section>
          <div className="bottom-grid">
            <section className="sources-card" id="sources">
              <div className="section-heading">
                <h2>Источники трафика</h2>
                <span>Посетители</span>
              </div>
              {[
                {
                  label: "Органический поиск",
                  share: 46.2,
                  color: "green",
                  icon: "globe",
                },
                {
                  label: "Прямые переходы",
                  share: 30.8,
                  color: "purple",
                  icon: "arrow",
                },
                {
                  label: "Социальные сети",
                  share: 15.4,
                  color: "blue",
                  icon: "users",
                },
                {
                  label: "Другие источники",
                  share: 7.6,
                  color: "gray",
                  icon: "link",
                },
              ].map((source) => (
                <div className="source-row" key={source.label}>
                  <span className="source-icon">
                    <Icon name={source.icon as IconName} size={15} />
                  </span>
                  <span className="source-label">{source.label}</span>
                  <div className="source-track">
                    <span
                      className={source.color}
                      style={{ width: `${(source.share / 46.2) * 100}%` }}
                    />
                  </div>
                  <strong>
                    {number(Math.round((total * source.share) / 100))}
                  </strong>
                  <span className="source-share">
                    {source.share.toLocaleString("ru-RU")}%
                  </span>
                </div>
              ))}
            </section>
            <section className="insight-card">
              <div className="insight-heading">
                <span className="insight-icon">
                  <Icon name="activity" size={18} />
                </span>
                <span>В ФОКУСЕ</span>
                <span className="insight-tag">За {days} дней</span>
              </div>
              <h2>Ваша аудитория растёт</h2>
              <p>
                За выбранный период число посетителей выросло на{" "}
                <strong>{growth}%</strong>. Так держать!
              </p>
              <div className="insight-bottom">
                <div className="insight-growth">
                  +{number(total - previousTotal)}
                  <span>посетителей к прошлому периоду</span>
                </div>
                <svg viewBox="0 0 90 50" aria-hidden="true">
                  <path d="m3 42 18-12 15 5 21-21 13 4L86 4" />
                  <path d="M73 4h13v13" />
                </svg>
              </div>
            </section>
          </div>
          <footer className="page-footer">
            <span>Чуть больше ясности каждый день.</span>
            <span>
              Сделано с <span className="footer-heart">♡</span> в pulse
            </span>
          </footer>
        </main>
      </div>
      {(help || table) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setHelp(false);
            setTable(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={help ? "Помощь" : "Данные графика"}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            ref={modalRef}
          >
            <div className="modal-title">
              <h2>{help ? "Всё о вашей аналитике" : "Данные графика"}</h2>
              <button
                className="icon-button"
                aria-label="Закрыть"
                onClick={() => {
                  setHelp(false);
                  setTable(false);
                }}
              >
                <Icon name="close" />
              </button>
            </div>
            {help ? (
              <div className="help-content">
                <p>
                  Выберите период 7, 30 или 90 дней. Карточки «Посетители» и
                  «Сессии» переключают показатель на графике.
                </p>
                <p>
                  Наведите указатель на график, чтобы увидеть значения за день.
                  Нажмите на название ряда в легенде, чтобы скрыть или показать
                  его.
                </p>
                <p>
                  Внешний вид можно изменить внизу боковой панели: светлая,
                  тёмная или системная тема.
                </p>
                <p>
                  Это демонстрационный проект с примерными данными. Кнопка
                  «Экспорт отчёта» скачивает данные выбранного периода в формате
                  CSV.
                </p>
              </div>
            ) : (
              <>
                <p className="modal-subtitle">
                  {range} · демонстрационные данные
                </p>
                <div className="data-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Дата</th>
                        <th>Посетители</th>
                        <th>Пред. период</th>
                        <th>Сессии</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawData.map((d) => (
                        <tr key={d.date.toISOString()}>
                          <td>{dateLabel(d.date)}</td>
                          <td>{number(d.current)}</td>
                          <td>{number(d.previous)}</td>
                          <td>{number(Math.round(d.current * 1.32))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="button" onClick={exportData}>
                  <Icon name="download" size={16} />
                  Скачать CSV
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
function StatCard({
  label,
  value,
  growth,
  icon,
  values,
  selected,
  onClick,
}: {
  label: string;
  value: string;
  growth: string;
  icon: IconName;
  values: number[];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`stat-card ${selected ? "stat-selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">
          <Icon name={icon} size={18} />
        </span>
      </div>
      <div className="stat-main">
        <strong>{value}</strong>
        <Sparkline values={values} variant={label === "Сессии" ? 1 : 0} />
      </div>
      <div className="stat-bottom">
        <span className="growth">
          <Icon name="arrow" size={12} />
          {growth}
        </span>
        <span>к прошлому периоду</span>
      </div>
    </button>
  );
}
