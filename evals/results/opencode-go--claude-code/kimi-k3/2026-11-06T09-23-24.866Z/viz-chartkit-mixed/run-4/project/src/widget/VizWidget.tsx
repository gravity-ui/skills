/**
 * VizWidget — единый виджет визуализации.
 *
 * Один компонент, один API: набор режимов в `modes`, активный — `mode`
 * (или внутреннее состояние от `initialMode`). Движки рендеринга
 * (SVG для продаж, Canvas для плотного мониторинга) подгружаются лениво
 * через динамический import() при первом выборе соответствующего режима;
 * Vite выносит каждый движок в отдельный чанк сборки.
 *
 * Обвязка — переключатель режимов, легенда, кроссхейр-тултип, табличный
 * вид, клавиатурная навигация — общая для всех режимов и живёт здесь.
 */

import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import {Button, SegmentedRadioGroup, Spin} from '@gravity-ui/uikit';

import type {
  ChartEngine,
  EngineFactory,
  EngineHover,
  EngineTokens,
  EngineView,
  VizKind,
  VizModeConfig,
  VizTableRow,
} from './types';
import {
  formatAxis,
  formatDayHeader,
  formatDayTick,
  formatTimeTick,
  formatValue,
} from './format';
import './viz.css';

/* Ленивый реестр движков: модуль загружается только при первом запросе kind. */
const engineLoaders: Record<VizKind, () => Promise<{createEngine: EngineFactory}>> = {
  sales: () => import('./engines/salesLine'),
  monitoring: () => import('./engines/monitoringSeries'),
};

const engineCache = new Map<VizKind, Promise<{createEngine: EngineFactory}>>();

function loadEngine(kind: VizKind): Promise<{createEngine: EngineFactory}> {
  let pending = engineCache.get(kind);
  if (!pending) {
    pending = engineLoaders[kind]();
    engineCache.set(kind, pending);
  }
  return pending;
}

function resolveTokens(root: HTMLElement): EngineTokens {
  const cs = getComputedStyle(root);
  const v = (name: string): string => cs.getPropertyValue(name).trim();
  return {
    surface: v('--viz-surface'),
    textPrimary: v('--viz-text-primary'),
    textSecondary: v('--viz-text-secondary'),
    textMuted: v('--viz-text-muted'),
    gridline: v('--viz-gridline'),
    baseline: v('--viz-baseline'),
    series: [v('--viz-series-1'), v('--viz-series-2'), v('--viz-series-3')],
  };
}

export interface VizWidgetProps {
  modes: Record<string, VizModeConfig>;
  initialMode?: string;
  /** Контролируемый режим (опционально). */
  mode?: string;
  onModeChange?: (mode: string) => void;
  className?: string;
}

export function VizWidget(props: VizWidgetProps): JSX.Element {
  const {modes} = props;
  const modeIds = useMemo(() => Object.keys(modes), [modes]);
  const [innerMode, setInnerMode] = useState(props.initialMode ?? modeIds[0]);
  const mode = props.mode ?? innerMode;
  const config = modes[mode] ?? modes[modeIds[0]];

  const [viewKind, setViewKind] = useState<'chart' | 'table'>('chart');
  const [hover, setHover] = useState<EngineHover | null>(null);
  const [busy, setBusy] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<ChartEngine | null>(null);
  const viewRef = useRef<EngineView | null>(null);
  const seqRef = useRef(0);
  const groupName = useId();

  const isSales = config.kind === 'sales';
  const formatXHeader = isSales ? formatDayHeader : formatTimeTick;

  /* Полный EngineView из конфига режима + темы + размеров. */
  const pushUpdate = useCallback((): void => {
    const engine = engineRef.current;
    const plotEl = plotRef.current;
    const root = rootRef.current;
    if (!engine || !plotEl || !root) return;
    const tokens = resolveTokens(root);
    const view: EngineView = {
      times: config.times,
      series: config.series,
      colors: config.series.map((s) => tokens.series[s.colorSlot - 1]),
      tokens,
      width: plotEl.clientWidth,
      height: plotEl.clientHeight,
      formatXTick: config.kind === 'sales' ? formatDayTick : formatTimeTick,
      formatYTick: formatAxis,
      formatPoint: (v) => formatValue(v, config.unit),
    };
    viewRef.current = view;
    engine.update(view);
  }, [config]);

  /* Смена режима: лениво догружаем движок, держим прежний кадр до готовности. */
  useEffect(() => {
    let cancelled = false;
    const seq = ++seqRef.current;
    setBusy(true);
    void loadEngine(config.kind).then((mod) => {
      if (cancelled || seq !== seqRef.current) return;
      const plotEl = plotRef.current;
      if (!plotEl) return;
      const engine = mod.createEngine({plotEl, onHover: setHover});
      engineRef.current?.destroy();
      engineRef.current = engine;
      setHover(null);
      pushUpdate();
      setBusy(false);
    });
    return () => {
      cancelled = true;
    };
  }, [config, pushUpdate]);

  /* Размеры: ResizeObserver держит фрейм без скачков. */
  useEffect(() => {
    const plotEl = plotRef.current;
    if (!plotEl) return;
    const ro = new ResizeObserver(() => {
      engineRef.current?.resize(plotEl.clientWidth, plotEl.clientHeight);
    });
    ro.observe(plotEl);
    return () => ro.disconnect();
  }, []);

  /* Тема: перечитываем токены при смене data-theme или prefers-color-scheme. */
  useEffect(() => {
    const onTheme = (): void => pushUpdate();
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', onTheme);
    return () => {
      mo.disconnect();
      mq.removeEventListener('change', onTheme);
    };
  }, [pushUpdate]);

  /* Деструктор движка при размонтировании. */
  useEffect(
    () => () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    },
    [],
  );

  const handleModeChange = (next: string): void => {
    if (props.mode === undefined) setInnerMode(next);
    props.onModeChange?.(next);
  };

  /* Клавиатурная навигация по точкам: те же значения, что и в тултипе. */
  const moveCursor = (index: number): void => {
    const n = config.times.length;
    const i = Math.min(n - 1, Math.max(0, index));
    engineRef.current?.setCursor(i);
    const a = engineRef.current?.getAnchor(i) ?? {x: 0, y: 0};
    setHover({index: i, x: a.x, y: a.y});
  };

  const onPlotKeyDown = (ev: React.KeyboardEvent): void => {
    if (viewKind !== 'chart') return;
    const n = config.times.length;
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
      ev.preventDefault();
      const delta = ev.key === 'ArrowLeft' ? -1 : 1;
      moveCursor(hover === null ? (delta > 0 ? 0 : n - 1) : hover.index + delta);
    } else if (ev.key === 'Home' || ev.key === 'End') {
      ev.preventDefault();
      moveCursor(ev.key === 'Home' ? 0 : n - 1);
    } else if (ev.key === 'Escape') {
      engineRef.current?.setCursor(null);
      setHover(null);
    }
  };

  /* Табличный вид: готовые строки (агрегаты) или сырые ряды. */
  const tableRows: VizTableRow[] = useMemo(() => {
    if (config.tableRows) return config.tableRows;
    return config.times.map((t, i) => ({
      label: formatXHeader(t),
      values: config.series.map((s) => s.values[i]),
    }));
  }, [config, formatXHeader]);

  /* Позиция тултипа: над якорной точкой, с удержанием в пределах карточки. */
  const wrapW = wrapRef.current?.clientWidth ?? 640;
  const tooltipLeft = hover ? Math.min(Math.max(hover.x, 110), Math.max(110, wrapW - 110)) : 0;
  const tooltipTop = hover ? Math.max(hover.y, 64) : 0;

  return (
    <section className={`viz-root${props.className ? ` ${props.className}` : ''}`}>
      <header className="viz-header">
        <div className="viz-titles">
          <h3 className="viz-title">{config.title}</h3>
          {config.subtitle ? <p className="viz-subtitle">{config.subtitle}</p> : null}
        </div>
        <div className="viz-controls">
          <SegmentedRadioGroup
            name={`viz-mode-${groupName}`}
            value={mode}
            onUpdate={handleModeChange}
            options={modeIds.map((id) => ({value: id, content: modes[id].label}))}
          />
          <Button
            view="outlined"
            onClick={() => {
              setHover(null);
              engineRef.current?.setCursor(null);
              setViewKind(viewKind === 'chart' ? 'table' : 'chart');
            }}
          >
            {viewKind === 'chart' ? 'Таблица' : 'График'}
          </Button>
        </div>
      </header>

      {config.series.length > 1 ? (
        <ul className="viz-legend" aria-label="Легенда">
          {config.series.map((s) => (
            <li key={s.id}>
              <span
                className="viz-legend-key"
                style={{background: `var(--viz-series-${s.colorSlot})`}}
              />
              <span>{s.name}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {viewKind === 'chart' ? (
        <div
          ref={wrapRef}
          className="viz-plot-wrap"
          style={{opacity: busy ? 0.55 : 1}}
          tabIndex={0}
          role="img"
          aria-label={`${config.title}. ${config.subtitle ?? ''} Используйте стрелки для навигации по точкам.`}
          onKeyDown={onPlotKeyDown}
          onBlur={() => {
            engineRef.current?.setCursor(null);
            setHover(null);
          }}
        >
          <div ref={plotRef} className="viz-plot" />
          {hover ? (
            <div
              className="viz-tooltip"
              style={{left: tooltipLeft, top: tooltipTop}}
              role="status"
            >
              <div className="viz-tooltip-title">{formatXHeader(config.times[hover.index])}</div>
              {config.series.map((s) => (
                <div className="viz-tooltip-row" key={s.id}>
                  <span
                    className="viz-tooltip-key"
                    style={{background: `var(--viz-series-${s.colorSlot})`}}
                  />
                  <span className="viz-tooltip-name">{s.name}</span>
                  <span className="viz-tooltip-value">
                    {formatValue(s.values[hover.index], config.unit)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          {busy ? (
            <div className="viz-busy" aria-hidden="true">
              <Spin size="s" />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="viz-table-wrap">
          <table className="viz-table">
            <thead>
              <tr>
                <th scope="col">{isSales ? 'Дата' : 'Интервал'}</th>
                {config.series.map((s) => (
                  <th scope="col" key={s.id}>
                    <span
                      className="viz-legend-key"
                      style={{background: `var(--viz-series-${s.colorSlot})`}}
                    />
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.values.map((v, i) => (
                    <td key={config.series[i].id}>
                      {v === null ? '—' : formatValue(v, config.unit)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {config.tableNote ? <p className="viz-note">{config.tableNote}</p> : null}
        </div>
      )}
    </section>
  );
}
