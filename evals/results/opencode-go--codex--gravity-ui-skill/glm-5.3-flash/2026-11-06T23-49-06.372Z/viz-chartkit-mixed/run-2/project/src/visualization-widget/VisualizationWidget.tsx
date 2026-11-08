import {Box, SegmentedRadioGroup, Spin} from '@gravity-ui/uikit';
import React, {Suspense, useState} from 'react';

import type {
    LazyVisualizationEngine,
    VisualizationMode,
    VisualizationWidgetData,
} from './types';
import './VisualizationWidget.css';

const engines: Record<VisualizationMode, LazyVisualizationEngine> = {
    sales: React.lazy(() =>
        import('./SalesChart').then((module) => ({default: module.SalesChart})),
    ),
    monitoring: React.lazy(() =>
        import('./MonitoringChart').then((module) => ({
            default: module.MonitoringChart,
        })),
    ),
};

const modeOptions: Array<{value: VisualizationMode; content: string}> = [
    {value: 'sales', content: 'Продажи'},
    {value: 'monitoring', content: 'Мониторинг'},
];

interface VisualizationWidgetProps {
    data: VisualizationWidgetData;
}

export function VisualizationWidget({data}: VisualizationWidgetProps) {
    const [mode, setMode] = useState<VisualizationMode>(data.mode);
    const Engine = engines[mode];
    const hasModeData = mode === 'sales' ? Boolean(data.sales) : Boolean(data.monitoring);

    return (
        <Box className="visualization-widget">
            <SegmentedRadioGroup
                aria-label="Режим визуализации"
                name="visualization-mode"
                size="m"
                value={mode}
                onUpdate={setMode}
                options={modeOptions}
            />
            <Box className="visualization-widget__chart">
                <Suspense fallback={<Spin size="m" />}>
                    {hasModeData ? <Engine data={data} /> : null}
                </Suspense>
            </Box>
        </Box>
    );
}
