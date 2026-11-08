import {useMemo} from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {Button, Loader} from '@gravity-ui/uikit';
import type {DataSeries, VisualizationMode} from '../data';

/** Shared, engine-independent API. Timestamps are milliseconds in both modes. */
export interface VisualizationWidgetProps {
  mode: VisualizationMode;
  series: DataSeries[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}
const primary = 'var(--g-color-text-brand)';
const secondary = 'var(--g-color-text-hint)';

export function VisualizationWidget({mode, series, loading, error, onRetry}: VisualizationWidgetProps) {
  const upperBound = Math.max(35000, Math.ceil(series.reduce((max, s) => s.points.reduce((m, p) => Math.max(m, p.y), max), 0) / 35000) * 35000);
  const sales = useMemo<ChartData>(() => ({
    series: {data: series.map((s) => ({type: 'line', name: s.name, data: s.points,
      color: s.secondary ? secondary : primary, lineWidth: s.secondary ? 2 : 3,
      dashStyle: s.secondary ? 'Dash' : 'Solid', marker: {enabled: false},
      interpolation: {type: 'monotone'},
    }))},
    legend: {enabled: false},
    xAxis: {type: 'datetime', labels: {dateFormat: 'D MMM'}, grid: {enabled: false}, ticks: {pixelInterval: 120}},
    yAxis: [{min: 0, max: upperBound, ticks: {values: Array.from({length: 5}, (_, i) => i * upperBound / 4)}, labels: {numberFormat: {multiplier: 0.001, postfix: ' тыс.'}}}],
    tooltip: {enabled: true},
  }), [series, upperBound]);
  const monitoring = useMemo<YagrWidgetData>(() => ({
    data: {timeline: series[0]?.points.map((p) => p.x) ?? [], timeZone: 'UTC',
      graphs: series.map((s) => ({id: s.id, name: s.name, data: s.points.map((p) => p.y), color: s.secondary ? secondary : primary, width: s.secondary ? 1 : 1.5})),
    },
    libraryConfig: {chart: {timeMultiplier: 1}, legend: {show: false}, tooltip: {show: true}},
  }), [series]);
  const loader = () => <div className="chart-state" role="status"><Loader size="m"/><span>Загружаем график…</span></div>;
  return <div className="chart-canvas" aria-label={mode === 'sales' ? 'График динамики продаж' : 'График времени ответа сервиса'}>
    {loading ? loader() : error ? <div className="chart-state" role="alert"><span>{error}</span><Button onClick={onRetry}>Повторить</Button></div>
      : !series.length || !series.some((s) => s.points.length) ? <div className="chart-state">За выбранный период нет данных</div>
      : <ChartKit key={mode} type={mode === 'sales' ? 'gravity-charts' : 'yagr'} data={mode === 'sales' ? sales : monitoring}
        renderPluginLoader={loader}
        renderError={({resetError}) => <div className="chart-state" role="alert"><span>Не удалось загрузить график</span><Button onClick={() => {resetError(); onRetry?.();}}>Повторить</Button></div>}/>
    }
  </div>;
}
