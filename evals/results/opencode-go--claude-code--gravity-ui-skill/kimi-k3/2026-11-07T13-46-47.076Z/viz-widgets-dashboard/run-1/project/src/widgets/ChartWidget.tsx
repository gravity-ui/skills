import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';
import {Text} from '@gravity-ui/uikit';
import type {PluginWidgetProps} from '@gravity-ui/dashkit';

export type ChartWidgetData = {
  title: string;
  chartData: ChartData;
};

export function ChartWidget({data}: PluginWidgetProps) {
  const {title, chartData} = data as unknown as ChartWidgetData;

  return (
    <div className="widget widget-chart">
      <div className="widget__header">
        <Text className="widget__title" variant="subheader-2" ellipsis>
          {title}
        </Text>
      </div>
      <div className="widget__body">
        <Chart data={chartData} />
      </div>
    </div>
  );
}
