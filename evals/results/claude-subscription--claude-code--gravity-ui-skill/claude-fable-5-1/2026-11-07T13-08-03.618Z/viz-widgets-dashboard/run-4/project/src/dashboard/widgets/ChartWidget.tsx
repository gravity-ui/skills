import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';
import {useMemo} from 'react';

import {WidgetFrame} from './WidgetFrame';

export interface ChartWidgetData {
    title: string;
    seriesName: string;
    categories: string[];
    values: number[];
}

function ChartWidget({data}: PluginWidgetProps) {
    const {title, seriesName, categories, values} = data as unknown as ChartWidgetData;

    const chartData = useMemo<ChartData>(
        () => ({
            chart: {margin: {top: 8, right: 8, bottom: 0, left: 0}},
            legend: {enabled: false},
            xAxis: {type: 'category', categories},
            yAxis: [{lineVisible: false}],
            series: {
                data: [
                    {
                        type: 'bar-x',
                        name: seriesName,
                        borderRadius: 4,
                        data: values.map((y, i) => ({x: i, y})),
                    },
                ],
            },
        }),
        [categories, seriesName, values],
    );

    return (
        <WidgetFrame title={title}>
            <div className="dashboard-widget__chart">
                <Chart data={chartData} />
            </div>
        </WidgetFrame>
    );
}

export const chartPlugin: Plugin = {
    type: 'chart',
    defaultLayout: {w: 18, h: 14, minW: 9, minH: 8},
    renderer: (props) => <ChartWidget {...props} />,
};
