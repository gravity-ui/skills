import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Flex, Progress, Text} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

export interface MeterWidgetData {
    title: string;
    items: {name: string; value: number; max: number; unit?: string}[];
}

function MeterWidget({data}: PluginWidgetProps) {
    const {title, items} = data as unknown as MeterWidgetData;

    return (
        <WidgetFrame title={title}>
            <Flex direction="column" gap={3} justifyContent="center" grow>
                {items.map((item) => {
                    const percent = Math.min(100, Math.round((item.value / item.max) * 100));
                    return (
                        <Flex key={item.name} direction="column" gap={1}>
                            <Flex justifyContent="space-between" gap={2}>
                                <Text variant="body-1" ellipsis style={{flex: 1, minWidth: 0}}>
                                    {item.name}
                                </Text>
                                <Text variant="body-1" color="secondary" style={{flexShrink: 0}}>
                                    {item.value.toLocaleString('ru-RU')} / {item.max.toLocaleString('ru-RU')}
                                    {item.unit ? ` ${item.unit}` : ''}
                                </Text>
                            </Flex>
                            <Progress
                                size="s"
                                value={percent}
                                colorStops={[
                                    {theme: 'info', stop: 70},
                                    {theme: 'warning', stop: 90},
                                    {theme: 'danger', stop: 100},
                                ]}
                            />
                        </Flex>
                    );
                })}
            </Flex>
        </WidgetFrame>
    );
}

export const meterPlugin: Plugin = {
    type: 'meter',
    defaultLayout: {w: 12, h: 10, minW: 8, minH: 6},
    renderer: (props) => <MeterWidget {...props} />,
};
