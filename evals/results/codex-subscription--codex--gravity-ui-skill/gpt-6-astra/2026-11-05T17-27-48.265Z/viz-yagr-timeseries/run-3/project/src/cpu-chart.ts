import Yagr, {type YagrTheme} from '@gravity-ui/yagr';
import {CpuBuffer, DAY_MS, type CpuDataSource} from './cpu-data';

export interface CpuChartStatus {
  phase: 'loading' | 'ready' | 'empty' | 'error';
  count: number;
  latest: number | null;
  updatedAt?: number;
  zoomed: boolean;
}

const UPDATE_MS = 250;
const SERIES_COLOR = 'var(--g-color-text-info)';

export function mountCpuChart(
  host: HTMLElement,
  source: CpuDataSource,
  initialTheme: YagrTheme,
  onStatus: (status: CpuChartStatus) => void,
) {
  const buffer = new CpuBuffer();
  let chart: Yagr | undefined;
  let theme = initialTheme;
  let disposed = false;
  let received = false;
  let failed = false;
  let dirty = true;
  let resize = true;
  let frame = 0;
  let timer = 0;
  let lastDraw = -Infinity;
  let zoom: {min: number; max: number} | undefined;
  let unsubscribe: (() => void) | undefined;

  const publish = () => {
    const {timeline, values} = buffer.snapshot();
    const hasValues = values.some((value) => value !== null);
    onStatus({
      phase: failed ? 'error' : !received ? 'loading' : hasValues ? 'ready' : 'empty',
      count: timeline.length,
      latest: values.at(-1) ?? null,
      updatedAt: timeline.at(-1),
      zoomed: Boolean(zoom),
    });
  };

  const draw = () => {
    frame = 0;
    if (disposed) return;
    const now = Date.now();
    buffer.expire(now);
    if (dirty) {
      const {timeline, values} = buffer.snapshot();
      if (timeline.length && !chart) {
        chart = new Yagr(host, {
          timeline,
          series: [{id: 'cpu', name: 'CPU', type: 'line', data: values, color: SERIES_COLOR}],
          chart: {
            series: {type: 'line', width: 1.5},
            timeMultiplier: 1,
            // Own observer lets us cancel pending resize frames during disposal.
            size: {adaptive: false},
            appearance: {theme, locale: 'ru'},
            select: {zoom: true, minWidth: 8},
          },
          scales: {y: {min: 0, max: 100}},
          axes: {y: {values: (_u, ticks) => ticks.map((value) => `${value}%`)}},
          markers: {show: false},
          legend: {show: false},
          tooltip: {show: true, value: (value) => value === null ? 'Нет данных' : `${Number(value).toFixed(1)} %`},
          hooks: {onSelect: [({from, to}) => {
            zoom = {min: from, max: to};
            publish();
          }]},
        });
      } else if (chart && timeline.length) {
        // Yagr 5's full timeline overload rebuilds uPlot. Update the existing
        // named series instead; batch scale restoration to keep the user's zoom.
        chart.uplot.batch(() => {
          chart!.config.timeline = timeline;
          // Also populate the config for recovery from Yagr's empty-series state.
          chart!.config.series[0].data = values;
          chart!.setSeries('cpu', {data: values});
          chart!.uplot.setScale('x', zoom ?? {min: now - DAY_MS, max: now});
        });
      }
      if (chart) chart.uplot.setScale('x', zoom ?? {min: now - DAY_MS, max: now});
      // Keep the host measurable for ResizeObserver even in the empty state.
      host.style.visibility = timeline.length ? 'visible' : 'hidden';
      dirty = false;
      lastDraw = performance.now();
      publish();
    }
    if (resize && chart && host.clientWidth && host.clientHeight) chart.reflow();
    resize = false;
  };

  const schedule = () => {
    if (disposed || frame || timer) return;
    const delay = Math.max(0, UPDATE_MS - (performance.now() - lastDraw));
    if (delay) {
      timer = window.setTimeout(() => {
        timer = 0;
        if (!disposed) frame = requestAnimationFrame(draw);
      }, delay);
    } else frame = requestAnimationFrame(draw);
  };

  const observer = new ResizeObserver(() => {
    resize = true;
    schedule();
  });
  observer.observe(host);

  try {
    unsubscribe = source.subscribe((samples) => {
      if (disposed) return;
      buffer.append(samples, Date.now());
      received = true;
      failed = false;
      dirty = true;
      schedule();
    }, () => {
      if (disposed) return;
      failed = true;
      publish();
    });
  } catch {
    failed = true;
    publish();
  }

  // Also age out data when a source goes silent.
  const expiryTimer = window.setInterval(() => {
    dirty = true;
    schedule();
  }, 1_000);
  schedule();

  return {
    setTheme(next: YagrTheme) {
      if (disposed) return;
      theme = next;
      chart?.batch(() => {
        chart!.setTheme(next);
        // Re-resolve semantic CSS colors when the provider changes theme.
        chart!.setSeries('cpu', {color: SERIES_COLOR});
      });
    },
    resetZoom() {
      if (disposed) return;
      zoom = undefined;
      dirty = true;
      schedule();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.clearInterval(expiryTimer);
      try {
        unsubscribe?.();
      } finally {
        chart?.dispose();
        chart = undefined;
        host.replaceChildren();
      }
    },
  };
}
