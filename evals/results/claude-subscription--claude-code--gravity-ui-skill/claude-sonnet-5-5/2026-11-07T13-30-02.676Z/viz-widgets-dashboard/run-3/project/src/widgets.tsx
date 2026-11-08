import {Card, Flex, Label, Progress, Text} from '@gravity-ui/uikit';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';

/** Widget types registered in DashKit. `title` is the built-in DashKit plugin. */
export const WidgetType = {
    Title: 'title',
    Kpi: 'kpi',
    Progress: 'progress',
    Activity: 'activity',
} as const;

type KpiData = {
    label: string;
    value: string;
    delta: number;
};

type ProgressData = {
    title: string;
    items: {name: string; value: number}[];
};

type ActivityData = {
    title: string;
    items: {id: string; text: string; time: string}[];
};

function WidgetCard({title, children}: {title: string; children: React.ReactNode}) {
    return (
        <Card
            view="outlined"
            type="container"
            style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column'}}
        >
            <Flex
                direction="column"
                gap={3}
                style={{flex: 1, minHeight: 0, padding: 'var(--g-spacing-4)'}}
            >
                <Text variant="subheader-2" ellipsis style={{flexShrink: 0}}>
                    {title}
                </Text>
                <div style={{flex: 1, minHeight: 0, overflowY: 'auto'}}>{children}</div>
            </Flex>
        </Card>
    );
}

function KpiWidget({data}: PluginWidgetProps) {
    const {label, value, delta} = data as unknown as KpiData;
    const positive = delta >= 0;
    return (
        <WidgetCard title={label}>
            <Flex direction="column" gap={2}>
                <Text variant="display-2">{value}</Text>
                <div>
                    <Label theme={positive ? 'success' : 'danger'} size="s">
                        {positive ? '+' : ''}
                        {delta}% за неделю
                    </Label>
                </div>
            </Flex>
        </WidgetCard>
    );
}

function ProgressWidget({data}: PluginWidgetProps) {
    const {title, items} = data as unknown as ProgressData;
    return (
        <WidgetCard title={title}>
            <Flex direction="column" gap={4}>
                {items.map((item) => (
                    <Flex key={item.name} direction="column" gap={1}>
                        <Flex justifyContent="space-between" gap={2}>
                            <Text variant="body-2" ellipsis style={{flex: 1, minWidth: 0}}>
                                {item.name}
                            </Text>
                            <Text variant="body-2" color="secondary" style={{flexShrink: 0}}>
                                {item.value}%
                            </Text>
                        </Flex>
                        <Progress
                            value={item.value}
                            size="xs"
                            theme={item.value >= 80 ? 'success' : item.value >= 40 ? 'info' : 'warning'}
                        />
                    </Flex>
                ))}
            </Flex>
        </WidgetCard>
    );
}

function ActivityWidget({data}: PluginWidgetProps) {
    const {title, items} = data as unknown as ActivityData;
    return (
        <WidgetCard title={title}>
            <Flex direction="column" gap={3}>
                {items.map((item) => (
                    <Flex key={item.id} gap={3} alignItems="baseline">
                        <Text
                            variant="caption-2"
                            color="secondary"
                            style={{flexShrink: 0, width: 44}}
                        >
                            {item.time}
                        </Text>
                        <Text variant="body-2" style={{flex: 1, minWidth: 0}}>
                            {item.text}
                        </Text>
                    </Flex>
                ))}
            </Flex>
        </WidgetCard>
    );
}

export const kpiPlugin: Plugin = {
    type: WidgetType.Kpi,
    defaultLayout: {w: 9, h: 5, minW: 6, minH: 4},
    renderer: (props) => <KpiWidget {...props} />,
};

export const progressPlugin: Plugin = {
    type: WidgetType.Progress,
    defaultLayout: {w: 14, h: 9, minW: 8, minH: 5},
    renderer: (props) => <ProgressWidget {...props} />,
};

export const activityPlugin: Plugin = {
    type: WidgetType.Activity,
    defaultLayout: {w: 14, h: 9, minW: 8, minH: 5},
    renderer: (props) => <ActivityWidget {...props} />,
};

/** Default `data` for widgets added from the action panel. */
export const newWidgetData: Record<string, Record<string, unknown>> = {
    [WidgetType.Title]: {text: 'Новый раздел', size: 'm', showInTOC: false},
    [WidgetType.Kpi]: {label: 'Новая метрика', value: '0', delta: 0} satisfies KpiData,
    [WidgetType.Progress]: {
        title: 'Прогресс',
        items: [
            {name: 'Задача A', value: 30},
            {name: 'Задача B', value: 75},
        ],
    } satisfies ProgressData,
    [WidgetType.Activity]: {
        title: 'Активность',
        items: [{id: '1', text: 'Виджет добавлен', time: 'сейчас'}],
    } satisfies ActivityData,
};
