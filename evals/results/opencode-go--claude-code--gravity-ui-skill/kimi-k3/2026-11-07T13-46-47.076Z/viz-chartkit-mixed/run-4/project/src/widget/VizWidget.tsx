import React from 'react';

import {Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {toMonitoringWidgetData, toSalesWidgetData} from './adapters';
import {ChartKit} from './chartkit';
import type {VizWidgetMode, VizWidgetProps} from './types';

const MODE_OPTIONS: {value: VizWidgetMode; content: string}[] = [
    {value: 'sales', content: 'Продажи'},
    {value: 'monitoring', content: 'Мониторинг'},
];

function PluginLoader() {
    return (
        <Flex alignItems="center" justifyContent="center" height="100%">
            <Loader size="m" />
        </Flex>
    );
}

/**
 * One visualization widget, two engines behind a single API.
 *
 * The mode switcher swaps the ChartKit `type`; each engine's bundle is
 * lazy-loaded by its ChartKit plugin on first use, so the monitoring
 * renderer is never fetched while the widget stays in sales mode (and
 * vice versa).
 */
export function VizWidget({
    title,
    data,
    mode,
    defaultMode = 'sales',
    onModeChange,
    height = 320,
}: VizWidgetProps) {
    const [innerMode, setInnerMode] = React.useState<VizWidgetMode>(defaultMode);
    const activeMode = mode ?? innerMode;

    const salesData = React.useMemo(() => toSalesWidgetData(data.sales), [data.sales]);
    const monitoringData = React.useMemo(
        () => toMonitoringWidgetData(data.monitoring),
        [data.monitoring],
    );

    const handleModeUpdate = (value: VizWidgetMode) => {
        setInnerMode(value);
        onModeChange?.(value);
    };

    return (
        <Card view="raised" size="l" spacing={{p: 4}}>
            <Flex direction="column" gap={4}>
                <Flex alignItems="center" gap={3}>
                    <Text variant="subheader-2" style={{flex: 1, minWidth: 0}}>
                        {title}
                    </Text>
                    <SegmentedRadioGroup
                        name="viz-widget-mode"
                        size="m"
                        value={activeMode}
                        options={MODE_OPTIONS}
                        onUpdate={handleModeUpdate}
                        style={{flexShrink: 0}}
                    />
                </Flex>
                <div style={{height}}>
                    {activeMode === 'sales' ? (
                        <ChartKit
                            key="sales"
                            type="gravity-charts"
                            data={salesData}
                            renderPluginLoader={() => <PluginLoader />}
                        />
                    ) : (
                        <ChartKit
                            key="monitoring"
                            id="viz-widget-monitoring"
                            type="yagr"
                            data={monitoringData}
                            renderPluginLoader={() => <PluginLoader />}
                        />
                    )}
                </div>
            </Flex>
        </Card>
    );
}
