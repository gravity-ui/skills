import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitWidget} from '@gravity-ui/chartkit';
import {Alert, Button, Card, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {loadEngine} from './engines';
import {toMonitoringChart, toSalesChart} from './adapters';
import type {ChartWidgetMode, ChartWidgetProps} from './types';

type EngineState = {mode: ChartWidgetMode; status: 'loading' | 'ready' | 'error'};

const MODE_LABELS: Record<ChartWidgetMode, string> = {
  sales: 'Продажи',
  monitoring: 'Мониторинг',
};

function useEngine(mode: ChartWidgetMode) {
  const [state, setState] = React.useState<EngineState>({mode, status: 'loading'});
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setState({mode, status: 'loading'});
    loadEngine(mode).then(
      () => !cancelled && setState({mode, status: 'ready'}),
      () => !cancelled && setState({mode, status: 'error'}),
    );
    return () => {
      cancelled = true;
    };
  }, [mode, attempt]);

  // State may lag one render behind `mode`; never treat another mode's state as ready.
  const status = state.mode === mode ? state.status : 'loading';
  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);
  return {status, retry};
}

export function ChartWidget({
  title,
  data,
  mode: controlledMode,
  defaultMode = 'sales',
  onModeChange,
  height = 360,
}: ChartWidgetProps) {
  const [innerMode, setInnerMode] = React.useState<ChartWidgetMode>(defaultMode);
  const mode = controlledMode ?? innerMode;

  const handleModeChange = React.useCallback(
    (next: string) => {
      const nextMode = next as ChartWidgetMode;
      if (controlledMode === undefined) {
        setInnerMode(nextMode);
      }
      onModeChange?.(nextMode);
    },
    [controlledMode, onModeChange],
  );

  const {status, retry} = useEngine(mode);

  const salesChart = React.useMemo(() => toSalesChart(data.sales), [data.sales]);
  const monitoringChart = React.useMemo(
    () => toMonitoringChart(data.monitoring),
    [data.monitoring],
  );

  let body: React.ReactNode;
  if (status === 'error') {
    body = (
      <Alert
        theme="danger"
        title="Не удалось загрузить график"
        message="Проверьте соединение и повторите попытку."
        actions={<Button onClick={retry}>Повторить</Button>}
      />
    );
  } else if (status === 'loading') {
    body = <Loader size="l" />;
  } else if (mode === 'sales') {
    body = <ChartKit type="gravity-charts" data={salesChart} />;
  } else {
    body = <ChartKit type="yagr" data={monitoringChart} />;
  }

  return (
    <Card type="container" view="outlined" style={{padding: 16}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <Text variant="subheader-3">{title}</Text>
        <SegmentedRadioGroup value={mode} onUpdate={handleModeChange}>
          {(Object.keys(MODE_LABELS) as ChartWidgetMode[]).map((m) => (
            <SegmentedRadioGroup.Option key={m} value={m} content={MODE_LABELS[m]} />
          ))}
        </SegmentedRadioGroup>
      </div>
      {/* ChartKit fills its parent: the height must be explicit. */}
      <div
        style={{
          height,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* `key` remounts the chart when the engine changes */}
        <div key={mode} style={{width: '100%', height: '100%'}}>
          {body}
        </div>
      </div>
    </Card>
  );
}

export type {ChartKitWidget};
