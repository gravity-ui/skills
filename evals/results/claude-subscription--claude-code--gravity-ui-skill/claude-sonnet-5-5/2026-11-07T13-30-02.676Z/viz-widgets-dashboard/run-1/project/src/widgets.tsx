import {DashKit, pluginTitle} from '@gravity-ui/dashkit';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Card, Label, Progress, Text} from '@gravity-ui/uikit';

import './widgets.css';

export type WidgetType = 'kpi' | 'progress' | 'activity' | 'note';

type KpiData = {title: string; value: string; delta: string; positive: boolean};
type ProgressData = {title: string; items: {label: string; value: number}[]};
type ActivityData = {title: string; items: {text: string; time: string}[]};
type NoteData = {title: string; text: string};

function KpiWidget({data}: PluginWidgetProps) {
    const {title, value, delta, positive} = data as unknown as KpiData;
    return (
        <Card type="container" view="outlined" className="widget">
            <Text variant="subheader-1" color="secondary">
                {title}
            </Text>
            <Text variant="display-1">{value}</Text>
            <div>
                <Label theme={positive ? 'success' : 'danger'} size="s">
                    {delta}
                </Label>
            </div>
        </Card>
    );
}

function ProgressWidget({data}: PluginWidgetProps) {
    const {title, items} = data as unknown as ProgressData;
    return (
        <Card type="container" view="outlined" className="widget">
            <Text variant="subheader-2">{title}</Text>
            {items.map((item) => (
                <div key={item.label} className="widget__row">
                    <Text variant="body-1">{item.label}</Text>
                    <Progress
                        value={item.value}
                        text={`${item.value}%`}
                        size="s"
                        theme={item.value > 85 ? 'danger' : item.value > 70 ? 'warning' : 'success'}
                    />
                </div>
            ))}
        </Card>
    );
}

function ActivityWidget({data}: PluginWidgetProps) {
    const {title, items} = data as unknown as ActivityData;
    return (
        <Card type="container" view="outlined" className="widget">
            <Text variant="subheader-2">{title}</Text>
            <ul className="widget__list">
                {items.map((item) => (
                    <li key={item.text} className="widget__list-item">
                        <Text variant="body-1" ellipsis>
                            {item.text}
                        </Text>
                        <Text variant="caption-2" color="secondary">
                            {item.time}
                        </Text>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

function NoteWidget({data}: PluginWidgetProps) {
    const {title, text} = data as unknown as NoteData;
    return (
        <Card type="container" view="outlined" className="widget">
            <Text variant="subheader-2">{title}</Text>
            <Text variant="body-2" color="secondary">
                {text}
            </Text>
        </Card>
    );
}

// w/h are in grid units (36 columns, 18px row height by default)
const plugins: Plugin[] = [
    {type: 'kpi', defaultLayout: {w: 9, h: 6, minW: 6, minH: 5}, renderer: KpiWidget},
    {type: 'progress', defaultLayout: {w: 12, h: 9, minW: 8, minH: 6}, renderer: ProgressWidget},
    {type: 'activity', defaultLayout: {w: 12, h: 10, minW: 8, minH: 6}, renderer: ActivityWidget},
    {type: 'note', defaultLayout: {w: 12, h: 6, minW: 6, minH: 4}, renderer: NoteWidget},
];

export function setupDashKit() {
    DashKit.setSettings({
        gridLayout: {margin: [12, 12]},
        isMobile: window.matchMedia('(max-width: 767px)').matches,
    });
    DashKit.registerPlugins(pluginTitle, ...plugins);
}

export const defaultWidgetData: Record<WidgetType, Record<string, unknown>> = {
    kpi: {title: 'Новая метрика', value: '0', delta: '+0%', positive: true},
    progress: {
        title: 'Загрузка ресурсов',
        items: [
            {label: 'CPU', value: 45},
            {label: 'Память', value: 62},
            {label: 'Диск', value: 80},
        ],
    },
    activity: {
        title: 'Последние события',
        items: [
            {text: 'Выкатили версию 2.14', time: '5 мин назад'},
            {text: 'Алерт: рост latency', time: '23 мин назад'},
            {text: 'Добавлен новый узел', time: '1 ч назад'},
        ],
    },
    note: {title: 'Заметка', text: 'Перетащите виджет за любое место или потяните за угол, чтобы изменить размер.'},
};
