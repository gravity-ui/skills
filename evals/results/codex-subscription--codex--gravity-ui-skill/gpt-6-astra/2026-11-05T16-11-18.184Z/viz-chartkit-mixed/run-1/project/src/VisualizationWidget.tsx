import {useMemo} from 'react';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {Button, Loader, useThemeValue} from '@gravity-ui/uikit';
import type {DataSeries, Mode} from './data';

// Both descriptors use React.lazy; their rendering engines load on first use.
settings.set({plugins: [GravityChartsPlugin, YagrPlugin], lang: 'ru'});

export interface VisualizationWidgetProps {
  mode: Mode;
  series: DataSeries[];
  unit: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function VisualizationWidget({mode, series, unit, loading, error, onRetry}: VisualizationWidgetProps) {
  const theme = useThemeValue();
  const config = useMemo(() => {
    const primary = 'var(--g-color-text-brand)';
    const secondary = 'var(--app-chart-comparison)';
    if (mode === 'sales') {
      const data: ChartData = {
        chart: {margin: {top: 24, right: 12, bottom: 12, left: 8}},
        legend: {enabled: false},
        xAxis: {type: 'datetime', labels: {dateFormat: 'D MMM', style: {fontSize: '11px'}}, ticks: {pixelInterval: 110}, grid: {enabled: false}},
        yAxis: [{min: 0, ticks: {pixelInterval: 70}, labels: {numberFormat: {multiplier: unit === '₽' ? 0.001 : 1, postfix: unit === '₽' ? ' тыс.' : ''}, style: {fontSize: '11px'}}, grid: {enabled: true}}],
        series: {data: series.map((s, index) => ({type: 'line', name: s.name, color: index ? secondary : primary, lineWidth: index ? 2 : 3, dashStyle: index ? 'Dash' : 'Solid', data: s.points.map(p => ({x: p.timestamp, y: p.value}))}))},
      };
      return {type: 'gravity-charts' as const, data};
    }
    const data: YagrWidgetData = {
      data: {timeline: series[0]?.points.map(p => p.timestamp) ?? [], timeZone: 'UTC', graphs: series.map((s, index) => ({id: `series-${index}`, name: s.name, data: s.points.map(p => p.value), color: index ? secondary : primary, width: index ? 1.5 : 1.7}))},
      libraryConfig: {
        chart: {appearance: {locale: 'ru'}, timeMultiplier: 1, select: {zoom: true}},
        legend: {show: false}, scales: {y: {min: 0}},
        axes: {y: {splitsCount: 5}, x: {grid: {show: false}}},
      },
    };
    return {type: 'yagr' as const, data};
  }, [mode, series, unit, theme]);
  const pending = <div className="chart-state" role="status"><Loader size="m"/><span>Загружаем визуализацию…</span></div>;
  if (loading) return pending;
  if (error) return <div className="chart-state" role="alert"><strong>Не удалось получить данные</strong><span>{error}</span>{onRetry && <Button onClick={onRetry}>Повторить</Button>}</div>;
  if (!series.length || !series[0].points.length) return <div className="chart-state"><strong>Пока нет данных</strong><span>Выберите другой период или источник данных.</span></div>;
  return <div className="chart-engine" aria-label={mode === 'sales' ? 'Линейный график продаж' : 'Временной ряд мониторинга'}><ChartKit key={mode} {...config} renderPluginLoader={() => pending} renderError={() => <div className="chart-state" role="alert"><strong>Не удалось загрузить график</strong><span>Проверьте подключение и попробуйте снова.</span><Button onClick={() => window.location.reload()}>Перезагрузить страницу</Button></div>}/></div>;
}
