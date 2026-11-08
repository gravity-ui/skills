// Implement the requested feature here (and may add sibling files).
import React from 'react';
import {Flex} from '@gravity-ui/uikit';

import {
    VisualizationWidget,
    type VisualizationMode,
    type VisualizationWidgetData,
} from './VisualizationWidget';

const salesData = {
    title: {text: 'Продажи за неделю'},
    xAxis: {type: 'datetime'},
    yAxis: [{title: {text: 'Продажи'}}],
    series: {
        data: [
            {
                type: 'line',
                name: 'Продажи',
                data: [
                    {x: 1764374400000, y: 320},
                    {x: 1764460800000, y: 410},
                    {x: 1764547200000, y: 375},
                    {x: 1764633600000, y: 520},
                    {x: 1764720000000, y: 480},
                    {x: 1764806400000, y: 610},
                    {x: 1764892800000, y: 580},
                ],
            },
        ],
    },
} satisfies VisualizationWidgetData['sales'];

const monitoringTimeline = Array.from(
    {length: 120},
    (_, index) => 1764374400000 + index * 60_000,
);

const monitoringData = {
    data: {
        timeline: monitoringTimeline,
        graphs: [
            {
                name: 'CPU',
                type: 'line',
                data: monitoringTimeline.map((_, index) => 35 + Math.sin(index / 9) * 18),
            },
            {
                name: 'Память',
                type: 'line',
                data: monitoringTimeline.map((_, index) => 52 + Math.cos(index / 13) * 7),
            },
        ],
    },
    libraryConfig: {
        title: {text: 'Мониторинг сервисов'},
    },
} satisfies VisualizationWidgetData['monitoring'];

export function App() {
    const [mode, setMode] = React.useState<VisualizationMode>('sales');

    return (
        <Flex justifyContent="center" style={{padding: 24}}>
            <VisualizationWidget
                data={{sales: salesData, monitoring: monitoringData}}
                mode={mode}
                onModeChange={setMode}
            />
        </Flex>
    );
}
