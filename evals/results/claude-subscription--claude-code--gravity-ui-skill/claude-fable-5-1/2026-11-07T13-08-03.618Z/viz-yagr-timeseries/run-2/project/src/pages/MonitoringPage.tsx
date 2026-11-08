import * as React from 'react';
import {Box, Card, Flex, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from '../features/cpu-load/CpuLoadChart';
import {createMockCpuLoadSource} from '../features/cpu-load/cpuLoadSource';

export function MonitoringPage() {
    // Один источник на время жизни страницы; при размонтировании подписки
    // снимаются внутри CpuLoadChart.
    const cpuSource = React.useMemo(() => createMockCpuLoadSource(), []);

    return (
        <Box spacing={{p: 6}}>
            <Flex direction="column" gap={5}>
                <Text variant="header-1">Мониторинг</Text>
                <Card type="container" view="outlined" size="l">
                    <CpuLoadChart source={cpuSource} />
                </Card>
            </Flex>
        </Box>
    );
}
