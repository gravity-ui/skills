import {useMemo} from 'react';
import {Box, Text} from '@gravity-ui/uikit';

import {createMonitoringData, createSalesData} from './data/demo';
import {VizWidget} from './widgets/VizWidget';
import type {VizView} from './widgets/VizWidget';

export function App() {
    const views = useMemo<VizView[]>(
        () => [
            {
                id: 'sales',
                label: 'Продажи',
                engine: 'line',
                description: 'Выручка по месяцам за последние два года, тыс. ₽',
                dateFormat: 'MMM YY',
                valueFormat: {precision: 0, postfix: ' тыс. ₽'},
                data: createSalesData(),
            },
            {
                id: 'monitoring',
                label: 'Мониторинг',
                engine: 'timeseries',
                description: 'Запросов в секунду по узлам, шаг 5 с, последние 24 часа',
                valueFormat: {precision: 0, postfix: ' rps'},
                data: createMonitoringData(),
            },
        ],
        [],
    );

    return (
        <Box spacing={{p: 6}} maxWidth={1100} style={{marginInline: 'auto'}}>
            <Box spacing={{mb: 4}}>
                <Text as="h1" variant="header-1">
                    Визуализация
                </Text>
            </Box>
            <VizWidget title="Продажи и мониторинг" views={views} defaultViewId="sales" />
        </Box>
    );
}
