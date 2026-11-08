import './chartkit-setup';

import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitRef} from '@gravity-ui/chartkit';
import {Card, Flex, Loader, SegmentedRadioGroup, Text, useThemeType} from '@gravity-ui/uikit';

import {toChartKitConfig} from './adapters';
import type {ChartWidgetDatasets, ChartWidgetMode} from './types';

const MODE_LABELS: Record<ChartWidgetMode, string> = {
    sales: 'Продажи',
    monitoring: 'Мониторинг',
};

export interface ChartWidgetProps {
    /** Данные для каждого режима в едином формате. */
    datasets: ChartWidgetDatasets;
    /** Контролируемый режим. */
    mode?: ChartWidgetMode;
    /** Начальный режим для неконтролируемого использования. */
    defaultMode?: ChartWidgetMode;
    onModeChange?: (mode: ChartWidgetMode) => void;
    /** Высота области графика, px. */
    height?: number;
}

export type ChartWidgetRef = ChartKitRef | undefined;

export const ChartWidget = React.forwardRef<ChartWidgetRef, ChartWidgetProps>(function ChartWidget(
    {datasets, mode: controlledMode, defaultMode = 'sales', onModeChange, height = 360},
    ref,
) {
    const [uncontrolledMode, setUncontrolledMode] = React.useState(defaultMode);
    const mode = controlledMode ?? uncontrolledMode;
    const colorScheme = useThemeType();

    const handleModeChange = (value: ChartWidgetMode) => {
        setUncontrolledMode(value);
        onModeChange?.(value);
    };

    const dataset = datasets[mode];
    const config = React.useMemo(
        () => toChartKitConfig(mode, dataset, {colorScheme}),
        [mode, dataset, colorScheme],
    );

    return (
        <Card view="outlined" spacing={{p: 4}}>
            <Flex direction="column" gap={3}>
                <Flex justifyContent="space-between" alignItems="center" gap={3} wrap>
                    <Text variant="subheader-3">{dataset.title}</Text>
                    <SegmentedRadioGroup<ChartWidgetMode>
                        value={mode}
                        onUpdate={handleModeChange}
                        options={(Object.keys(MODE_LABELS) as ChartWidgetMode[]).map((value) => ({
                            value,
                            content: MODE_LABELS[value],
                        }))}
                    />
                </Flex>
                <div style={{height}}>
                    <ChartKit
                        // Разные движки — разные экземпляры: ключ сбрасывает состояние при переключении.
                        key={config.type}
                        ref={ref}
                        id={`chart-widget-${mode}`}
                        type={config.type}
                        data={config.data}
                        renderPluginLoader={() => (
                            <Flex height="100%" alignItems="center" justifyContent="center">
                                <Loader size="m" />
                            </Flex>
                        )}
                    />
                </div>
            </Flex>
        </Card>
    );
});
