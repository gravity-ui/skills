import {Component, Suspense, useState} from 'react';
import type {ReactNode} from 'react';

import {Button, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {DataTable} from './DataTable';
import {chartEngines} from './engines';
import {MODE_META} from './modeMeta';
import type {ChartMode, ChartWidgetProps} from './types';

const MODE_OPTIONS = (Object.keys(MODE_META) as ChartMode[]).map((m) => ({
  value: m,
  content: MODE_META[m].switchLabel,
}));

/** Keeps a failed engine chunk (e.g. offline dynamic import) from killing the page. */
class EngineErrorBoundary extends Component<{children: ReactNode}, {error: boolean}> {
  state = {error: false};
  static getDerivedStateFromError() {
    return {error: true};
  }
  render() {
    if (this.state.error) {
      return (
        <div className="ck-widget__loading">
          <Text color="secondary">Не удалось загрузить движок графика. Обновите страницу.</Text>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * The single visualization widget. Callers talk to it through one API
 * (`ChartWidgetProps`) regardless of mode; the mode switch picks the chart
 * engine, and each engine is lazy-loaded on first use.
 */
export function ChartWidget({
  mode,
  onModeChange,
  series,
  height = 340,
  title,
  formatValue,
  formatTime,
  formatAxis,
  formatTimeAxis,
}: ChartWidgetProps) {
  const [tableView, setTableView] = useState(false);
  const meta = MODE_META[mode];
  const Engine = chartEngines[mode];

  const engineProps = {
    series,
    height,
    formatValue: formatValue ?? meta.formatValue,
    formatTime: formatTime ?? meta.formatTime,
    formatAxis: formatAxis ?? meta.formatAxis,
    formatTimeAxis: formatTimeAxis ?? meta.formatTimeAxis,
  };

  return (
    <section className="ck-widget">
      <header className="ck-widget__header">
        <Text variant="subheader-2">{title ?? meta.title}</Text>
        <div className="ck-widget__controls">
          <SegmentedRadioGroup
            size="m"
            value={mode}
            options={MODE_OPTIONS}
            onChange={(e) => onModeChange(e.target.value as ChartMode)}
          />
          <Button view="outlined" size="m" selected={tableView} onClick={() => setTableView((v) => !v)}>
            Таблица
          </Button>
        </div>
      </header>
      <div className="ck-widget__body" style={{minHeight: height}}>
        {tableView ? (
          <DataTable series={series} formatValue={engineProps.formatValue} formatTime={engineProps.formatTime} />
        ) : (
          <EngineErrorBoundary key={mode}>
            <Suspense
              fallback={
                <div className="ck-widget__loading" style={{height}}>
                  <Loader size="m" />
                  <Text color="secondary">Загрузка движка графика…</Text>
                </div>
              }
            >
              <Engine {...engineProps} />
            </Suspense>
          </EngineErrorBoundary>
        )}
      </div>
    </section>
  );
}
