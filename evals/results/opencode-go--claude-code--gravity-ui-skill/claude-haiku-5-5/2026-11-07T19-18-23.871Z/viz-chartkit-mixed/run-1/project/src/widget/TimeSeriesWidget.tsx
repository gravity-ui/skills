import {lazy, Suspense, useMemo, useState} from 'react';
import type {ComponentType, LazyExoticComponent} from 'react';
import {Card, Flex, Loader, SegmentedRadioGroup, Text, useThemeType} from '@gravity-ui/uikit';

import {getSeriesColors, MAX_SERIES} from './palette';
import type {EngineProps, TimeSeriesWidgetProps, WidgetMode} from './types';

// Движки грузятся лениво: код графика подтягивается только при первом показе режима.
const ENGINES: Record<WidgetMode, LazyExoticComponent<ComponentType<EngineProps>>> = {
    sales: lazy(() => import('./engines/SalesLineEngine')),
    monitoring: lazy(() => import('./engines/MonitoringEngine')),
};

const MODE_OPTIONS: {value: WidgetMode; content: string}[] = [
    {value: 'sales', content: 'Продажи'},
    {value: 'monitoring', content: 'Мониторинг'},
];

export function TimeSeriesWidget({
    title,
    series,
    mode: controlledMode,
    defaultMode = 'sales',
    onModeChange,
    height = 360,
}: TimeSeriesWidgetProps) {
    const [innerMode, setInnerMode] = useState<WidgetMode>(defaultMode);
    const mode = controlledMode ?? innerMode;
    const themeType = useThemeType();

    const colors = useMemo(() => getSeriesColors(themeType), [themeType]);

    // Палитра не циклируется: лишние серии отбрасываются, а не получают сгенерированный цвет.
    const shownSeries = useMemo(() => {
        if (series.length > MAX_SERIES) {
            console.warn(`TimeSeriesWidget: показаны первые ${MAX_SERIES} из ${series.length} серий.`);
        }
        return series.slice(0, MAX_SERIES);
    }, [series]);

    const handleModeChange = (next: WidgetMode) => {
        if (controlledMode === undefined) {
            setInnerMode(next);
        }
        onModeChange?.(next);
    };

    const Engine = ENGINES[mode];

    return (
        <Card view="outlined" size="l">
            <Flex direction="column" gap={4} style={{padding: 16}}>
                <Flex alignItems="center" justifyContent="space-between" gap={3} wrap="wrap">
                    <Text variant="subheader-2" style={{flex: 1, minWidth: 0}}>
                        {title}
                    </Text>
                    <SegmentedRadioGroup
                        style={{flexShrink: 0}}
                        aria-label="Режим графика"
                        value={mode}
                        onUpdate={(value) => handleModeChange(value as WidgetMode)}
                    >
                        {MODE_OPTIONS.map((option) => (
                            <SegmentedRadioGroup.Option key={option.value} value={option.value}>
                                {option.content}
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                </Flex>
                <div style={{height, minWidth: 0}}>
                    <Suspense
                        fallback={
                            <Flex alignItems="center" justifyContent="center" style={{height: '100%'}}>
                                <Loader size="m" />
                            </Flex>
                        }
                    >
                        <Engine series={shownSeries} colors={colors} themeType={themeType} />
                    </Suspense>
                </div>
            </Flex>
        </Card>
    );
}
