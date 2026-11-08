import ChartKit from '@gravity-ui/chartkit';
import type {SalesPoint} from './types';

type SalesChartProps = {
  data: SalesPoint[];
  className?: string;
};

export function SalesChart({data, className}: SalesChartProps) {
  const timeline = data.map((point) => Date.parse(point.date));

  return (
    <div className={className}>
      <ChartKit
        type="yagr"
        id="sales-line-chart"
        data={{
          data: {
            timeline,
            graphs: [
              {
                id: 'revenue',
                name: 'Выручка, ₽',
                type: 'line',
                color: '#3f80ed',
                data: data.map((point) => point.revenue),
              },
              {
                id: 'orders',
                name: 'Заказы',
                type: 'line',
                color: '#25b387',
                data: data.map((point) => point.orders),
              },
            ],
          },
          libraryConfig: {
            timeline,
            title: {text: 'Продажи за две недели'},
            chart: {
              series: {type: 'line', width: 2},
              appearance: {theme: 'light', locale: 'ru'},
            },
          },
        }}
      />
    </div>
  );
}
