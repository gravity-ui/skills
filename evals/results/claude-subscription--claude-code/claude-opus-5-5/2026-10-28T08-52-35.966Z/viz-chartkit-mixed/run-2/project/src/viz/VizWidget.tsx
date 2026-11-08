import React from 'react';
import type {ChartKitProps, ChartKitRef} from '@gravity-ui/chartkit';
import {Button, Card, Loader, SegmentedRadioGroup, Text, useThemeType} from '@gravity-ui/uikit';

import {toGravityChartsData, toYagrData, type GravityChartsData, type YagrData} from './adapters';
import {ChartKit} from './chartkit';
import type {PaletteTheme} from './palette';
import type {VizDataset, VizMode, VizWidgetProps, VizWidgetRef} from './types';

import './VizWidget.css';

const MODES: ReadonlyArray<{value: VizMode; label: string}> = [
    {value: 'sales', label: 'Продажи'},
    {value: 'monitoring', label: 'Мониторинг'},
];

const DEFAULT_HEIGHT = 360;

type ChartConfig =
    | {type: 'gravity-charts'; data: GravityChartsData}
    | {type: 'yagr'; data: YagrData};

type BuildResult = {ok: true; config: ChartConfig} | {ok: false; error: string};

// Mode → engine mapping. A regular sales chart has few points and benefits from
// SVG rendering of @gravity-ui/charts; dense monitoring series go to canvas-based yagr.
function buildChartConfig(mode: VizMode, dataset: VizDataset, theme: PaletteTheme): ChartConfig {
    switch (mode) {
        case 'sales':
            return {type: 'gravity-charts', data: toGravityChartsData(dataset, theme)};
        case 'monitoring':
            return {type: 'yagr', data: toYagrData(dataset, theme)};
    }
}

function isVizMode(value: string): value is VizMode {
    return MODES.some((m) => m.value === value);
}

function renderPluginLoader() {
    return (
        <div className="viz-widget__state">
            <Loader size="m" />
        </div>
    );
}

function ErrorState({message, onRetry}: {message: string; onRetry?: () => void}) {
    return (
        <div className="viz-widget__state" role="alert">
            <Text color="danger">{message}</Text>
            {onRetry && (
                <Button view="outlined" size="s" onClick={onRetry}>
                    Повторить
                </Button>
            )}
        </div>
    );
}

const renderChartError: NonNullable<ChartKitProps<'yagr'>['renderError']> = ({message, resetError}) => (
    <ErrorState message={message} onRetry={resetError} />
);

export const VizWidget = React.forwardRef<VizWidgetRef, VizWidgetProps>(function VizWidget(
    {title, datasets, mode: controlledMode, defaultMode = 'sales', onModeChange, height = DEFAULT_HEIGHT},
    ref,
) {
    const [uncontrolledMode, setUncontrolledMode] = React.useState<VizMode>(defaultMode);
    const mode = controlledMode ?? uncontrolledMode;
    const theme = useThemeType();
    const chartRef = React.useRef<ChartKitRef>(null);

    React.useImperativeHandle(ref, () => ({reflow: () => chartRef.current?.reflow()}), []);

    const handleModeChange = (value: string) => {
        if (!isVizMode(value) || value === mode) {
            return;
        }
        if (controlledMode === undefined) {
            setUncontrolledMode(value);
        }
        onModeChange?.(value);
    };

    const dataset = datasets[mode];
    const result = React.useMemo((): BuildResult => {
        try {
            return {ok: true, config: buildChartConfig(mode, dataset, theme)};
        } catch (error) {
            return {ok: false, error: error instanceof Error ? error.message : String(error)};
        }
    }, [mode, dataset, theme]);

    const modeLabel = MODES.find((m) => m.value === mode)?.label;
    const chartProps = {
        ref: chartRef,
        renderPluginLoader,
        renderError: renderChartError,
    };

    let chart: React.ReactNode;
    if (!result.ok) {
        chart = <ErrorState message={result.error} />;
    } else if (result.config.type === 'yagr') {
        // `key` remounts ChartKit on mode switch, so loader and error boundary start fresh.
        chart = <ChartKit key="yagr" type="yagr" data={result.config.data} {...chartProps} />;
    } else {
        chart = (
            <ChartKit
                key="gravity-charts"
                type="gravity-charts"
                data={result.config.data}
                {...chartProps}
            />
        );
    }

    return (
        <Card view="outlined" className="viz-widget">
            <div className="viz-widget__header">
                <Text as="h2" variant="subheader-3" className="viz-widget__title">
                    {title}
                </Text>
                <SegmentedRadioGroup
                    aria-label="Режим графика"
                    value={mode}
                    onUpdate={handleModeChange}
                    options={MODES.map((m) => ({value: m.value, content: m.label}))}
                />
            </div>
            <div
                className="viz-widget__plot"
                style={{height}}
                role="figure"
                aria-label={`${title}: ${modeLabel}`}
            >
                {chart}
            </div>
        </Card>
    );
});
