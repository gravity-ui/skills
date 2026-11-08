import React from 'react';

import ChartKit from '@gravity-ui/chartkit';
import {Alert, Button, Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {toGravityChartsData, toYagrData} from './adapters';
import {loadEngine} from './engines';
import type {ChartWidgetMode, ChartWidgetProps} from './types';

const MODE_OPTIONS = [
  {value: 'sales', content: 'Продажи'},
  {value: 'monitoring', content: 'Мониторинг'},
] as const;

type EngineState = {mode: ChartWidgetMode; status: 'loading' | 'ready' | 'error'};

function useEngine(mode: ChartWidgetMode, attempt: number): EngineState['status'] {
  const [state, setState] = React.useState<EngineState>({mode, status: 'loading'});

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

  // The state may still describe the previous mode for one render
  return state.mode === mode ? state.status : 'loading';
}

export function ChartWidget({
  title,
  mode: controlledMode,
  defaultMode = 'sales',
  onModeChange,
  sales,
  monitoring,
  height = 360,
}: ChartWidgetProps) {
  const [innerMode, setInnerMode] = React.useState<ChartWidgetMode>(defaultMode);
  const mode = controlledMode ?? innerMode;
  const [attempt, setAttempt] = React.useState(0);
  const status = useEngine(mode, attempt);

  const handleModeChange = (value: string) => {
    const next = value as ChartWidgetMode;
    if (controlledMode === undefined) {
      setInnerMode(next);
    }
    onModeChange?.(next);
  };

  const salesData = React.useMemo(() => toGravityChartsData(sales), [sales]);
  const monitoringData = React.useMemo(() => toYagrData(monitoring), [monitoring]);

  let body: React.ReactNode;
  if (status === 'error') {
    body = (
      <Alert
        theme="danger"
        title="Не удалось загрузить график"
        message="Проверьте соединение и повторите попытку."
        actions={<Button onClick={() => setAttempt((n) => n + 1)}>Повторить</Button>}
      />
    );
  } else if (status === 'loading') {
    body = (
      <Flex alignItems="center" justifyContent="center" style={{height: '100%'}}>
        <Loader />
      </Flex>
    );
  } else if (mode === 'sales') {
    body = <ChartKit key="sales" type="gravity-charts" data={salesData} />;
  } else {
    body = <ChartKit key="monitoring" type="yagr" data={monitoringData} />;
  }

  return (
    <Card view="outlined" style={{padding: 'var(--g-spacing-4)'}}>
      <Flex direction="column" gap={4}>
        <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
          <Text variant="header-2" style={{flex: 1, minWidth: 0}}>
            {title}
          </Text>
          <SegmentedRadioGroup
            style={{flexShrink: 0}}
            value={mode}
            options={MODE_OPTIONS as unknown as {value: string; content: string}[]}
            onUpdate={handleModeChange}
          />
        </Flex>
        <div style={{height, minWidth: 0}}>{body}</div>
      </Flex>
    </Card>
  );
}
