import * as React from 'react';
import {Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './monitoring/CpuLoadChart';
import {createMockCpuLoadSource} from './monitoring/mockCpuLoadSource';

export function App() {
    // Источник создаётся один раз: смена ссылки пересоздала бы график и подписку.
    const cpuLoadSource = React.useMemo(() => createMockCpuLoadSource(), []);

    return (
        <main style={{display: 'flex', flexDirection: 'column', gap: 16, padding: 24}}>
            <Text as="h1" variant="header-1" style={{margin: 0}}>
                Мониторинг
            </Text>
            <div style={{height: 'clamp(320px, 60vh, 560px)'}}>
                <CpuLoadChart source={cpuLoadSource} />
            </div>
        </main>
    );
}
