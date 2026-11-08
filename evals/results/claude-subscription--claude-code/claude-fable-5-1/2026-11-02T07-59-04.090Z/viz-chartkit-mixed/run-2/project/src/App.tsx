import React from 'react';
import {Text} from '@gravity-ui/uikit';

import {ChartWidget} from './widget';
import type {ChartWidgetMode} from './widget';
import {createMonitoringDataset, createSalesDataset} from './demo/data';

export function App() {
    const data = React.useMemo(
        () => ({sales: createSalesDataset(), monitoring: createMonitoringDataset()}),
        [],
    );
    const [mode, setMode] = React.useState<ChartWidgetMode>('sales');

    return (
        <main style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 1100}}>
            <ChartWidget
                title={mode === 'sales' ? 'Выручка по каналам' : 'Нагрузка на веб-кластер'}
                data={data}
                mode={mode}
                onModeChange={setMode}
                height={380}
            />
            <Text color="secondary" variant="body-1">
                Движок графика загружается при первом включении режима: SVG (gravity-charts) для продаж,
                canvas (yagr/uPlot) для плотного ряда мониторинга.
            </Text>
        </main>
    );
}
