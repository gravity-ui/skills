import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import * as React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {YagrConfig, YagrTheme} from '@gravity-ui/yagr';
import {useThemeValue} from '@gravity-ui/uikit';

import {
  DEFAULT_MAX_POINTS,
  planAppend,
  reconcileZoom,
  sanitizeSamples,
  toZoom,
} from './model';
import type {CpuSample, XRange} from './model';

type UPlot = Yagr['uplot'];

const SERIES_ID = 'cpu';
/** Максимум точек за один вызов `setSeries`: Yagr делает `push(...points)`, а у spread есть лимит. */
const MAX_CHUNK = 10_000;

const SERIES_COLOR: Record<YagrTheme, string> = {
  light: '#2f6fed',
  'light-hc': '#1f4fc4',
  dark: '#5b9bff',
  'dark-hc': '#7db0ff',
};

const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const timeFormat = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const timeWithSecondsFormat = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function toYagrTheme(themeValue: string): YagrTheme {
  const base = themeValue.startsWith('dark') ? 'dark' : 'light';
  return themeValue.endsWith('-hc') ? (`${base}-hc` as YagrTheme) : base;
}

export interface CpuLoadChartHandle {
  /**
   * Добавляет новые точки в конец графика. Вызовы можно делать сколько угодно часто:
   * точки копятся и применяются не чаще одного раза за кадр. Старые точки вытесняются,
   * так что в окне всегда не больше `maxPoints` точек. Точки не новее последней
   * (дубликаты, «прошлое») игнорируются.
   */
  append(samples: ReadonlyArray<CpuSample>): void;
}

export interface CpuLoadChartProps {
  /**
   * Начальная история (по возрастанию времени). Используется только при создании графика;
   * дальнейшие данные передаются через `ref.append()`, а не пропсами — так 40+ тысяч точек
   * не гоняются через рендер React.
   */
  initialData?: ReadonlyArray<CpuSample>;
  /** Размер скользящего окна в точках (по умолчанию 24 ч при шаге 2 с). */
  maxPoints?: number;
  className?: string;
}

/**
 * График загрузки CPU на Yagr (canvas, uPlot):
 *  - занимает 100% ширины и высоты родителя (у родителя должна быть задана высота);
 *  - цвета берутся из текущей темы Gravity UI и меняются вместе с ней;
 *  - при размонтировании снимает наблюдатели, отменяет кадры и уничтожает canvas.
 */
export const CpuLoadChart = React.forwardRef<CpuLoadChartHandle, CpuLoadChartProps>(
  function CpuLoadChart({initialData, maxPoints = DEFAULT_MAX_POINTS, className}, ref) {
    const yagrTheme = toYagrTheme(useThemeValue());

    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const plotRef = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    // Всё, что меняется чаще, чем нужно React, живёт в ref.
    const stateRef = React.useRef<{
      chart: Yagr | null;
      /** Точки, ещё не попавшие на график. */
      pendingT: number[];
      pendingV: (number | null)[];
      lastT: number;
      length: number;
      dragging: boolean;
      /** Мы сами меняем шкалу — не считать это действием пользователя. */
      applying: boolean;
      zoom: XRange | null;
      schedule: () => void;
      applyTheme: (theme: YagrTheme) => void;
    } | null>(null);

    // Актуальные значения для эффекта создания, который не должен перезапускаться.
    const latest = React.useRef({initialData, maxPoints, yagrTheme});
    latest.current = {initialData, maxPoints, yagrTheme};

    React.useImperativeHandle(
      ref,
      () => ({
        append(samples) {
          const s = stateRef.current;
          if (!s) {
            return;
          }
          const {timeline, values} = sanitizeSamples(samples, s.lastT);
          if (!timeline.length) {
            return;
          }
          s.lastT = timeline[timeline.length - 1];
          for (let i = 0; i < timeline.length; i++) {
            s.pendingT.push(timeline[i]);
            s.pendingV.push(values[i]);
          }
          s.schedule();
        },
      }),
      [],
    );

    React.useEffect(() => {
      const plot = plotRef.current;
      const wrapper = wrapperRef.current;
      const tooltip = tooltipRef.current;
      if (!plot || !wrapper || !tooltip) {
        return undefined;
      }

      const {initialData: initial = [], maxPoints: capacity} = latest.current;
      const seed = sanitizeSamples(initial.slice(-capacity), -Infinity);

      const state: NonNullable<typeof stateRef.current> = {
        chart: null,
        pendingT: seed.timeline,
        pendingV: seed.values,
        lastT: seed.timeline.length ? seed.timeline[seed.timeline.length - 1] : -Infinity,
        length: 0,
        dragging: false,
        applying: false,
        zoom: null,
        schedule,
        applyTheme,
      };
      stateRef.current = state;

      let disposed = false;
      let frame = 0;
      let resizeFrame = 0;

      function hideTooltip() {
        tooltip!.style.visibility = 'hidden';
      }

      function updateTooltip(u: UPlot) {
        const idx = u.cursor.idx;
        const {left, top} = u.cursor;
        if (idx == null || left == null || top == null || left < 0 || top < 0) {
          hideTooltip();
          return;
        }
        const t = u.data[0][idx];
        const v = u.data[1][idx];
        if (t == null || v == null) {
          hideTooltip();
          return;
        }

        tooltip!.textContent = `${dateTimeFormat.format(t)} · ${v.toFixed(1)}%`;

        const wrapperRect = wrapper!.getBoundingClientRect();
        const overRect = u.over.getBoundingClientRect();
        const x = overRect.left - wrapperRect.left + left;
        const y = overRect.top - wrapperRect.top + top;
        const gap = 12;
        const flip = x + gap + tooltip!.offsetWidth > wrapperRect.width;
        tooltip!.style.transform = `translate(${
          flip ? x - gap - tooltip!.offsetWidth : x + gap
        }px, ${Math.max(0, y - tooltip!.offsetHeight - gap)}px)`;
        tooltip!.style.visibility = 'visible';
      }

      function onSetScale(u: UPlot, key: string) {
        if (key !== 'x' || state.applying) {
          return;
        }
        const {min, max} = u.scales.x;
        const xs = u.data[0];
        if (min == null || max == null || !xs.length) {
          return;
        }
        // Выбор области мышью — зум, двойной клик — сброс к полному диапазону.
        state.zoom = toZoom(min, max, xs[0], xs[xs.length - 1]);
      }

      function createChart(timeline: number[], values: (number | null)[]) {
        const config: Partial<YagrConfig> & Pick<YagrConfig, 'timeline' | 'series'> = {
          timeline,
          series: [
            {
              id: SERIES_ID,
              name: 'CPU',
              data: values,
              color: SERIES_COLOR[latest.current.yagrTheme],
            },
          ],
          chart: {
            // Разрыв в данных — это разрыв линии, а не интерполяция.
            series: {type: 'line', width: 1.5, spanGaps: false},
            appearance: {theme: latest.current.yagrTheme, locale: 'ru'},
            // Размером управляем сами (ResizeObserver ниже): у встроенного адаптива
            // есть неотменяемый debounce-таймер, который может сработать после dispose.
            size: {adaptive: false},
            select: {zoom: true},
          },
          scales: {y: {min: 0, max: 100}},
          axes: {
            x: {
              space: 90,
              // Свой форматтер: в зуме подписи Yagr округляются вниз (05:29:59 вместо 05:30:00).
              values: (_u, splits, _axisIdx, _space, incr) =>
                splits.map((v) =>
                  (incr >= 60_000 ? timeFormat : timeWithSecondsFormat).format(
                    Math.round(v / 1000) * 1000,
                  ),
                ),
            },
            y: {
              splitsCount: 5,
              values: (_u, splits) => splits.map((v) => `${v}%`),
            },
          },
          // Собственный тултип (ниже): встроенный рисуется в <body> со светлым фоном.
          tooltip: {show: false},
          legend: {show: false},
          hooks: {
            setCursor: [updateTooltip],
            setScale: [onSetScale],
          },
        };

        state.chart = new Yagr(plot!, config);
        state.length = timeline.length;
      }

      function flush() {
        frame = 0;
        if (disposed || state.dragging || !state.pendingT.length) {
          return;
        }

        let timeline = state.pendingT;
        let values = state.pendingV;
        state.pendingT = [];
        state.pendingV = [];

        if (timeline.length > capacity) {
          timeline = timeline.slice(-capacity);
          values = values.slice(-capacity);
        }

        // Первое применение — создаём график сразу со всеми накопленными данными.
        // (Yagr плохо переносит старт с пустым набором, поэтому не создаём его раньше.)
        if (!state.chart) {
          if (plot!.clientWidth > 0 && plot!.clientHeight > 0) {
            createChart(timeline, values);
          } else {
            // Контейнер скрыт или ещё без размеров — вернём точки и подождём ResizeObserver.
            state.pendingT = timeline;
            state.pendingV = values;
          }
          return;
        }

        const chart = state.chart;
        const {grow, rotate} = planAppend(state.length, timeline.length, capacity);

        state.applying = true;
        try {
          chart.batch(() => {
            // Растём без вытеснения, затем — со сдвигом окна (Yagr удаляет столько же с начала).
            for (const [from, to, splice] of [
              [0, grow, false],
              [grow, grow + rotate, true],
            ] as const) {
              for (let i = from; i < to; i += MAX_CHUNK) {
                const end = Math.min(i + MAX_CHUNK, to);
                chart.setSeries(
                  timeline.slice(i, end),
                  [{id: SERIES_ID, data: values.slice(i, end)}],
                  {incremental: true, splice},
                );
              }
            }
          });
          state.length = Math.min(capacity, state.length + timeline.length);

          // setData сбрасывает шкалу X к полному диапазону — вернём зум пользователя.
          const xs = chart.uplot.data[0];
          state.zoom = reconcileZoom(state.zoom, xs[0]);
          if (state.zoom) {
            chart.uplot.setScale('x', state.zoom);
          }
        } finally {
          state.applying = false;
        }
      }

      function schedule() {
        if (!frame && !disposed) {
          frame = requestAnimationFrame(flush);
        }
      }

      function applyTheme(theme: YagrTheme) {
        const chart = state.chart;
        if (!chart) {
          return;
        }
        chart.batch(() => {
          chart.setSeries(SERIES_ID, {color: SERIES_COLOR[theme]});
          chart.setTheme(theme);
        });
      }

      // Пока пользователь тянет область зума, не перерисовываем график под руками.
      const onPointerDown = () => {
        state.dragging = true;
      };
      const onPointerUp = () => {
        if (state.dragging) {
          state.dragging = false;
          schedule();
        }
      };
      wrapper.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
      wrapper.addEventListener('pointerleave', hideTooltip);

      // Подгоняем canvas под контейнер; несколько событий за кадр схлопываются в одно.
      let lastWidth = 0;
      let lastHeight = 0;
      const resizeObserver = new ResizeObserver(() => {
        if (resizeFrame) {
          return;
        }
        resizeFrame = requestAnimationFrame(() => {
          resizeFrame = 0;
          const width = plot.clientWidth;
          const height = plot.clientHeight;
          if (disposed || !width || !height || (width === lastWidth && height === lastHeight)) {
            return;
          }
          lastWidth = width;
          lastHeight = height;

          if (!state.chart) {
            schedule(); // контейнер получил размеры — можно создавать график
            return;
          }
          state.applying = true;
          try {
            state.chart.reflow();
            if (state.zoom) {
              state.chart.uplot.setScale('x', state.zoom);
            }
          } finally {
            state.applying = false;
          }
        });
      });
      resizeObserver.observe(plot);

      schedule();

      return () => {
        disposed = true;
        cancelAnimationFrame(frame);
        cancelAnimationFrame(resizeFrame);
        resizeObserver.disconnect();
        wrapper.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        wrapper.removeEventListener('pointerleave', hideTooltip);
        state.chart?.dispose();
        state.chart = null;
        state.pendingT = [];
        state.pendingV = [];
        stateRef.current = null;
      };
    }, []);

    // Тему применяем в passive-эффекте: к этому моменту ThemeProvider уже сменил CSS-переменные.
    const appliedTheme = React.useRef(yagrTheme);
    React.useEffect(() => {
      if (appliedTheme.current === yagrTheme) {
        return;
      }
      appliedTheme.current = yagrTheme;
      stateRef.current?.applyTheme(yagrTheme);
    }, [yagrTheme]);

    return (
      <div ref={wrapperRef} className={`cpu-load-chart${className ? ` ${className}` : ''}`}>
        <div ref={plotRef} className="cpu-load-chart__plot yagr" />
        <div ref={tooltipRef} className="cpu-load-chart__tooltip" role="status" />
      </div>
    );
  },
);
