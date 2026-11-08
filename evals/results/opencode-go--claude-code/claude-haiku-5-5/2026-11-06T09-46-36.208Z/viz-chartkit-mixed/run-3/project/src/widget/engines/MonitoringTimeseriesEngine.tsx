import {useId, useMemo} from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

import type {ChartEngineProps, EngineSeries} from '../types';
import {alignToTimeline} from '../timeline';
import {registerChartkitPlugin} from './chartkit';

// Лениво загружаемый модуль. Импортирует плагин Yagr: canvas-движок для плотных рядов.
registerChartkitPlugin(YagrPlugin);

/** Плотный временной ряд: десятки тысяч точек на серию, общая шкала времени. */
function toYagrData(series: EngineSeries[]): YagrWidgetData {
  const {timeline, values} = alignToTimeline(series);
  return {
    data: {
      // Yagr по умолчанию принимает метки времени в миллисекундах, как и API виджета.
      timeline,
      graphs: series.map((s) => ({
        id: s.id,
        name: s.name,
        type: 'line',
        color: s.color,
        data: values.get(s.id)!,
      })),
    },
    libraryConfig: {
      // Легенда и подписи — в виджете. Тултип Yagr остаётся для наведения.
      legend: {show: false},
      tooltip: {show: true},
    },
  };
}

export default function MonitoringTimeseriesEngine({series}: ChartEngineProps) {
  const data = useMemo(() => toYagrData(series), [series]);
  // Уникальный id на экземпляр, чтобы несколько виджетов на странице не конфликтовали.
  const id = `yagr-${useId().replace(/:/g, '')}`;
  return (
    <div className="cw-engine">
      <ChartKit type="yagr" id={id} data={data} />
    </div>
  );
}
