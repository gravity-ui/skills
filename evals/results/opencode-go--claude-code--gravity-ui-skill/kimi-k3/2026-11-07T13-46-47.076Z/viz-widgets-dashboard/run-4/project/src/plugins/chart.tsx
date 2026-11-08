import React from 'react';

import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetFrame} from './WidgetFrame';

export interface ChartWidgetData {
    title: string;
    chart: ChartData;
}

/**
 * Chart widget plugin: renders a @gravity-ui/charts <Chart /> inside
 * the shared widget card. The chart config lives in the item's `data.chart`,
 * so different widgets of the same type can show different charts.
 */
const ChartWidget = React.forwardRef<HTMLDivElement, PluginWidgetProps>(
    function ChartWidget({data}, ref) {
        const {title, chart} = data as unknown as ChartWidgetData;

        return (
            <WidgetFrame title={title} ref={ref}>
                <Chart data={chart} lang="ru" />
            </WidgetFrame>
        );
    },
);

export const chartPlugin: Plugin = {
    type: 'chart',
    defaultLayout: {w: 18, h: 14, minW: 8, minH: 8},
    renderer(props, forwardedRef) {
        return <ChartWidget {...props} ref={forwardedRef as React.Ref<HTMLDivElement>} />;
    },
};
