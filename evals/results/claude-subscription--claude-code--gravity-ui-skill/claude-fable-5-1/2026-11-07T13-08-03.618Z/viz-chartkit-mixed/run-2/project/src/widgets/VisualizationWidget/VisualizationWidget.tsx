import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitProps} from '@gravity-ui/chartkit';
import {Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {toGravityChartsData} from './adapters/toGravityCharts';
import {toYagrData} from './adapters/toYagr';
import type {VisualizationMode, VisualizationWidgetProps} from './types';

const MODE_LABELS: Record<VisualizationMode, string> = {
    sales: 'Продажи',
    monitoring: 'Мониторинг',
};

const MODE_HINTS: Record<VisualizationMode, string> = {
    sales: 'Линейный график · @gravity-ui/charts',
    monitoring: 'Плотный временной ряд · @gravity-ui/yagr',
};

function PluginLoader() {
    return (
        <Flex alignItems="center" justifyContent="center" style={{height: '100%'}}>
            <Loader size="m" />
        </Flex>
    );
}

function renderError({message}: {message: string}) {
    return (
        <Flex alignItems="center" justifyContent="center" style={{height: '100%'}}>
            <Text variant="body-1" color="danger">
                Не удалось построить график: {message}
            </Text>
        </Flex>
    );
}

/**
 * Один виджет — два движка.
 *
 * Переключатель режима выбирает, какой плагин ChartKit получит данные:
 * `gravity-charts` для продаж, `yagr` для мониторинга. Код движка подгружается ChartKit лениво
 * при первом рендере соответствующего `type`, до этого показывается `renderPluginLoader`.
 */
export function VisualizationWidget({
    title,
    mode: controlledMode,
    defaultMode = 'sales',
    onModeChange,
    salesData,
    monitoringData,
    height = 320,
    className,
}: VisualizationWidgetProps) {
    const [uncontrolledMode, setUncontrolledMode] = React.useState<VisualizationMode>(defaultMode);
    const mode = controlledMode ?? uncontrolledMode;

    const handleModeChange = React.useCallback(
        (next: VisualizationMode) => {
            setUncontrolledMode(next);
            onModeChange?.(next);
        },
        [onModeChange],
    );

    const salesChart = React.useMemo(() => toGravityChartsData(salesData), [salesData]);
    const monitoringChart = React.useMemo(() => toYagrData(monitoringData), [monitoringData]);

    const commonProps: Pick<ChartKitProps<'yagr'>, 'renderPluginLoader' | 'renderError'> = {
        renderPluginLoader: PluginLoader,
        renderError,
    };

    return (
        <Card type="container" view="outlined" className={className}>
            <Flex direction="column" gap={3} style={{padding: 'var(--g-spacing-4)'}}>
                <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
                    <Flex direction="column" gap={0.5} style={{flex: 1, minWidth: 0}}>
                        <Text variant="subheader-2" ellipsis>
                            {title}
                        </Text>
                        <Text variant="caption-2" color="secondary">
                            {MODE_HINTS[mode]}
                        </Text>
                    </Flex>
                    <SegmentedRadioGroup<VisualizationMode>
                        size="m"
                        value={mode}
                        onUpdate={handleModeChange}
                        aria-label="Режим визуализации"
                        style={{flexShrink: 0}}
                    >
                        <SegmentedRadioGroup.Option value="sales">
                            {MODE_LABELS.sales}
                        </SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value="monitoring">
                            {MODE_LABELS.monitoring}
                        </SegmentedRadioGroup.Option>
                    </SegmentedRadioGroup>
                </Flex>

                <div style={{height, minWidth: 0}}>
                    {mode === 'sales' ? (
                        <ChartKit key="sales" type="gravity-charts" data={salesChart} {...commonProps} />
                    ) : (
                        <ChartKit key="monitoring" type="yagr" data={monitoringChart} {...commonProps} />
                    )}
                </div>
            </Flex>
        </Card>
    );
}
