import {lazy, useMemo} from 'react';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {Button, Icon, Loader} from '@gravity-ui/uikit';
import {ChartLine} from '@gravity-ui/icons';

// The plugin entry points stay behind import() as well: gravity-charts also
// re-exports runtime chart helpers, which must not enter the initial bundle.
settings.set({
  lang: 'ru',
  plugins: [
    {type: 'gravity-charts', renderer: lazy(async () => {
      const {GravityChartsPlugin} = await import('@gravity-ui/chartkit/gravity-charts');
      return {default: GravityChartsPlugin.renderer};
    })},
    {type: 'yagr', renderer: lazy(async () => {
      const {YagrPlugin} = await import('@gravity-ui/chartkit/yagr');
      return {default: YagrPlugin.renderer};
    })},
  ],
});

export type VisualizationMode = 'sales' | 'monitoring';
export interface TimePoint {timestamp: number; value: number}
export interface VisualizationSeries {id: string; name: string; color: string; points: TimePoint[]; comparison?: boolean}
export interface VisualizationWidgetProps {
  mode: VisualizationMode;
  series: VisualizationSeries[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function VisualizationWidget({mode, series, loading, error, onRetry}: VisualizationWidgetProps) {
  const salesData = useMemo<ChartData>(() => ({
    chart: {margin: {top: 20, right: 16, bottom: 12, left: 4}},
    legend: {enabled: false},
    xAxis: {type: 'datetime', grid: {enabled: false}, lineVisible: false,
      ticks: {interval: 110}, labels: {dateFormat: 'DD MMM', style: {fontSize: '11px'}}},
    yAxis: [{min: 0, lineVisible: false, ticks: {interval: 65},
      labels: {numberFormat: {unit: 'auto'}, style: {fontSize: '11px'}}}],
    series: {data: series.map(s => ({
      type: 'line', name: s.name, color: s.color,
      data: s.points.map(p => ({x: p.timestamp, y: p.value})),
      lineWidth: s.comparison ? 2 : 3,
      dashStyle: s.comparison ? 'Dash' : 'Solid',
      marker: {enabled: false}, interpolation: {type: 'monotone'},
    }))},
  }), [series]);
  const monitoringData = useMemo<YagrWidgetData>(() => ({
    data: {
      timeline: series[0]?.points.map(p => p.timestamp) ?? [],
      graphs: series.map(s => ({id: s.id, name: s.name, color: s.color,
        type: 'line', width: 1.5, data: s.points.map(p => p.value)})),
      timeZone: 'UTC',
    },
    libraryConfig: {
      chart: {timeMultiplier: 1}, legend: {show: false},
      axes: {y: {precision: 0}},
      scales: {y: {min: 0}},
    },
  }), [series]);
  if (loading) return <div className="chart-state" role="status"><Loader size="m"/><span>Загружаем данные…</span></div>;
  if (error) return <div className="chart-state" role="alert"><Icon data={ChartLine} size={30}/><strong>Не удалось построить график</strong><span>{error}</span>{onRetry && <Button onClick={onRetry}>Повторить</Button>}</div>;
  if (!series.some(s => s.points.length)) return <div className="chart-state"><Icon data={ChartLine} size={30}/><strong>Пока нет данных</strong><span>Выберите другой период или источник.</span></div>;
  const sharedProps = {
    renderPluginLoader: () => <div className="chart-state" role="status"><Loader size="m"/><span>Готовим график…</span></div>,
    renderError: ({resetError}: {resetError: () => void}) => <div className="chart-state" role="alert"><strong>Не удалось загрузить график</strong><Button onClick={resetError}>Повторить</Button></div>,
  };
  return <div className="chart-canvas" role="img" aria-label={mode === 'sales' ? 'Линейный график выручки по дням' : 'Временной ряд нагрузки на серверы'}>
    {mode === 'sales'
      ? <ChartKit key="sales" type="gravity-charts" data={salesData} {...sharedProps}/>
      : <ChartKit key="monitoring" type="yagr" data={monitoringData} {...sharedProps}/>}
  </div>;
}
