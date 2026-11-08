import React, {Suspense} from 'react';
import {SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import type {ChartMode, VizWidgetProps} from './types';

const SalesChartLazy = React.lazy(() =>
    import('./SalesChart').then((mod) => ({default: mod.SalesChart})),
);

const MonitoringChartLazy = React.lazy(() =>
    import('./MonitoringChart').then((mod) => ({default: mod.MonitoringChart})),
);

const MODE_OPTIONS = [
    {value: 'sales' as const, content: 'Продажи'},
    {value: 'monitoring' as const, content: 'Мониторинг'},
];

const DEFAULT_HEIGHT = 400;

function ChartFallback() {
    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text variant="body-2" color="secondary">
                Загрузка графика…
            </Text>
        </div>
    );
}

export function VizWidget({
    mode,
    onChangeMode,
    salesData,
    monitoringData,
    height = DEFAULT_HEIGHT,
    className,
}: VizWidgetProps) {
    return (
        <div className={className}>
            <SegmentedRadioGroup
                value={mode}
                onUpdate={onChangeMode}
                name="chart-mode"
                size="m"
                width="auto"
            >
                {MODE_OPTIONS.map((opt) => (
                    <SegmentedRadioGroup.Option
                        key={opt.value}
                        value={opt.value}
                        content={opt.content}
                    />
                ))}
            </SegmentedRadioGroup>

            <div style={{marginTop: 12, height}}>
                <Suspense fallback={<ChartFallback />}>
                    {mode === 'sales' ? (
                        <SalesChartLazy data={salesData} height={height} />
                    ) : (
                        <MonitoringChartLazy data={monitoringData} height={height} />
                    )}
                </Suspense>
            </div>
        </div>
    );
}
