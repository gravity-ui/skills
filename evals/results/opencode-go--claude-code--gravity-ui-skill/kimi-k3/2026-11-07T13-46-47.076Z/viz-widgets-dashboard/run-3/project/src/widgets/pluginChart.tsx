import React from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetFrame} from './WidgetFrame';

export type ChartWidgetData = {
    title: string;
    chart: ChartData;
};

/**
 * Factory for chart widgets rendered with @gravity-ui/charts.
 * The chart config lives in the widget `data`, so it is fully driven by the
 * dashboard config (and persists with it).
 */
export function createChartPlugin(type: string, defaultLayout: {w: number; h: number}): Plugin {
    function ChartWidget({data}: PluginWidgetProps) {
        const {title, chart} = data as ChartWidgetData;

        return (
            <WidgetFrame title={title}>
                <Chart data={chart} />
            </WidgetFrame>
        );
    }

    return {
        type,
        defaultLayout,
        renderer: (props) => <ChartWidget {...props} />,
    };
}
