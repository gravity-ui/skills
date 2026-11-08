import { useEffect, useId, useRef, useState } from "react";
import { ThemeProvider, useTheme, useThemeValue } from "@gravity-ui/uikit";
import "./styles.css";

type IconName =
  | "chart"
  | "grid"
  | "users"
  | "file"
  | "arrow"
  | "chevron"
  | "calendar"
  | "download"
  | "sun"
  | "moon"
  | "monitor"
  | "help"
  | "close"
  | "globe"
  | "check"
  | "spark"
  | "clock"
  | "eye"
  | "target"
  | "external";
function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    chart: (
      <>
        <path d="M4 4v16h16" />
        <path d="m8 14 4-5 4 3 4-7" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5" />
      </>
    ),
    file: (
      <>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <path d="M14 3v6h6M8 13h8M8 17h5" />
      </>
    ),
    arrow: <path d="M5 16 16 5M6 5h10v10" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 11h18M7 15h2m4 0h2m-8 3h2" />
      </>
    ),
    download: (
      <path d="M12 3v12m-4-4 4 4 4-4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />,
    monitor: (
      <>
        <rect x="3" y="3" width="18" height="13" rx="2" />
        <path d="M12 16v5m-5 0h10" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 2-2.5 2-2.5 4M12 17h.01" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    spark: (
      <>
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
        <path d="m20 2 .5 1.5L22 4l-1.5.5L20 6l-.5-1.5L18 4l1.5-.5Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
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
      <path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
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
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const raw = [
  2900, 3300, 3050, 3900, 3500, 3100, 3300, 4300, 4700, 4100, 3600, 4200, 5100,
  4600, 4200, 4800, 4500, 5000, 5700, 5200, 4800, 5300, 6000, 5500, 5900, 6800,
  6300, 5800, 6600, 7100,
];
const scale = 128430 / raw.reduce((a, b) => a + b, 0);
const daily = raw.map((v) => Math.round(v * scale));
daily[daily.length - 1] += 128430 - daily.reduce((a, b) => a + b, 0);
const nf = new Intl.NumberFormat("ru-RU");
type Metric = "views" | "visitors" | "conversion" | "duration";
const metricInfo: Record<
  Metric,
  { label: string; icon: IconName; growth: string; chart: string }
> = {
  views: {
    label: "Просмотры",
    icon: "eye",
    growth: "12,8",
    chart: "Динамика просмотров",
  },
  visitors: {
    label: "Посетители",
    icon: "users",
    growth: "8,2",
    chart: "Динамика посещений",
  },
  conversion: {
    label: "Конверсия",
    icon: "target",
    growth: "2,4",
    chart: "Динамика конверсии",
  },
  duration: {
    label: "Время на сайте",
    icon: "clock",
    growth: "6,1",
    chart: "Время на сайте",
  },
};
function formatValue(value: number, metric: Metric) {
  if (metric === "conversion")
    return `${value.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;
  if (metric === "duration")
    return `${Math.floor(Math.round(value) / 60)} м ${Math.round(value) % 60} с`;
  return nf.format(Math.round(value));
}
function pointsPath(points: { x: number; y: number }[]) {
  return points
    .map((p, i) => {
      if (!i) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1],
        dx = (p.x - prev.x) * 0.4;
      return `C ${prev.x + dx} ${prev.y}, ${p.x - dx} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(" ");
}

export function App() {
  const inheritedTheme = useTheme();
  const [theme, setTheme] = useState<"light" | "dark" | "system" | null>(() => {
    try {
      const saved = localStorage.getItem("pulse-theme");
      return saved === "light" || saved === "dark" || saved === "system"
        ? saved
        : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    if (theme)
      try {
        localStorage.setItem("pulse-theme", theme);
      } catch {}
  }, [theme]);
  const activeTheme =
    theme ??
    (inheritedTheme === "system"
      ? "system"
      : inheritedTheme.startsWith("dark")
        ? "dark"
        : "light");
  return (
    <ThemeProvider theme={activeTheme}>
      <Dashboard theme={activeTheme} setTheme={setTheme} />
    </ThemeProvider>
  );
}

function Dashboard({
  theme,
  setTheme,
}: {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}) {
  const resolvedTheme = useThemeValue();
  const [metric, setMetric] = useState<Metric>("views");
  const [days, setDays] = useState(30);
  const [group, setGroup] = useState("День");
  const [dateOpen, setDateOpen] = useState(false);
  const [compare, setCompare] = useState(true);
  const [currentVisible, setCurrentVisible] = useState(true);
  const [hover, setHover] = useState<number | null>(18);
  const [help, setHelp] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeNav, setActiveNav] = useState("Аналитика");
  const dateRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const [compactChart, setCompactChart] = useState(false);
  const gradientId = useId().replace(/:/g, "");
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setCompactChart(entry.contentRect.width < 500),
    );
    if (plotRef.current) observer.observe(plotRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!dateRef.current?.contains(event.target as Node)) setDateOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (help) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [help]);
  const base = Array.from(
    { length: days },
    (_, i) =>
      daily[(i + 30 - Math.min(days, 30)) % 30] *
      (days === 90 ? 0.8 + Math.floor(i / 30) * 0.1 : 1),
  );
  const mean = base.reduce((a, b) => a + b, 0) / base.length;
  const values = base.map((v, i) =>
    metric === "visitors"
      ? v * (24812 / 128430)
      : metric === "conversion"
        ? 4.8 + (v - mean) / 5000 + Math.sin(i) * 0.2
        : metric === "duration"
          ? 222 + (v - mean) / 90
          : v,
  );
  const oldValues = values.map((v, i) => v * (0.84 + Math.sin(i * 0.8) * 0.08));
  const comparisonScale =
    values.reduce((a, b) => a + b, 0) /
    oldValues.reduce((a, b) => a + b, 0) /
    (1 + Number(metricInfo[metric].growth.replace(",", ".")) / 100);
  const previous = oldValues.map((v) => v * comparisonScale);
  const bucket = group === "Неделя" ? 7 : group === "Месяц" ? 30 : 1;
  const aggregate = (data: number[]) =>
    Array.from({ length: Math.ceil(data.length / bucket) }, (_, i) => {
      const slice = data.slice(i * bucket, (i + 1) * bucket);
      return (
        slice.reduce((a, b) => a + b, 0) /
        (metric === "conversion" || metric === "duration" ? slice.length : 1)
      );
    });
  const chartValues = aggregate(values),
    comparison = aggregate(previous);
  const max =
    metric === "conversion"
      ? 8
      : metric === "duration"
        ? 360
        : Math.ceil(Math.max(...chartValues, ...comparison) / 4 / 500) *
          500 *
          4;
  const chartWidth = compactChart ? 600 : 1040;
  const left = 48,
    right = chartWidth - 22,
    top = 22,
    bottom = 275;
  const points = chartValues.map((v, i) => ({
    x: left + (i * (right - left)) / Math.max(1, chartValues.length - 1),
    y: bottom - (v / max) * (bottom - top),
  }));
  const oldPoints = comparison.map((v, i) => ({
    x: points[i].x,
    y: bottom - (v / max) * (bottom - top),
  }));
  const focused = hover === null ? null : Math.min(hover, points.length - 1);
  const periodLabel =
    days === 7
      ? "24–30 сентября 2026"
      : days === 90
        ? "3 июля – 30 сентября 2026"
        : "1–30 сентября 2026";
  const dateAt = (index: number) =>
    new Date(2026, 8, 31 - days + Math.min(index * bucket, days - 1));
  const shortDate = (index: number) =>
    dateAt(index)
      .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
      .replace(".", "");
  const totalViews = base.reduce((a, b) => a + b, 0);
  const summary: Record<Metric, number> = {
    views: totalViews,
    visitors: totalViews * (24812 / 128430),
    conversion: 4.8,
    duration: 222,
  };
  const exportData = () => {
    const rows = [
      "Дата;" + metricInfo[metric].label + ";Предыдущий период",
      ...chartValues.map(
        (v, i) =>
          `${dateAt(i).toLocaleDateString("ru-RU")};${v.toFixed(2).replace(".", ",")};${comparison[i].toFixed(2).replace(".", ",")}`,
      ),
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + rows.join("\r\n")], {
        type: "text/csv;charset=utf-8;",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse-${metric}-${days}days.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Отчёт скачан в формате CSV");
  };
  const navigate = (name: string) => {
    setActiveNav(name);
    if (name === "Аудитория") setMetric("visitors");
    if (name === "Обзор") setMetric("views");
    if (name === "Отчёты")
      setNotice("Отчёт за выбранный период готов к экспорту");
  };
  return (
    <div
      className={`app-shell ${resolvedTheme.startsWith("dark") ? "dark" : "light"}`}
    >
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Аналитика");
          }}
          aria-label="Pulse — главная"
        >
          <span className="brand-mark">
            <svg width="25" height="25" viewBox="0 0 26 26" fill="none">
              <path
                d="m13 2 10 5.5V19L13 25 3 19V7.5L13 2Z"
                fill="currentColor"
              />
              <path
                d="m3 7.5 10 6 10-6M13 13.5V25M8 4.8l10 6v5.7"
                stroke="var(--sidebar)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          pulse<span className="brand-period">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <Icon name="globe" size={19} />
          </span>
          <div>
            <span className="workspace-caption">Рабочее пространство</span>
            <strong>acme.design</strong>
          </div>
          <span className="workspace-plan">PRO</span>
        </div>
        <div className="nav-label">ПРОСТРАНСТВО</div>
        <nav className="main-nav" aria-label="Основная навигация">
          {(
            [
              ["Обзор", "grid"],
              ["Аналитика", "chart"],
              ["Аудитория", "users"],
              ["Отчёты", "file"],
            ] as [string, IconName][]
          ).map(([name, icon]) => (
            <button
              key={name}
              title={name}
              aria-label={name}
              onClick={() => navigate(name)}
              className={`nav-item ${activeNav === name ? "active" : ""}`}
            >
              <Icon name={icon} size={19} />
              <span>{name}</span>
              {name === "Аналитика" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-symbol">
              <Icon name="spark" size={19} />
            </span>
            <strong>Данные — в действия</strong>
            <p>
              Узнайте, как находить точки
              <br />
              роста в вашей аналитике.
            </p>
            <button onClick={() => setHelp(true)}>
              Краткое руководство <Icon name="external" size={13} />
            </button>
          </div>
          <div className="theme-label">Тема интерфейса</div>
          <div
            className="theme-switch"
            role="group"
            aria-label="Тема интерфейса"
          >
            {(
              [
                ["light", "sun", "Светлая"],
                ["dark", "moon", "Тёмная"],
                ["system", "monitor", "Системная"],
              ] as const
            ).map(([value, icon, label]) => (
              <button
                key={value}
                className={theme === value ? "selected" : ""}
                aria-label={label}
                aria-pressed={theme === value}
                title={label}
                onClick={() => setTheme(value)}
              >
                <Icon name={icon} size={17} />
              </button>
            ))}
          </div>
          <button className="support" onClick={() => setHelp(true)}>
            <Icon name="help" size={18} />
            Помощь и поддержка
            <Icon name="external" size={13} />
          </button>
          <div className="sidebar-footer">
            <span className="tiny-logo">p.</span> pulse analytics{" "}
            <span>v. 1.8</span>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            Рабочее пространство <span>/</span>
            <strong>{activeNav}</strong>
          </div>
          <div className="topbar-right">
            <span className="saved-status">
              <span />
              Все изменения сохранены
            </span>
            <div className="topbar-divider" />
            <button
              className="help-button"
              aria-label="Открыть помощь"
              onClick={() => setHelp(true)}
            >
              <Icon name="help" size={20} />
            </button>
            <div className="avatar" title="Александр Морозов">
              АМ
            </div>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="title-row">
                <h1>{activeNav}</h1>
                <span className="live-badge">
                  <span />В реальном времени
                </span>
              </div>
              <p className="page-description">
                Вся картина в цифрах. Следите за тем, что действительно важно.
              </p>
            </div>
            <div className="heading-actions">
              <div className="date-dropdown" ref={dateRef}>
                <button
                  className={`button date-button ${dateOpen ? "opened" : ""}`}
                  aria-expanded={dateOpen}
                  onClick={() => setDateOpen(!dateOpen)}
                >
                  <Icon name="calendar" size={17} />
                  <span>{periodLabel}</span>
                  <Icon name="chevron" size={15} />
                </button>
                {dateOpen && (
                  <div className="dropdown">
                    <span className="dropdown-heading">Период отчёта</span>
                    {[7, 30, 90].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          setDays(n);
                          setDateOpen(false);
                          setHover(null);
                        }}
                        className={days === n ? "chosen" : ""}
                      >
                        Последние {n} дней
                        {days === n && <Icon name="check" size={16} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="button export-button" onClick={exportData}>
                <Icon name="download" size={17} />
                Экспорт
              </button>
            </div>
          </div>

          <section className="metric-grid" aria-label="Ключевые показатели">
            {(Object.keys(metricInfo) as Metric[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setMetric(key);
                  setCurrentVisible(true);
                }}
                aria-pressed={metric === key}
                className={`metric-card ${metric === key ? "selected" : ""}`}
              >
                <div className="metric-top">
                  <span>{metricInfo[key].label}</span>
                  <Icon name={metricInfo[key].icon} size={18} />
                </div>
                <div className="metric-value">
                  {formatValue(summary[key], key)}
                </div>
                <div className="metric-bottom">
                  <span className="growth">
                    <Icon name="arrow" size={12} /> {metricInfo[key].growth}%
                  </span>
                  <span>к прошлому периоду</span>
                </div>
                <svg
                  className="sparkline"
                  viewBox="0 0 95 32"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d={
                      key === "duration"
                        ? "M1 26 10 23 18 25 26 17 35 18 44 14 53 16 61 8 70 10 79 5 94 2"
                        : "M1 28 10 24 18 26 26 19 35 22 44 15 53 17 61 10 70 14 79 8 86 10 94 3"
                    }
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </section>

          <section
            className="chart-card"
            aria-label="Линейный график показателей"
          >
            <div className="chart-heading">
              <div>
                <h2>
                  {metricInfo[metric].chart}
                  <span
                    className="info-icon"
                    title="Демонстрационные данные за выбранный период"
                  >
                    i
                  </span>
                </h2>
                <p>Как меняется активность вашей аудитории</p>
              </div>
              <div className="segmented" aria-label="Группировка данных">
                {["День", "Неделя", "Месяц"].map((label) => (
                  <button
                    key={label}
                    aria-pressed={group === label}
                    onClick={() => {
                      setGroup(label);
                      setHover(null);
                    }}
                    className={group === label ? "selected" : ""}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-toolbar">
              <div className="chart-metric-tabs">
                {(["views", "visitors", "conversion"] as Metric[]).map(
                  (key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setMetric(key);
                        setCurrentVisible(true);
                      }}
                      className={metric === key ? "active" : ""}
                    >
                      {metricInfo[key].label}
                    </button>
                  ),
                )}
              </div>
              <label className="compare-toggle">
                <input
                  type="checkbox"
                  checked={compare}
                  onChange={(e) => setCompare(e.target.checked)}
                />
                <span className="custom-checkbox">
                  {compare && <Icon name="check" size={11} />}
                </span>
                Сравнить с прошлым периодом
              </label>
            </div>
            <div className="plot-caption">
              {metric === "conversion"
                ? "Конверсия, %"
                : metric === "duration"
                  ? "Время, мин"
                  : `${metricInfo[metric].label}, ${group === "День" ? "за день" : group === "Неделя" ? "за неделю" : "за месяц"}`}
            </div>
            <div
              className="chart-plot"
              ref={plotRef}
              onMouseLeave={() => setHover(null)}
            >
              <svg
                viewBox={`0 0 ${chartWidth} 315`}
                className="line-chart"
                role="img"
                aria-label={`${metricInfo[metric].chart}, ${periodLabel}. ${chartValues.length} точек. Используйте стрелки для просмотра значений.`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    setHover((i) =>
                      Math.max(
                        0,
                        Math.min(
                          chartValues.length - 1,
                          (i ?? 0) + (e.key === "ArrowRight" ? 1 : -1),
                        ),
                      ),
                    );
                  }
                }}
                onMouseMove={(e) => {
                  const bounds = e.currentTarget.getBoundingClientRect();
                  const x =
                    ((e.clientX - bounds.left) / bounds.width) * chartWidth;
                  setHover(
                    Math.max(
                      0,
                      Math.min(
                        points.length - 1,
                        Math.round(
                          ((x - left) / (right - left)) * (points.length - 1),
                        ),
                      ),
                    ),
                  );
                }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--accent)"
                      stopOpacity=".13"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--accent)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4].map((i) => {
                  const y = top + (i * (bottom - top)) / 4;
                  const val = (max * (4 - i)) / 4;
                  return (
                    <g key={i}>
                      <line
                        x1={left}
                        y1={y}
                        x2={right}
                        y2={y}
                        className="grid-line"
                      />
                      <text
                        x={left - 15}
                        y={y + 4}
                        textAnchor="end"
                        className="axis-label"
                      >
                        {metric === "conversion"
                          ? `${val}%`
                          : metric === "duration"
                            ? `${val / 60}`
                            : val >= 1000
                              ? `${val / 1000}k`
                              : val}
                      </text>
                    </g>
                  );
                })}
                {currentVisible && (
                  <path
                    d={`${pointsPath(points)} L ${points[points.length - 1].x} ${bottom} L ${left} ${bottom} Z`}
                    fill={`url(#${gradientId})`}
                  />
                )}
                {compare && (
                  <path d={pointsPath(oldPoints)} className="previous-line" />
                )}
                {compare && points.length === 1 && (
                  <circle
                    cx={oldPoints[0].x}
                    cy={oldPoints[0].y}
                    r="4"
                    fill="var(--previous)"
                  />
                )}
                {currentVisible && (
                  <path d={pointsPath(points)} className="current-line" />
                )}
                {currentVisible && points.length === 1 && (
                  <circle
                    cx={points[0].x}
                    cy={points[0].y}
                    r="5"
                    fill="var(--accent)"
                  />
                )}
                {focused !== null && (
                  <g>
                    <line
                      x1={points[focused].x}
                      x2={points[focused].x}
                      y1={top}
                      y2={bottom}
                      className="focus-line"
                    />
                    {currentVisible && (
                      <>
                        <circle
                          cx={points[focused].x}
                          cy={points[focused].y}
                          r="8"
                          fill="var(--accent)"
                          fillOpacity=".13"
                        />
                        <circle
                          cx={points[focused].x}
                          cy={points[focused].y}
                          r="4"
                          fill="var(--accent)"
                          stroke="var(--surface)"
                          strokeWidth="2"
                        />
                      </>
                    )}
                    {compare && (
                      <circle
                        cx={oldPoints[focused].x}
                        cy={oldPoints[focused].y}
                        r="3.5"
                        fill="var(--previous)"
                        stroke="var(--surface)"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                )}
                {Array.from(
                  new Set([
                    0,
                    ...Array.from({ length: compactChart ? 3 : 5 }, (_, i) =>
                      Math.round(
                        ((points.length - 1) * (i + 1)) /
                          (compactChart ? 3 : 5),
                      ),
                    ),
                  ]),
                ).map((i) => (
                  <text
                    key={i}
                    x={points[i].x}
                    y="306"
                    textAnchor={
                      i === 0
                        ? "start"
                        : i === points.length - 1
                          ? "end"
                          : "middle"
                    }
                    className="axis-label"
                  >
                    {shortDate(i)}
                  </text>
                ))}
              </svg>
              {focused !== null && (
                <div
                  className="chart-tooltip"
                  style={{
                    left: `clamp(8px, ${(points[focused].x / chartWidth) * 100 + 2}%, calc(100% - 218px))`,
                    top: `${Math.max(5, Math.min(40, (points[focused].y / 315) * 100 - 20))}%`,
                  }}
                >
                  <div className="tooltip-date">
                    {dateAt(focused).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  {currentVisible && (
                    <div>
                      <span>
                        <i />
                        {metricInfo[metric].label}
                      </span>
                      <strong>
                        {formatValue(chartValues[focused], metric)}
                      </strong>
                    </div>
                  )}
                  {compare && (
                    <div>
                      <span>
                        <i className="previous-dot" />
                        Прошлый период
                      </span>
                      <strong>
                        {formatValue(comparison[focused], metric)}
                      </strong>
                    </div>
                  )}
                  <span className="tooltip-growth">
                    ↗{" "}
                    {((chartValues[focused] / comparison[focused] - 1) * 100)
                      .toFixed(1)
                      .replace(".", ",")}
                    % к прошлому периоду
                  </span>
                </div>
              )}
            </div>
            <div className="chart-footer">
              <div className="legend">
                <button
                  className={!currentVisible ? "muted" : ""}
                  aria-pressed={currentVisible}
                  onClick={() => setCurrentVisible(!currentVisible)}
                >
                  <span className="legend-line" />
                  Текущий период
                </button>
                <button
                  className={!compare ? "muted" : ""}
                  aria-pressed={compare}
                  onClick={() => setCompare(!compare)}
                >
                  <span className="legend-line previous" />
                  Предыдущий период
                </button>
              </div>
              <span className="timezone">Часовой пояс: UTC+3</span>
            </div>
          </section>

          <div className="bottom-grid">
            <section className="sources-card">
              <div className="section-heading">
                <h2>Источники трафика</h2>
                <span>За выбранный период</span>
              </div>
              <div className="source-content">
                <div className="source-bars">
                  {[
                    {
                      label: "Прямые переходы",
                      percent: 42.6,
                      color: "orange",
                      icon: "external",
                    },
                    {
                      label: "Поисковые системы",
                      percent: 32.4,
                      color: "peach",
                      icon: "globe",
                    },
                    {
                      label: "Социальные сети",
                      percent: 18.2,
                      color: "lavender",
                      icon: "users",
                    },
                    {
                      label: "Другие",
                      percent: 6.8,
                      color: "gray",
                      icon: "grid",
                    },
                  ].map((source) => (
                    <div className="source-row" key={source.label}>
                      <span className={`source-icon ${source.color}`}>
                        <Icon name={source.icon as IconName} size={14} />
                      </span>
                      <span className="source-name">{source.label}</span>
                      <div className="bar-track">
                        <div
                          className={source.color}
                          style={{ width: `${(source.percent / 42.6) * 100}%` }}
                        />
                      </div>
                      <strong>
                        {source.percent.toLocaleString("ru-RU")}
                        <span>%</span>
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section className="insight-card">
              <div className="insight-title">
                <span>
                  <Icon name="spark" size={18} />
                </span>
                <h2>Коротко о главном</h2>
                <span className="insight-tag">ИНСАЙТ</span>
              </div>
              <h3>
                {days === 30
                  ? "Хороший месяц."
                  : days === 7
                    ? "Хорошая неделя."
                    : "Хороший квартал."}
                <br />И это только начало.
              </h3>
              <p>
                Просмотры выросли на <strong>12,8%</strong> по сравнению
                <br className="desktop-break" /> с прошлым периодом. Ваша
                аудитория
                <br className="desktop-break" /> возвращается чаще — продолжайте
                в том же духе.
              </p>
              <div className="insight-footer">
                <span className="insight-growth">
                  <Icon name="chart" size={15} />
                  Положительная динамика
                </span>
                <span className="insight-art" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </section>
          </div>
          <footer className="page-footer">
            <span>
              <span className="status-dot" />
              Демонстрационные данные <span className="footer-dot">·</span>{" "}
              Обновлено только что
            </span>
            <span>Каждая цифра — часть вашей истории.</span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={17} />
          </span>
          {notice}
          <button
            aria-label="Закрыть уведомление"
            onClick={() => setNotice("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      <dialog
        ref={dialogRef}
        className="help-dialog"
        onCancel={() => setHelp(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setHelp(false);
        }}
      >
        <button
          className="dialog-close"
          aria-label="Закрыть"
          onClick={() => setHelp(false)}
        >
          <Icon name="close" />
        </button>
        <span className="dialog-icon">
          <Icon name="chart" size={26} />
        </span>
        <h2>Знакомьтесь с вашей аналитикой</h2>
        <p>
          Находите точки роста, сравнивая поведение аудитории за разные периоды.
        </p>
        <ol>
          <li>
            <strong>Выберите показатель.</strong> Нажмите на карточку, чтобы
            увидеть его динамику на графике.
          </li>
          <li>
            <strong>Посмотрите на детали.</strong> Наведите курсор на график или
            используйте стрелки на клавиатуре.
          </li>
          <li>
            <strong>Сравните результаты.</strong> Включите предыдущий период и
            выберите группировку по дням, неделям или месяцам.
          </li>
          <li>
            <strong>Поделитесь данными.</strong> Кнопка «Экспорт» скачает CSV
            для работы в таблицах.
          </li>
        </ol>
        <div className="demo-note">
          Сейчас вы работаете с демонстрационными данными.
        </div>
        <button
          className="button primary-button"
          onClick={() => setHelp(false)}
        >
          Всё понятно <Icon name="check" size={16} />
        </button>
      </dialog>
    </div>
  );
}
