import './dashboard/setup';
import './App.css';

import React from 'react';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {
    ActionPanelItem,
    Config,
    ConfigItem,
    DashKitProps,
    ItemDropProps,
    MenuItem,
} from '@gravity-ui/dashkit';
import {
    ArrowRotateLeft,
    ChartColumn,
    ChartLine,
    ChartPie,
    Check,
    Copy,
    Heading,
    LayoutHeaderCells,
    Pencil,
    TextAlignLeft,
    Thunderbolt,
    TrashBin,
} from '@gravity-ui/icons';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';

import {NAMESPACE, createWidgetData, initialConfig} from './dashboard/config';
import {WIDGET_TYPE} from './dashboard/widgets';

const STORAGE_KEY = 'gravity-dashboard-config-v1';

function loadConfig(): Config {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Config;
            if (Array.isArray(parsed.items) && Array.isArray(parsed.layout)) {
                return parsed;
            }
        }
    } catch {
        // Corrupted storage — fall back to the default layout.
    }
    return initialConfig;
}

function saveConfig(config: Config) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
        // Storage may be unavailable (private mode, quota) — layout simply won't persist.
    }
}

/** Adds a widget of `type` to the config: at `layout` if given, otherwise at the bottom. */
function addWidget(
    config: Config,
    type: string,
    options: {layout?: {x: number; y: number; w: number; h: number}; updateLayout?: Config['layout']} = {},
): Config {
    return DashKit.setItem({
        item: {
            type,
            namespace: NAMESPACE,
            data: createWidgetData(type, config.counter),
            layout: options.layout,
        },
        config,
        options: options.updateLayout ? {updateLayout: options.updateLayout} : undefined,
    });
}

const PALETTE: Array<{type: string; title: string; icon: React.ReactNode}> = [
    {type: WIDGET_TYPE.Metric, title: 'Метрика', icon: <Icon data={Thunderbolt} />},
    {type: WIDGET_TYPE.LineChart, title: 'Линейный график', icon: <Icon data={ChartLine} />},
    {type: WIDGET_TYPE.BarChart, title: 'Столбцы', icon: <Icon data={ChartColumn} />},
    {type: WIDGET_TYPE.PieChart, title: 'Кольцевая', icon: <Icon data={ChartPie} />},
    {type: WIDGET_TYPE.Table, title: 'Таблица', icon: <Icon data={LayoutHeaderCells} />},
    {type: 'title', title: 'Заголовок', icon: <Icon data={Heading} />},
    {type: WIDGET_TYPE.Note, title: 'Заметка', icon: <Icon data={TextAlignLeft} />},
];

export function App() {
    const [config, setConfig] = React.useState<Config>(loadConfig);
    const [editMode, setEditMode] = React.useState(false);

    React.useEffect(() => {
        saveConfig(config);
    }, [config]);

    const handleChange = React.useCallback<NonNullable<DashKitProps['onChange']>>(
        ({config: next}) => setConfig(next),
        [],
    );

    const handleDrop = React.useCallback((dropProps: ItemDropProps) => {
        const {x, y, w, h} = dropProps.itemLayout;
        setConfig((prev) =>
            addWidget(prev, dropProps.dragProps.type, {
                layout: {x, y, w, h},
                updateLayout: dropProps.newLayout,
            }),
        );
        dropProps.commit();
    }, []);

    const duplicateWidget = React.useCallback((item: ConfigItem) => {
        setConfig((prev) => {
            const source = prev.layout.find((l) => l.i === item.id);
            const bottom = prev.layout.reduce((max, l) => Math.max(max, l.y + l.h), 0);
            return DashKit.setItem({
                item: {
                    type: item.type,
                    namespace: item.namespace,
                    data: item.data,
                    layout: source ? {x: 0, y: bottom, w: source.w, h: source.h} : undefined,
                },
                config: prev,
            });
        });
    }, []);

    const overlayMenuItems = React.useMemo<MenuItem[]>(
        () => [
            {
                id: 'duplicate',
                title: 'Дублировать',
                icon: <Icon data={Copy} size={16} />,
                handler: duplicateWidget,
            },
            // No handler: DashKit falls back to its built-in "delete" action.
            {id: 'delete', title: 'Удалить', icon: <Icon data={TrashBin} size={16} />},
        ],
        [duplicateWidget],
    );

    const actionPanelItems = React.useMemo<ActionPanelItem[]>(
        () =>
            PALETTE.map(({type, title, icon}) => ({
                id: type,
                title,
                icon,
                qa: `add-${type}`,
                dragProps: {type},
                onClick: () => setConfig((prev) => addWidget(prev, type)),
            })),
        [],
    );

    const handleReset = () => setConfig(initialConfig);

    const isEmpty = config.items.length === 0;

    return (
        <div className={`dashboard${editMode ? ' dashboard_edit' : ''}`}>
            <Flex className="dashboard__toolbar" alignItems="center" gap={3} wrap>
                <Flex direction="column" className="dashboard__heading">
                    <Text variant="header-1" ellipsis>
                        Дашборд
                    </Text>
                    <Text variant="body-1" color="secondary" ellipsis>
                        {editMode
                            ? 'Перетаскивайте виджеты за любое место, меняйте размер за углы. Новые — из панели снизу.'
                            : 'Нажмите «Настроить», чтобы изменить расположение виджетов.'}
                    </Text>
                </Flex>
                <Flex gap={2} className="dashboard__actions">
                    {editMode ? (
                        <Button view="outlined" size="l" onClick={handleReset}>
                            <Icon data={ArrowRotateLeft} />
                            Сбросить
                        </Button>
                    ) : null}
                    <Button
                        view={editMode ? 'action' : 'normal'}
                        size="l"
                        onClick={() => setEditMode((v) => !v)}
                        selected={editMode}
                    >
                        <Icon data={editMode ? Check : Pencil} />
                        {editMode ? 'Готово' : 'Настроить'}
                    </Button>
                </Flex>
            </Flex>

            <DashKitDnDWrapper>
                {/* DashKitDnDWrapper accepts a single element child */}
                <div className="dashboard__workspace">
                    <div className="dashboard__grid">
                        {isEmpty ? (
                            <div className="dashboard__empty">
                                <Text variant="subheader-2">На дашборде нет виджетов</Text>
                                <Text color="secondary">
                                    {editMode
                                        ? 'Перетащите виджет из панели снизу или кликните по нему.'
                                        : 'Включите режим настройки, чтобы добавить виджеты.'}
                                </Text>
                            </div>
                        ) : null}
                        <DashKit
                            config={config}
                            editMode={editMode}
                            onChange={handleChange}
                            onDrop={handleDrop}
                            overlayMenuItems={overlayMenuItems}
                        />
                    </div>
                    {editMode ? (
                        <ActionPanel items={actionPanelItems} className="dashboard__action-panel" />
                    ) : null}
                </div>
            </DashKitDnDWrapper>
        </div>
    );
}
