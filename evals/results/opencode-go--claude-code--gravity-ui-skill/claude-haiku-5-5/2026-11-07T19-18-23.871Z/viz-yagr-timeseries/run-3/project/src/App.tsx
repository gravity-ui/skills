import {Box, Flex, Text} from '@gravity-ui/uikit';

import {CpuUsageChart} from './cpu/CpuUsageChart';

export function App() {
    return (
        <Box spacing={{p: 6}} style={{height: '100vh', boxSizing: 'border-box'}}>
            <Flex direction="column" gap={4} style={{height: '100%'}}>
                <Text variant="header-1">Мониторинг</Text>
                <Text variant="body-1" color="secondary">
                    Загрузка CPU за последние 24 часа. Обновляется каждые 2 с.
                </Text>
                <Box style={{flex: 1, minHeight: 0}}>
                    <CpuUsageChart />
                </Box>
            </Flex>
        </Box>
    );
}
