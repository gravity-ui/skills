import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import {Alert, Button, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {toMonitoringChartData, toSalesChartData} from './adapters';
import {getEngineType} from './engines';
import type {ChartWidgetMode, ChartWidgetProps} from './types';
import {useEngine} from './useEngine';

const MODE_OPTIONS = [
    {value: 'sales', content: 'Sales'},
    {value: 'monitoring', content: 'Monitoring'},
] satisfies Array<{value: ChartWidgetMode; content: string}>;

function Centered({children, height}: {children: React.ReactNode; height: number}) {
    return (
        <Flex alignItems="center" justifyContent="center" style={{height}}>
            {children}
        </Flex>
    );
}

export function ChartWidget({
    mode: controlledMode,
    defaultMode = 'sales',
    onModeChange,
    title = 'Analytics',
    sales,
    monitoring,
    height = 360,
}: ChartWidgetProps) {
    const [innerMode, setInnerMode] = React.useState<ChartWidgetMode>(defaultMode);
    const mode = controlledMode ?? innerMode;

    const handleModeChange = React.useCallback(
        (next: ChartWidgetMode) => {
            if (controlledMode === undefined) {
                setInnerMode(next);
            }
            onModeChange?.(next);
        },
        [controlledMode, onModeChange],
    );

    const {engine, retry} = useEngine(mode);

    const salesData = React.useMemo(() => toSalesChartData(sales), [sales]);
    const monitoringData = React.useMemo(() => toMonitoringChartData(monitoring), [monitoring]);

    const loader = <Loader size="m" />;

    const renderChart = () => {
        if (engine.status === 'loading') {
            return <Centered height={height}>{loader}</Centered>;
        }
        if (engine.status === 'error') {
            return (
                <Centered height={height}>
                    <Alert
                        theme="danger"
                        title="Failed to load the chart engine"
                        actions={<Button onClick={retry}>Retry</Button>}
                    />
                </Centered>
            );
        }

        const renderError = ({message}: {message: string}) => (
            <Centered height={height}>
                <Text color="secondary">{message}</Text>
            </Centered>
        );

        // `key` remounts the chart when switching engines
        return mode === 'sales' ? (
            <ChartKit
                key={mode}
                type={getEngineType(mode) as 'gravity-charts'}
                data={salesData}
                renderPluginLoader={() => <Centered height={height}>{loader}</Centered>}
                renderError={renderError}
            />
        ) : (
            <ChartKit
                key={mode}
                id="chart-widget-monitoring"
                type={getEngineType(mode) as 'yagr'}
                data={monitoringData}
                renderPluginLoader={() => <Centered height={height}>{loader}</Centered>}
                renderError={renderError}
            />
        );
    };

    return (
        <Flex direction="column" gap={4} style={{minWidth: 0}}>
            <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
                <Text variant="header-2" style={{flex: 1, minWidth: 0}}>
                    {title}
                </Text>
                <SegmentedRadioGroup
                    style={{flexShrink: 0}}
                    aria-label="Chart mode"
                    value={mode}
                    options={MODE_OPTIONS}
                    onUpdate={handleModeChange}
                />
            </Flex>
            <div style={{height, minWidth: 0}}>{renderChart()}</div>
        </Flex>
    );
}
