import {Card, Flex, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './monitoring/CpuLoadChart';

export function App() {
    return (
        <Flex direction="column" gap={4} spacing={{p: 6}} style={{height: '100vh', boxSizing: 'border-box'}}>
            <Text variant="header-1">Мониторинг</Text>
            <Card view="outlined" size="l" spacing={{p: 4}} style={{flex: 1, minHeight: 0}}>
                <Flex direction="column" gap={3} style={{height: '100%'}}>
                    <Text variant="header-2">Загрузка CPU за последние сутки</Text>
                    <div style={{flex: 1, minHeight: 0}}>
                        <CpuLoadChart />
                    </div>
                </Flex>
            </Card>
        </Flex>
    );
}
