import './registerPlugins';

import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitProps, ChartKitType} from '@gravity-ui/chartkit';
import {Box, Button, Card, Flex, Label, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {toGravityChartsData, toYagrData} from './adapters';
import type {VizDataset, VizEngine, VizWidgetMode, VizWidgetProps} from './types';

interface ModeConfig {
    label: string;
    engine: VizEngine;
}

/** Карта «режим → движок ChartKit». Единственное место, где режимы связаны с движками. */
export const VIZ_MODES: Record<VizWidgetMode, ModeConfig> = {
    sales: {label: 'Продажи', engine: 'gravity-charts'},
    monitoring: {label: 'Мониторинг', engine: 'yagr'},
};

const DEFAULT_HEIGHT = 360;

type CommonChartProps = Pick<
    ChartKitProps<ChartKitType>,
    'id' | 'onLoad' | 'renderPluginLoader' | 'renderError'
>;

type RenderErrorOpts = Parameters<NonNullable<CommonChartProps['renderError']>>[0];

function PluginLoader() {
    return (
        <Flex alignItems="center" justifyContent="center" style={{height: '100%'}}>
            <Loader size="m" />
        </Flex>
    );
}

function PluginError({message, resetError}: RenderErrorOpts) {
    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            gap={3}
            style={{height: '100%'}}
        >
            <Text variant="body-2" color="danger">
                Не удалось отрисовать график: {message}
            </Text>
            <Button view="outlined" size="m" onClick={resetError}>
                Повторить
            </Button>
        </Flex>
    );
}

/** Рендер через единый API `<ChartKit type data>`; `type` выбирает лениво загружаемый движок. */
function renderChart(mode: VizWidgetMode, dataset: VizDataset, common: CommonChartProps) {
    switch (mode) {
        case 'sales':
            return <ChartKit type="gravity-charts" data={toGravityChartsData(dataset)} {...common} />;
        case 'monitoring':
            return <ChartKit type="yagr" data={toYagrData(dataset)} {...common} />;
    }
}

export function VizWidget({
    datasets,
    mode: controlledMode,
    defaultMode = 'sales',
    onModeChange,
    height = DEFAULT_HEIGHT,
    id,
}: VizWidgetProps) {
    const [innerMode, setInnerMode] = React.useState<VizWidgetMode>(defaultMode);
    const mode = controlledMode ?? innerMode;
    const dataset = datasets[mode];
    const {engine} = VIZ_MODES[mode];

    const [renderTime, setRenderTime] = React.useState<number | undefined>();

    const handleModeChange = React.useCallback(
        (next: VizWidgetMode) => {
            setRenderTime(undefined);
            setInnerMode(next);
            onModeChange?.(next);
        },
        [onModeChange],
    );

    const chartProps = React.useMemo<CommonChartProps>(
        () => ({
            id: id ? `${id}-${mode}` : undefined,
            onLoad: (data) => setRenderTime(data?.widgetRendering),
            renderPluginLoader: () => <PluginLoader />,
            renderError: (opts) => <PluginError {...opts} />,
        }),
        [id, mode],
    );

    const pointsCount = dataset.timeline.length * dataset.series.length;

    return (
        <Card type="container" view="outlined" spacing={{p: 4}}>
            <Flex direction="column" gap={3}>
                <Flex alignItems="center" gap={3} wrap>
                    <Text variant="subheader-2" ellipsis style={{flex: 1, minWidth: 0}}>
                        {dataset.title}
                    </Text>
                    <SegmentedRadioGroup<VizWidgetMode>
                        size="m"
                        value={mode}
                        onUpdate={handleModeChange}
                        aria-label="Режим визуализации"
                        style={{flexShrink: 0}}
                    >
                        {(Object.keys(VIZ_MODES) as VizWidgetMode[]).map((key) => (
                            <SegmentedRadioGroup.Option key={key} value={key}>
                                {VIZ_MODES[key].label}
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                </Flex>

                <Flex alignItems="center" gap={2} wrap>
                    <Label theme="info" size="s">
                        {engine}
                    </Label>
                    <Text variant="caption-2" color="secondary">
                        {dataset.series.length} ряд(а) · {pointsCount.toLocaleString('ru-RU')} точек
                        {renderTime !== undefined ? ` · рендер ${Math.round(renderTime)} мс` : ''}
                    </Text>
                </Flex>

                <Box style={{height, minWidth: 0}}>
                    {renderChart(mode, dataset, chartProps)}
                </Box>
            </Flex>
        </Card>
    );
}
