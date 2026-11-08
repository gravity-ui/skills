import {useMemo} from 'react';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {Button, Loader} from '@gravity-ui/uikit';
import type {VisualizationData, VisualizationMode} from '../data';

// The plugin entry points register React.lazy renderers. Never import the engines here.
settings.set({plugins: [GravityChartsPlugin, YagrPlugin], lang: 'ru'});
export interface VisualizationWidgetProps {
  mode: VisualizationMode;
  data: VisualizationData;
  comparison?: boolean;
  grid?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}
export function VisualizationWidget({mode, data, comparison = true, grid = true, loading, error, onRetry}: VisualizationWidgetProps) {
  const visible = useMemo(() => comparison ? data.series : data.series.slice(0, 1), [data, comparison]);
  const config = useMemo(() => {
    const colors = ['var(--g-color-text-brand)', 'var(--g-color-text-hint)'];
    if (mode === 'sales') {
      return {type: 'gravity-charts' as const, data: {
        chart: {margin: {top: 20, right: 16, bottom: 10, left: 0}},
        series: {data: visible.map((series, i) => ({type: 'line' as const, name: series.name, data: series.points, color: colors[i % colors.length], lineWidth: i ? 2 : 3, dashStyle: i ? 'Dash' as const : 'Solid' as const, marker: {enabled: false}}))},
        xAxis: {type: 'datetime', labels: {dateFormat: 'D MMM', style: {fontSize: '11px'}}, grid: {enabled: false}},
        yAxis: [{min: 0, grid: {enabled: grid}, labels: {numberFormat: {unit: 'k'}, style: {fontSize: '11px'}}}],
        legend: {enabled: false}, tooltip: {enabled: true},
      } satisfies ChartData};
    }
    // Align all series to a shared timeline; missing samples remain explicit gaps.
    const timeline = [...new Set(visible.flatMap(series => series.points.map(p => p.x)))].sort((a, b) => a - b);
    return {type: 'yagr' as const, data: {
      data: {timeline, graphs: visible.map((series, i) => {
        const values = new Map(series.points.map(p => [p.x, p.y]));
        return {id: series.id, name: series.name, data: timeline.map(x => values.get(x) ?? null), color: colors[i % colors.length], type: 'line' as const, width: i ? 1 : 1.5};
      })},
      libraryConfig: {chart: {timeMultiplier: 1, size: {adaptive: true}, select: {zoom: true}}, legend: {show: false}, grid: {show: grid}, scales: {y: {min: 0, max: 100}}, axes: {y: {precision: 0}}},
    } satisfies YagrWidgetData};
  }, [mode, visible, grid]);
  if (loading) return <div className="chart-state" role="status"><Loader size="m" /><span>Загружаем данные…</span></div>;
  if (error) return <div className="chart-state" role="alert"><strong>Не удалось загрузить данные</strong><span>{error}</span>{onRetry && <Button onClick={onRetry}>Повторить</Button>}</div>;
  if (!visible.some(s => s.points.some(p => p.y !== null))) return <div className="chart-state"><strong>За этот период пока нет данных</strong><span>Попробуйте выбрать другой период.</span></div>;
  const shared = {
    renderPluginLoader: () => <div className="chart-state" role="status"><Loader size="m" /><span>Подготавливаем график…</span></div>,
    renderError: ({resetError}: {resetError: () => void}) => <div className="chart-state" role="alert"><strong>Не удалось построить график</strong><Button onClick={resetError}>Попробовать снова</Button></div>,
  };
  return <div className="chart-canvas" role="region" aria-label={mode === 'sales' ? 'График динамики продаж' : 'Временной ряд загрузки CPU'}>
    {config.type === 'gravity-charts' ? <ChartKit key="sales" type={config.type} data={config.data} {...shared} /> : <ChartKit key="monitoring" type={config.type} data={config.data} {...shared} />}
  </div>;
}
