import React from 'react';
import {Chart} from '@gravity-ui/charts';
import type {Plugin} from '@gravity-ui/dashkit';
import {ArrowDown, ArrowUp} from '@gravity-ui/icons';
import {Card, Flex, Icon, Label, Text} from '@gravity-ui/uikit';

import type {BarChartData, KpiData, LineChartData} from './types';

/** Common frame for every widget: a full-height card with a title row. */
function WidgetFrame({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <Card
            type="container"
            view="outlined"
            size="l"
            spacing={{p: 4}}
            style={{height: '100%', boxSizing: 'border-box'}}
        >
            <Flex direction="column" gap={3} style={{height: '100%', minHeight: 0}}>
                <Flex direction="column" gap={1} style={{flexShrink: 0}}>
                    <Text variant="subheader-2">{title}</Text>
                    {subtitle && (
                        <Text variant="caption-1" color="secondary">
                            {subtitle}
                        </Text>
                    )}
                </Flex>
                {children}
            </Flex>
        </Card>
    );
}

function KpiWidget({data}: {data: KpiData}) {
    return (
        <WidgetFrame title={data.label}>
            <Flex direction="column" gap={2} justifyContent="flex-end" style={{flex: 1, minHeight: 0}}>
                <Text variant="header-1">{data.value}</Text>
                {/* Icon + sign + text, so the direction never depends on color alone. */}
                <Label
                    theme={data.up ? 'success' : 'danger'}
                    size="s"
                    icon={<Icon data={data.up ? ArrowUp : ArrowDown} size={12} />}
                >
                    {data.delta}
                </Label>
            </Flex>
        </WidgetFrame>
    );
}

function LineChartWidget({data}: {data: LineChartData}) {
    const chartData = {
        series: {
            data: [
                {
                    type: 'line' as const,
                    name: 'Факт',
                    data: data.months.map((x, i) => ({x, y: data.fact[i]})),
                },
                {
                    type: 'line' as const,
                    name: 'План',
                    data: data.months.map((x, i) => ({x, y: data.plan[i]})),
                },
            ],
        },
        xAxis: {type: 'category' as const, categories: data.months},
        legend: {enabled: true},
    };

    return (
        <WidgetFrame title="Выручка по месяцам" subtitle="Факт и план, тыс. ₽">
            <div style={{flex: 1, minHeight: 0, position: 'relative'}}>
                <Chart data={chartData} />
            </div>
        </WidgetFrame>
    );
}

function BarChartWidget({data}: {data: BarChartData}) {
    const chartData = {
        series: {
            data: [
                {
                    type: 'bar-x' as const,
                    name: 'Выручка',
                    dataLabels: {enabled: true},
                    data: data.regions.map((x, i) => ({x, y: data.revenue[i]})),
                },
            ],
        },
        xAxis: {type: 'category' as const, categories: data.regions},
        // A single series needs no legend: the title names what is plotted.
        legend: {enabled: false},
    };

    return (
        <WidgetFrame title="Выручка по регионам" subtitle="млн ₽, текущий квартал">
            <div style={{flex: 1, minHeight: 0, position: 'relative'}}>
                <Chart data={chartData} />
            </div>
        </WidgetFrame>
    );
}

/**
 * Plugins for the custom widget types. Each is registered once with
 * DashKit.registerPlugins (see setup.ts) and driven by the item's `data`.
 */
export const WIDGET_PLUGINS: Plugin[] = [
    {
        type: 'kpi',
        defaultLayout: {w: 9, h: 4},
        renderer: (props) => <KpiWidget data={props.data as unknown as KpiData} />,
    },
    {
        type: 'line-chart',
        defaultLayout: {w: 18, h: 11},
        renderer: (props) => <LineChartWidget data={props.data as unknown as LineChartData} />,
    },
    {
        type: 'bar-chart',
        defaultLayout: {w: 18, h: 11},
        renderer: (props) => <BarChartWidget data={props.data as unknown as BarChartData} />,
    },
];
