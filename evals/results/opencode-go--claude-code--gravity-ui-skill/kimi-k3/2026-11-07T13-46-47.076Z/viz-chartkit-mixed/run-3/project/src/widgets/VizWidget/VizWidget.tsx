import React from 'react';

import ChartKit from '@gravity-ui/chartkit';
import {Box, Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {VIZ_MODE_META, getMonitoringChartData, getSalesChartData} from './data';
import type {VizWidgetMode} from './types';

const CHART_HEIGHT = 360;

/** Shown while a chart engine's lazy chunk is being fetched. */
function renderPluginLoader() {
    return (
        <Flex alignItems="center" justifyContent="center" style={{height: '100%'}}>
            <Loader size="l" />
        </Flex>
    );
}

/**
 * One widget — two engines. Both modes are rendered through the same
 * <ChartKit type="..." data="..." /> API; ChartKit dispatches to the plugin
 * registered for the type, and each plugin's renderer is React.lazy, so the
 * @gravity-ui/charts / @gravity-ui/yagr bundles load only when their mode
 * is first shown.
 */
export function VizWidget() {
    const [mode, setMode] = React.useState<VizWidgetMode>('sales');

    const salesData = React.useMemo(() => getSalesChartData(), []);
    const monitoringData = React.useMemo(
        () => getMonitoringChartData(Math.floor(Date.now() / 1000)),
        [],
    );

    return (
        <Card view="outlined">
            <Box spacing={{p: 4}}>
                <Flex direction="column" gap={4}>
                    <Flex alignItems="center" gap={3}>
                        <Text
                            variant="subheader-2"
                            ellipsis
                            style={{flex: 1, minWidth: 0}}
                        >
                            {VIZ_MODE_META[mode].title}
                        </Text>
                        <SegmentedRadioGroup
                            style={{flexShrink: 0}}
                            size="m"
                            value={mode}
                            onUpdate={setMode}
                            options={(
                                Object.keys(VIZ_MODE_META) as VizWidgetMode[]
                            ).map((value) => ({
                                value,
                                content: VIZ_MODE_META[value].option,
                            }))}
                        />
                    </Flex>
                    {/* ChartKit fills its parent — an explicit height is required. */}
                    <div style={{height: CHART_HEIGHT}}>
                        {mode === 'sales' ? (
                            <ChartKit
                                type="gravity-charts"
                                data={salesData}
                                renderPluginLoader={renderPluginLoader}
                            />
                        ) : (
                            <ChartKit
                                type="yagr"
                                data={monitoringData}
                                renderPluginLoader={renderPluginLoader}
                            />
                        )}
                    </div>
                </Flex>
            </Box>
        </Card>
    );
}
