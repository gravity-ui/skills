import React from 'react';
import {Alert, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import ChartKit from '@gravity-ui/chartkit';

import {toMonitoringChart} from './adapters/monitoring';
import {toSalesChart} from './adapters/sales';
import {ensureEngine} from './engines';
import {formatValue, summarize, validateSeries} from './series';
import type {VizMode, VizWidgetProps} from './types';

import './VizWidget.css';

const MODE_OPTIONS: {value: VizMode; content: string}[] = [
  {value: 'sales', content: 'Продажи'},
  {value: 'monitoring', content: 'Мониторинг'},
];

/** A chart config already converted for the engine that will draw it. */
type EngineInput =
  | {mode: 'sales'; data: ReturnType<typeof toSalesChart>}
  | {mode: 'monitoring'; data: ReturnType<typeof toMonitoringChart>};

/**
 * One visualization widget with two presentations: a regular line chart (`sales`)
 * and a dense time series for monitoring (`monitoring`). Both are driven by the same
 * props. Each engine loads on first use and is then kept by the registry.
 */
export function VizWidget(props: VizWidgetProps): React.JSX.Element {
  const {title, series, unit, height = 360, onModeChange} = props;
  const titleId = React.useId();
  const chartId = React.useId();

  const isControlled = props.mode !== undefined;
  const [internalMode, setInternalMode] = React.useState<VizMode>(props.defaultMode ?? 'sales');
  const requested: VizMode = props.mode ?? internalMode;

  // `shown` is the mode currently on screen. It lags `requested` while an engine loads,
  // so the previous chart keeps its place instead of the card collapsing into a spinner.
  const [shown, setShown] = React.useState<VizMode | null>(null);
  const [engineError, setEngineError] = React.useState<string | null>(null);

  const problem = React.useMemo(() => validateSeries(series), [series]);

  React.useEffect(() => {
    let active = true;
    setEngineError(null);
    ensureEngine(requested).then(
      () => {
        if (active) {
          setShown(requested);
        }
      },
      (error: unknown) => {
        if (active) {
          setEngineError(error instanceof Error ? error.message : String(error));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [requested]);

  const engineInput = React.useMemo<EngineInput | null>(() => {
    if (problem || shown === null) {
      return null;
    }
    return shown === 'sales'
      ? {mode: 'sales', data: toSalesChart(series, {unit})}
      : {mode: 'monitoring', data: toMonitoringChart(series, {unit})};
  }, [problem, shown, series, unit]);

  const summary = React.useMemo(() => summarize(series), [series]);

  const handleModeChange = (next: VizMode) => {
    if (!isControlled) {
      setInternalMode(next);
    }
    onModeChange?.(next);
  };

  const isRefreshing = shown !== null && shown !== requested;
  const isLoadingFirst = shown === null && !problem && !engineError;

  return (
    <section className="viz-widget" aria-labelledby={titleId}>
      <header className="viz-widget__header">
        <Text as="h2" variant="subheader-2" id={titleId} className="viz-widget__title">
          {title}
        </Text>
        <SegmentedRadioGroup
          aria-label="Режим графика"
          value={requested}
          onUpdate={handleModeChange}
          options={MODE_OPTIONS}
        />
      </header>

      {problem ? <Alert theme="danger" title="Не удалось построить график" message={problem} /> : null}
      {engineError ? (
        <Alert theme="danger" title="Не удалось загрузить движок графика" message={engineError} />
      ) : null}

      <div className="viz-widget__chart" style={{height}}>
        {engineInput ? (
          <div
            className={`viz-widget__engine${isRefreshing ? ' viz-widget__engine_refreshing' : ''}`}
            aria-busy={isRefreshing}
          >
            {engineInput.mode === 'sales' ? (
              <ChartKit key="sales" id={`${chartId}-sales`} type="gravity-charts" data={engineInput.data} />
            ) : (
              <ChartKit key="monitoring" id={`${chartId}-monitoring`} type="yagr" data={engineInput.data} />
            )}
          </div>
        ) : null}
        {isLoadingFirst ? (
          <div className="viz-widget__loading">
            <Loader size="m" />
          </div>
        ) : null}
      </div>

      {/* Table twin: the non-hover route to every number. Required by the palette's relief rule. */}
      <details className="viz-widget__table-wrap">
        <summary>Таблица значений</summary>
        <table className="viz-widget__table">
          <thead>
            <tr>
              <th scope="col">Серия</th>
              <th scope="col">Последнее</th>
              <th scope="col">Минимум</th>
              <th scope="col">Максимум</th>
              <th scope="col">Среднее</th>
              <th scope="col">Пропуски</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.name}</th>
                <td>{row.last === null ? '—' : formatValue(row.last, unit)}</td>
                <td>{row.min === null ? '—' : formatValue(row.min, unit)}</td>
                <td>{row.max === null ? '—' : formatValue(row.max, unit)}</td>
                <td>{row.avg === null ? '—' : formatValue(row.avg, unit)}</td>
                <td>{row.gaps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
