import {useMemo} from 'react';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import {Button, Loader} from '@gravity-ui/uikit';
import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import type {ChartMode, WidgetDataset} from '../data';

// Descriptors register the engines; ChartKit lazy-loads their renderers on demand.
settings.set({plugins: [GravityChartsPlugin, YagrPlugin], lang: 'ru'});
export interface VisualizationWidgetProps {mode: ChartMode; data: WidgetDataset; compare?: boolean; markers?: boolean;}

export function VisualizationWidget({mode, data, compare = true, markers = false}: VisualizationWidgetProps) {
  const salesData = useMemo<ChartData>(() => ({
    chart: {margin: {top: 18, right: 12, bottom: 8, left: 0}},
    series: {data: [
      ...(compare ? [{type: 'line' as const, name: 'Предыдущий период', color: 'var(--g-color-text-hint)', dashStyle: 'Dash' as const, lineWidth: 2, data: data.timeline.map((x, index) => ({x, y: data.previous[index]}))}] : []),
      {type: 'line', name: 'Текущий период', color: 'var(--g-color-text-positive)', lineWidth: 3, marker: {enabled: markers, radius: 3}, data: data.timeline.map((x, index) => ({x, y: data.current[index]}))},
    ]},
    xAxis: {type: 'datetime', grid: {enabled: false}, labels: {dateFormat: 'DD MMM', style: {fontSize: '11px'}}},
    yAxis: [{min: 0, title: {text: ''}, labels: {numberFormat: {showRankDelimiter: true}, style: {fontSize: '11px'}}}],
    legend: {enabled: false}, tooltip: {enabled: true, headerFormat: {type: 'date', format: 'DD MMMM YYYY'}, valueFormat: {type: 'number', showRankDelimiter: true, postfix: ' ₽', precision: 0}},
  }), [data, compare, markers]);
  const monitoringData = useMemo<YagrWidgetData>(() => ({
    data: {timeline: data.timeline, timeZone: 'UTC', graphs: [
      ...(compare ? [{id: 'previous', name: 'Предыдущий период', color: 'var(--g-color-text-hint)', width: 1, data: data.previous}] : []),
      {id: 'response', name: 'Время ответа', color: 'var(--g-color-text-positive)', width: 1.5, data: data.current},
    ]},
    libraryConfig: {chart: {series: {type: 'line'}, timeMultiplier: 1, size: {adaptive: true}, appearance: {locale: 'ru'}}, legend: {show: false}, axes: {y: {min: 0, precision: 0}}, scales: {y: {min: 0}}},
  }), [data, compare]);
  const shared = {
    renderPluginLoader: () => <div className="chart-state" role="status"><Loader size="m"/><span>Загружаем график…</span></div>,
    renderError: ({resetError}: {resetError: () => void}) => <div className="chart-state" role="alert"><b>Не удалось загрузить график</b><span>Попробуйте загрузить визуализацию ещё раз.</span><Button onClick={resetError}>Повторить</Button></div>,
  };
  if (data.timeline.length === 0) return <div className="chart-state">За выбранный период пока нет данных</div>;
  return mode === 'sales'
    ? <ChartKit key="sales" type="gravity-charts" data={salesData} {...shared}/>
    : <ChartKit key="monitoring" type="yagr" data={monitoringData} {...shared}/>;
}
