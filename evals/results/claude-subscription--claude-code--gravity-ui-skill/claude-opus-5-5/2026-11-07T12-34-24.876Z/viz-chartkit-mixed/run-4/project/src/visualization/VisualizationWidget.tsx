import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitOnError, ChartKitProps, ChartKitRef} from '@gravity-ui/chartkit';
import {Alert, Button, Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {isDatasetEmpty, toGravityChartsData, toYagrData} from './adapters';
import type {
    VisualizationMode,
    VisualizationWidgetProps,
    VisualizationWidgetRef,
} from './types';

import './VisualizationWidget.css';

const MODE_LABELS: Record<VisualizationMode, string> = {
    sales: 'Продажи',
    monitoring: 'Мониторинг',
};

const MODE_HINTS: Record<VisualizationMode, string> = {
    sales: 'Линейный график',
    monitoring: 'Плотный временной ряд · выделите область для зума',
};

const renderPluginLoader = () => (
    <div className="viz-widget__state">
        <Loader size="m" />
    </div>
);

type RenderError = NonNullable<ChartKitProps<'gravity-charts'>['renderError']>;

const renderError: RenderError = ({message, resetError}) => (
    <div className="viz-widget__state">
        <Alert
            theme="danger"
            title="Не удалось отобразить график"
            message={message}
            actions={
                <Button view="normal" onClick={resetError}>
                    Повторить
                </Button>
            }
        />
    </div>
);

export const VisualizationWidget = React.forwardRef<VisualizationWidgetRef, VisualizationWidgetProps>(
    function VisualizationWidget(
        {title, datasets, mode: controlledMode, defaultMode = 'sales', onModeChange, height = 360, onError},
        ref,
    ) {
        const [uncontrolledMode, setUncontrolledMode] = React.useState<VisualizationMode>(defaultMode);
        const mode = controlledMode ?? uncontrolledMode;
        const dataset = datasets[mode];

        const chartRef = React.useRef<ChartKitRef | undefined>(undefined);

        React.useImperativeHandle(
            ref,
            () => ({
                reflow: () => {
                    // ChartKitRef.reflow may return a promise that rejects on unmount/zero size.
                    Promise.resolve(chartRef.current?.reflow()).catch(() => undefined);
                },
            }),
            [],
        );

        const handleModeChange = React.useCallback(
            (next: VisualizationMode) => {
                if (controlledMode === undefined) {
                    setUncontrolledMode(next);
                }
                onModeChange?.(next);
            },
            [controlledMode, onModeChange],
        );

        const handleError = React.useCallback<ChartKitOnError>(
            ({error}) => onError?.(error, mode),
            [onError, mode],
        );

        // ChartKit is memoized, so keep `data` referentially stable and only
        // convert the dataset of the active mode.
        const isEmpty = isDatasetEmpty(dataset);
        const salesData = React.useMemo(
            () => (mode === 'sales' && !isEmpty ? toGravityChartsData(dataset) : null),
            [mode, dataset, isEmpty],
        );
        const monitoringData = React.useMemo(
            () => (mode === 'monitoring' && !isEmpty ? toYagrData(dataset) : null),
            [mode, dataset, isEmpty],
        );

        const commonChartProps = {
            ref: chartRef,
            onError: handleError,
            renderError,
            renderPluginLoader,
        };

        let chart: React.ReactNode;
        if (isEmpty) {
            chart = (
                <div className="viz-widget__state">
                    <Text color="secondary">Нет данных для отображения</Text>
                </div>
            );
        } else if (salesData) {
            chart = <ChartKit key="sales" type="gravity-charts" data={salesData} {...commonChartProps} />;
        } else if (monitoringData) {
            chart = <ChartKit key="monitoring" type="yagr" data={monitoringData} {...commonChartProps} />;
        }

        return (
            <Card view="outlined" className="viz-widget">
                <Flex className="viz-widget__header" alignItems="center" justifyContent="space-between" gap={3} wrap>
                    <Flex className="viz-widget__heading" direction="column" gap={0.5}>
                        <Text variant="subheader-3" ellipsis>
                            {title}
                        </Text>
                        <Text variant="caption-2" color="secondary" ellipsis>
                            {MODE_HINTS[mode]}
                        </Text>
                    </Flex>
                    <SegmentedRadioGroup<VisualizationMode>
                        className="viz-widget__switcher"
                        aria-label="Режим графика"
                        value={mode}
                        onUpdate={handleModeChange}
                    >
                        <SegmentedRadioGroup.Option value="sales">{MODE_LABELS.sales}</SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value="monitoring">
                            {MODE_LABELS.monitoring}
                        </SegmentedRadioGroup.Option>
                    </SegmentedRadioGroup>
                </Flex>
                <div className="viz-widget__chart" style={{height}}>
                    {chart}
                </div>
            </Card>
        );
    },
);
