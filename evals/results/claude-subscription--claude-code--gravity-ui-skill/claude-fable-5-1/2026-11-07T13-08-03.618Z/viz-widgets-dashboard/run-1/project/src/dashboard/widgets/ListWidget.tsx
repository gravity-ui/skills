import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {Flex, Label, Text} from '@gravity-ui/uikit';

import type {ListWidgetData} from '../types';
import {WidgetFrame} from './WidgetFrame';

export function ListWidget(props: PluginWidgetProps) {
    const data = props.data as unknown as ListWidgetData;

    return (
        <WidgetFrame title={data.title}>
            <Flex direction="column" gap={2}>
                {data.items.map((item, index) => (
                    <Flex key={index} alignItems="center" gap={2}>
                        <Label theme={item.theme ?? 'normal'} size="xs" className="dashboard-list__time">
                            {item.time}
                        </Label>
                        <Text variant="body-1" ellipsis style={{flex: 1, minWidth: 0}}>
                            {item.text}
                        </Text>
                    </Flex>
                ))}
            </Flex>
        </WidgetFrame>
    );
}
