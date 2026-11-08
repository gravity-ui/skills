import React from 'react';
import {Container, Flex, Text} from '@gravity-ui/uikit';

import {buildMonitoringDataset, buildSalesDataset} from './demoData';
import {VizWidget} from './viz-widget';

export function App() {
    const datasets = React.useMemo(
        () => ({
            sales: buildSalesDataset(),
            monitoring: buildMonitoringDataset(),
        }),
        [],
    );

    return (
        <Container maxWidth="l" style={{paddingBlock: 'var(--g-spacing-6)'}}>
            <Flex direction="column" gap={4}>
                <Text variant="header-1">Визуализация</Text>
                <VizWidget id="sales-vs-monitoring" datasets={datasets} defaultMode="sales" />
            </Flex>
        </Container>
    );
}
