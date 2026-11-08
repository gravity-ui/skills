import React from 'react';

import {ChartWidget} from './chart-widget';
import {createDemoDatasets} from './demo-data';

export function App() {
    const datasets = React.useMemo(createDemoDatasets, []);

    return (
        <div style={{padding: 24, maxWidth: 1100, margin: '0 auto'}}>
            <ChartWidget datasets={datasets} />
        </div>
    );
}
