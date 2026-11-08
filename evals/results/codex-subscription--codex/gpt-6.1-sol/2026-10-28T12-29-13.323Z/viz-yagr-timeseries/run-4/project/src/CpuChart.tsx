import { useEffect, useRef, useState } from "react";
import { useThemeType } from "@gravity-ui/uikit";
import Yagr from "@gravity-ui/yagr";
import "@gravity-ui/yagr/index.css";
import { CpuBuffer, DAY_MS, type CpuSource } from "./cpuMetrics";

const periods = [
  { label: "1 час", ms: 3_600_000 },
  { label: "6 часов", ms: 21_600_000 },
  { label: "24 часа", ms: DAY_MS },
];
const number = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });
const tooltipClass = (theme: string) =>
  `yagr-tooltip_default cpu-tooltip cpu-tooltip_${theme}`;
const time = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
const tooltipTime = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
type Snapshot = Omit<ReturnType<CpuBuffer["snapshot"]>, "timeline" | "values">;
const summary = ({
  timeline,
  values,
  ...stats
}: ReturnType<CpuBuffer["snapshot"]>): Snapshot => stats;

export function CpuChart({ source }: { source: CpuSource }) {
  const container = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  const theme = useThemeType();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const [period, setPeriod] = useState(DAY_MS);
  const periodRef = useRef(period);
  periodRef.current = period;
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [zoomed, setZoomed] = useState(false);
  const zoomedRef = useRef(false);
  const [stats, setStats] = useState<Snapshot | null>(null);
  const [error, setError] = useState(false);
  const flushRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!container.current) return;
    const host = container.current;
    const buffer = new CpuBuffer();
    let disposed = false;
    let timer: number | undefined;
    let frame: number | undefined;
    let observer: ResizeObserver | undefined;
    let unsubscribe: (() => void) | undefined;
    let chart: Yagr | undefined;
    let dirty = true;
    let lastExpiry = Date.now();
    setError(false);
    zoomedRef.current = false;
    setZoomed(false);

    const flush = () => {
      if (disposed || pausedRef.current || !chart || !dirty) return;
      dirty = false;
      const snapshot = buffer.snapshot(Date.now());
      const previous = chart.uplot.scales.x;
      const range =
        zoomedRef.current &&
        previous.min !== undefined &&
        previous.max !== undefined
          ? { min: previous.min, max: previous.max }
          : { min: Date.now() - periodRef.current, max: Date.now() };
      // Yagr 5.3 recreates uPlot when replacing a timeline via setSeries(timeline, ...).
      // Sync its public timeline, then update the existing series in place.
      chart.config.timeline = snapshot.timeline;
      chart.uplot.batch(() => {
        chart!.config.series[0].data = snapshot.values;
        chart!.setSeries("cpu", { data: snapshot.values });
        // Yagr ignores empty replacements; explicitly clear expired data.
        if (!snapshot.count) {
          chart!.config.series[0].data = [];
          chart!.series = [[], []];
          chart!.uplot.setData(chart!.series, false);
        }
        chart!.uplot.setScale("x", range);
      });
      setStats(summary(snapshot));
    };

    const cleanup = () => {
      disposed = true;
      observer?.disconnect();
      window.clearInterval(timer);
      if (frame !== undefined) cancelAnimationFrame(frame);
      unsubscribe?.();
      flushRef.current = null;
      chartRef.current = null;
      chart?.dispose();
      host.replaceChildren();
    };

    try {
      buffer.append(source.getHistory());
      const initial = buffer.snapshot(Date.now());
      setStats(summary(initial));
      chart = new Yagr(host, {
        timeline: initial.timeline,
        series: [
          {
            id: "cpu",
            name: "Загрузка CPU",
            data: initial.values,
            color: "#8562ed",
          },
        ],
        chart: {
          series: {
            type: "line",
            width: 1.5,
            fill: "rgba(133, 98, 237, 0.09)",
            spanGaps: false,
          },
          size: { adaptive: false }, // Own observer has no untracked debounce timer.
          appearance: { theme: themeRef.current, locale: "ru" },
          timeMultiplier: 1,
          select: { zoom: true },
        },
        scales: {
          y: { min: 0, max: 100, range: () => [0, 100] },
          x: { min: Date.now() - periodRef.current, max: Date.now() },
        },
        axes: {
          y: {
            size: 54,
            splits: () => [0, 25, 50, 75, 100],
            values: (_, ticks) => ticks.map((value) => `${value}%`),
            ticks: { show: false },
          },
          x: { grid: { show: false }, ticks: { show: false } },
        },
        legend: { show: false },
        markers: { show: false },
        cursor: { x: { visible: true }, y: { visible: false }, markersSize: 6 },
        tooltip: {
          show: true,
          className: tooltipClass(themeRef.current),
          strategy: "none",
          title: ({ x }) => tooltipTime.format(x),
          value: (value) =>
            value === null ? "Нет данных" : `${number.format(Number(value))}%`,
        },
        hooks: {
          onSelect: [
            () => {
              zoomedRef.current = true;
              setZoomed(true);
            },
          ],
          error: [
            () => {
              if (!disposed) setError(true);
            },
          ],
        },
      });
      chartRef.current = chart;
      observer = new ResizeObserver(() => {
        if (disposed || frame !== undefined) return;
        frame = requestAnimationFrame(() => {
          frame = undefined;
          if (!disposed && host.clientWidth > 0 && host.clientHeight > 0) {
            chart!.plugins.tooltip?.reset();
            chart!.reflow();
            chart!.uplot.redraw(true, true);
          }
        });
      });
      observer.observe(host);
      unsubscribe = source.subscribe((samples) => {
        if (disposed) return;
        buffer.append(samples);
        dirty = true;
      });
      // Coalesce bursty feeds to at most four history snapshots/redraws per second.
      timer = window.setInterval(() => {
        if (Date.now() - lastExpiry >= 1000) {
          dirty = true;
          lastExpiry = Date.now();
        }
        flush();
      }, 250);
      flushRef.current = flush;
      return cleanup;
    } catch {
      cleanup();
      setError(true);
    }
  }, [source]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setTheme(theme);
    const className = tooltipClass(theme);
    chart.config.tooltip.className = className;
    chart.plugins.tooltip?.updateOptions({ className });
  }, [theme]);
  useEffect(() => {
    if (!paused) flushRef.current?.();
  }, [paused]);

  const resetView = (duration = period) => {
    chartRef.current?.plugins.tooltip?.reset();
    setPeriod(duration);
    periodRef.current = duration;
    zoomedRef.current = false;
    setZoomed(false);
    const end =
      paused && stats?.lastTimestamp ? stats.lastTimestamp : Date.now();
    chartRef.current?.uplot.setScale("x", { min: end - duration, max: end });
  };

  return (
    <section className="chart-card" aria-labelledby="cpu-title">
      <div className="chart-heading">
        <div>
          <div className="eyebrow">ПРОИЗВОДИТЕЛЬНОСТЬ</div>
          <h2 id="cpu-title">
            Загрузка CPU <span className="unit-tag">%</span>
          </h2>
          <p>Использование процессора за последние сутки</p>
        </div>
        <div className="stream-status">
          <span className={`status-dot ${paused ? "is-paused" : ""}`} />
          {paused ? "На паузе" : "В реальном времени"}
        </div>
      </div>
      <div className="metrics-row">
        <Metric
          label="Текущая загрузка"
          value={stats?.current ?? null}
          accent
        />
        <Metric label="Средняя за 24 часа" value={stats?.average ?? null} />
        <Metric label="Максимум за 24 часа" value={stats?.maximum ?? null} />
        <div className="metric point-metric">
          <span>Точек в истории</span>
          <strong>
            {stats ? new Intl.NumberFormat("ru-RU").format(stats.count) : "—"}
          </strong>
          <small>Окно хранения · 24 часа</small>
        </div>
      </div>
      <div className="chart-toolbar">
        <div className="series-label">
          <span />
          Загрузка CPU
        </div>
        <div className="chart-actions">
          <div
            className="period-switch"
            role="group"
            aria-label="Период графика"
          >
            {periods.map((item) => (
              <button
                key={item.ms}
                aria-pressed={period === item.ms}
                onClick={() => resetView(item.ms)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            className="pause-button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
            {paused ? "Продолжить" : "Пауза"}
          </button>
        </div>
      </div>
      <div className="chart-area">
        <div
          ref={container}
          className="cpu-chart"
          role="img"
          aria-label="Интерактивный график загрузки CPU от 0 до 100 процентов"
          aria-describedby="chart-help"
        />
        {error && (
          <div className="chart-message" role="alert">
            Не удалось загрузить график. Проверьте источник метрик.
          </div>
        )}
        {!error && stats?.count === 0 && (
          <div className="chart-message" role="status">
            Нет данных за последние сутки
          </div>
        )}
        {zoomed && (
          <button className="reset-button" onClick={() => resetView()}>
            ↺ Сбросить масштаб
          </button>
        )}
      </div>
      <div className="chart-footer">
        <span id="chart-help">
          <span aria-hidden="true">↔</span> Выделите область для увеличения ·
          Время местное
        </span>
        <span>
          Обновлено{" "}
          {stats?.lastTimestamp ? time.format(stats.lastTimestamp) : "—"}
        </span>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | null;
  accent?: boolean;
}) {
  return (
    <div className={`metric ${accent ? "metric-accent" : ""}`}>
      <span>{label}</span>
      <strong>
        {value === null ? "—" : number.format(value)}
        <em>%</em>
      </strong>
      <small>
        {accent ? "Последнее измерение" : "По доступным измерениям"}
      </small>
    </div>
  );
}
