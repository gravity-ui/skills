import React from 'react';

import {createMonitoringDataset, createSalesDataset} from './demo-data';
import {VizWidget, type VizDataset, type VizMode} from './viz';

export function App() {
    const datasets = React.useMemo<Record<VizMode, VizDataset>>(
        () => ({sales: createSalesDataset(), monitoring: createMonitoringDataset()}),
        [],
    );

    return (
        <div style={{padding: 24, maxWidth: 1200, margin: '0 auto'}}>
            <VizWidget title="Динамика показателей" datasets={datasets} />
        </div>
    );
}
