import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import React from 'react';
import {Box, Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {getMonitoringWidgetData, getSalesChartData} from './dataAdapters';

settings.set({plugins: [GravityChartsPlugin, YagrPlugin]});

type DataVisualizerMode = 'sales' | 'monitoring';

const modes: Array<{
  value: DataVisualizerMode;
  content: string;
}> = [
  {value: 'sales', content: 'Sales'},
  {value: 'monitoring', content: 'Monitoring'},
];

const salesData = getSalesChartData();
const monitoringData = getMonitoringWidgetData();

export function DataVisualizer() {
  const [mode, setMode] = React.useState<DataVisualizerMode>('sales');

  return (
    <Flex direction="column" gap="5" width="100%">
      <Flex
        direction={{s: 'column', m: 'row'}}
        gap="3"
        justifyContent="space-between"
        alignItems={{s: 'stretch', m: 'center'}}
      >
        <Flex direction="column" gap="1">
          <Text variant="header-2">Data visualization</Text>
          <Text variant="body-2" color="secondary">
            Select a dataset to render it with the matching engine.
          </Text>
        </Flex>
        <SegmentedRadioGroup
          value={mode}
          onUpdate={(value) => setMode(value as DataVisualizerMode)}
          aria-label="Visualization mode"
        >
          {modes.map((item) => (
            <SegmentedRadioGroup.Option key={item.value} value={item.value}>
              {item.content}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </Flex>

      {mode === 'sales' ? (
        <div>
          <Flex direction="column" gap="1">
            <Text variant="subheader-3">Weekly sales</Text>
            <Text variant="caption-1" color="secondary">
              Online and retail revenue by four-hour intervals.
            </Text>
          </Flex>
          <Box height={420} style={{marginTop: 12}}>
            <ChartKit type="gravity-charts" data={salesData} />
          </Box>
        </div>
      ) : (
        <div>
          <Flex direction="column" gap="1">
            <Text variant="subheader-3">Cluster monitoring</Text>
            <Text variant="caption-1" color="secondary">
              7,200 points across two hours, sampled every 10 seconds.
            </Text>
          </Flex>
          <Box height={420} style={{marginTop: 12}}>
            <ChartKit type="yagr" id="cluster-monitoring" data={monitoringData} />
          </Box>
        </div>
      )}
    </Flex>
  );
}
