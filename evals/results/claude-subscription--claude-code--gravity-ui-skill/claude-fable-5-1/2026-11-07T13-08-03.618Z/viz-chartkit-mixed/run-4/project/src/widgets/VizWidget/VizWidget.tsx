import {useCallback, useMemo, useState} from 'react';
import ChartKit from '@gravity-ui/chartkit';
import type {ChartKitProps} from '@gravity-ui/chartkit';
import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {
    Button,
    Card,
    Flex,
    SegmentedRadioGroup,
    Skeleton,
    Table,
    Text,
    useThemeValue,
} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import {toGravityCharts, toYagr} from './adapters';
import {ENGINE_TO_CHARTKIT_TYPE, useEngine} from './engines';
import {formatValue, summarizeSeries} from './format';
import {getSeriesColor, getSeriesPalette} from './palette';
import type {VizView, VizWidgetProps} from './types';

import './VizWidget.css';

const DEFAULT_CHART_HEIGHT = 320;

type RenderErrorArgs = Parameters<NonNullable<ChartKitProps<'gravity-charts'>['renderError']>>[0];

type ChartSpec =
    | {type: 'gravity-charts'; data: ChartData}
    | {type: 'yagr'; data: YagrWidgetData};

function buildChartSpec(view: VizView, palette: readonly string[]): ChartSpec {
    switch (view.engine) {
        case 'line':
            return {type: 'gravity-charts', data: toGravityCharts(view, palette)};
        case 'timeseries':
            return {type: 'yagr', data: toYagr(view, palette)};
        default: {
            const unknown: never = view.engine;
            throw new Error(`Unknown viz engine: ${String(unknown)}`);
        }
    }
}

function ChartSkeleton() {
    return <Skeleton style={{width: '100%', height: '100%'}} />;
}

interface StateMessageProps {
    title: string;
    description?: string;
    action?: {label: string; onClick: () => void};
}

function StateMessage({title, description, action}: StateMessageProps) {
    return (
        <div className="viz-widget__state" role="status">
            <Text variant="body-2">{title}</Text>
            {description ? (
                <Text variant="body-1" color="secondary">
                    {description}
                </Text>
            ) : null}
            {action ? (
                <Button view="outlined" size="m" onClick={action.onClick}>
                    {action.label}
                </Button>
            ) : null}
        </div>
    );
}

function renderChartError({message, resetError}: RenderErrorArgs) {
    return (
        <StateMessage
            title="Не удалось отрисовать график"
            description={message}
            action={{label: 'Повторить', onClick: resetError}}
        />
    );
}

function EngineChart({spec}: {spec: ChartSpec}) {
    switch (spec.type) {
        case 'gravity-charts':
            return (
                <ChartKit
                    type="gravity-charts"
                    data={spec.data}
                    renderPluginLoader={ChartSkeleton}
                    renderError={renderChartError}
                />
            );
        case 'yagr':
            return (
                <ChartKit
                    type="yagr"
                    data={spec.data}
                    renderPluginLoader={ChartSkeleton}
                    renderError={renderChartError}
                />
            );
        default:
            return null;
    }
}

interface SummaryRow {
    id: string;
    name: string;
    color: string;
    last: string;
    min: string;
    max: string;
    avg: string;
}

function SummaryTable({view, palette}: {view: VizView; palette: readonly string[]}) {
    const rows = useMemo<SummaryRow[]>(
        () =>
            view.data.series.map((series, index) => {
                const summary = summarizeSeries(series);
                const format = view.valueFormat;

                return {
                    id: series.id,
                    name: series.name,
                    color: getSeriesColor(palette, index),
                    last: formatValue(summary.last, format),
                    min: formatValue(summary.min, format),
                    max: formatValue(summary.max, format),
                    avg: formatValue(summary.avg, format),
                };
            }),
        [view, palette],
    );

    const columns = useMemo<TableColumnConfig<SummaryRow>[]>(
        () => [
            {
                id: 'name',
                name: 'Ряд',
                primary: true,
                template: (row) => (
                    <span className="viz-widget__series">
                        <span className="viz-widget__swatch" style={{background: row.color}} />
                        <Text ellipsis>{row.name}</Text>
                    </span>
                ),
            },
            {id: 'last', name: 'Последнее', align: 'end'},
            {id: 'min', name: 'Мин.', align: 'end'},
            {id: 'max', name: 'Макс.', align: 'end'},
            {id: 'avg', name: 'Среднее', align: 'end'},
        ],
        [],
    );

    return (
        <div className="viz-widget__summary">
            <Table data={rows} columns={columns} getRowId="id" aria-label={`Сводка: ${view.label}`} />
        </div>
    );
}

function ChartArea({view, palette}: {view: VizView; palette: readonly string[]}) {
    const chartKitType = ENGINE_TO_CHARTKIT_TYPE[view.engine];
    const [engine, retry] = useEngine(chartKitType);
    const spec = useMemo(() => buildChartSpec(view, palette), [view, palette]);
    const isEmpty = view.data.timeline.length === 0 || view.data.series.length === 0;

    if (isEmpty) {
        return <StateMessage title="Нет данных" description="Для этого режима пока нечего показать" />;
    }

    if (engine.state === 'error') {
        return (
            <StateMessage
                title="Не удалось загрузить движок графика"
                description={engine.error.message}
                action={{label: 'Повторить', onClick: retry}}
            />
        );
    }

    if (engine.state === 'loading') {
        return <ChartSkeleton />;
    }

    return <EngineChart spec={spec} />;
}

/**
 * A single visualization widget with a view switcher.
 *
 * Every view shares the same data contract (`VizSeriesData`); the view's `engine`
 * picks the renderer. `line` dispatches to the `gravity-charts` ChartKit plugin,
 * `timeseries` to the `yagr` plugin, and each plugin bundle is fetched on first use.
 */
export function VizWidget(props: VizWidgetProps) {
    const {
        title,
        views,
        activeViewId,
        defaultViewId,
        onViewChange,
        chartHeight = DEFAULT_CHART_HEIGHT,
        showSummary = true,
        className,
    } = props;

    const [internalViewId, setInternalViewId] = useState(defaultViewId ?? views[0]?.id);
    const isControlled = activeViewId !== undefined;
    const currentViewId = isControlled ? activeViewId : internalViewId;
    const view = views.find((item) => item.id === currentViewId) ?? views[0];

    const handleViewChange = useCallback(
        (viewId: string) => {
            if (!isControlled) {
                setInternalViewId(viewId);
            }
            onViewChange?.(viewId);
        },
        [isControlled, onViewChange],
    );

    const theme = useThemeValue();
    const palette = getSeriesPalette(theme);

    const switcherOptions = useMemo(
        () => views.map((item) => ({value: item.id, content: item.label})),
        [views],
    );

    const rootClassName = className ? `viz-widget ${className}` : 'viz-widget';

    if (!view) {
        return (
            <Card view="outlined" spacing={{p: 4}} className={rootClassName}>
                <StateMessage title="Нет представлений" description="Передайте хотя бы один view" />
            </Card>
        );
    }

    return (
        <Card view="outlined" spacing={{p: 4}} className={rootClassName}>
            <Flex direction="column" gap={4}>
                <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
                    <div className="viz-widget__title">
                        <Text as="div" variant="subheader-2" ellipsis>
                            {title}
                        </Text>
                        {view.description ? (
                            <Text as="div" variant="body-1" color="secondary" ellipsis>
                                {view.description}
                            </Text>
                        ) : null}
                    </div>
                    {views.length > 1 ? (
                        <SegmentedRadioGroup
                            className="viz-widget__switch"
                            size="m"
                            value={view.id}
                            onUpdate={handleViewChange}
                            options={switcherOptions}
                            aria-label="Режим визуализации"
                        />
                    ) : null}
                </Flex>

                <div className="viz-widget__chart" style={{height: chartHeight}}>
                    <ChartArea view={view} palette={palette} />
                </div>

                {showSummary ? <SummaryTable view={view} palette={palette} /> : null}
            </Flex>
        </Card>
    );
}
