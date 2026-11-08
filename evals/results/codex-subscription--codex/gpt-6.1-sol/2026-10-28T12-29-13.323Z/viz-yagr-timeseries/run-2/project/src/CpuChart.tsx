import { useEffect, useRef } from "react";
import { useThemeType } from "@gravity-ui/uikit";
import Yagr from "@gravity-ui/yagr";
import "@gravity-ui/yagr/index.css";
import type { CpuSource } from "./telemetry";

interface CpuChartProps {
  source: CpuSource;
  live: boolean;
  hours: number;
  resetToken: number;
  threshold: boolean;
}

const timeFormat = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});
const tooltipFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function CpuChart({
  source,
  live,
  hours,
  resetToken,
  threshold,
}: CpuChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<Yagr | null>(null);
  const theme = useThemeType();
  const settings = useRef({ theme, hours, threshold });
  settings.current = { theme, hours, threshold };
  const zoom = useRef<{ min: number; max: number } | null>(null);

  useEffect(() => {
    const root = container.current!;
    const initial = source.getSnapshot();
    const chart = new Yagr(root, {
      timeline: initial.timeline,
      series: [
        {
          id: "cpu",
          name: "Загрузка CPU",
          data: initial.values,
          type: "line",
          color: "#8262ec",
          formatter: (value) => `${Number(value).toFixed(1)} %`,
        },
      ],
      chart: {
        series: { type: "line", width: 1.5, fill: "rgba(130, 98, 236, 0.09)" },
        size: { adaptive: false, padding: [18, 16, 4, 0] },
        appearance: { theme: settings.current.theme, locale: "ru" },
        timeMultiplier: 1,
        select: { zoom: false, minWidth: 8 },
      },
      scales: {
        x: {
          min: initial.updatedAt - settings.current.hours * 3_600_000,
          max: initial.updatedAt,
        },
        y: { min: 0, max: 100 },
      },
      axes: {
        x: {
          grid: { show: false },
          ticks: { show: false },
          size: 38,
          space: 90,
          values: (_u, splits) => splits.map((time) => timeFormat.format(time)),
        },
        y: {
          size: 52,
          ticks: { show: false },
          splits: () => [0, 20, 40, 60, 80, 100],
          values: (_u, splits) => splits.map((value) => `${value}%`),
          plotLines: settings.current.threshold
            ? [{ value: 80, color: "#dca24e", dash: [5, 5], width: 1 }]
            : [],
        },
      },
      grid: {
        width: 1,
        dash: [3, 4],
        stroke: () =>
          getComputedStyle(root).getPropertyValue("--yagr-grid").trim(),
      },
      editUplotOptions: (options) => {
        // Yagr's global grid option also overrides x.grid; keep vertical lines off.
        const axis = options.axes?.find((item) => item.scale === "x");
        if (axis) axis.grid = { show: false };
        return options;
      },
      markers: { show: false },
      legend: { show: false },
      cursor: { x: { visible: true }, y: { visible: false }, markersSize: 7 },
      tooltip: {
        show: true,
        strategy: "none",
        onUpdate: "none",
        title: ({ x }) => tooltipFormat.format(x),
        value: (value) => `${Number(value).toFixed(1)} %`,
      },
      hooks: {
        onSelect: [
          ({ from, to }) => {
            if (to - from < 1000) return;
            zoom.current = { min: from, max: to };
            chart.uplot.setScale("x", zoom.current);
          },
        ],
      },
    });
    instance.current = chart;
    let resizeFrame = 0;
    let disposed = false;
    // Own the observer so no debounced resize callback survives unmount.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (!disposed && root.clientWidth > 0 && root.clientHeight > 0) {
          // Let setSize recalculate tick spacing; Yagr.reflow immediately calls
          // redraw() which can cancel uPlot's queued axis layout calculation.
          chart.uplot.setSize({
            width: root.clientWidth,
            height: root.clientHeight,
          });
          chart.plugins.tooltip?.hide();
        }
      });
    });
    observer.observe(root);
    const reset = () => {
      zoom.current = null;
      const end = chart.config.timeline.at(-1)!;
      chart.uplot.setScale("x", {
        min: end - settings.current.hours * 3_600_000,
        max: end,
      });
    };
    root.addEventListener("dblclick", reset);
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(resizeFrame);
      root.removeEventListener("dblclick", reset);
      instance.current = null;
      zoom.current = null;
      chart.dispose();
      root.replaceChildren();
    };
  }, [source]);

  useEffect(() => {
    const chart = instance.current;
    if (!chart || !live) return;
    let frame = 0;
    let disposed = false;
    const update = () => {
      if (frame || document.hidden) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (disposed) return;
        const data = source.getSnapshot();
        chart.uplot.batch(() => {
          // Updating by ID retains the Yagr/uPlot instances and series styles.
          chart.config.timeline = data.timeline;
          chart.setSeries("cpu", { data: data.values });
          // Retain the user's selected interval while live data arrives.
          chart.uplot.setScale(
            "x",
            zoom.current ?? {
              min: data.updatedAt - settings.current.hours * 3_600_000,
              max: data.updatedAt,
            },
          );
        });
      });
    };
    update();
    const unsubscribe = source.subscribe(update);
    document.addEventListener("visibilitychange", update);
    return () => {
      disposed = true;
      unsubscribe();
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", update);
    };
  }, [source, live]);

  useEffect(() => {
    instance.current?.setTheme(theme);
  }, [source, theme]);

  useEffect(() => {
    const chart = instance.current;
    if (!chart) return;
    zoom.current = null;
    const end = chart.config.timeline.at(-1)!;
    chart.uplot.setScale("x", { min: end - hours * 3_600_000, max: end });
  }, [source, hours, resetToken]);

  useEffect(() => {
    const chart = instance.current;
    chart?.plugins.plotLines?.update(
      threshold
        ? [{ value: 80, scale: "y", color: "#dca24e", dash: [5, 5], width: 1 }]
        : [],
      "y",
    );
    chart?.redraw(false, true);
  }, [source, threshold]);

  return (
    <div
      ref={container}
      className="cpu-chart"
      role="img"
      aria-label="График загрузки CPU от 0 до 100 процентов. Выделите интервал для увеличения, дважды нажмите для сброса."
    />
  );
}
