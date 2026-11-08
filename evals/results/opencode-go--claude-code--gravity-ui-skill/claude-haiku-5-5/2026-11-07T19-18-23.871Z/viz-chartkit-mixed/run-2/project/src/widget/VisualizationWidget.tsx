import {type ComponentType, type LazyExoticComponent, Suspense, lazy, useState} from 'react';
import {Card, Flex, Loader, SegmentedRadioGroup, Text, useThemeType} from '@gravity-ui/uikit';

import './widget.css';

import type {EngineProps, VisualizationWidgetProps, WidgetMode} from './types';

/**
 * Each engine is a separate chunk. Its library is downloaded the first time
 * its mode is shown, and never for a mode the user does not open.
 */
const ENGINES: Record<WidgetMode, LazyExoticComponent<ComponentType<EngineProps>>> = {
    sales: lazy(() => import('./engines/SalesLineChart')),
    monitoring: lazy(() => import('./engines/MonitoringTimeSeries')),
};

const MODE_OPTIONS: {value: WidgetMode; content: string}[] = [
    {value: 'sales', content: 'Продажи'},
    {value: 'monitoring', content: 'Мониторинг'},
];

export function VisualizationWidget({
    title,
    data,
    mode: controlledMode,
    defaultMode = 'sales',
    onModeChange,
    height = 360,
    className,
}: VisualizationWidgetProps) {
    const [innerMode, setInnerMode] = useState<WidgetMode>(defaultMode);
    const isControlled = controlledMode !== undefined;
    const mode = controlledMode ?? innerMode;

    const theme = useThemeType();

    const handleModeChange = (next: WidgetMode) => {
        if (!isControlled) {
            setInnerMode(next);
        }
        onModeChange?.(next);
    };

    const Engine = ENGINES[mode];

    return (
        <Card type="container" view="outlined" size="l" className={['vw-widget', className].filter(Boolean).join(' ')}>
            <Flex direction="column" gap={4}>
                <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
                    <Text variant="subheader-2">{title}</Text>
                    <SegmentedRadioGroup
                        size="m"
                        value={mode}
                        onUpdate={handleModeChange}
                        aria-label="Режим отображения"
                    >
                        {MODE_OPTIONS.map((option) => (
                            <SegmentedRadioGroup.Option key={option.value} value={option.value}>
                                {option.content}
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                </Flex>

                <Suspense
                    fallback={
                        <div className="vw-fallback" style={{height}}>
                            <Loader size="m" />
                        </div>
                    }
                >
                    <Engine series={data[mode]} height={height} theme={theme} />
                </Suspense>
            </Flex>
        </Card>
    );
}
