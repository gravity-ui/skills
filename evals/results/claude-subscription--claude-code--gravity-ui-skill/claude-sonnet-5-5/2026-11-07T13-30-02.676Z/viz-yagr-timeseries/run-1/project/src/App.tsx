import React from 'react';

import {Button, Card, Flex, Label, Text} from '@gravity-ui/uikit';

import {CpuChart, type CpuChartHandle} from './monitoring/CpuChart';
import {useCpuSource} from './monitoring/useCpuSource';

export function App() {
  const source = useCpuSource();
  const chartRef = React.useRef<CpuChartHandle>(null);
  const [zoomed, setZoomed] = React.useState(false);

  return (
    <Flex direction="column" gap={4} style={{height: '100vh', minHeight: 360, padding: 24, boxSizing: 'border-box'}}>
      <Text variant="header-1" style={{flexShrink: 0}}>
        Мониторинг
      </Text>

      <Card
        type="container"
        view="outlined"
        style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: 16}}
      >
        <Flex alignItems="center" gap={3} style={{flexShrink: 0, marginBottom: 12}}>
          <Text variant="subheader-2" style={{flex: 1, minWidth: 0}}>
            Загрузка CPU за последние 24 часа
          </Text>
          {zoomed ? (
            <>
              <div style={{flexShrink: 0}}>
                <Label theme="warning">Обновление приостановлено</Label>
              </div>
              <Button size="s" style={{flexShrink: 0}} onClick={() => chartRef.current?.resetZoom()}>
                Сбросить масштаб
              </Button>
            </>
          ) : (
            <div style={{flexShrink: 0}}>
              <Label theme="success">В реальном времени</Label>
            </div>
          )}
        </Flex>

        <div style={{flex: 1, minHeight: 0, minWidth: 0}}>
          <CpuChart ref={chartRef} source={source} onZoomedChange={setZoomed} />
        </div>
      </Card>
    </Flex>
  );
}
