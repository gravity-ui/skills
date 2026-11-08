import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {ArrowDown, ArrowUp} from '@gravity-ui/icons';
import {Flex, Icon, Text} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

export interface MetricWidgetData {
  title: string;
  value: number;
  unit?: string;
  /** Изменение к прошлому периоду, в процентах. */
  delta?: number;
  caption?: string;
}

export function MetricWidget(props: PluginWidgetProps) {
  const data = props.data as unknown as MetricWidgetData;
  const delta = data.delta ?? 0;
  const positive = delta >= 0;

  return (
    <WidgetFrame title={data.title}>
      <Flex direction="column" gap={1} justifyContent="center" style={{height: '100%'}}>
        <Flex alignItems="baseline" gap={1}>
          <Text variant="display-1">{data.value.toLocaleString('ru-RU')}</Text>
          {data.unit ? (
            <Text variant="body-2" color="secondary">
              {data.unit}
            </Text>
          ) : null}
        </Flex>
        {data.delta !== undefined ? (
          <Flex alignItems="center" gap={1}>
            <Text variant="body-1" color={positive ? 'positive' : 'danger'}>
              <Icon data={positive ? ArrowUp : ArrowDown} size={14} /> {Math.abs(delta)}%
            </Text>
            {data.caption ? (
              <Text variant="body-1" color="secondary">
                {data.caption}
              </Text>
            ) : null}
          </Flex>
        ) : null}
      </Flex>
    </WidgetFrame>
  );
}
