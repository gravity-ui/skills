import {Card, Flex, Text} from '@gravity-ui/uikit';

import {CpuChart} from './CpuChart';

export function MonitoringPage() {
  return (
    <Flex direction="column" gap={4} style={{padding: 24, height: '100vh', boxSizing: 'border-box'}}>
      <Text variant="header-1">Мониторинг</Text>
      <Card
        view="outlined"
        style={{flex: '1 1 0', minHeight: 240, minWidth: 0, padding: 16, boxSizing: 'border-box'}}
      >
        <Flex direction="column" gap={2} style={{height: '100%', minHeight: 0}}>
          <Text variant="subheader-2">Загрузка CPU за последние 24 часа</Text>
          <div style={{flex: '1 1 0', minHeight: 0, minWidth: 0}}>
            <CpuChart />
          </div>
        </Flex>
      </Card>
    </Flex>
  );
}
