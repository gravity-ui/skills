import {useMemo} from 'react';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {Button, Loader, Text} from '@gravity-ui/uikit';
import type {ViewMode, VisualizationData} from './data';

// Descriptors register React.lazy renderers, not eager engine instances.
settings.set({plugins: [GravityChartsPlugin, YagrPlugin], lang: 'ru'});

export interface VisualizationWidgetProps {
  mode: ViewMode;
  data: VisualizationData;
  showComparison?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}
export function VisualizationWidget({mode, data, showComparison = true, loading, error, onRetry}: VisualizationWidgetProps) {
  const config = useMemo(() => {
    const series = data.series.filter((s) => showComparison || !s.comparison);
    if (mode === 'sales') {
      const chart: ChartData = {
        series: {data: series.map((s) => ({
          type: 'line' as const, name: s.name,
          color: s.comparison ? 'var(--g-color-text-hint)' : 'var(--g-color-text-brand)',
          data: s.points.map((p) => ({x: p.timestamp, y: p.value})),
          lineWidth: s.comparison ? 2 : 3,
          dashStyle: s.comparison ? 'Dash' as const : 'Solid' as const,
          interpolation: {type: 'monotone' as const}, marker: {enabled: false},
        }))},
        xAxis: {type: 'datetime', grid: {enabled: false},
          labels: {dateTimeLabelFormats: {day: 'D MMM', week: 'D MMM', month: 'MMM'}}},
        yAxis: [{min: 0, title: {text: ''},
          labels: {numberFormat: {precision: 0, multiplier: 0.001, postfix: ' тыс.'}}}],
        legend: {enabled: false},
        tooltip: {headerFormat: {type: 'date', format: 'D MMMM YYYY'},
          valueFormat: {type: 'number', precision: 0, postfix: ' ₽', showRankDelimiter: true}},
      };
      return {type: 'gravity-charts' as const, data: chart};
    }
    const chart: YagrWidgetData = {
      data: {timeline: series[0]?.points.map((p) => p.timestamp) ?? [],
        graphs: series.map((s) => ({id: s.id, name: s.name, type: 'line' as const,
          color: 'var(--g-color-text-brand)', width: 1.5, data: s.points.map((p) => p.value)})),
        timeZone: 'UTC'},
      libraryConfig: {chart: {timeMultiplier: 1, select: {zoom: true}},
        scales: {y: {min: 0, max: 100}}, legend: {show: false}, tooltip: {show: true}},
    };
    return {type: 'yagr' as const, data: chart};
  }, [mode, data, showComparison]);
  const loadingView = () => <div className="chart-state" role="status"><Loader size="m" /><Text color="secondary">Загружаем график…</Text></div>;
  return <div className="chart-host" aria-label={mode === 'sales' ? 'График выручки' : 'График загрузки CPU'}>
    {loading ? loadingView() : error ? <div className="chart-state" role="alert">
      <Text variant="subheader-2">Не удалось получить данные</Text><Text color="secondary">{error}</Text>
      {onRetry && <Button onClick={onRetry}>Повторить</Button>}
    </div> : !data.series[0]?.points.length ? <div className="chart-state"><Text variant="subheader-2">Пока нет данных</Text><Text color="secondary">Выберите другой период или обновите данные.</Text></div> :
      <ChartKit key={mode} {...config} renderPluginLoader={loadingView}
        renderError={() => <div className="chart-state" role="alert">
          <Text variant="subheader-2">Не удалось построить график</Text><Text color="secondary">Проверьте соединение и попробуйте ещё раз.</Text>
          <Button onClick={() => window.location.reload()}>Перезагрузить страницу</Button>
        </div>} />}
  </div>;
}
