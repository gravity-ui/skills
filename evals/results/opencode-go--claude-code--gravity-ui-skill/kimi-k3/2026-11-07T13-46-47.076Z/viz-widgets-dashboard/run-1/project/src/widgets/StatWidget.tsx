import {Text} from '@gravity-ui/uikit';
import type {PluginWidgetProps} from '@gravity-ui/dashkit';

export type StatWidgetData = {
  title: string;
  value: string;
  /** Week-over-week change in percents; negative values mean a decline. */
  delta: number;
};

export function StatWidget({data}: PluginWidgetProps) {
  const {title, value, delta} = data as unknown as StatWidgetData;
  const positive = delta >= 0;

  return (
    <div className="widget widget-stat">
      <div className="widget__header">
        <Text className="widget__title" variant="body-2" color="secondary" ellipsis>
          {title}
        </Text>
      </div>
      <Text variant="display-2">{value}</Text>
      <Text
        className="widget-stat__delta"
        variant="body-2"
        color={positive ? 'positive' : 'danger'}
      >
        {positive ? '↑' : '↓'} {Math.abs(delta)}% за неделю
      </Text>
    </div>
  );
}
