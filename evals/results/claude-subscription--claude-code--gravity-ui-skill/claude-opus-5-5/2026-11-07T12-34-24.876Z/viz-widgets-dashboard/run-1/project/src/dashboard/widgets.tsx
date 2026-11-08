import React from 'react';
import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Flex, Label, Table, Text} from '@gravity-ui/uikit';
import type {LabelProps, TableColumnConfig} from '@gravity-ui/uikit';

import {
    METRICS,
    MONTHS,
    ORDERS_BY_CHANNEL,
    REVENUE_BY_MONTH,
    TOP_PRODUCTS,
    TRAFFIC_SOURCES,
} from './data';
import type {MetricKey, ProductRow} from './data';

/* -------------------------------------------------------------------------- */
/* Widget types                                                               */
/* -------------------------------------------------------------------------- */

export const WIDGET_TYPE = {
    Metric: 'metric',
    LineChart: 'line-chart',
    BarChart: 'bar-chart',
    PieChart: 'pie-chart',
    Table: 'products-table',
    Note: 'note',
} as const;

/* -------------------------------------------------------------------------- */
/* Shared frame                                                               */
/* -------------------------------------------------------------------------- */

interface WidgetFrameProps {
    title?: string;
    children: React.ReactNode;
}

function WidgetFrame({title, children}: WidgetFrameProps) {
    return (
        <div className="widget">
            {title ? (
                <Text variant="subheader-2" ellipsis className="widget__title">
                    {title}
                </Text>
            ) : null}
            <div className="widget__body">{children}</div>
        </div>
    );
}

function getTitle(props: PluginWidgetProps): string | undefined {
    const title = props.data.title;
    return typeof title === 'string' ? title : undefined;
}

/* -------------------------------------------------------------------------- */
/* Metric (KPI tile)                                                          */
/* -------------------------------------------------------------------------- */

function MetricWidget(props: PluginWidgetProps) {
    const key = props.data.metric as MetricKey;
    const metric = METRICS[key] ?? METRICS.revenue;
    const positive = metric.delta >= 0;
    const theme: LabelProps['theme'] = positive ? 'success' : 'danger';

    return (
        <div className="widget widget_metric">
            <Text variant="body-2" color="secondary" ellipsis>
                {metric.label}
            </Text>
            <Text variant="header-2" ellipsis className="widget__metric-value">
                {metric.value}
            </Text>
            <Flex gap={2} alignItems="center">
                <Label theme={theme} size="xs" className="widget__no-shrink">
                    {`${positive ? '+' : '−'}${Math.abs(metric.delta).toFixed(1).replace('.', ',')} %`}
                </Label>
                <Text variant="caption-2" color="hint" ellipsis>
                    {metric.hint}
                </Text>
            </Flex>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Charts                                                                     */
/* -------------------------------------------------------------------------- */

const lineChartData: ChartData = {
    xAxis: {type: 'category', categories: MONTHS},
    yAxis: [{title: {text: 'млн ₽'}}],
    legend: {enabled: true},
    series: {
        data: [
            {
                type: 'line',
                name: '2026',
                data: REVENUE_BY_MONTH.current.map((y, x) => ({x, y})),
            },
            {
                type: 'line',
                name: '2025',
                data: REVENUE_BY_MONTH.previous.map((y, x) => ({x, y})),
            },
        ],
    },
};

const barChartData: ChartData = {
    xAxis: {type: 'category', categories: ORDERS_BY_CHANNEL.map((d) => d.channel)},
    legend: {enabled: false},
    series: {
        data: [
            {
                type: 'bar-x',
                name: 'Заказы',
                borderRadius: 4,
                data: ORDERS_BY_CHANNEL.map((d, x) => ({x, y: d.orders})),
            },
        ],
    },
};

const pieChartData: ChartData = {
    legend: {enabled: true, position: 'bottom'},
    series: {
        data: [
            {
                type: 'pie',
                innerRadius: '55%',
                data: TRAFFIC_SOURCES.map((d) => ({name: d.name, value: d.value})),
            },
        ],
    },
};

function ChartWidget({title, data}: {title?: string; data: ChartData}) {
    return (
        <WidgetFrame title={title}>
            <div className="widget__chart">
                <Chart data={data} />
            </div>
        </WidgetFrame>
    );
}

/* -------------------------------------------------------------------------- */
/* Table                                                                      */
/* -------------------------------------------------------------------------- */

const STOCK_LABEL: Record<ProductRow['stock'], {text: string; theme: LabelProps['theme']}> = {
    ok: {text: 'В наличии', theme: 'success'},
    low: {text: 'Мало', theme: 'warning'},
    out: {text: 'Нет', theme: 'danger'},
};

const rubFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

const productColumns: TableColumnConfig<ProductRow>[] = [
    {id: 'name', name: 'Товар', primary: true},
    {id: 'category', name: 'Категория'},
    {id: 'sold', name: 'Продано', align: 'end'},
    {
        id: 'revenue',
        name: 'Выручка',
        align: 'end',
        template: (item) => rubFormatter.format(item.revenue),
    },
    {
        id: 'stock',
        name: 'Остаток',
        template: (item) => (
            <Label size="xs" theme={STOCK_LABEL[item.stock].theme}>
                {STOCK_LABEL[item.stock].text}
            </Label>
        ),
    },
];

function TableWidget(props: PluginWidgetProps) {
    return (
        <WidgetFrame title={getTitle(props)}>
            <div className="widget__scroll">
                <Table
                    data={TOP_PRODUCTS}
                    columns={productColumns}
                    width="max"
                    emptyMessage="Нет данных"
                />
            </div>
        </WidgetFrame>
    );
}

/* -------------------------------------------------------------------------- */
/* Note                                                                       */
/* -------------------------------------------------------------------------- */

function NoteWidget(props: PluginWidgetProps) {
    const text = typeof props.data.text === 'string' ? props.data.text : '';
    return (
        <div className="widget widget_note">
            <Text variant="body-2" className="widget__note-text">
                {text}
            </Text>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* DashKit plugins                                                            */
/* -------------------------------------------------------------------------- */

export const notePlugin: Plugin = {
    type: WIDGET_TYPE.Note,
    defaultLayout: {w: 12, h: 4, minW: 6, minH: 3},
    renderer: (props: PluginWidgetProps) => <NoteWidget {...props} />,
};

export const metricPlugin: Plugin = {
    type: WIDGET_TYPE.Metric,
    defaultLayout: {w: 9, h: 5, minW: 6, minH: 4},
    renderer: (props: PluginWidgetProps) => <MetricWidget {...props} />,
};

export const lineChartPlugin: Plugin = {
    type: WIDGET_TYPE.LineChart,
    defaultLayout: {w: 18, h: 12, minW: 9, minH: 8},
    renderer: (props: PluginWidgetProps) => (
        <ChartWidget title={getTitle(props)} data={lineChartData} />
    ),
};

export const barChartPlugin: Plugin = {
    type: WIDGET_TYPE.BarChart,
    defaultLayout: {w: 12, h: 12, minW: 8, minH: 8},
    renderer: (props: PluginWidgetProps) => (
        <ChartWidget title={getTitle(props)} data={barChartData} />
    ),
};

export const pieChartPlugin: Plugin = {
    type: WIDGET_TYPE.PieChart,
    defaultLayout: {w: 12, h: 12, minW: 8, minH: 9},
    renderer: (props: PluginWidgetProps) => (
        <ChartWidget title={getTitle(props)} data={pieChartData} />
    ),
};

export const tablePlugin: Plugin = {
    type: WIDGET_TYPE.Table,
    defaultLayout: {w: 18, h: 12, minW: 12, minH: 7},
    renderer: (props: PluginWidgetProps) => <TableWidget {...props} />,
};
