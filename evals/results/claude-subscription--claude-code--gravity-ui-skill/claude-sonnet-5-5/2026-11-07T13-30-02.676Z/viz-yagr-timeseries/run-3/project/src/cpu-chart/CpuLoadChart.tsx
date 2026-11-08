import '@gravity-ui/yagr/index.css';

import React from 'react';
import {Button, useThemeValue} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import type {YagrTheme} from '@gravity-ui/yagr';

import type {CpuSource} from './cpuSource';
import styles from './CpuLoadChart.module.css';

const SERIES_ID = 'cpu';

export interface CpuLoadChartProps {
  source: CpuSource;
  className?: string;
}

function toYagrTheme(themeValue: string): YagrTheme {
  return themeValue.startsWith('dark') ? 'dark' : 'light';
}

/**
 * Canvas не понимает CSS-переменные, поэтому резолвим токены Gravity UI
 * в конкретные цвета через getComputedStyle элемента внутри ThemeProvider.
 */
function readTokens(el: HTMLElement) {
  const style = getComputedStyle(el);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    line: token('--g-color-line-brand'),
    axis: token('--g-color-text-secondary'),
    grid: token('--g-color-line-generic'),
  };
}

export function CpuLoadChart({source, className}: CpuLoadChartProps) {
  const themeValue = useThemeValue();
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Авторитетное хранилище окна данных. Yagr получает копии: он мутирует переданные массивы.
  const storeRef = React.useRef<{source: CpuSource; timeline: number[]; values: number[]} | null>(
    null,
  );
  const [zoomed, setZoomed] = React.useState(false);
  // Меняется при «Вернуться к live»: пересоздаёт график из актуального хранилища.
  const [epoch, setEpoch] = React.useState(0);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    if (storeRef.current?.source !== source) {
      const snapshot = source.getSnapshot();
      storeRef.current = {
        source,
        timeline: snapshot.timeline.slice(),
        values: snapshot.values.slice(),
      };
    }
    const store = storeRef.current;

    let chart: Yagr | undefined;
    let isZoomed = false;
    let frame = 0;
    let pendingTimeline: number[] = [];
    let pendingValues: number[] = [];

    // Passive effect выполняется после layout-эффекта ThemeProvider,
    // поэтому класс темы на корне уже применён и токены резолвятся корректно.
    const tokens = readTokens(container);

    const mount = () => {
      // Yagr не умеет стартовать с пустым набором данных.
      if (chart || store.timeline.length === 0) {
        return;
      }
      chart = new Yagr(container, {
        timeline: store.timeline.slice(),
        series: [
          {
            id: SERIES_ID,
            name: 'CPU',
            type: 'line',
            data: store.values.slice(),
            color: tokens.line,
            formatter: (value) => (value === null ? '—' : `${Number(value).toFixed(1)}%`),
          },
        ],
        chart: {
          series: {type: 'line', width: 1.5},
          appearance: {theme: toYagrTheme(themeValue), locale: 'ru'},
        },
        grid: {stroke: tokens.grid, width: 1},
        axes: {
          x: {stroke: () => tokens.axis},
          y: {
            stroke: () => tokens.axis,
            values: (_u, splits) => splits.map((v) => `${v}%`),
          },
        },
        scales: {y: {min: 0, max: 100}},
        legend: {show: false},
        hooks: {
          // Выделение области = зум. Пока пользователь изучает участок, live-обновления
          // копятся в хранилище, но не перерисовывают (и не сбрасывают) график.
          onSelect: [
            () => {
              isZoomed = true;
              setZoomed(true);
            },
          ],
        },
      });
    };

    const flush = () => {
      frame = 0;
      if (pendingTimeline.length === 0) {
        return;
      }
      const timeline = pendingTimeline;
      const values = pendingValues;
      pendingTimeline = [];
      pendingValues = [];

      // Скользящее окно: сколько точек добавили — столько же убрали спереди
      // (ровно та же семантика, что у `splice: true` в Yagr).
      const drop = Math.min(timeline.length, store.timeline.length);
      store.timeline.splice(0, drop);
      store.values.splice(0, drop);
      for (let i = 0; i < timeline.length; i++) {
        store.timeline.push(timeline[i]);
        store.values.push(values[i]);
      }

      if (!chart) {
        mount();
      } else if (!isZoomed) {
        chart.setSeries(timeline, [{id: SERIES_ID, data: values}], {
          incremental: true,
          splice: true,
        });
      }
    };

    mount();

    // Точки могут приходить чаще, чем кадры: склеиваем их и обновляем график не чаще одного раза за кадр.
    const unsubscribe = source.subscribe((points) => {
      pendingTimeline.push(...points.timeline);
      pendingValues.push(...points.values);
      if (!frame) {
        frame = requestAnimationFrame(flush);
      }
    });

    return () => {
      unsubscribe();
      if (frame) {
        cancelAnimationFrame(frame);
      }
      // Недосброшенные точки не теряем: к следующему монтированию они должны попасть в хранилище.
      if (pendingTimeline.length) {
        const drop = Math.min(pendingTimeline.length, store.timeline.length);
        store.timeline.splice(0, drop);
        store.values.splice(0, drop);
        store.timeline.push(...pendingTimeline);
        store.values.push(...pendingValues);
      }
      chart?.dispose();
      chart = undefined;
    };
  }, [source, themeValue, epoch]);

  const resumeLive = () => {
    setZoomed(false);
    setEpoch((e) => e + 1);
  };

  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      <div ref={containerRef} className={styles.chart} />
      {zoomed ? (
        <Button
          view="outlined"
          size="s"
          onClick={resumeLive}
          style={{position: 'absolute', top: 0, right: 0}}
        >
          Сбросить масштаб
        </Button>
      ) : null}
    </div>
  );
}
