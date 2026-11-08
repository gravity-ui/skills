import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {Flex, Label, Text} from '@gravity-ui/uikit';

import type {MetricWidgetData} from '../types';
import {WidgetFrame} from './WidgetFrame';

export function MetricWidget(props: PluginWidgetProps) {
    const data = props.data as unknown as MetricWidgetData;
    const delta = data.delta;
    const deltaTheme = delta === undefined ? undefined : delta >= 0 ? 'success' : 'danger';
    const deltaText = delta === undefined ? null : `${delta > 0 ? '+' : ''}${delta}%`;

    return (
        <WidgetFrame title={data.title}>
            <Flex direction="column" gap={2} className="dashboard-metric">
                <Flex alignItems="baseline" gap={1}>
                    <Text variant="display-2">{data.value}</Text>
                    {data.unit ? (
                        <Text variant="body-2" color="secondary">
                            {data.unit}
                        </Text>
                    ) : null}
                </Flex>
                <Flex alignItems="center" gap={2}>
                    {deltaText ? (
                        <Label theme={deltaTheme} size="xs">
                            {deltaText}
                        </Label>
                    ) : null}
                    {data.caption ? (
                        <Text variant="caption-2" color="secondary" ellipsis>
                            {data.caption}
                        </Text>
                    ) : null}
                </Flex>
            </Flex>
        </WidgetFrame>
    );
}
