import * as React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitRef, ChartKitProps} from '@gravity-ui/chartkit';
import {Alert, Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import './chartkit-setup';
import {
    MODE_HINTS,
    MODE_LABELS,
    isDatasetEmpty,
    toGravityChartsData,
    toYagrData,
    validateDataset,
} from './adapters';
import type {VisualizationMode, VisualizationWidgetProps, VisualizationWidgetRef} from './types';

import './VisualizationWidget.css';

const MODES: VisualizationMode[] = ['sales', 'monitoring'];

const renderPluginLoader = () => (
    <div className="viz-widget__state">
        <Loader size="m" />
    </div>
);

const renderError: ChartKitProps<'yagr'>['renderError'] = ({message, resetError}) => (
    <div className="viz-widget__state">
        <Alert
            theme="danger"
            title="Не удалось построить график"
            message={message}
            actions={[{text: 'Повторить', handler: resetError}]}
        />
    </div>
);

export const VisualizationWidget = React.forwardRef<VisualizationWidgetRef, VisualizationWidgetProps>(
    function VisualizationWidget(
        {
            title,
            datasets,
            mode: controlledMode,
            defaultMode = 'sales',
            onModeChange,
            height = 360,
            loading = false,
            onLoad,
            onError,
        },
        ref,
    ) {
        const [uncontrolledMode, setUncontrolledMode] = React.useState<VisualizationMode>(defaultMode);
        const mode = controlledMode ?? uncontrolledMode;
        const dataset = datasets[mode];

        const chartRef = React.useRef<ChartKitRef | null | undefined>(null);

        React.useImperativeHandle(
            ref,
            () => ({
                reflow() {
                    // gravity-charts может вернуть промис, который отклоняется при размонтировании.
                    Promise.resolve(chartRef.current?.reflow()).catch(() => {});
                },
            }),
            [],
        );

        const handleModeChange = (next: VisualizationMode) => {
            if (controlledMode === undefined) {
                setUncontrolledMode(next);
            }
            onModeChange?.(next);
        };

        const validationError = React.useMemo(() => validateDataset(dataset), [dataset]);

        // Адаптеры мемоизируем: ChartKit перерисовывает график при смене ссылки на data.
        const chart = React.useMemo(() => {
            if (validationError || isDatasetEmpty(dataset)) {
                return null;
            }
            return mode === 'sales'
                ? ({type: 'gravity-charts', data: toGravityChartsData(dataset)} as const)
                : ({type: 'yagr', data: toYagrData(dataset)} as const);
        }, [mode, dataset, validationError]);

        const handleLoad = () => onLoad?.(mode);
        const handleError = ({error}: {error: unknown}) => onError?.(mode, error);

        let body: React.ReactNode;
        if (loading) {
            body = renderPluginLoader();
        } else if (validationError) {
            body = (
                <div className="viz-widget__state">
                    <Alert theme="danger" title="Некорректные данные" message={validationError} />
                </div>
            );
        } else if (!chart) {
            body = (
                <div className="viz-widget__state">
                    <Text color="secondary">Нет данных за выбранный период</Text>
                </div>
            );
        } else if (chart.type === 'gravity-charts') {
            body = (
                <ChartKit
                    key="gravity-charts"
                    ref={chartRef}
                    type="gravity-charts"
                    data={chart.data}
                    onLoad={handleLoad}
                    onError={handleError}
                    renderError={renderError}
                    renderPluginLoader={renderPluginLoader}
                />
            );
        } else {
            body = (
                <ChartKit
                    key="yagr"
                    ref={chartRef}
                    type="yagr"
                    data={chart.data}
                    onLoad={handleLoad}
                    onError={handleError}
                    renderError={renderError}
                    renderPluginLoader={renderPluginLoader}
                />
            );
        }

        return (
            <Card view="outlined" className="viz-widget">
                <Flex
                    className="viz-widget__header"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={3}
                    wrap
                >
                    <Flex direction="column" gap={0.5} className="viz-widget__heading">
                        <Text variant="subheader-3" ellipsis>
                            {title}
                        </Text>
                        <Text variant="caption-2" color="secondary" ellipsis>
                            {MODE_HINTS[mode]}
                        </Text>
                    </Flex>
                    <SegmentedRadioGroup<VisualizationMode>
                        className="viz-widget__switch"
                        value={mode}
                        onUpdate={handleModeChange}
                        aria-label="Режим графика"
                    >
                        {MODES.map((m) => (
                            <SegmentedRadioGroup.Option key={m} value={m}>
                                {MODE_LABELS[m]}
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                </Flex>
                <div className="viz-widget__body" style={{height}}>
                    {body}
                </div>
            </Card>
        );
    },
);
