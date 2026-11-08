import React, {useCallback, useState} from 'react';
import {SegmentedRadioGroup, Card, Text} from '@gravity-ui/uikit';
import type {ChartWidgetProps, ChartMode} from './types';

const SalesEngine = React.lazy(() => import('./SalesEngine'));
const MonitorEngine = React.lazy(() => import('./MonitorEngine'));

const MODE_OPTIONS: {value: ChartMode; content: string}[] = [
  {value: 'sales', content: 'Продажи'},
  {value: 'monitor', content: 'Мониторинг'},
];

export function ChartWidget({data, initialMode = 'sales', className}: ChartWidgetProps) {
  const [mode, setMode] = useState<ChartMode>(initialMode);

  const onModeChange = useCallback(
    (value: string) => setMode(value as ChartMode),
    [],
  );

  return (
    <Card className={className} style={{padding: 16}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12}}>
        <Text variant="header-1">Виджет</Text>
        <SegmentedRadioGroup value={mode} onUpdate={onModeChange}>
          {MODE_OPTIONS.map((opt) => (
            <SegmentedRadioGroup.Option key={opt.value} value={opt.value} content={opt.content} />
          ))}
        </SegmentedRadioGroup>
      </div>

      <React.Suspense fallback={<div style={{height: 280}}>Загрузка графика…</div>}>
        {mode === 'sales' ? (
          <SalesEngine data={data.sales} />
        ) : (
          <MonitorEngine data={data.monitor} />
        )}
      </React.Suspense>
    </Card>
  );
}
