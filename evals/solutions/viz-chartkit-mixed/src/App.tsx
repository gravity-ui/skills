import {useState} from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

type Engine = 'gravity-charts' | 'yagr';

const salesData: ChartData = {
  xAxis: {type: 'category', categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн']},
  yAxis: [{title: {text: 'Продажи'}}],
  series: {
    data: [
      {
        type: 'line',
        name: 'Продажи',
        data: [
          {x: 'Янв', y: 120},
          {x: 'Фев', y: 180},
          {x: 'Мар', y: 165},
          {x: 'Апр', y: 230},
          {x: 'Май', y: 260},
          {x: 'Июн', y: 310},
        ],
      },
    ],
  },
};

const now = Date.now();
const monitoringTimeline = Array.from({length: 3000}, (_, index) => now - (2999 - index) * 1000);
const monitoringValues = monitoringTimeline.map((_, index) => 55 + 25 * Math.sin(index / 50));

const monitoringData: YagrWidgetData = {
  data: {
    timeline: monitoringTimeline,
    graphs: [{id: 'cpu', name: 'CPU', type: 'line', data: monitoringValues}],
  },
  libraryConfig: {
    chart: {
      size: {adaptive: true},
    },
  },
};

function Visualization({engine}: {engine: Engine}) {
  if (engine === 'gravity-charts') {
    return <ChartKit type="gravity-charts" data={salesData} />;
  }

  return <ChartKit type="yagr" data={monitoringData} id="monitoring-chart" />;
}

export function App() {
  const [engine, setEngine] = useState<Engine>('gravity-charts');

  return (
    <Flex direction="column" gap={4} style={{padding: 24}}>
      <Text variant="header-1">Визуализация данных</Text>
      <SegmentedRadioGroup value={engine} onUpdate={(value) => setEngine(value as Engine)}>
        <SegmentedRadioGroup.Option value="gravity-charts">Продажи</SegmentedRadioGroup.Option>
        <SegmentedRadioGroup.Option value="yagr">Мониторинг</SegmentedRadioGroup.Option>
      </SegmentedRadioGroup>
      <div style={{height: 400}}>
        <Visualization engine={engine} />
      </div>
    </Flex>
  );
}
