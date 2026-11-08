import React from 'react';
import {Button, Label, Loader, Text, useThemeType, useThemeValue} from '@gravity-ui/uikit';

import '@gravity-ui/yagr/index.css';

import './CpuChart.css';
import {toYagrTheme} from './cpuChartTheme';
import {CpuChartController, type CpuChartState} from './CpuChartController';
import type {CpuHistory, CpuSource} from './cpuSource';

export interface CpuChartLatest {
  t: number;
  v: number;
}

export interface CpuChartProps {
  source: CpuSource;
  /** Вызывается при загрузке истории и после каждого применённого обновления. */
  onLatest?: (point: CpuChartLatest) => void;
  className?: string;
}

type Status = 'loading' | 'ready' | 'error';

/**
 * График загрузки CPU за скользящее окно (по умолчанию — сутки).
 *
 * Размер: график занимает всю область родителя (родителю нужна ненулевая высота) и
 * сам перерисовывается при её изменении.
 * Тема: следует за ThemeProvider Gravity UI, переключается без пересоздания графика.
 * Ресурсы: при размонтировании (и при смене `source`) отписывается от потока, отменяет
 * загрузку, снимает ResizeObserver/слушатели и уничтожает canvas и tooltip.
 */
export function CpuChart({source, onLatest, className}: CpuChartProps) {
  const plotRef = React.useRef<HTMLDivElement>(null);
  const controllerRef = React.useRef<CpuChartController | null>(null);

  const themeValue = useThemeValue();
  const themeType = useThemeType();
  const theme = toYagrTheme(themeValue, themeType);

  // Актуальные значения для эффекта создания графика, который не должен
  // пересоздаваться при смене темы или колбэка.
  const live = React.useRef({theme, onLatest});
  live.current = {theme, onLatest};

  const [status, setStatus] = React.useState<Status>('loading');
  const [attempt, setAttempt] = React.useState(0);
  const [state, setState] = React.useState<CpuChartState>({zoomed: false, paused: false});
  const [latest, setLatest] = React.useState<CpuChartLatest | null>(null);

  React.useEffect(() => {
    const root = plotRef.current;
    if (!root) return undefined;

    const abort = new AbortController();
    let controller: CpuChartController | undefined;

    // Подписываемся сразу, до окончания загрузки истории, чтобы не потерять точки
    // между «история готова» и «подписка началась». Дубли отсекает контроллер.
    const early: CpuHistory[] = [];
    const unsubscribe = source.subscribe((chunk) => {
      if (controller) controller.push(chunk);
      else early.push(chunk);
    });

    setStatus('loading');
    setState({zoomed: false, paused: false});

    source.loadHistory(abort.signal).then(
      (history) => {
        if (abort.signal.aborted) return;
        try {
          controller = new CpuChartController(root, history, {
            theme: live.current.theme,
            stepMs: source.stepMs,
            windowMs: source.windowMs,
            onStateChange: setState,
            onLatest: (point) => {
              setLatest(point);
              live.current.onLatest?.(point);
            },
          });
        } catch (error) {
          console.error('CpuChart: failed to create the chart', error);
          setStatus('error');
          return;
        }
        controllerRef.current = controller;
        early.splice(0).forEach((chunk) => controller!.push(chunk));
        setStatus('ready');
      },
      (error) => {
        if (abort.signal.aborted) return;
        console.error('CpuChart: failed to load history', error);
        setStatus('error');
      },
    );

    return () => {
      abort.abort();
      unsubscribe();
      controllerRef.current = null;
      controller?.dispose();
      controller = undefined;
    };
  }, [source, attempt]);

  // Смена темы: пересоздавать график не нужно — меняем цвета и перерисовываем.
  // Эффект выполняется после layout-эффекта ThemeProvider, то есть CSS-переменные
  // темы к этому моменту уже обновлены.
  React.useEffect(() => {
    controllerRef.current?.setTheme(theme);
  }, [theme]);

  const label = latest
    ? `График загрузки CPU за последние 24 часа. Сейчас ${latest.v.toFixed(1)}%.`
    : 'График загрузки CPU за последние 24 часа.';

  return (
    <div className={['cpu-chart-frame', className].filter(Boolean).join(' ')}>
      {/* Полоса фиксированной высоты: статусы не перекрывают график и не сдвигают его. */}
      <div className="cpu-chart-toolbar">
        {status === 'ready' && state.paused && (
          <Label theme="info">Обновление приостановлено, пока курсор на графике</Label>
        )}
        {status === 'ready' && state.zoomed && (
          <Button view="outlined" size="s" onClick={() => controllerRef.current?.resetZoom()}>
            Сбросить масштаб
          </Button>
        )}
      </div>

      <div className="cpu-chart-plot">
        <div ref={plotRef} className="cpu-chart" role="img" aria-label={label} />

        {status === 'loading' && (
          <div className="cpu-chart-overlay">
            <Loader size="m" />
          </div>
        )}

        {status === 'error' && (
          <div className="cpu-chart-overlay cpu-chart-overlay_column">
            <Text color="secondary">Не удалось загрузить данные о загрузке CPU</Text>
            <Button view="outlined" onClick={() => setAttempt((n) => n + 1)}>
              Повторить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
