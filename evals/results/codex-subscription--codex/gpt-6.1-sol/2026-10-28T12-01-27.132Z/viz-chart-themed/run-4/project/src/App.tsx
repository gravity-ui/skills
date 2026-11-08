import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Select,
  SegmentedRadioGroup,
  useThemeType,
  type Theme,
} from "@gravity-ui/uikit";
import "./styles.css";

type IconName =
  | "pulse"
  | "grid"
  | "chart"
  | "layers"
  | "arrow"
  | "download"
  | "calendar"
  | "sun"
  | "moon"
  | "monitor"
  | "help"
  | "check"
  | "bag"
  | "wallet"
  | "target"
  | "external";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    pulse: <path d="M3 12h4l3-7 4 14 3-7h4" />,
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </>
    ),
    chart: <path d="M4 4v16h16M7 15l4-5 4 3 5-7" />,
    layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" />,
    arrow: <path d="m6 16 12-12M7 4h11v11" />,
    download: <path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5" />,
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="3" />
        <path d="M8 3v4m8-4v4M4 11h16m-12 4h2m4 0h2m-8 3h2" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
      </>
    ),
    moon: <path d="M20 14a8.5 8.5 0 0 1-10-10A8.5 8.5 0 1 0 20 14Z" />,
    monitor: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3h.01" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    bag: (
      <>
        <rect x="4" y="7" width="16" height="14" rx="3" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M3 8h18m-5 4h5v5h-5a2.5 2.5 0 0 1 0-5Z" />
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
      <path d="M14 3h7v7m0-7L10 14M10 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-5" />
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
const number = (n: number) => Math.round(n).toLocaleString("ru-RU");
const metrics = [
  {
    id: "revenue",
    label: "Выручка",
    icon: "wallet",
    unit: "₽",
    title: "Динамика выручки",
  },
  {
    id: "orders",
    label: "Заказы",
    icon: "bag",
    unit: "",
    title: "Динамика заказов",
  },
  {
    id: "average",
    label: "Средний чек",
    icon: "layers",
    unit: "₽",
    title: "Динамика среднего чека",
  },
  {
    id: "conversion",
    label: "Конверсия",
    icon: "target",
    unit: "%",
    title: "Динамика конверсии",
  },
] as const;
type Metric = (typeof metrics)[number]["id"];
type Values = Record<Metric, number>;
type Datum = Values & { date: Date; previous: Values };
const dateLabel = (date: Date) =>
  date
    .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
    .replace(".", "");
function makeData(days: number, project: string): Datum[] {
  const base = Array.from(
    { length: days },
    (_, i) =>
      25000 + i * 730 + Math.sin(i * 1.43) * 8900 + Math.cos(i * 0.57) * 5200,
  );
  const scale =
    ((1284560 * days) / 30 / base.reduce((a, b) => a + b, 0)) *
    (project === "store" ? 1 : 0.72);
  return base.map((value, i) => {
    const date = new Date(2026, 8, 30 - days + i + 1);
    const revenue = Math.round(value * scale);
    const orders = Math.round(revenue / (697 + Math.sin(i) * 65));
    const conversion = 3.2 + (i / days) * 0.8 + Math.sin(i * 0.7) * 0.35;
    const priorRevenue = Math.round(
      revenue * (0.84 + Math.sin(i * 0.83) * 0.08),
    );
    const priorOrders = Math.round(orders * (0.88 + Math.sin(i * 0.83) * 0.08));
    return {
      date,
      revenue,
      orders,
      average: revenue / orders,
      conversion,
      previous: {
        revenue: priorRevenue,
        orders: priorOrders,
        average: priorRevenue / priorOrders,
        conversion: conversion * (0.84 + Math.sin(i * 0.83) * 0.08),
      },
    };
  });
}
function summarize(data: Values[]): Values {
  const revenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const orders = data.reduce((sum, d) => sum + d.orders, 0);
  return {
    revenue,
    orders,
    average: revenue / orders,
    conversion: data.reduce((sum, d) => sum + d.conversion, 0) / data.length,
  };
}
function aggregate(data: Datum[], group: string): Datum[] {
  if (group === "day") return data;
  const chunks: Datum[][] = [];
  for (const datum of data) {
    const last = chunks[chunks.length - 1];
    const isNew =
      !last ||
      (group === "month"
        ? last[0].date.getMonth() !== datum.date.getMonth()
        : datum.date.getDay() === 1);
    if (isNew) chunks.push([datum]);
    else last.push(datum);
  }
  return chunks.map((chunk) => ({
    date: chunk[0].date,
    ...summarize(chunk),
    previous: summarize(chunk.map((d) => d.previous)),
  }));
}
function sparklinePath(values: number[]) {
  const sampled = values.filter(
    (_, i) => i % Math.max(1, Math.floor(values.length / 12)) === 0,
  );
  const min = Math.min(...sampled),
    range = Math.max(...sampled) - min || 1;
  return sampled
    .map(
      (v, i) =>
        (i ? "L" : "M") +
        (i / (sampled.length - 1)) * 100 +
        " " +
        (29 - ((v - min) / range) * 26),
    )
    .join(" ");
}
function smoothPath(points: { x: number; y: number }[]) {
  return points
    .map((p, i) => {
      if (!i) return `M ${p.x},${p.y}`;
      const a = points[Math.max(0, i - 2)],
        b = points[i - 1],
        c = points[Math.min(points.length - 1, i + 1)];
      return `C ${b.x + (p.x - a.x) / 6},${b.y + (p.y - a.y) / 6} ${p.x - (c.x - b.x) / 6},${p.y - (c.y - b.y) / 6} ${p.x},${p.y}`;
    })
    .join(" ");
}
function LineChart({
  data,
  metric,
  comparison,
}: {
  data: Datum[];
  metric: Metric;
  comparison: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const selected = metrics.find((m) => m.id === metric)!;
  const values = data.map((d) => d[metric]);
  const previous = data.map((d) => d.previous[metric]);
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1080);
  useLayoutEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver((entries) =>
      setWidth(Math.max(280, entries[0].contentRect.width)),
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const peak = Math.max(...values, ...(comparison ? previous : []));
  const magnitude = 10 ** Math.floor(Math.log10(peak / 4));
  const normalized = peak / 4 / magnitude;
  const tick =
    ([1, 2, 2.5, 5, 10].find((step) => step >= normalized) ?? 10) * magnitude;
  const tickCount = Math.ceil(peak / tick);
  const max = tickCount * tick;
  const plotWidth = width - 88;
  const x = (i: number) =>
    58 + (data.length === 1 ? 0.5 : i / (data.length - 1)) * plotWidth;
  const y = (v: number) => 274 - (v / max) * 244;
  const points = values.map((v, i) => ({ x: x(i), y: y(v) }));
  const path = smoothPath(points);
  const labelCount = Math.min(data.length, width < 500 ? 4 : 7);
  const labelIndices = new Set(
    Array.from({ length: labelCount }, (_, i) =>
      Math.round((i * (data.length - 1)) / Math.max(1, labelCount - 1)),
    ),
  );
  const active = hover !== null && hover < data.length ? hover : null;
  const format = (v: number) =>
    metric === "conversion"
      ? v.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " %"
      : number(v) + (selected.unit ? " " + selected.unit : "");
  return (
    <div className="chart-wrap" ref={container}>
      <div className="axis-unit">{selected.unit || "заказов"}</div>
      <svg
        className="line-chart"
        viewBox={`0 0 ${width} 325`}
        role="img"
        aria-label={`${selected.title}. ${data.length} точек. ${dateLabel(data[0].date)} — ${dateLabel(data[data.length - 1].date)}`}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-line)" stopOpacity=".13" />
            <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: tickCount + 1 }, (_, i) => (
          <g key={i}>
            <line
              x1="58"
              x2={width - 30}
              y1={y(tick * i)}
              y2={y(tick * i)}
              className="chart-grid"
            />
            <text
              x="46"
              y={y(tick * i) + 4}
              textAnchor="end"
              className="axis-text"
            >
              {(tick * i).toLocaleString("ru-RU", {
                maximumFractionDigits: metric === "conversion" ? 2 : 0,
              })}
            </text>
          </g>
        ))}
        {data.length > 1 && (
          <path
            d={`${path} L ${x(data.length - 1)},274 L 58,274 Z`}
            fill="url(#area-fill)"
          />
        )}
        {comparison && (
          <path
            d={smoothPath(previous.map((v, i) => ({ x: x(i), y: y(v) })))}
            className="previous-line"
          />
        )}
        <path d={path} className="current-line" />
        {data.length === 1 && (
          <>
            <circle cx={x(0)} cy={y(values[0])} r="5" className="chart-dot" />
            {comparison && (
              <circle
                cx={x(0)}
                cy={y(previous[0])}
                r="4"
                fill="var(--previous-line)"
              />
            )}
          </>
        )}
        {data.map(
          (d, i) =>
            labelIndices.has(i) && (
              <text
                key={i}
                x={x(i)}
                y="310"
                textAnchor={
                  data.length === 1
                    ? "middle"
                    : i === 0
                      ? "start"
                      : i === data.length - 1
                        ? "end"
                        : "middle"
                }
                className="axis-text"
              >
                {dateLabel(d.date)}
              </text>
            ),
        )}
        {active !== null && (
          <g>
            <line
              x1={x(active)}
              x2={x(active)}
              y1="24"
              y2="274"
              className="hover-line"
            />
            <circle
              cx={x(active)}
              cy={y(values[active])}
              r="5"
              className="chart-dot"
            />
          </g>
        )}
        {data.map((d, i) => (
          <rect
            key={i}
            x={
              x(i) -
              (data.length === 1 ? 25 : plotWidth / 2 / (data.length - 1))
            }
            y="15"
            width={data.length === 1 ? 50 : plotWidth / (data.length - 1)}
            height="270"
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${dateLabel(d.date)}: ${format(d[metric])}`}
            onPointerEnter={() => setHover(i)}
            onPointerDown={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setHover(null);
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setHover(i);
              }
            }}
          />
        ))}
      </svg>
      {active !== null && (
        <div
          className="chart-tooltip"
          style={{
            left: `${Math.min(78, Math.max(18, (x(active) / width) * 100))}%`,
            top: `${Math.max(10, (y(values[active]) / 325) * 100 - 18)}%`,
          }}
        >
          <span>
            {data[active].date.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
            })}
          </span>
          <strong>
            <i className="legend-dot" />
            {format(values[active])}
          </strong>
          {comparison && (
            <small>Пред. период: {format(previous[active])}</small>
          )}
        </div>
      )}
    </div>
  );
}
export function App({
  onThemeChange,
}: {
  onThemeChange?: (theme: Theme) => void;
}) {
  const theme = useThemeType();
  const [days, setDays] = useState("30");
  const [project, setProject] = useState("store");
  const [metric, setMetric] = useState<Metric>("revenue");
  const [group, setGroup] = useState("day");
  const [comparison, setComparison] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");
  const [help, setHelp] = useState(false);
  const [exported, setExported] = useState(false);
  const raw = useMemo(() => makeData(Number(days), project), [days, project]);
  const data = useMemo(() => aggregate(raw, group), [raw, group]);
  const stats = summarize(raw);
  const priorStats = summarize(raw.map((d) => d.previous));
  const change = (id: Metric) =>
    ((stats[id] / priorStats[id] - 1) * 100).toLocaleString("ru-RU", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  const selected = metrics.find((m) => m.id === metric)!;
  const period = `${dateLabel(raw[0].date)} — ${dateLabel(raw[raw.length - 1].date)} 2026`;
  const display = (id: Metric, value: number) =>
    id === "conversion"
      ? value.toLocaleString("ru-RU", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : number(value);
  function exportData() {
    const csv =
      "\uFEFFДата;Выручка (₽);Заказы;Средний чек (₽);Конверсия (%)\n" +
      data
        .map((d) =>
          [
            d.date.toLocaleDateString("ru-RU"),
            d.revenue,
            d.orders,
            Math.round(d.average),
            d.conversion.toFixed(2),
          ].join(";"),
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse-analytics-${days}-days.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    window.setTimeout(() => setExported(false), 3000);
  }
  function navigate(id: string) {
    setActiveNav(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <div className="app" data-theme={theme}>
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Пульс — главная">
          <span className="brand-mark">
            <Icon name="pulse" size={25} />
          </span>
          пульс<span className="brand-point">.</span>
        </a>
        <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <div className="project-select">
          <span className="project-icon">
            <Icon name="bag" size={18} />
          </span>
          <Select
            aria-label="Выбрать проект"
            value={[project]}
            onUpdate={(v) => setProject(v[0])}
            options={[
              { value: "store", content: "Мой магазин" },
              { value: "website", content: "Мой сайт" },
            ]}
            view="clear"
            size="l"
            width="max"
          />
        </div>
        <div className="sidebar-separator" />
        <div className="nav-caption">АНАЛИТИКА</div>
        <nav aria-label="Основная навигация">
          {(
            [
              { id: "overview", label: "Обзор", icon: "grid" },
              { id: "dynamics", label: "Динамика", icon: "chart" },
              { id: "indicators", label: "Показатели", icon: "layers" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} />
              {item.label}
              {item.id === "overview" && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="data-note">
            <span className="note-symbol">✦</span>
            <strong>Всё важное — в цифрах</strong>
            <p>
              Следите за результатами.
              <br />
              Находите точки роста.
            </p>
            <span className="note-decoration" />
          </div>
          <button
            className="help-button"
            onClick={() => {
              setHelp(!help);
              if (!help)
                window.setTimeout(
                  () =>
                    document
                      .getElementById("help")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  0,
                );
            }}
            aria-expanded={help}
          >
            <Icon name="help" size={18} />О данных и помощь
            <Icon name="external" size={14} />
          </button>
          <div
            className="theme-switch"
            role="group"
            aria-label="Тема приложения"
          >
            <button
              title="Светлая тема"
              aria-label="Светлая тема"
              aria-pressed={theme === "light"}
              className={theme === "light" ? "selected" : ""}
              onClick={() => onThemeChange?.("light")}
            >
              <Icon name="sun" size={17} />
              Светлая
            </button>
            <button
              title="Тёмная тема"
              aria-label="Тёмная тема"
              aria-pressed={theme === "dark"}
              className={theme === "dark" ? "selected" : ""}
              onClick={() => onThemeChange?.("dark")}
            >
              <Icon name="moon" size={17} />
              Тёмная
            </button>
          </div>
          <button
            className="system-theme"
            onClick={() => onThemeChange?.("system")}
          >
            <Icon name="monitor" size={13} />
            Как в системе
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            Рабочее пространство<span>/</span>
            <strong>Аналитика</strong>
          </div>
          <div className="topbar-right">
            <span className="live-status">
              <i />
              Все системы в норме
            </span>
            <div className="avatar" title="Алексей Козлов">
              АК
            </div>
          </div>
        </header>
        <main id="overview">
          <div className="page-heading">
            <div>
              <div className="eyebrow">ВАШ БИЗНЕС В ЦИФРАХ</div>
              <h1>
                Обзор аналитики<span className="heading-dot">.</span>
              </h1>
              <p>Всё, что нужно знать о результатах вашего проекта.</p>
            </div>
            <div className="page-actions">
              <div className="period-select">
                <Icon name="calendar" size={17} />
                <Select
                  aria-label="Период аналитики"
                  value={[days]}
                  onUpdate={(v) => {
                    setDays(v[0]);
                    setGroup("day");
                  }}
                  options={[
                    { value: "7", content: "Последние 7 дней" },
                    { value: "30", content: "Последние 30 дней" },
                    { value: "90", content: "Последние 90 дней" },
                  ]}
                  view="clear"
                  size="l"
                />
              </div>
              <Button size="l" view="outlined" onClick={exportData}>
                <Button.Icon>
                  <Icon name={exported ? "check" : "download"} size={17} />
                </Button.Icon>
                {exported ? "Готово" : "Экспорт"}
              </Button>
            </div>
          </div>
          <section
            className="metrics-grid"
            id="indicators"
            aria-label="Ключевые показатели"
          >
            {metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                aria-pressed={metric === m.id}
                className={`metric-card ${metric === m.id ? "chosen" : ""}`}
              >
                <div className="metric-top">
                  <span>{m.label}</span>
                  <span className="metric-icon">
                    <Icon name={m.icon} size={18} />
                  </span>
                </div>
                <div className="metric-value">
                  {display(m.id, stats[m.id])}
                  {m.unit && <span>{m.unit}</span>}
                </div>
                <div className="metric-bottom">
                  <span className="positive">
                    <Icon name="arrow" size={12} />
                    {change(m.id)}%
                  </span>
                  <span>к пред. периоду</span>
                </div>
                <svg
                  className="sparkline"
                  viewBox="0 0 100 32"
                  aria-hidden="true"
                >
                  <path
                    d={sparklinePath(raw.map((d) => d[m.id]))}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </section>
          <section className="chart-card" id="dynamics">
            <div className="chart-heading">
              <div>
                <h2>
                  {selected.title}
                  <span
                    className="info-icon"
                    title="Демонстрационные данные выбранного проекта"
                  >
                    i
                  </span>
                </h2>
                <p>{period}</p>
              </div>
              <SegmentedRadioGroup
                value={group}
                onUpdate={setGroup}
                size="m"
                aria-label="Группировка данных"
              >
                <SegmentedRadioGroup.Option value="day">
                  День
                </SegmentedRadioGroup.Option>
                <SegmentedRadioGroup.Option value="week">
                  Неделя
                </SegmentedRadioGroup.Option>
                <SegmentedRadioGroup.Option value="month">
                  Месяц
                </SegmentedRadioGroup.Option>
              </SegmentedRadioGroup>
            </div>
            <div className="chart-summary">
              <strong>
                {display(metric, stats[metric])}
                <span>{selected.unit}</span>
              </strong>
              <span className="positive">
                <Icon name="arrow" size={13} />
                {change(metric)}%
              </span>
              <span className="summary-caption">за выбранный период</span>
            </div>
            <div className="chart-legend">
              <span>
                <i className="legend-dot" />
                Текущий период
              </span>
              <button
                onClick={() => setComparison(!comparison)}
                aria-pressed={comparison}
                className={!comparison ? "legend-disabled" : ""}
              >
                <i className="legend-dot previous" />
                Предыдущий период
                <span className="legend-check">
                  {comparison && <Icon name="check" size={10} />}
                </span>
              </button>
            </div>
            <LineChart
              key={`${days}-${group}-${metric}-${project}`}
              data={data}
              metric={metric}
              comparison={comparison}
            />
            <div className="chart-footer">
              <span>
                <span className="tiny-dot" />
                Демонстрационные данные
              </span>
              <span>
                Наведите на график, чтобы увидеть детали
                <Icon name="chart" size={14} />
              </span>
            </div>
          </section>
          <div className="bottom-grid">
            <section className="insight-card">
              <div className="insight-icon">
                <Icon name="pulse" size={23} />
              </div>
              <div>
                <div className="insight-label">ХОРОШИЙ ТЕМП</div>
                <h3>Ваш проект растёт</h3>
                <p>
                  Выручка выросла на <strong>{change("revenue")}%</strong> по
                  сравнению с предыдущим
                  <br className="desktop-break" /> периодом. Продолжайте в том
                  же духе.
                </p>
              </div>
              <span className="insight-arrow">
                <Icon name="arrow" size={27} />
              </span>
            </section>
            <section className="period-card">
              <div className="period-card-heading">
                <h3>Выбранный период</h3>
                <Icon name="calendar" size={18} />
              </div>
              <strong>{period}</strong>
              <p>
                {days} дней наблюдений<span>·</span>Демонстрационные данные
              </p>
            </section>
          </div>
          {help && (
            <section
              id="help"
              className="help-panel"
              role="region"
              aria-label="О данных"
            >
              <h3>О данных</h3>
              <p>
                На странице представлены демонстрационные данные за 2026 год.
                Выберите показатель, период и группировку, чтобы исследовать
                график. Нажмите на легенду предыдущего периода для сравнения.
                Экспорт сохраняет отображаемые данные в CSV.
              </p>
              <Button onClick={() => setHelp(false)}>Понятно</Button>
            </section>
          )}
          <footer className="page-footer">
            <span>© 2026 Пульс</span>
            <span>Больше ясности. Больше возможностей.</span>
            <span className="footer-version">
              Аналитика с заботой о деталях
              <Icon name="pulse" size={15} />
            </span>
          </footer>
        </main>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {exported ? "Данные экспортированы в CSV" : ""}
      </div>
    </div>
  );
}
