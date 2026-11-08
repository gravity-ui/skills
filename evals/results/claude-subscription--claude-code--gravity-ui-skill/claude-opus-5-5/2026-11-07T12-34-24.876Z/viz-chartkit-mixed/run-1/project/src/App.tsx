import * as React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

import {VisualizationWidget} from './visualization';
import type {TimeSeriesDataset, VisualizationMode} from './visualization';
import {createMonitoringDataset, createSalesDataset} from './visualization/mock-data';

export function App() {
    const datasets = React.useMemo<Record<VisualizationMode, TimeSeriesDataset>>(
        () => ({sales: createSalesDataset(), monitoring: createMonitoringDataset()}),
        [],
    );

    return (
        <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)', maxWidth: 1200, margin: '0 auto'}}>
            <Text variant="header-1">Аналитика</Text>
            <VisualizationWidget title="Продажи и мониторинг сервиса" datasets={datasets} height={380} />
        </Flex>
    );
}
