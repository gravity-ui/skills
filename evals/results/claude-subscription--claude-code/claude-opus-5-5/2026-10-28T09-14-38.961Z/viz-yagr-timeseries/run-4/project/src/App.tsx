import React from 'react';
import {Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './monitoring/CpuLoadChart';
import {createMockCpuLoadSource} from './monitoring/cpuLoadSource';

export function App() {
    // Демо-источник; в продукте сюда передаётся клиент к API метрик.
    const [cpuSource] = React.useState(() => createMockCpuLoadSource());

    return (
        <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
            <Text as="h1" variant="header-1" style={{margin: 0}}>
                Мониторинг
            </Text>
            <CpuLoadChart source={cpuSource} />
        </div>
    );
}
