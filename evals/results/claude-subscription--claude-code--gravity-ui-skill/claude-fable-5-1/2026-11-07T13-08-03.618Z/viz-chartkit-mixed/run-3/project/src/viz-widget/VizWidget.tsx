import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitOnError} from '@gravity-ui/chartkit';
import {Alert, Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {toGravityChartsData, toYagrData} from './adapters';
import type {VizMode, VizWidgetData} from './types';

export interface VizWidgetProps {
    /** Unified data for both modes. */
    data: VizWidgetData;
    /** Controlled mode. Omit to let the widget manage the mode itself. */
    mode?: VizMode;
    /** Initial mode in uncontrolled usage. */
    defaultMode?: VizMode;
    onModeChange?: (mode: VizMode) => void;
    title?: string;
    /** Height of the plot area in px. ChartKit fills its parent, so the container must be sized. */
    height?: number;
    /** Fires if a chart engine throws while rendering. */
    onError?: ChartKitOnError;
}

const MODE_LABELS: Record<VizMode, string> = {
    sales: 'Продажи',
    monitoring: 'Мониторинг',
};

const MODE_HINTS: Record<VizMode, string> = {
    sales: 'Линейный график, движок @gravity-ui/charts',
    monitoring: 'Плотный временной ряд, движок @gravity-ui/yagr (canvas)',
};

function PluginLoader() {
    return (
        <Flex alignItems="center" justifyContent="center" style={{height: '100%'}}>
            <Loader size="m" />
        </Flex>
    );
}

/**
 * One visualization widget with two modes behind a single ChartKit API:
 * - `sales` → `<ChartKit type="gravity-charts">` (declarative SVG line chart);
 * - `monitoring` → `<ChartKit type="yagr">` (dense canvas time series).
 *
 * Both engines are registered as lazy ChartKit plugins (see `chartkit-setup.ts`),
 * so switching to a mode for the first time fetches only that engine's bundle.
 */
export function VizWidget({
    data,
    mode: controlledMode,
    defaultMode = 'sales',
    onModeChange,
    title = 'Визуализация',
    height = 320,
    onError,
}: VizWidgetProps) {
    const [innerMode, setInnerMode] = React.useState<VizMode>(defaultMode);
    const mode = controlledMode ?? innerMode;

    const handleModeUpdate = React.useCallback(
        (next: VizMode) => {
            if (controlledMode === undefined) {
                setInnerMode(next);
            }
            onModeChange?.(next);
        },
        [controlledMode, onModeChange],
    );

    const salesData = React.useMemo(() => toGravityChartsData(data.sales), [data.sales]);
    const monitoringData = React.useMemo(() => toYagrData(data.monitoring), [data.monitoring]);

    return (
        <Card type="container" view="outlined" spacing={{p: 4}}>
            <Flex direction="column" gap={3}>
                <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
                    <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                        <Text variant="subheader-2" ellipsis>
                            {title}
                        </Text>
                        <Text variant="caption-2" color="secondary">
                            {MODE_HINTS[mode]}
                        </Text>
                    </Flex>
                    <SegmentedRadioGroup<VizMode>
                        size="m"
                        value={mode}
                        onUpdate={handleModeUpdate}
                        aria-label="Режим графика"
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
                        <ChartKit
                            key="sales"
                            type="gravity-charts"
                            data={salesData}
                            renderPluginLoader={() => <PluginLoader />}
                            renderError={({message}) => (
                                <Alert theme="danger" title="Не удалось отрисовать график" message={message} />
                            )}
                            onError={onError}
                        />
                    ) : (
                        <ChartKit
                            key="monitoring"
                            type="yagr"
                            data={monitoringData}
                            renderPluginLoader={() => <PluginLoader />}
                            renderError={({message}) => (
                                <Alert theme="danger" title="Не удалось отрисовать график" message={message} />
                            )}
                            onError={onError}
                        />
                    )}
                </div>
            </Flex>
        </Card>
    );
}
