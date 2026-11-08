import React from 'react';
import {Text, Card, Flex, sp} from '@gravity-ui/uikit';
import type {PluginWidgetProps} from '@gravity-ui/dashkit';

interface MetricData {
    label: string;
    value: string;
    delta?: string;
    deltaPositive?: boolean;
}

export function MetricWidget(props: PluginWidgetProps<Record<string, string | string[]>>) {
    const data = props.data as unknown as MetricData | undefined;
    const label = data?.label ?? 'Metric';
    const value = data?.value ?? '—';
    const delta = data?.delta;

    const deltaColor = delta
        ? data?.deltaPositive
            ? 'var(--g-color-text-positive)'
            : 'var(--g-color-text-danger)'
        : undefined;

    return (
        <Card
            view="filled"
            style={{height: '100%', padding: 0}}
        >
            <Flex
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap={1}
                style={{height: '100%', padding: 'var(--g-spacing-4)'}}
            >
                <Text variant="subheader-1" color="secondary">
                    {label}
                </Text>
                <Text variant="display-2">{value}</Text>
                {delta && (
                    <Text variant="body-1" style={{color: deltaColor}}>
                        {delta}
                    </Text>
                )}
            </Flex>
        </Card>
    );
}
