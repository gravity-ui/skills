import ChartKit from '@gravity-ui/chartkit';
import type {MonitoringPoint} from './types';

type MonitoringChartProps = {
  data: MonitoringPoint[];
  className?: string;
};

export function MonitoringChart({data, className}: MonitoringChartProps) {
  const timeline = data.map((point) => point.timestamp);

  return (
    <div className={className}>
      <ChartKit
        type="yagr"
        id="monitoring-time-series"
        data={{
          data: {
            timeline,
            timeZone: 'UTC',
            graphs: [
              {
                id: 'response-time',
                name: 'Время ответа, мс',
                type: 'line',
                color: '#ed573f',
                data: data.map((point) => point.responseTimeMs),
              },
              {
                id: 'cpu-load',
                name: 'Нагрузка CPU, %',
                type: 'line',
                color: '#a855f7',
                data: data.map((point) => point.cpuLoad),
              },
            ],
          },
          libraryConfig: {
            timeline,
            title: {text: 'Мониторинг: высокая плотность точек'},
            chart: {
              series: {type: 'line', width: 1},
              appearance: {theme: 'light', locale: 'ru'},
            },
          },
        }}
      />
    </div>
  );
}
