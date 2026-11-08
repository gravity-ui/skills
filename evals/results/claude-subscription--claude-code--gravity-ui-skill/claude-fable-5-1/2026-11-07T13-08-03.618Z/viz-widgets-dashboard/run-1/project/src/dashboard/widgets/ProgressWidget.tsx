import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {Flex, Progress, Text} from '@gravity-ui/uikit';

import type {ProgressWidgetData} from '../types';
import {WidgetFrame} from './WidgetFrame';

export function ProgressWidget(props: PluginWidgetProps) {
    const data = props.data as unknown as ProgressWidgetData;

    return (
        <WidgetFrame title={data.title}>
            <Flex direction="column" gap={3}>
                {data.items.map((item) => (
                    <Flex key={item.label} direction="column" gap={1}>
                        <Flex justifyContent="space-between" gap={2}>
                            <Text variant="body-1" ellipsis style={{flex: 1, minWidth: 0}}>
                                {item.label}
                            </Text>
                            <Text variant="body-1" color="secondary" style={{flexShrink: 0}}>
                                {item.value}%
                            </Text>
                        </Flex>
                        <Progress value={item.value} theme={item.theme ?? 'default'} size="s" />
                    </Flex>
                ))}
            </Flex>
        </WidgetFrame>
    );
}
