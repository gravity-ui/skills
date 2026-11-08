import React from 'react';
import {Box, Flex, Text, useThemeValue} from '@gravity-ui/uikit';

import {CpuUsageChart} from './cpu-usage-chart';

export function MonitoringPage() {
  const theme = useThemeValue() === 'dark' ? 'dark' : 'light';

  return (
    <Box spacing={{p: 4}} style={{height: '100%'}}>
      <Flex direction="column" height="100%" gap={2}>
        <Text variant="header-1">Мониторинг</Text>
        <Text variant="body-1">Загрузка CPU за последние сутки</Text>
        <div className="cpu-usage-chart">
          <CpuUsageChart points={[]} theme={theme} />
        </div>
      </Flex>
    </Box>
  );
}
