import React from 'react';

import {VisualizationWidget} from './widget';
import type {VisualizationView} from './widget';
import {createMonitoringDataset, createSalesDataset} from './demo-data';

type ViewId = 'sales' | 'monitoring';

export function App() {
    // Datasets are built once; in a real app they would come from an API.
    const views = React.useMemo<VisualizationView<ViewId>[]>(
        () => [
            {
                id: 'sales',
                label: 'Продажи',
                engine: 'line',
                data: createSalesDataset(),
                yAxisTitle: 'Выручка, тыс. ₽',
                precision: 0,
            },
            {
                id: 'monitoring',
                label: 'Мониторинг',
                engine: 'timeseries',
                data: createMonitoringDataset(),
                yAxisTitle: 'CPU, %',
                precision: 1,
            },
        ],
        [],
    );

    return (
        <div style={{padding: 'var(--g-spacing-6)', maxWidth: 1200, margin: '0 auto'}}>
            <VisualizationWidget<ViewId>
                title="Аналитика сервиса"
                description="Продажи по каналам за 12 месяцев и загрузка CPU хостов за последние сутки"
                views={views}
                defaultView="sales"
            />
        </div>
    );
}
