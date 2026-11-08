import {Component, Suspense, lazy, useMemo, useState} from 'react';
import type {ComponentType, LazyExoticComponent, ReactNode} from 'react';
import {Card, Flex, Loader, SegmentedRadioGroup, Text, useThemeType} from '@gravity-ui/uikit';

import {CATEGORICAL_DARK, CATEGORICAL_LIGHT, MAX_SERIES} from './palette';
import type {EngineProps, VisualizationMode, VisualizationWidgetProps} from './types';

// Engines are lazy: each library's bundle is fetched only when its mode is shown.
const ENGINES: Record<VisualizationMode, LazyExoticComponent<ComponentType<EngineProps>>> = {
    sales: lazy(() => import('./engines/SalesLineChart')),
    monitoring: lazy(() => import('./engines/MonitoringTimeSeries')),
};

const MODE_OPTIONS: {value: VisualizationMode; content: string}[] = [
    {value: 'sales', content: 'Продажи'},
    {value: 'monitoring', content: 'Мониторинг'},
];

/** Shows a message if an engine fails to load (e.g. a failed chunk fetch). Keyed by mode, so switching modes retries. */
class EngineErrorBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
    state = {failed: false};

    static getDerivedStateFromError() {
        return {failed: true};
    }

    render() {
        if (this.state.failed) {
            return <Text style={{color: 'var(--g-color-text-danger)'}}>Не удалось загрузить график.</Text>;
        }
        return this.props.children;
    }
}

export function VisualizationWidget({
    title,
    series,
    mode: controlledMode,
    defaultMode = 'sales',
    onModeChange,
    height = 360,
}: VisualizationWidgetProps) {
    const [innerMode, setInnerMode] = useState<VisualizationMode>(defaultMode);
    const mode = controlledMode ?? innerMode;
    const theme = useThemeType();

    const colors = theme === 'dark' ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;

    // Fixed slots only: extra series are dropped with a warning, never given a cycled color.
    const visibleSeries = useMemo(() => {
        if (series.length > MAX_SERIES) {
            console.warn(`VisualizationWidget: ${series.length} series given, only ${MAX_SERIES} are plotted.`);
            return series.slice(0, MAX_SERIES);
        }
        return series;
    }, [series]);

    const hasData = visibleSeries.some((s) => s.points.length > 0);

    const handleModeChange = (next: VisualizationMode) => {
        if (controlledMode === undefined) {
            setInnerMode(next);
        }
        onModeChange?.(next);
    };

    const Engine = ENGINES[mode];

    return (
        <Card view="outlined" size="l" style={{padding: 16, width: '100%', maxWidth: 960}}>
            <Flex direction="column" gap={4}>
                <Flex alignItems="center" justifyContent="space-between" gap={4} wrap style={{rowGap: 8}}>
                    <Text variant="subheader-2" style={{flex: '1 1 200px', minWidth: 0}}>
                        {title}
                    </Text>
                    <SegmentedRadioGroup
                        value={mode}
                        onUpdate={handleModeChange}
                        options={MODE_OPTIONS}
                        aria-label="Режим визуализации"
                    />
                </Flex>

                <div style={{height, width: '100%', minWidth: 0}}>
                    {hasData ? (
                        <EngineErrorBoundary key={mode}>
                            <Suspense
                                fallback={
                                    <Flex justifyContent="center" alignItems="center" style={{height: '100%'}}>
                                        <Loader size="m" />
                                    </Flex>
                                }
                            >
                                <Engine series={visibleSeries} colors={colors} theme={theme} />
                            </Suspense>
                        </EngineErrorBoundary>
                    ) : (
                        <Flex justifyContent="center" alignItems="center" style={{height: '100%'}}>
                            <Text color="secondary">Нет данных для отображения.</Text>
                        </Flex>
                    )}
                </div>
            </Flex>
        </Card>
    );
}
