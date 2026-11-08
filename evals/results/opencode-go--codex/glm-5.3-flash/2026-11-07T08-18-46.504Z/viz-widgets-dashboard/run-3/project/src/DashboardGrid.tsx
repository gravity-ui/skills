import {useCallback, useMemo, useState} from 'react';
import {Button, Flex, Select} from '@gravity-ui/uikit';
import {
    MetricsWidget,
    OrdersWidget,
    RevenueChartWidget,
    ServicesWidget,
} from './widgets';
import type {WidgetSize} from './WidgetShell';

type WidgetKind = 'metrics' | 'revenue' | 'services' | 'orders';

interface DashboardWidget {
    id: string;
    kind: WidgetKind;
    size: WidgetSize;
}

const initialWidgets: DashboardWidget[] = [
    {id: 'metrics-1', kind: 'metrics', size: 'medium'},
    {id: 'revenue-1', kind: 'revenue', size: 'large'},
    {id: 'services-1', kind: 'services', size: 'medium'},
    {id: 'orders-1', kind: 'orders', size: 'small'},
];

const widgetTitles: Record<WidgetKind, string> = {
    metrics: 'Метрики',
    revenue: 'Выручка',
    services: 'Сервисы',
    orders: 'Заказы',
};

const spans: Record<WidgetSize, string> = {
    small: 'span 1 / span 1',
    medium: 'span 2 / span 2',
    large: 'span 4 / span 4',
};

export function DashboardGrid() {
    const [widgets, setWidgets] = useState(initialWidgets);
    const [dragId, setDragId] = useState<string>();

    const nextWidget = useMemo(() => {
        const count = widgets.length;
        const kinds: WidgetKind[] = ['metrics', 'revenue', 'services', 'orders'];
        return {
            kind: kinds[count % kinds.length],
            id: `${kinds[count % kinds.length]}-${count + 1}`,
        };
    }, [widgets.length]);

    const handleSize = useCallback((id: string, size: WidgetSize) => {
        setWidgets((prev) => prev.map((item) => (item.id === id ? {...item, size} : item)));
    }, []);

    const handleRemove = useCallback((id: string) => {
        setWidgets((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const handleDrop = useCallback((targetId: string) => {
        if (!dragId || dragId === targetId) return;
        setWidgets((prev) => {
            const sourceIndex = prev.findIndex((item) => item.id === dragId);
            const targetIndex = prev.findIndex((item) => item.id === targetId);
            const reordered = [...prev];
            const [moved] = reordered.splice(sourceIndex, 1);
            reordered.splice(targetIndex, 0, moved);
            return reordered;
        });
        setDragId(undefined);
    }, [dragId]);

    return (
        <Flex direction="column" gap="4" width="100%">
            <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap="4">
                <h1 style={{margin: 0, fontSize: 24}}>Дашборд</h1>
                <Flex gap="4" alignItems="center">
                    <Select
                        size="m"
                        value={[nextWidget.kind]}
                        onUpdate={() => undefined}
                        width={160}
                    >
                        {Object.entries(widgetTitles).map(([kind, title]) => (
                            <Select.Option key={kind} value={kind}>
                                {title}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button
                        view="action"
                        onClick={() =>
                            setWidgets((prev) => [
                                ...prev,
                                {id: `${nextWidget.id}-${Date.now()}`, kind: nextWidget.kind, size: 'medium'},
                            ])
                        }
                    >
                        Добавить виджет
                    </Button>
                </Flex>
            </Flex>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: 14,
                    minHeight: 240,
                }}
            >
                {widgets.map((widget) => {
                    const commonProps = {
                        size: widget.size,
                        onRemove: () => handleRemove(widget.id),
                        onSizeChange: (size: WidgetSize) => handleSize(widget.id, size),
                        style: {
                            gridColumn: spans[widget.size],
                            cursor: dragId === widget.id ? 'grabbing' : 'grab',
                            opacity: dragId === widget.id ? 0.65 : 1,
                            transition: 'opacity 150ms ease',
                        },
                    };

                    const onDragStart = () => setDragId(widget.id);

                    if (widget.kind === 'metrics') {
                        return (
                            <div key={widget.id} draggable onDragStart={onDragStart} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(widget.id)}>
                                <MetricsWidget {...commonProps} />
                            </div>
                        );
                    }
                    if (widget.kind === 'revenue') {
                        return (
                            <div key={widget.id} draggable onDragStart={onDragStart} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(widget.id)}>
                                <RevenueChartWidget {...commonProps} />
                            </div>
                        );
                    }
                    if (widget.kind === 'services') {
                        return (
                            <div key={widget.id} draggable onDragStart={onDragStart} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(widget.id)}>
                                <ServicesWidget {...commonProps} />
                            </div>
                        );
                    }
                    return (
                        <div key={widget.id} draggable onDragStart={onDragStart} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(widget.id)}>
                            <OrdersWidget {...commonProps} />
                        </div>
                    );
                })}
            </div>
        </Flex>
    );
}
