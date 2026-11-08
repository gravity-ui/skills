import YagrComponent from '@gravity-ui/yagr/react';
import '@gravity-ui/yagr/index.css';

import type {VisualizationEngineProps} from './types';

export function MonitoringChart({data}: VisualizationEngineProps) {
    const monitoring = data.monitoring;

    if (!monitoring) {
        return null;
    }

    return (
        <YagrComponent
            id="monitoring-realtime-chart"
            config={{
                timeline: monitoring.timeline,
                series: monitoring.series.map((series) => ({
                    name: series.name,
                    color: series.color,
                    data: series.data,
                    type: 'line' as const,
                    scale: 'y',
                })),
                scales: {y: {}},
                chart: {
                    appearance: {
                        theme: 'light',
                    },
                    size: {
                        adaptive: true,
                    },
                },
                cursor: {
                    snapToValues: false,
                },
            }}
        />
    );
}
