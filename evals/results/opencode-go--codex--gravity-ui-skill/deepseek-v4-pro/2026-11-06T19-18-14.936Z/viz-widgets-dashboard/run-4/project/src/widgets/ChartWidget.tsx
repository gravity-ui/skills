import React from 'react';
import {Text, Card, Flex} from '@gravity-ui/uikit';
import type {PluginWidgetProps} from '@gravity-ui/dashkit';

interface ChartData {
    title?: string;
}

export function ChartWidget(props: PluginWidgetProps<Record<string, string | string[]>>) {
    const data = props.data as unknown as ChartData | undefined;
    const title = data?.title ?? 'Chart';

    return (
        <Card view="filled" style={{height: '100%', padding: 0}}>
            <Flex
                direction="column"
                gap={2}
                style={{height: '100%', padding: 'var(--g-spacing-4)'}}
            >
                <Text variant="subheader-1">{title}</Text>
                <Flex
                    alignItems="flex-end"
                    justifyContent="space-around"
                    gap={1}
                    style={{
                        flex: 1,
                        minHeight: 0,
                        paddingBottom: 'var(--g-spacing-2)',
                    }}
                >
                    {[60, 85, 45, 90, 70, 55, 80].map((val, i) => (
                        <Flex key={i} direction="column" alignItems="center" gap={0.5}>
                            <Text variant="caption-1" color="secondary">{val}%</Text>
                            <div
                                style={{
                                    width: 32,
                                    height: `${val * 0.8}%`,
                                    background:
                                        'linear-gradient(to top, var(--g-color-base-brand), var(--g-color-base-brand-hover))',
                                    borderRadius: 'var(--g-border-radius-xs)',
                                }}
                            />
                            <Text variant="caption-1" color="secondary">Q{i + 1}</Text>
                        </Flex>
                    ))}
                </Flex>
            </Flex>
        </Card>
    );
}
