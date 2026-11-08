import React from 'react';
import {Card} from '@gravity-ui/uikit';

import {CpuLoadChart} from './monitoring/CpuLoadChart';
import {createMockCpuLoadSource} from './monitoring/cpuLoadSource';

export function App() {
    // Источник должен быть стабильным: его смена пересоздаёт график.
    const source = React.useMemo(() => createMockCpuLoadSource(), []);

    return (
        <div style={{padding: 24}}>
            <Card view="outlined" style={{padding: 16, height: 400}}>
                <CpuLoadChart source={source} />
            </Card>
        </div>
    );
}
