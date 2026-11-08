import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

import {buildMonitoringData, buildSalesData} from './data/sampleData';
import {VisualizationWidget} from './widgets/VisualizationWidget';
import type {VisualizationMode} from './widgets/VisualizationWidget';

export function App() {
    const salesData = React.useMemo(() => buildSalesData(), []);
    const monitoringData = React.useMemo(() => buildMonitoringData(), []);
    const [mode, setMode] = React.useState<VisualizationMode>('sales');

    return (
        <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)', maxWidth: 1100}}>
            <Text variant="header-1">Визуализация</Text>
            <VisualizationWidget
                title="Продажи и мониторинг"
                mode={mode}
                onModeChange={setMode}
                salesData={salesData}
                monitoringData={monitoringData}
                height={360}
            />
        </Flex>
    );
}
