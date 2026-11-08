import {useMemo} from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';

import type {ChartEngineProps, EngineSeries} from '../types';
import {registerChartkitPlugin} from './chartkit';

// Этот модуль загружается лениво. Он импортирует плагин Gravity Charts, который тянет
// за собой @gravity-ui/charts. Пока режим «Продажи» не открыт, этот код не грузится.
registerChartkitPlugin(GravityChartsPlugin);

/** Обычный линейный график: до нескольких десятков точек на серию. */
function toGravityChartData(series: EngineSeries[]): ChartData {
  return {
    // Легенду рисует виджет, чтобы оба режима показывали её одинаково.
    legend: {enabled: false},
    xAxis: {type: 'datetime'},
    series: {
      data: series.map((s) => ({
        type: 'line',
        id: s.id,
        name: s.name,
        color: s.color,
        lineWidth: 2,
        // Точек мало, поэтому маркеры каждой точки помогают. Диаметр 8px.
        marker: {enabled: true, radius: 4},
        data: s.points.map((p) => ({x: p.x, y: p.y})),
      })),
    },
  };
}

export default function SalesLineEngine({series}: ChartEngineProps) {
  const data = useMemo(() => toGravityChartData(series), [series]);
  return (
    <div className="cw-engine">
      <ChartKit type="gravity-charts" data={data} />
    </div>
  );
}
