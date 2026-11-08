import React from 'react';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {ActionPanelItem, Config, ItemDropProps} from '@gravity-ui/dashkit';
import {
    ArrowRotateLeft,
    ChartLine,
    Check,
    Heading,
    ListUl,
    Pencil,
    Speedometer,
    TextAlignLeft,
} from '@gravity-ui/icons';
import {Button, Flex, Icon, Text, configure, Lang} from '@gravity-ui/uikit';

import {defaultWidgetData, setupDashKit} from './widgets';
import type {WidgetType} from './widgets';

import './App.css';

configure({lang: Lang.Ru});
setupDashKit();

const STORAGE_KEY = 'viz-widgets-dashboard:config';
const NAMESPACE = 'default';

type AddableType = WidgetType | 'title';

const titleData = {size: 'm', text: 'Новый раздел', showInTOC: false};

const initialConfig: Config = {
    salt: '0.1',
    counter: 8,
    items: [
        {id: 'title', type: 'title', namespace: NAMESPACE, data: {size: 'l', text: 'Состояние сервиса', showInTOC: false}},
        {id: 'kpi1', type: 'kpi', namespace: NAMESPACE, data: {title: 'Запросов в минуту', value: '12 480', delta: '+8,2%', positive: true}},
        {id: 'kpi2', type: 'kpi', namespace: NAMESPACE, data: {title: 'Ошибки 5xx', value: '0,4%', delta: '+0,1 п.п.', positive: false}},
        {id: 'kpi3', type: 'kpi', namespace: NAMESPACE, data: {title: 'p95 latency', value: '182 мс', delta: '−12 мс', positive: true}},
        {id: 'kpi4', type: 'kpi', namespace: NAMESPACE, data: {title: 'Активные узлы', value: '24', delta: '+2', positive: true}},
        {id: 'res', type: 'progress', namespace: NAMESPACE, data: defaultWidgetData.progress},
        {id: 'log', type: 'activity', namespace: NAMESPACE, data: defaultWidgetData.activity},
        {id: 'note', type: 'note', namespace: NAMESPACE, data: defaultWidgetData.note},
    ],
    layout: [
        {i: 'title', x: 0, y: 0, w: 36, h: 2},
        {i: 'kpi1', x: 0, y: 2, w: 9, h: 6},
        {i: 'kpi2', x: 9, y: 2, w: 9, h: 6},
        {i: 'kpi3', x: 18, y: 2, w: 9, h: 6},
        {i: 'kpi4', x: 27, y: 2, w: 9, h: 6},
        {i: 'res', x: 0, y: 8, w: 12, h: 9},
        {i: 'log', x: 12, y: 8, w: 12, h: 10},
        {i: 'note', x: 24, y: 8, w: 12, h: 6},
    ],
    aliases: {},
    connections: [],
};

function loadConfig(): Config {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw) as Config;
        }
    } catch {
        // повреждённое или недоступное хранилище — начинаем с конфигурации по умолчанию
    }
    return initialConfig;
}

function getItemData(type: AddableType) {
    return type === 'title' ? titleData : defaultWidgetData[type];
}

const panelEntries: {type: AddableType; title: string; icon: React.ComponentProps<typeof Icon>['data']}[] = [
    {type: 'title', title: 'Заголовок', icon: Heading},
    {type: 'kpi', title: 'Метрика', icon: ChartLine},
    {type: 'progress', title: 'Загрузка', icon: Speedometer},
    {type: 'activity', title: 'События', icon: ListUl},
    {type: 'note', title: 'Заметка', icon: TextAlignLeft},
];

export function App() {
    const [config, setConfig] = React.useState<Config>(loadConfig);
    const [editMode, setEditMode] = React.useState(false);

    React.useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch {
            // хранилище недоступно — дашборд работает без сохранения
        }
    }, [config]);

    const addWidget = React.useCallback((type: AddableType) => {
        setConfig((prev) =>
            DashKit.setItem({
                item: {type, namespace: NAMESPACE, data: getItemData(type)},
                config: prev,
            }),
        );
    }, []);

    const onDrop = React.useCallback((dropProps: ItemDropProps) => {
        const type = dropProps.dragProps.type as AddableType;
        setConfig((prev) =>
            DashKit.setItem({
                item: {
                    type,
                    namespace: NAMESPACE,
                    data: getItemData(type),
                    layout: {
                        x: dropProps.itemLayout.x,
                        y: dropProps.itemLayout.y,
                        w: dropProps.itemLayout.w,
                        h: dropProps.itemLayout.h,
                    },
                },
                config: prev,
                options: {updateLayout: dropProps.newLayout},
            }),
        );
        dropProps.commit();
    }, []);

    const panelItems = React.useMemo<ActionPanelItem[]>(
        () =>
            panelEntries.map(({type, title, icon}) => ({
                id: type,
                title,
                icon: <Icon data={icon} size={18} />,
                onClick: () => addWidget(type),
                dragProps: {type},
            })),
        [addWidget],
    );

    return (
        <div className="app">
            <Flex className="app__header" alignItems="center" justifyContent="space-between" gap={3} wrap>
                <Flex direction="column" gap={1}>
                    <Text variant="header-2">Дашборд</Text>
                    <Text variant="body-1" color="secondary">
                        {editMode
                            ? 'Перетаскивайте виджеты, меняйте размер за угол, добавляйте из панели'
                            : 'Нажмите «Редактировать», чтобы изменить расположение виджетов'}
                    </Text>
                </Flex>
                <Flex gap={2}>
                    {editMode && (
                        <Button view="outlined" onClick={() => setConfig(initialConfig)}>
                            <Icon data={ArrowRotateLeft} size={16} />
                            Сбросить
                        </Button>
                    )}
                    <Button
                        view={editMode ? 'action' : 'normal'}
                        onClick={() => setEditMode((value) => !value)}
                    >
                        <Icon data={editMode ? Check : Pencil} size={16} />
                        {editMode ? 'Готово' : 'Редактировать'}
                    </Button>
                </Flex>
            </Flex>
            <DashKitDnDWrapper>
                <>
                    <DashKit
                        config={config}
                        editMode={editMode}
                        onChange={({config: next}) => setConfig(next)}
                        onDrop={onDrop}
                    />
                    <ActionPanel items={panelItems} disable={!editMode} toggleAnimation />
                </>
            </DashKitDnDWrapper>
        </div>
    );
}
