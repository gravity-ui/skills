import {Suspense, lazy, useState} from 'react';
import type {ComponentType, LazyExoticComponent} from 'react';
import {Box, Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import type {VizDataset, VizEngineProps, VizMode} from './types';

// Движки грузятся при первом показе своего режима. Каждый имеет один и тот же контракт VizEngineProps.
const ENGINES: Record<VizMode, LazyExoticComponent<ComponentType<VizEngineProps>>> = {
  sales: lazy(() => import('./engines/SalesLineEngine')),
  monitoring: lazy(() => import('./engines/MonitoringEngine')),
};

const MODE_OPTIONS: {value: VizMode; content: string}[] = [
  {value: 'sales', content: 'Продажи'},
  {value: 'monitoring', content: 'Мониторинг'},
];

export interface VizWidgetProps {
  title: string;
  /** Данные для каждого режима в едином формате VizDataset. */
  datasets: Record<VizMode, VizDataset>;
  /** Управляемый режим. Если не задан, виджет управляет им сам. */
  mode?: VizMode;
  /** Начальный режим для неуправляемого использования. */
  defaultMode?: VizMode;
  onModeChange?: (mode: VizMode) => void;
  /** Высота области графика в пикселях. */
  height?: number;
}

export function VizWidget({
  title,
  datasets,
  mode: controlledMode,
  defaultMode = 'sales',
  onModeChange,
  height = 360,
}: VizWidgetProps) {
  const [uncontrolledMode, setUncontrolledMode] = useState<VizMode>(defaultMode);
  const mode = controlledMode ?? uncontrolledMode;

  const handleModeChange = (next: VizMode) => {
    if (controlledMode === undefined) {
      setUncontrolledMode(next);
    }
    onModeChange?.(next);
  };

  const Engine = ENGINES[mode];

  return (
    <Card view="outlined" size="l">
      <Box spacing={{p: 5}}>
        <Flex direction="column" gap={4}>
          <Flex justifyContent="space-between" alignItems="center" gap={4}>
            <Text variant="subheader-2">{title}</Text>
            <SegmentedRadioGroup
              size="m"
              value={mode}
              options={MODE_OPTIONS}
              onUpdate={handleModeChange}
              aria-label="Режим отображения"
            />
          </Flex>
          <Suspense
            fallback={
              <Flex justifyContent="center" alignItems="center" style={{height}}>
                <Loader size="m" />
              </Flex>
            }
          >
            <Engine dataset={datasets[mode]} height={height} />
          </Suspense>
        </Flex>
      </Box>
    </Card>
  );
}
