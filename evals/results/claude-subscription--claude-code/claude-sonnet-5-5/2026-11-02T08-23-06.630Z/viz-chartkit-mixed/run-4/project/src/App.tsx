import React from 'react';
import {Text} from '@gravity-ui/uikit';

import {createDemoData} from './demoData';
import {ChartWidget} from './widget';
import type {ChartMode} from './widget';

export function App() {
  const data = React.useMemo(createDemoData, []);
  const [mode, setMode] = React.useState<ChartMode>('sales');

  return (
    <div style={{padding: 24, maxWidth: 1100}}>
      <Text variant="header-1" as="h1" style={{margin: '0 0 16px'}}>
        Дашборд
      </Text>
      <ChartWidget data={data} mode={mode} onModeChange={setMode} />
    </div>
  );
}
