import type { ReactNode } from 'react';
import { Icon, Label, Table, Text } from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';
import {
    ArrowDown,
    ArrowUp,
    ChartColumn,
    ChartLine,
    CircleCheck,
    LayoutCells,
    ListUl,
    TriangleExclamation,
} from '@gravity-ui/icons';

import { BarList, LineChart, Meter, SegmentedBar, Sparkline } from './charts/charts';
import { type DashboardData, type Kpi, deltaOf, fmt } from './data';

export type WidgetType =
    | 'kpi-revenue'
    | 'kpi-orders'
    | 'kpi-conversion'
    | 'kpi-aov'
    | 'revenue-trend'
    | 'channels'
    | 'devices'
    | 'goal'
    | 'top-products';

export interface WidgetContext {
    data: DashboardData;
    rangeLabel: string;
    /** Chart widgets can be flipped to a plain table (accessible alternative). */
    asTable: boolean;
}

export interface WidgetDefinition {
    title: string;
    subtitle?: (ctx: WidgetContext) => string;
    group: 'Показатели' | 'Графики' | 'Таблицы';
    icon: typeof ChartLine;
    size: { w: number; h: number; minW: number; minH: number; maxH?: number };
    hasTableView?: boolean;
    render: (ctx: WidgetContext) => ReactNode;
}

const C = {
    s1: 'var(--viz-series-1)',
    s2: 'var(--viz-series-2)',
    s3: 'var(--viz-series-3)',
};

// ---------------------------------------------------------------- pieces

function StatTile({ kpi, format, period }: { kpi: Kpi; format: (v: number) => string; period: string }) {
    const delta = deltaOf(kpi.value, kpi.prev);
    const up = delta.rel >= 0;
    // Every KPI here is "up is good".
    return (
        <div className="stat">
            <div className="stat__value">{format(kpi.value)}</div>
            <div className={`stat__delta stat__delta_${up ? 'good' : 'bad'}`}>
                <Icon data={up ? ArrowUp : ArrowDown} size={12} />
                <span>{delta.text}</span>
                <span className="stat__period">к пред. {period}</span>
            </div>
            <Sparkline values={kpi.trend} />
        </div>
    );
}

function DataTable<T extends object>({ data, columns }: { data: T[]; columns: TableColumnConfig<T>[] }) {
    return (
        <div className="widget-table">
            <Table data={data} columns={columns} width="max" />
        </div>
    );
}

const num = (v: string) => <span className="num">{v}</span>;

// ---------------------------------------------------------------- registry

const kpiSize = { w: 3, h: 2, minW: 2, minH: 2, maxH: 3 };

export const WIDGETS: Record<WidgetType, WidgetDefinition> = {
    'kpi-revenue': {
        title: 'Выручка',
        group: 'Показатели',
        icon: LayoutCells,
        size: kpiSize,
        render: ({ data, rangeLabel }) => (
            <StatTile kpi={data.kpi.revenue} format={fmt.moneyCompact} period={rangeLabel} />
        ),
    },
    'kpi-orders': {
        title: 'Заказы',
        group: 'Показатели',
        icon: LayoutCells,
        size: kpiSize,
        render: ({ data, rangeLabel }) => <StatTile kpi={data.kpi.orders} format={fmt.int} period={rangeLabel} />,
    },
    'kpi-conversion': {
        title: 'Конверсия',
        group: 'Показатели',
        icon: LayoutCells,
        size: kpiSize,
        render: ({ data, rangeLabel }) => <StatTile kpi={data.kpi.conversion} format={fmt.pct} period={rangeLabel} />,
    },
    'kpi-aov': {
        title: 'Средний чек',
        group: 'Показатели',
        icon: LayoutCells,
        size: kpiSize,
        render: ({ data, rangeLabel }) => <StatTile kpi={data.kpi.aov} format={fmt.money} period={rangeLabel} />,
    },

    'revenue-trend': {
        title: 'Выручка по дням',
        subtitle: ({ rangeLabel }) => `Текущие ${rangeLabel} против предыдущих`,
        group: 'Графики',
        icon: ChartLine,
        size: { w: 8, h: 5, minW: 4, minH: 3 },
        hasTableView: true,
        render: ({ data, asTable }) => {
            if (asTable) {
                return (
                    <DataTable
                        data={data.days}
                        columns={[
                            { id: 'date', name: 'Дата', template: (d) => fmt.date(d.date) },
                            { id: 'revenue', name: 'Текущий период', align: 'end', template: (d) => num(fmt.money(d.revenue)) },
                            { id: 'prevRevenue', name: 'Предыдущий', align: 'end', template: (d) => num(fmt.money(d.prevRevenue)) },
                        ]}
                    />
                );
            }
            return (
                <LineChart
                    label="Выручка по дням: текущий и предыдущий период"
                    dates={data.days.map((d) => d.date)}
                    format={fmt.money}
                    series={[
                        { id: 'cur', name: 'Текущий период', color: C.s1, values: data.days.map((d) => d.revenue) },
                        { id: 'prev', name: 'Предыдущий период', color: C.s2, values: data.days.map((d) => d.prevRevenue) },
                    ]}
                />
            );
        },
    },

    channels: {
        title: 'Выручка по каналам',
        group: 'Графики',
        icon: ChartColumn,
        size: { w: 4, h: 5, minW: 3, minH: 3 },
        hasTableView: true,
        render: ({ data, asTable }) =>
            asTable ? (
                <DataTable
                    data={data.channels}
                    columns={[
                        { id: 'name', name: 'Канал' },
                        { id: 'revenue', name: 'Выручка', align: 'end', template: (c) => num(fmt.money(c.revenue)) },
                    ]}
                />
            ) : (
                <BarList
                    color={C.s1}
                    format={fmt.money}
                    items={data.channels.map((c) => ({ name: c.name, value: c.revenue }))}
                />
            ),
    },

    devices: {
        title: 'Визиты по устройствам',
        subtitle: ({ data }) => `Всего ${fmt.int(data.devices.reduce((s, d) => s + d.visits, 0))} визитов`,
        group: 'Графики',
        icon: ChartColumn,
        size: { w: 6, h: 2, minW: 3, minH: 2, maxH: 3 },
        hasTableView: true,
        render: ({ data, asTable }) => {
            const total = data.devices.reduce((s, d) => s + d.visits, 0);
            return asTable ? (
                <DataTable
                    data={data.devices}
                    columns={[
                        { id: 'name', name: 'Устройство' },
                        { id: 'visits', name: 'Визиты', align: 'end', template: (d) => num(fmt.int(d.visits)) },
                        { id: 'share', name: 'Доля', align: 'end', template: (d) => num(fmt.pct(d.visits / total)) },
                    ]}
                />
            ) : (
                <SegmentedBar
                    label="Визиты по устройствам"
                    format={(v) => `${fmt.int(v)} визитов`}
                    parts={data.devices.map((d, k) => ({
                        name: d.name,
                        value: d.visits,
                        color: [C.s1, C.s2, C.s3][k],
                        ink: '#ffffff',
                    }))}
                />
            );
        },
    },

    goal: {
        title: 'План выручки на ноябрь',
        group: 'Показатели',
        icon: LayoutCells,
        size: { w: 6, h: 2, minW: 3, minH: 2, maxH: 3 },
        render: ({ data }) => {
            const { actual, target, elapsedShare } = data.goal;
            const share = actual / target;
            const pace = share / elapsedShare;
            const status =
                pace >= 1
                    ? { severity: 'accent' as const, theme: 'success' as const, icon: CircleCheck, text: 'Опережаем план' }
                    : pace >= 0.9
                      ? { severity: 'warning' as const, theme: 'warning' as const, icon: TriangleExclamation, text: 'Немного отстаём' }
                      : { severity: 'danger' as const, theme: 'danger' as const, icon: TriangleExclamation, text: 'Отстаём от плана' };
            return (
                <div className="goal">
                    <div className="goal__head">
                        <span className="goal__value">{fmt.pct(share)}</span>
                        <Label theme={status.theme} icon={<Icon data={status.icon} size={14} />}>
                            {status.text}
                        </Label>
                    </div>
                    <Meter
                        value={actual}
                        max={target}
                        severity={status.severity}
                        label="Выполнение плана выручки"
                        marker={{ share: elapsedShare, label: `Ожидаемо к сегодняшнему дню: ${fmt.pct(elapsedShare)}` }}
                    />
                    <Text variant="caption-2" color="secondary" className="goal__caption">
                        {fmt.moneyCompact(actual)} из {fmt.moneyCompact(target)} · отметка — ожидаемый темп ({fmt.pct(elapsedShare)})
                    </Text>
                </div>
            );
        },
    },

    'top-products': {
        title: 'Топ товаров',
        group: 'Таблицы',
        icon: ListUl,
        size: { w: 12, h: 5, minW: 4, minH: 3 },
        render: ({ data }) => (
            <DataTable
                data={data.products}
                columns={[
                    { id: 'name', name: 'Товар' },
                    { id: 'category', name: 'Категория', template: (p) => <Text color="secondary">{p.category}</Text> },
                    { id: 'orders', name: 'Заказы', align: 'end', template: (p) => num(fmt.int(p.orders)) },
                    { id: 'revenue', name: 'Выручка', align: 'end', template: (p) => num(fmt.money(p.revenue)) },
                    {
                        id: 'delta',
                        name: 'Динамика',
                        align: 'end',
                        template: (p) => (
                            <span className={`delta-cell delta-cell_${p.delta >= 0 ? 'good' : 'bad'}`}>
                                <Icon data={p.delta >= 0 ? ArrowUp : ArrowDown} size={12} />
                                {num(`${Math.abs(p.delta).toLocaleString('ru-RU')} %`)}
                            </span>
                        ),
                    },
                ]}
            />
        ),
    },
};

export const WIDGET_GROUPS: WidgetDefinition['group'][] = ['Показатели', 'Графики', 'Таблицы'];
