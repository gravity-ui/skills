import {Flex, Label, Progress, Table, ThemeProvider, Text} from '@gravity-ui/uikit';
import {WidgetShell} from './WidgetShell';
import type {WidgetSize} from './WidgetShell';

const salesData = [
    {name: 'Янв', value: 320},
    {name: 'Фев', value: 410},
    {name: 'Мар', value: 390},
    {name: 'Апр', value: 480},
    {name: 'Май', value: 560},
    {name: 'Июн', value: 620},
];

const metrics = [
    {label: 'Доход', value: '482 900 ₽', trend: '+12,4%'},
    {label: 'Заказы', value: '1 284', trend: '+3,1%'},
    {label: 'Конверсия', value: '4,8%', trend: '-0,3%'},
];

const services = [
    {id: 'api', name: 'API', status: 'Healthy', load: 62},
    {id: 'db', name: 'Database', status: 'Busy', load: 84},
    {id: 'cdn', name: 'CDN', status: 'Healthy', load: 38},
];

type ServiceRow = (typeof services)[number];

const columns = [
    {id: 'name', name: 'Сервис'},
    {id: 'status', name: 'Статус'},
    {id: 'load', name: 'Нагрузка'},
];

interface WidgetProps {
    size: WidgetSize;
    onRemove: () => void;
    onSizeChange: (size: WidgetSize) => void;
    style?: React.CSSProperties;
}

export function RevenueChartWidget({size, onRemove, onSizeChange, style}: WidgetProps) {
    return (
        <WidgetShell title="Выручка" size={size} onRemove={onRemove} onSizeChange={onSizeChange} style={style}>
            <Flex direction="column" gap="2" justifyItems="end" width="100%">
                {salesData.map((point) => (
                    <Flex key={point.name} justifyContent="space-between" alignItems="flex-end">
                        <Text color="secondary">{point.name}</Text>
                        <div style={{width: 8, height: point.value / 4, background: 'var(--g-color-base-info)'}} />
                        <Text>{point.value}</Text>
                    </Flex>
                ))}
            </Flex>
        </WidgetShell>
    );
}

export function MetricsWidget({size, onRemove, onSizeChange, style}: WidgetProps) {
    return (
        <WidgetShell title="Ключевые метрики" size={size} onRemove={onRemove} onSizeChange={onSizeChange} style={style}>
            <Flex direction="column" gap="4" justifyItems="center" width="100%">
                {metrics.map((metric) => (
                    <Flex key={metric.label} direction="column" gap="1" width="100%">
                        <Flex justifyContent="space-between">
                            <Text color="secondary">{metric.label}</Text>
                            <Text variant="caption-2">{metric.trend}</Text>
                        </Flex>
                        <Text variant="display-1">{metric.value}</Text>
                    </Flex>
                ))}
            </Flex>
        </WidgetShell>
    );
}

export function ServicesWidget({size, onRemove, onSizeChange, style}: WidgetProps) {
    return (
        <WidgetShell title="Состояние сервисов" size={size} onRemove={onRemove} onSizeChange={onSizeChange} style={style}>
            <Flex direction="column" gap="4" width="100%">
                {services.map((service) => (
                    <Flex key={service.id} direction="column" gap="2">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text>{service.name}</Text>
                            <Label theme={service.status === 'Busy' ? 'warning' : 'success'}>
                                {service.status}
                            </Label>
                        </Flex>
                        <Progress value={service.load} theme="info" />
                    </Flex>
                ))}
            </Flex>
        </WidgetShell>
    );
}

export function OrdersWidget({size, onRemove, onSizeChange, style}: WidgetProps) {
    return (
        <WidgetShell title="Заказы" size={size} onRemove={onRemove} onSizeChange={onSizeChange} style={style}>
            <Table<ServiceRow>
                columns={columns}
                data={services}
                width="max"
            />
        </WidgetShell>
    );
}
