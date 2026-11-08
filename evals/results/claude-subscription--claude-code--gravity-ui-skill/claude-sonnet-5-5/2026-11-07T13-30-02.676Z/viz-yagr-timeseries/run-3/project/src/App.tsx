import React from 'react';
import {Card, Flex, Text} from '@gravity-ui/uikit';

import {CpuLoadChart} from './cpu-chart/CpuLoadChart';
import {createMockCpuSource} from './cpu-chart/cpuSource';

export function App() {
  // В реальном приложении здесь будет источник данных мониторинга.
  const source = React.useMemo(() => createMockCpuSource(), []);

  return (
    <Flex direction="column" gap={4} style={{padding: 24, height: '100vh', boxSizing: 'border-box'}}>
      <Text variant="header-1" style={{flexShrink: 0}}>
        Мониторинг
      </Text>
      <Card type="container" view="outlined" style={{flex: 1, minHeight: 0, minWidth: 0, padding: 16}}>
        <Flex direction="column" gap={3} style={{height: '100%'}}>
          <Text variant="subheader-2" style={{flexShrink: 0}}>
            Загрузка CPU за последние 24 часа
          </Text>
          <div style={{flex: 1, minHeight: 0, minWidth: 0}}>
            <CpuLoadChart source={source} />
          </div>
        </Flex>
      </Card>
    </Flex>
  );
}
