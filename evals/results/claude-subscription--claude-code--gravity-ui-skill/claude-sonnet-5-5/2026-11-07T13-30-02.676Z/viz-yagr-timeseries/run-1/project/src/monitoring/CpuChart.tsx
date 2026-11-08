import './CpuChart.css';

import React from 'react';

import {useThemeValue} from '@gravity-ui/uikit';
import Yagr, {type YagrTheme} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';

import {type CpuPoints, type CpuSource} from './cpuStream';

const SERIES_ID = 'cpu';
const SERIES_COLOR = 'var(--g-color-line-brand)';
/** Gravity theme (may be a custom one) -> one of the four Yagr themes. */
function toYagrTheme(theme: string): YagrTheme {
  const base = theme.includes('dark') ? 'dark' : 'light';
  return theme.endsWith('-hc') ? (`${base}-hc` as YagrTheme) : base;
}

/** Max points pushed into Yagr in one call (keeps `push(...args)` safe). */
const FLUSH_CHUNK = 5_000;

export interface CpuChartHandle {
  /** Reset the zoom and show the latest data again */
  resetZoom(): void;
}

export interface CpuChartProps {
  source: CpuSource;
  className?: string;
  /** Called when the live updates are paused / resumed because of zoom */
  onZoomedChange?: (zoomed: boolean) => void;
}

/**
 * Realtime CPU load chart (Yagr / uPlot canvas).
 *
 * - Fills its parent: the parent must have a definite height.
 * - New points are appended incrementally and the oldest ones are dropped,
 *   so the 24h window never grows and nothing is rebuilt on a tick.
 * - While the user is zoomed in (or the tab is hidden) incoming points are
 *   buffered and applied at once afterwards — uPlot resets the zoom on every
 *   `setData`, which would otherwise break the interaction.
 */
export const CpuChart = React.forwardRef<CpuChartHandle, CpuChartProps>(function CpuChart(
  {source, className, onZoomedChange},
  ref,
) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const yagrRef = React.useRef<Yagr>();
  const appliedThemeRef = React.useRef<string>();
  const onZoomedChangeRef = React.useRef(onZoomedChange);
  onZoomedChangeRef.current = onZoomedChange;

  const theme = toYagrTheme(useThemeValue());
  const themeRef = React.useRef(theme);
  themeRef.current = theme;

  React.useImperativeHandle(ref, () => ({
    resetZoom() {
      const u = yagrRef.current?.uplot;
      const xs = u?.data[0];
      if (u && xs && xs.length) {
        u.setScale('x', {min: xs[0] as number, max: xs[xs.length - 1] as number});
      }
    },
  }));

  // Create the chart once per source; dispose everything on unmount.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }

    const history = source.getHistory();
    let pending: CpuPoints = {timeline: [], values: []};
    let zoomed = false;
    let disposed = false;

    const flush = () => {
      const yagr = yagrRef.current;
      if (!yagr || !pending.timeline.length) {
        return;
      }
      const {timeline, values} = pending;
      pending = {timeline: [], values: []};
      // One recalculation / redraw for all chunks.
      yagr.batch(() => {
        for (let i = 0; i < timeline.length; i += FLUSH_CHUNK) {
          yagr.setSeries(
            timeline.slice(i, i + FLUSH_CHUNK),
            [{id: SERIES_ID, data: values.slice(i, i + FLUSH_CHUNK)}],
            // Window is already full: every appended point drops the oldest one.
            {incremental: true, splice: true},
          );
        }
      });
    };

    const isBuffering = () => zoomed || document.hidden;

    const updateZoomed = (u: Yagr['uplot']) => {
      const {min, max} = u.scales.x;
      const xs = u.data[0];
      if (min == null || max == null || !xs || xs.length < 2) {
        return;
      }
      const first = xs[0] as number;
      const last = xs[xs.length - 1] as number;
      // Unit-independent tolerance of ~1.5 step.
      const eps = ((last - first) / (xs.length - 1)) * 1.5;
      const next = min > first + eps || max < last - eps;
      if (next === zoomed) {
        return;
      }
      zoomed = next;
      onZoomedChangeRef.current?.(zoomed);
      if (!isBuffering()) {
        flush();
      }
    };

    const yagr = new Yagr(root, {
      timeline: history.timeline,
      series: [
        {
          id: SERIES_ID,
          name: 'CPU',
          type: 'line',
          color: SERIES_COLOR,
          data: history.values,
        },
      ],
      chart: {
        series: {type: 'line', width: 1.5},
        appearance: {theme: themeRef.current, locale: 'ru'},
        size: {adaptive: true, resizeDebounceMs: 50},
        select: {zoom: true},
      },
      scales: {y: {min: 0, max: 100}},
      axes: {
        y: {
          side: 'left',
          precision: 0,
          values: (_u, splits) => splits.map((v) => `${v}%`),
        },
      },
      cursor: {
        markersSize: 6,
        x: {visible: true, style: '1px dashed var(--g-color-line-generic-hover)'},
        y: {visible: false},
      },
      tooltip: {
        tracking: 'sticky',
        className: 'cpu-chart-tooltip',
        value: (v) => (v === null ? '—' : `${Number(v).toFixed(1)}%`),
      },
      legend: {show: false},
      markers: {show: false},
      hooks: {
        setScale: [
          (u, key) => {
            if (key === 'x') {
              updateZoomed(u);
            }
          },
        ],
      },
    });
    yagrRef.current = yagr;
    appliedThemeRef.current = themeRef.current;

    const unsubscribe = source.subscribe((points) => {
      if (disposed) {
        return;
      }
      for (let i = 0; i < points.timeline.length; i++) {
        pending.timeline.push(points.timeline[i]);
        pending.values.push(points.values[i]);
      }
      if (!isBuffering()) {
        flush();
      }
    });

    const onVisibilityChange = () => {
      if (!isBuffering()) {
        flush();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      disposed = true;
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      pending = {timeline: [], values: []};
      yagrRef.current = undefined;
      appliedThemeRef.current = undefined;
      yagr.dispose();
    };
  }, [source]);

  // Follow the Gravity theme. Runs after ThemeProvider has updated <body>,
  // so CSS variables already resolve to the new theme.
  React.useEffect(() => {
    const yagr = yagrRef.current;
    if (!yagr || appliedThemeRef.current === theme) {
      return;
    }
    appliedThemeRef.current = theme;
    yagr.setTheme(theme);
    // Colors given as CSS variables are resolved once — resolve them again.
    yagr.setSeries(SERIES_ID, {color: SERIES_COLOR});
  }, [theme]);

  return (
    <div className={['cpu-chart', className].filter(Boolean).join(' ')}>
      <div ref={rootRef} className="cpu-chart__canvas" />
    </div>
  );
});

