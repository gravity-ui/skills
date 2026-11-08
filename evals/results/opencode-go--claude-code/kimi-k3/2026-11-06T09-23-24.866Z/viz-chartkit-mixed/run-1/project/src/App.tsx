import {useMemo, useState} from 'react';

import {Text} from '@gravity-ui/uikit';

import {makeMonitoringSeries, makeSalesSeries} from './data/sampleData';
import {ChartWidget} from './widget/ChartWidget';
import type {ChartMode} from './widget/types';

import './widget/widget.css';

export function App() {
  const [mode, setMode] = useState<ChartMode>('sales');
  // Both datasets flow through the same widget API; the widget picks
  // (and lazy-loads) the engine that matches the selected mode.
  const datasets = useMemo(
    () => ({sales: makeSalesSeries(), monitoring: makeMonitoringSeries()}),
    [],
  );

  return (
    <main style={{maxWidth: 960, margin: '0 auto', padding: '32px 24px'}}>
      <Text variant="header-1">Виджет визуализации</Text>
      <div style={{margin: '4px 0 20px'}}>
        <Text color="secondary">
          Один виджет, два режима — обычный график продаж и плотный временной ряд мониторинга.
          Движки графиков подгружаются лениво.
        </Text>
      </div>
      <ChartWidget mode={mode} onModeChange={setMode} series={datasets[mode]} height={360} />
    </main>
  );
}
