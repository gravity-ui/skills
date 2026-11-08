import React, { Suspense, useState, useMemo } from 'react';
import { SegmentedRadioGroup } from '@gravity-ui/uikit';
import type { ChartWidgetProps, ChartMode } from './types';

const SalesEngine = React.lazy(() =>
  import('./engines/SalesChart').then((m) => ({ default: m.SalesChart })),
);

const MonitoringEngine = React.lazy(() =>
  import('./engines/MonitoringChart').then((m) => ({ default: m.MonitoringChart })),
);

const FALLBACK = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
    <span style={{ color: 'var(--g-color-text-secondary, #888)', fontSize: 13 }}>Загрузка…</span>
  </div>
);

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  data,
  mode: initialMode = 'sales',
  title = 'Продажи по дням',
  height = 300,
}) => {
  const [mode, setMode] = useState<ChartMode>(initialMode);

  const options = useMemo(
    () => [
      { value: 'sales', content: 'Продажи' },
      { value: 'monitoring', content: 'Мониторинг' },
    ],
    [],
  );

  const engineTitle = mode === 'sales' ? title : title.replace('Продажи', 'Мониторинг');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SegmentedRadioGroup value={mode} onUpdate={(value) => setMode(value as ChartMode)} options={options} />
      <Suspense fallback={FALLBACK}>
        {mode === 'sales' ? (
          <SalesEngine data={data} width={800} height={height} title={engineTitle} />
        ) : (
          <MonitoringEngine data={data} width={800} height={height} title={engineTitle} />
        )}
      </Suspense>
    </div>
  );
};
