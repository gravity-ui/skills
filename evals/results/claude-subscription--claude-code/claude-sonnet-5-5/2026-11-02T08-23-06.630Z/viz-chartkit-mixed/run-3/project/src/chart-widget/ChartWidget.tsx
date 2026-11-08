import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import {Alert, Button, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {toGravityChartsData, toYagrData} from './adapters';
import {MODE_ENGINE, loadEngine} from './engines';
import {useEngine} from './useEngine';
import type {ChartMode, ChartWidgetProps} from './types';

const MODE_LABEL: Record<ChartMode, string> = {
  sales: 'Продажи',
  monitoring: 'Мониторинг',
};
const MODE_ORDER: ChartMode[] = ['sales', 'monitoring'];

export function ChartWidget({
  title,
  datasets,
  mode: controlledMode,
  defaultMode,
  onModeChange,
  height = 360,
}: ChartWidgetProps) {
  const availableModes = MODE_ORDER.filter((m) => datasets[m]);
  const [innerMode, setInnerMode] = React.useState<ChartMode>(
    defaultMode ?? availableModes[0] ?? 'sales',
  );
  const mode = controlledMode ?? innerMode;
  const dataset = datasets[mode];
  const engine = MODE_ENGINE[mode];
  const state = useEngine(engine);

  const handleModeChange = (next: string) => {
    setInnerMode(next as ChartMode);
    onModeChange?.(next as ChartMode);
  };

  // Warm up the engines when the user reaches for the switcher.
  const prefetch = () => {
    availableModes.forEach((m) => loadEngine(MODE_ENGINE[m]).catch(() => {}));
  };

  const chartData = React.useMemo(() => {
    if (!dataset) return undefined;
    return mode === 'sales' ? toGravityChartsData(dataset) : toYagrData(dataset);
  }, [dataset, mode]);

  let body: React.ReactNode;
  if (!dataset || !chartData) {
    body = <Centered>Нет данных для режима «{MODE_LABEL[mode]}»</Centered>;
  } else if (state.status === 'error') {
    body = (
      <Alert
        theme="danger"
        title="Не удалось загрузить график"
        message="Проверьте соединение и попробуйте ещё раз."
        actions={<Button onClick={state.retry}>Повторить</Button>}
      />
    );
  } else if (state.status === 'loading') {
    body = (
      <Centered>
        <Loader size="m" />
      </Centered>
    );
  } else if (mode === 'sales') {
    body = <ChartKit type="gravity-charts" data={chartData as ReturnType<typeof toGravityChartsData>} />;
  } else {
    body = <ChartKit type="yagr" data={chartData as ReturnType<typeof toYagrData>} />;
  }

  return (
    <section style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
        <Text variant="subheader-2">{title}</Text>
        {availableModes.length > 1 && (
          <div onPointerEnter={prefetch} onFocus={prefetch}>
          <SegmentedRadioGroup value={mode} onUpdate={handleModeChange} aria-label="Режим графика">
            {availableModes.map((m) => (
              <SegmentedRadioGroup.Option
                key={m}
                value={m}
                content={MODE_LABEL[m]}
              />
            ))}
          </SegmentedRadioGroup>
          </div>
        )}
      </div>
      {/* key: a fresh chart instance per mode, never a morph between engines */}
      <div key={mode} style={{height, position: 'relative'}}>
        {body}
      </div>
    </section>
  );
}

function Centered({children}: {children: React.ReactNode}) {
  return (
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {children}
    </div>
  );
}
