import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {Flex, Progress, Text} from '@gravity-ui/uikit';
import type {ProgressTheme} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

export interface ProgressWidgetItem {
  name: string;
  /** Процент от 0 до 100. */
  value: number;
}

export interface ProgressWidgetData {
  title: string;
  items: ProgressWidgetItem[];
}

function themeByValue(value: number): ProgressTheme {
  if (value >= 90) return 'danger';
  if (value >= 70) return 'warning';
  return 'success';
}

export function ProgressWidget(props: PluginWidgetProps) {
  const data = props.data as unknown as ProgressWidgetData;

  return (
    <WidgetFrame title={data.title}>
      <Flex direction="column" gap={3}>
        {data.items.map((item) => (
          <Flex key={item.name} direction="column" gap={1}>
            <Flex alignItems="center" gap={2}>
              <Text variant="body-1" ellipsis style={{flex: 1, minWidth: 0}}>
                {item.name}
              </Text>
              <Text variant="body-1" color="secondary" style={{flexShrink: 0}}>
                {item.value}%
              </Text>
            </Flex>
            <Progress value={item.value} size="s" theme={themeByValue(item.value)} />
          </Flex>
        ))}
      </Flex>
    </WidgetFrame>
  );
}
