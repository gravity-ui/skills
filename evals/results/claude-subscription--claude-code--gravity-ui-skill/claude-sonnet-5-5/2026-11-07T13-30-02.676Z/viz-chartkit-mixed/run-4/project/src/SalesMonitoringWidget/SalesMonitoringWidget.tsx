import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import {Alert, Button, Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {toMonitoringData, toSalesChartData} from './adapters';
import {registerEngine} from './plugins';
import type {SalesMonitoringWidgetProps, VizMode} from './types';

const MODE_OPTIONS = [
  {value: 'sales', content: 'Продажи'},
  {value: 'monitoring', content: 'Мониторинг'},
] satisfies {value: VizMode; content: string}[];

const TITLES: Record<VizMode, string> = {
  sales: 'Динамика продаж',
  monitoring: 'Мониторинг',
};

function CenteredLoader() {
  return (
    <Flex alignItems="center" justifyContent="center" style={{height: '100%'}}>
      <Loader size="m" />
    </Flex>
  );
}

type EngineState = {mode: VizMode; status: 'loading' | 'ready' | 'error'};

/** Loads the ChartKit plugin of the current mode on demand. */
function useEngine(mode: VizMode) {
  const [attempt, setAttempt] = React.useState(0);
  const [state, setState] = React.useState<EngineState>({mode, status: 'loading'});

  React.useEffect(() => {
    let cancelled = false;
    setState({mode, status: 'loading'});
    registerEngine(mode).then(
      () => !cancelled && setState({mode, status: 'ready'}),
      () => !cancelled && setState({mode, status: 'error'}),
    );
    return () => {
      cancelled = true;
    };
  }, [mode, attempt]);

  // never report "ready" for a mode other than the requested one
  const status = state.mode === mode ? state.status : 'loading';
  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);
  return {status, retry};
}

export function SalesMonitoringWidget({
  series,
  mode: controlledMode,
  defaultMode = 'sales',
  onModeChange,
  height = 360,
  yAxisTitle,
}: SalesMonitoringWidgetProps) {
  const [innerMode, setInnerMode] = React.useState<VizMode>(defaultMode);
  const mode = controlledMode ?? innerMode;

  const handleModeChange = React.useCallback(
    (next: VizMode) => {
      if (controlledMode === undefined) {
        setInnerMode(next);
      }
      onModeChange?.(next);
    },
    [controlledMode, onModeChange],
  );

  const {status, retry} = useEngine(mode);

  const salesData = React.useMemo(
    () => toSalesChartData(series.sales, yAxisTitle?.sales),
    [series.sales, yAxisTitle?.sales],
  );
  const monitoringData = React.useMemo(
    () => toMonitoringData(series.monitoring, yAxisTitle?.monitoring),
    [series.monitoring, yAxisTitle?.monitoring],
  );

  const renderChart = () => {
    if (status === 'error') {
      return (
        <Alert
          theme="danger"
          title="Не удалось загрузить график"
          actions={<Button onClick={retry}>Повторить</Button>}
        />
      );
    }
    if (status === 'loading') {
      return <CenteredLoader />;
    }
    const common = {
      renderPluginLoader: () => <CenteredLoader />,
      renderError: ({message, resetError}: {message: string; resetError: () => void}) => (
        <Alert
          theme="danger"
          title="Ошибка отрисовки графика"
          message={message}
          actions={<Button onClick={resetError}>Повторить</Button>}
        />
      ),
    };
    return mode === 'sales' ? (
      <ChartKit key="sales" type="gravity-charts" data={salesData} {...common} />
    ) : (
      <ChartKit key="monitoring" type="yagr" data={monitoringData} {...common} />
    );
  };

  return (
    <Card view="outlined" type="container" style={{padding: 'var(--g-spacing-4)'}}>
      <Flex direction="column" gap={4}>
        <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
          <Text variant="header-1" style={{minWidth: 0}}>
            {TITLES[mode]}
          </Text>
          <SegmentedRadioGroup
            aria-label="Режим графика"
            value={mode}
            onUpdate={handleModeChange}
            options={MODE_OPTIONS}
          />
        </Flex>
        <div style={{height, minWidth: 0}}>{renderChart()}</div>
      </Flex>
    </Card>
  );
}
