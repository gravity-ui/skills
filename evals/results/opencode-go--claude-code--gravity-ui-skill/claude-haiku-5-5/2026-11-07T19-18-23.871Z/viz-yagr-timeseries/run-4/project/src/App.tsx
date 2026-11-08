import {Box, Card, Flex, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './cpu/CpuLoadChart';
import {createMockCpuSource} from './cpu/mockCpuSource';

// Created once at module load. It starts no timers until the chart subscribes.
const cpuSource = createMockCpuSource();

export function App() {
    return (
        <Box spacing={{p: 6}} style={{height: '100vh', boxSizing: 'border-box'}}>
            <Flex direction="column" gap={4} style={{height: '100%'}}>
                <Flex direction="column" gap={1} style={{flexShrink: 0}}>
                    <Text variant="header-1">Мониторинг</Text>
                    <Text variant="body-2" color="secondary">
                        Состояние сервера за последние сутки
                    </Text>
                </Flex>

                <Card view="outlined" size="l" style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
                    <Flex direction="column" gap={2} style={{flex: 1, minHeight: 0}}>
                        <Flex direction="column" gap={1} style={{flexShrink: 0}}>
                            <Text variant="subheader-2">Загрузка CPU, %</Text>
                            <Text variant="caption-1" color="secondary">
                                Выделите область мышью, чтобы приблизить. Двойной клик сбрасывает масштаб.
                            </Text>
                        </Flex>
                        <div style={{flex: 1, minHeight: 0, position: 'relative'}}>
                            <CpuLoadChart source={cpuSource} />
                        </div>
                    </Flex>
                </Card>
            </Flex>
        </Box>
    );
}
