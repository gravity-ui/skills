import React from 'react';

import {ChartWidget} from './chart-widget';
import type {ChartWidgetView} from './chart-widget';
import {createMonitoringData, createSalesData} from './demo-data';

type ViewId = 'sales' | 'monitoring';

export function App() {
    const views = React.useMemo<ChartWidgetView<ViewId>[]>(
        () => [
            {
                id: 'sales',
                label: 'Продажи',
                kind: 'line',
                description: 'Выручка по месяцам, ноябрь 2024 — октябрь 2026',
                data: createSalesData(),
            },
            {
                id: 'monitoring',
                label: 'Мониторинг',
                kind: 'dense',
                description: 'Загрузка CPU, поминутно за 7 дней. Выделите участок мышью для зума',
                data: createMonitoringData(),
            },
        ],
        [],
    );

    return (
        <div style={{padding: 24, maxWidth: 1100, margin: '0 auto'}}>
            <ChartWidget title="Аналитика" views={views} defaultValue="sales" height={380} />
        </div>
    );
}
