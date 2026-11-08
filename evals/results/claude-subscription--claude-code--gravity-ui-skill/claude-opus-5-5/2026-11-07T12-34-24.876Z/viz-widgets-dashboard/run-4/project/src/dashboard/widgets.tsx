import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {ArrowDown, ArrowRight, ArrowUp} from '@gravity-ui/icons';
import {Card, Flex, Icon, Label, Progress, Table, Text} from '@gravity-ui/uikit';
import type {LabelProps, ProgressTheme, TableColumnConfig} from '@gravity-ui/uikit';
import * as React from 'react';

import {formatCount, formatCurrency, formatDelta, formatMetric} from './format';
import type {GoalsData, MetricData, NoteData, Order, OrderStatus, OrdersData} from './types';

type WidgetFrameProps = {
    title: string;
    children: React.ReactNode;
};

/** Общая «рамка» виджета: поверхность, заголовок и прокручиваемое тело. */
function WidgetFrame({title, children}: WidgetFrameProps) {
    return (
        <Card className="widget" view="outlined" type="container">
            <Text className="widget__title" variant="subheader-2" ellipsis title={title}>
                {title}
            </Text>
            <div className="widget__body">{children}</div>
        </Card>
    );
}

function EmptyWidget({text}: {text: string}) {
    return (
        <Flex className="widget__empty" alignItems="center" justifyContent="center">
            <Text color="secondary">{text}</Text>
        </Flex>
    );
}

/* ---------- Метрика (stat tile) ---------- */

export function MetricWidget({data}: PluginWidgetProps) {
    const {title, value, delta, unit, upIsGood, period} = data as unknown as MetricData;
    const isFlat = delta === 0;
    const isGood = isFlat ? null : delta > 0 === upIsGood;
    const deltaColor = isGood === null ? 'secondary' : isGood ? 'positive' : 'danger';
    const deltaIcon = isFlat ? ArrowRight : delta > 0 ? ArrowUp : ArrowDown;

    return (
        <WidgetFrame title={title}>
            <Flex direction="column" gap={1}>
                <Text variant="display-1" className="metric__value">
                    {formatMetric(value, unit)}
                </Text>
                <Flex alignItems="center" gap={1} wrap>
                    <Text color={deltaColor} className="metric__delta">
                        <Icon data={deltaIcon} size={14} />
                        {formatDelta(delta)}
                    </Text>
                    <Text color="secondary">{period}</Text>
                </Flex>
            </Flex>
        </WidgetFrame>
    );
}

/* ---------- Цели (meters) ---------- */

function goalTheme(ratio: number): ProgressTheme {
    if (ratio >= 1) return 'success';
    if (ratio >= 0.7) return 'info';
    if (ratio >= 0.4) return 'warning';
    return 'danger';
}

export function GoalsWidget({data}: PluginWidgetProps) {
    const {title, goals} = data as unknown as GoalsData;

    return (
        <WidgetFrame title={title}>
            {goals.length === 0 ? (
                <EmptyWidget text="Цели не заданы" />
            ) : (
                <Flex direction="column" gap={4}>
                    {goals.map((goal) => {
                        const ratio = goal.target > 0 ? goal.value / goal.target : 0;
                        const percent = Math.round(ratio * 100);
                        return (
                            <Flex key={goal.name} direction="column" gap={1}>
                                <Flex justifyContent="space-between" gap={2}>
                                    <Text ellipsis className="goal__name">
                                        {goal.name}
                                    </Text>
                                    <Text color="secondary" className="goal__value">
                                        {formatCount(goal.value)} / {formatCount(goal.target)} ·{' '}
                                        {percent}%
                                    </Text>
                                </Flex>
                                <Progress
                                    value={Math.min(percent, 100)}
                                    theme={goalTheme(ratio)}
                                    size="s"
                                />
                            </Flex>
                        );
                    })}
                </Flex>
            )}
        </WidgetFrame>
    );
}

/* ---------- Заказы (table) ---------- */

const STATUS: Record<OrderStatus, {text: string; theme: LabelProps['theme']}> = {
    paid: {text: 'Оплачен', theme: 'success'},
    pending: {text: 'Ожидает', theme: 'warning'},
    cancelled: {text: 'Отменён', theme: 'danger'},
};

const ORDER_COLUMNS: TableColumnConfig<Order>[] = [
    {id: 'id', name: '№'},
    {id: 'customer', name: 'Клиент', primary: true},
    {
        id: 'amount',
        name: 'Сумма',
        align: 'end',
        template: (order) => <span className="tabular">{formatCurrency(order.amount)}</span>,
    },
    {
        id: 'status',
        name: 'Статус',
        template: (order) => (
            <Label theme={STATUS[order.status].theme} size="xs">
                {STATUS[order.status].text}
            </Label>
        ),
    },
];

export function OrdersWidget({data}: PluginWidgetProps) {
    const {title, orders} = data as unknown as OrdersData;

    return (
        <WidgetFrame title={title}>
            <div className="orders__scroll">
                <Table
                    className="orders__table"
                    data={orders}
                    columns={ORDER_COLUMNS}
                    width="max"
                    emptyMessage="Заказов пока нет"
                    getRowDescriptor={(order) => ({id: order.id})}
                />
            </div>
        </WidgetFrame>
    );
}

/* ---------- Заметка ---------- */

export function NoteWidget({data}: PluginWidgetProps) {
    const {title, text} = data as unknown as NoteData;

    return (
        <WidgetFrame title={title}>
            {text.trim() ? (
                <Text as="p" className="note__text" whiteSpace="break-spaces">
                    {text}
                </Text>
            ) : (
                <EmptyWidget text="Пустая заметка — откройте настройки виджета" />
            )}
        </WidgetFrame>
    );
}
