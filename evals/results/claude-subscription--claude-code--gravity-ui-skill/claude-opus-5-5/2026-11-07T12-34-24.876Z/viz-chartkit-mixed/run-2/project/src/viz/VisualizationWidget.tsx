import * as React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitProps, ChartKitRef} from '@gravity-ui/chartkit';
import {Button, Card, Flex, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import './chartkit';
import {isEmptySet, toMonitoringYagrData, toSalesChartData} from './adapters';
import type {
    VisualizationMode,
    VisualizationView,
    VisualizationViews,
    VisualizationWidgetRef,
} from './types';
import './VisualizationWidget.css';

const MODES: VisualizationMode[] = ['sales', 'monitoring'];

export interface VisualizationWidgetProps {
    title: string;
    description?: string;
    /** Данные и настройки для каждого режима — один формат для обоих движков. */
    views: VisualizationViews;
    /** Контролируемый режим. Если не задан, виджет хранит режим сам. */
    mode?: VisualizationMode;
    defaultMode?: VisualizationMode;
    onModeChange?: (mode: VisualizationMode) => void;
    /** Высота области графика, px. */
    height?: number;
    className?: string;
}

const renderPluginLoader = () => (
    <div className="viz-widget__state">
        <Loader size="m" />
    </div>
);

const renderError: NonNullable<ChartKitProps<'yagr'>['renderError']> = ({message, resetError}) => (
    <Flex className="viz-widget__state" direction="column" alignItems="center" gap={3}>
        <Text color="danger">Не удалось построить график: {message}</Text>
        <Button view="outlined" onClick={resetError}>
            Повторить
        </Button>
    </Flex>
);

interface ChartProps {
    view: VisualizationView;
}

const SalesChart = React.forwardRef<ChartKitRef | undefined, ChartProps>(function SalesChart(
    {view},
    ref,
) {
    const data = React.useMemo(() => toSalesChartData(view), [view]);
    return (
        <ChartKit
            ref={ref}
            type="gravity-charts"
            data={data}
            renderPluginLoader={renderPluginLoader}
            renderError={renderError}
        />
    );
});

const MonitoringChart = React.forwardRef<ChartKitRef | undefined, ChartProps>(
    function MonitoringChart({view}, ref) {
        const data = React.useMemo(() => toMonitoringYagrData(view), [view]);
        return (
            <ChartKit
                ref={ref}
                type="yagr"
                id="viz-widget-monitoring"
                data={data}
                renderPluginLoader={renderPluginLoader}
                renderError={renderError}
            />
        );
    },
);

export const VisualizationWidget = React.forwardRef<VisualizationWidgetRef, VisualizationWidgetProps>(
    function VisualizationWidget(
        {
            title,
            description,
            views,
            mode: controlledMode,
            defaultMode = 'sales',
            onModeChange,
            height = 360,
            className,
        },
        ref,
    ) {
        const [uncontrolledMode, setUncontrolledMode] = React.useState(defaultMode);
        const mode = controlledMode ?? uncontrolledMode;
        const view = views[mode];

        const chartRef = React.useRef<ChartKitRef | undefined>(undefined);
        React.useImperativeHandle(ref, () => ({reflow: () => chartRef.current?.reflow()}), []);

        const handleModeUpdate = (next: VisualizationMode) => {
            if (controlledMode === undefined) {
                setUncontrolledMode(next);
            }
            onModeChange?.(next);
        };

        let chart: React.ReactNode;
        if (isEmptySet(view.data)) {
            chart = (
                <div className="viz-widget__state">
                    <Text color="secondary">Нет данных для отображения</Text>
                </div>
            );
        } else if (mode === 'sales') {
            chart = <SalesChart ref={chartRef} view={view} />;
        } else {
            chart = <MonitoringChart ref={chartRef} view={view} />;
        }

        return (
            <Card view="outlined" className={['viz-widget', className].filter(Boolean).join(' ')}>
                <div className="viz-widget__header">
                    <Flex direction="column" gap={1} className="viz-widget__heading">
                        <Text variant="subheader-3" ellipsis>
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="body-1" color="secondary">
                                {description}
                            </Text>
                        ) : null}
                    </Flex>
                    <SegmentedRadioGroup<VisualizationMode>
                        className="viz-widget__switch"
                        aria-label="Режим визуализации"
                        value={mode}
                        onUpdate={handleModeUpdate}
                    >
                        {MODES.map((m) => (
                            <SegmentedRadioGroup.Option key={m} value={m}>
                                {views[m].label}
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                </div>
                {/* key по режиму: при переключении движок монтируется заново, без утечки состояния */}
                <div className="viz-widget__chart" style={{height}} key={mode}>
                    {chart}
                </div>
            </Card>
        );
    },
);
