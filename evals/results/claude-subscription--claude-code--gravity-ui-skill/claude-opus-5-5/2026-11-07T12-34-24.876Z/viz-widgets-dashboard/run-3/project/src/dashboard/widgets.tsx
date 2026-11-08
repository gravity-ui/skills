import type {ReactNode} from 'react';
import {Card, Flex, Icon, Label, Progress, Table, Text} from '@gravity-ui/uikit';
import type {LabelProps, ProgressTheme, TableColumnConfig} from '@gravity-ui/uikit';
import {
    ArrowDownRight,
    ArrowUpRight,
    ChartColumn,
    Clock,
    CreditCard,
    Persons,
    ShoppingCart,
    Target,
} from '@gravity-ui/icons';
import type {IconData} from '@gravity-ui/uikit';

import {ACTIVITY, DEALS, GOALS} from './data';
import type {Deal, DealStage, KpiIcon} from './data';

/* ---------- Общая рамка виджета ---------- */

interface WidgetFrameProps {
    title: string;
    icon?: IconData;
    children: ReactNode;
}

export function WidgetFrame({title, icon, children}: WidgetFrameProps) {
    return (
        <Card view="outlined" className="widget">
            <Flex className="widget__header" alignItems="center" gap={2}>
                {icon ? <Icon data={icon} size={16} className="widget__header-icon" /> : null}
                <Text variant="subheader-2" ellipsis className="widget__title">
                    {title}
                </Text>
            </Flex>
            <div className="widget__body">{children}</div>
        </Card>
    );
}

/* ---------- KPI ---------- */

const KPI_ICONS: Record<KpiIcon, IconData> = {
    revenue: CreditCard,
    orders: ShoppingCart,
    customers: Persons,
    conversion: ChartColumn,
};

interface KpiWidgetProps {
    title: string;
    value: string;
    delta: number;
    icon: KpiIcon;
}

export function KpiWidget({title, value, delta, icon}: KpiWidgetProps) {
    const positive = delta >= 0;
    return (
        <Card view="outlined" className="widget widget_kpi">
            <Flex alignItems="center" gap={2} className="widget__header">
                <Icon data={KPI_ICONS[icon] ?? ChartColumn} size={16} className="widget__header-icon" />
                <Text variant="body-2" color="secondary" ellipsis className="widget__title">
                    {title}
                </Text>
            </Flex>
            <Flex className="widget__body" direction="column" justifyContent="center" gap={1}>
                <Text variant="display-1" ellipsis>
                    {value}
                </Text>
                <Flex alignItems="center" gap={2} wrap>
                    <Label
                        theme={positive ? 'success' : 'danger'}
                        size="xs"
                        icon={<Icon data={positive ? ArrowUpRight : ArrowDownRight} size={12} />}
                    >
                        {`${positive ? '+' : ''}${delta.toFixed(1)}%`}
                    </Label>
                    <Text variant="caption-2" color="secondary">
                        к прошлому месяцу
                    </Text>
                </Flex>
            </Flex>
        </Card>
    );
}

/* ---------- Цели ---------- */

function goalTheme(percent: number): ProgressTheme {
    if (percent >= 90) return 'success';
    if (percent >= 60) return 'info';
    return 'warning';
}

export function GoalsWidget({title}: {title: string}) {
    return (
        <WidgetFrame title={title} icon={Target}>
            <Flex direction="column" gap={4}>
                {GOALS.map((goal) => {
                    const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                    const unit = goal.unit ? ` ${goal.unit}` : '';
                    return (
                        <Flex key={goal.id} direction="column" gap={1}>
                            <Flex justifyContent="space-between" alignItems="baseline" gap={2}>
                                <Text variant="body-1" ellipsis className="widget__flexible">
                                    {goal.name}
                                </Text>
                                <Text variant="caption-2" color="secondary" className="widget__fixed">
                                    {`${goal.current}${unit} из ${goal.target}${unit} · ${percent}%`}
                                </Text>
                            </Flex>
                            <Progress value={percent} theme={goalTheme(percent)} size="s" />
                        </Flex>
                    );
                })}
            </Flex>
        </WidgetFrame>
    );
}

/* ---------- Сделки ---------- */

const STAGES: Record<DealStage, {text: string; theme: LabelProps['theme']}> = {
    new: {text: 'Новая', theme: 'info'},
    negotiation: {text: 'Переговоры', theme: 'warning'},
    won: {text: 'Выиграна', theme: 'success'},
    lost: {text: 'Проиграна', theme: 'danger'},
};

const DEAL_COLUMNS: TableColumnConfig<Deal>[] = [
    {id: 'client', name: 'Клиент'},
    {id: 'manager', name: 'Менеджер'},
    {id: 'amount', name: 'Сумма', align: 'end'},
    {
        id: 'stage',
        name: 'Этап',
        template: (deal) => (
            <Label theme={STAGES[deal.stage].theme} size="xs">
                {STAGES[deal.stage].text}
            </Label>
        ),
    },
];

export function DealsWidget({title}: {title: string}) {
    return (
        <WidgetFrame title={title} icon={CreditCard}>
            {/* Горизонтальная прокрутка живёт внутри виджета, а не на странице. */}
            <div className="widget__scroll-x">
                <Table className="widget__table" data={DEALS} columns={DEAL_COLUMNS} width="max" />
            </div>
        </WidgetFrame>
    );
}

/* ---------- Лента активности ---------- */

export function ActivityWidget({title}: {title: string}) {
    return (
        <WidgetFrame title={title} icon={Clock}>
            <Flex direction="column" gap={3} as="ul" className="widget__list">
                {ACTIVITY.map((event) => (
                    <Flex as="li" key={event.id} gap={3} alignItems="baseline">
                        <Text variant="caption-2" color="secondary" className="widget__time">
                            {event.time}
                        </Text>
                        <Text variant="body-1" className="widget__flexible">
                            <Text variant="subheader-1">{event.author}</Text> {event.text}
                        </Text>
                    </Flex>
                ))}
            </Flex>
        </WidgetFrame>
    );
}
