import React, {Suspense, useState, lazy} from 'react';
import {SegmentedRadioGroup, SegmentedRadioGroupOption, Text, Box, Flex, Loader} from '@gravity-ui/uikit';

const SalesChart = lazy(() =>
  import('./charts/SalesChart').then((m) => ({default: m.SalesChart})),
);
const MonitoringChart = lazy(() =>
  import('./charts/MonitoringChart').then((m) => ({default: m.MonitoringChart})),
);

type Mode = 'sales' | 'monitoring';

const HEIGHT = 400;

export function VizWidget() {
  const [mode, setMode] = useState<Mode>('sales');

  return (
    <Box spacing={{p: 4}}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">Visualization Widget</Text>
        <SegmentedRadioGroup value={mode} onUpdate={setMode} size="m">
          <SegmentedRadioGroupOption value="sales" content="Sales Chart" />
          <SegmentedRadioGroupOption value="monitoring" content="Monitoring" />
        </SegmentedRadioGroup>
        <Suspense
          fallback={
            <Flex justifyContent="center" alignItems="center" style={{height: HEIGHT}}>
              <Loader size="l" />
            </Flex>
          }
        >
          {mode === 'sales' ? (
            <SalesChart height={HEIGHT} />
          ) : (
            <MonitoringChart height={HEIGHT} />
          )}
        </Suspense>
      </Flex>
    </Box>
  );
}
