import { useEffect, useRef, useState } from "react";
import { useThemeType } from "@gravity-ui/uikit";
import Yagr from "@gravity-ui/yagr";
import "@gravity-ui/yagr/index.css";
import type { CpuHistory } from "./cpu-data";

interface CpuChartProps {
  history: CpuHistory;
  hours: number;
  resetKey: number;
  visible: boolean;
  onZoomChange: (zoomed: boolean) => void;
}

const timeLabel = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});
const tooltipDate = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** One Yagr per mount; normal stream/theme updates reuse its canvas. */
export function CpuChart(props: CpuChartProps) {
  const theme = useThemeType();
  const container = useRef<HTMLDivElement>(null);
  const latest = useRef({ ...props, theme });
  latest.current = { ...props, theme };
  const schedule = useRef<(() => void) | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const root = container.current!;
    let frame = 0;
    let resizeFrame = 0;
    let disposed = false;
    let zoomed = false;
    let appliedHours = latest.current.hours;
    let appliedReset = latest.current.resetKey;
    let appliedTheme = latest.current.theme;
    let appliedHistory = latest.current.history;
    const { history, hours, visible } = latest.current;
    const end = history.timestamps.at(-1) ?? Date.now();
    const instance = new Yagr(root, {
      timeline: history.timestamps,
      series: [
        {
          id: "cpu",
          name: "Загрузка CPU",
          data: history.values,
          color: "#25a888",
          type: "line",
          show: visible,
          formatter: (value) =>
            value === null ? "Нет данных" : `${Number(value).toFixed(1)} %`,
        },
      ],
      chart: {
        series: { type: "line", width: 1.5 },
        appearance: { theme: appliedTheme, locale: "ru" },
        timeMultiplier: 1,
        size: { adaptive: false, padding: [18, 18, 0, 0] },
        select: { zoom: true, minWidth: 8 },
      },
      scales: {
        x: { min: end - hours * 3_600_000, max: end },
        y: { min: 0, max: 100 },
      },
      axes: {
        x: {
          space: 92,
          size: 36,
          grid: { show: false },
          ticks: { show: false },
          values: (_u, ticks) => ticks.map((t) => timeLabel.format(t)),
        },
        y: {
          size: 48,
          splits: () => [0, 25, 50, 75, 100],
          values: (_u, ticks) => ticks.map((v) => `${v}%`),
          ticks: { show: false },
          grid: { show: true, dash: [4, 4], width: 1 },
        },
      },
      legend: { show: false },
      markers: { show: false },
      cursor: {
        x: { visible: true, style: "1px dashed #7c9690" },
        y: { visible: false },
        markersSize: 7,
      },
      tooltip: {
        show: true,
        strategy: "none",
        title: ({ x }) => tooltipDate.format(x),
        precision: 1,
        value: (v) => (v === null ? "Нет данных" : `${Number(v).toFixed(1)} %`),
      },
      hooks: {
        onSelect: [
          ({ from, to }) => {
            if (to - from < 1000) return;
            zoomed = true;
            latest.current.onZoomChange(true);
          },
        ],
        error: [() => setFailed(true)],
      },
    });

    const update = () => {
      frame = 0;
      if (disposed) return;
      const next = latest.current;
      const reset =
        next.hours !== appliedHours || next.resetKey !== appliedReset;
      if (reset) {
        zoomed = false;
        next.onZoomChange(false);
      }
      const { min, max } = instance.uplot.scales.x;
      // Full-dataset setSeries() reinitializes uPlot. The public timeline plus
      // the per-series setter updates the existing instance in a single draw.
      instance.uplot.batch(() => {
        if (appliedTheme !== next.theme) instance.setTheme(next.theme);
        if (appliedHistory !== next.history) {
          instance.config.timeline = next.history.timestamps;
          if (next.history.timestamps.length === 0) {
            // The per-series setter ignores empty arrays. A rare transition to
            // an empty snapshot needs the full setter to release old buffers.
            instance.setSeries(
              instance.config.series.map((series) => ({ ...series, data: [] })),
            );
          } else {
            // The empty-to-populated transition rebuilds from configuration.
            if (instance.isEmpty)
              instance.config.series[0].data = next.history.values;
            instance.setSeries("cpu", { data: next.history.values });
          }
        }
        instance.setVisible("cpu", next.visible, false);
        const last = next.history.timestamps.at(-1) ?? Date.now();
        instance.uplot.setScale(
          "x",
          zoomed && min != null && max != null && !reset
            ? { min, max }
            : { min: last - next.hours * 3_600_000, max: last },
        );
      });
      appliedHistory = next.history;
      appliedTheme = next.theme;
      appliedHours = next.hours;
      appliedReset = next.resetKey;
    };
    const requestUpdate = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(update);
    };
    schedule.current = requestUpdate;
    const resetZoom = () => {
      zoomed = false;
      latest.current.onZoomChange(false);
      requestUpdate();
    };
    root.addEventListener("dblclick", resetZoom);
    const observer = new ResizeObserver(() => {
      if (resizeFrame || disposed) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        if (!disposed && root.clientWidth > 0 && root.clientHeight > 0)
          instance.reflow();
      });
    });
    observer.observe(root);

    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      root.removeEventListener("dblclick", resetZoom);
      schedule.current = null;
      instance.dispose();
      root.replaceChildren();
    };
  }, []);

  useEffect(() => {
    schedule.current?.();
  }, [props.history, props.hours, props.resetKey, props.visible, theme]);

  return (
    <div className="cpu-chart-wrap">
      <div
        ref={container}
        className="cpu-chart"
        role="img"
        aria-label={`Интерактивный график загрузки CPU за ${props.hours} ч. Шкала от 0 до 100 процентов. Выделите участок мышью для увеличения.`}
      />
      {props.history.timestamps.length === 0 && (
        <div className="chart-message">Ожидаем данные о загрузке CPU…</div>
      )}
      {failed && (
        <div className="chart-message" role="alert">
          Не удалось отобразить график. Обновите страницу.
        </div>
      )}
    </div>
  );
}
