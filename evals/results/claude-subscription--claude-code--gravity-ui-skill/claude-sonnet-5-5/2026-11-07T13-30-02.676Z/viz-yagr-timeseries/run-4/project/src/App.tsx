import React from 'react';
import {Card, Flex, Text} from '@gravity-ui/uikit';

import {CpuChart} from './cpu/CpuChart';
import {createMockCpuSource} from './cpu/cpuSource';

export function App() {
  const source = React.useMemo(() => createMockCpuSource(), []);

  return (
    <Flex direction="column" gap={4} style={{height: '100vh', minHeight: 360, boxSizing: 'border-box', padding: 'var(--g-spacing-6)'}}>
      <Flex direction="column" gap={1} style={{flexShrink: 0}}>
        <Text variant="header-1">Мониторинг</Text>
        <Text variant="body-1" color="secondary">
          Загрузка CPU за последние 24 часа
        </Text>
      </Flex>
      <Card
        type="container"
        view="outlined"
        style={{flex: 1, minHeight: 0, minWidth: 0, padding: 'var(--g-spacing-4)'}}
      >
        <CpuChart source={source} />
      </Card>
    </Flex>
  );
}
