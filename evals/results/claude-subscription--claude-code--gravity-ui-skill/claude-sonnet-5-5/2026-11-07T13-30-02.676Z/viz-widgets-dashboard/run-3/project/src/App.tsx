import React from 'react';
import {
    ActionPanel,
    DashKit,
    DashKitDnDWrapper,
    pluginTitle,
} from '@gravity-ui/dashkit';
import type {ActionPanelItem, DashKitProps} from '@gravity-ui/dashkit';
import {
    ArrowRotateLeft,
    ChartColumn,
    Check,
    Heading,
    ListCheck,
    Pencil,
    TextAlignLeft,
    Xmark,
} from '@gravity-ui/icons';
import {Button, Flex, Icon, Lang, Text, configure} from '@gravity-ui/uikit';

import {initialConfig} from './initialConfig';
import {
    WidgetType,
    activityPlugin,
    kpiPlugin,
    newWidgetData,
    progressPlugin,
} from './widgets';

configure({lang: Lang.Ru});

DashKit.setSettings({gridLayout: {margin: [12, 12]}});
DashKit.registerPlugins(pluginTitle, kpiPlugin, progressPlugin, activityPlugin);

const STORAGE_KEY = 'dashboard-config';

type Config = DashKitProps['config'];

function loadConfig(): Config {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw) as Config;
        }
    } catch {
        // fall through to the default config
    }
    return initialConfig;
}

const actionPanelItems: ActionPanelItem[] = [
    {
        id: WidgetType.Title,
        title: 'Заголовок',
        icon: <Icon data={Heading} size={16} />,
        dragProps: {type: WidgetType.Title, layout: {w: 36, h: 2}},
    },
    {
        id: WidgetType.Kpi,
        title: 'Метрика',
        icon: <Icon data={ChartColumn} size={16} />,
        dragProps: {type: WidgetType.Kpi},
    },
    {
        id: WidgetType.Progress,
        title: 'Прогресс',
        icon: <Icon data={ListCheck} size={16} />,
        dragProps: {type: WidgetType.Progress},
    },
    {
        id: WidgetType.Activity,
        title: 'События',
        icon: <Icon data={TextAlignLeft} size={16} />,
        dragProps: {type: WidgetType.Activity},
    },
];

export function App() {
    const [savedConfig, setSavedConfig] = React.useState<Config>(loadConfig);
    const [config, setConfig] = React.useState<Config>(savedConfig);
    const [editMode, setEditMode] = React.useState(false);

    const onChange = React.useCallback<NonNullable<DashKitProps['onChange']>>(
        ({config: next}) => setConfig(next),
        [],
    );

    const onDrop = React.useCallback<NonNullable<DashKitProps['onDrop']>>(
        ({commit, dragProps, itemLayout, newLayout}) => {
            setConfig((prev) =>
                DashKit.setItem({
                    item: {
                        type: dragProps.type,
                        namespace: 'default',
                        data: {...newWidgetData[dragProps.type]},
                        layout: {x: itemLayout.x, y: itemLayout.y, w: itemLayout.w, h: itemLayout.h},
                    },
                    config: prev,
                    options: {updateLayout: newLayout},
                }),
            );
            commit();
        },
        [],
    );

    const save = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        setSavedConfig(config);
        setEditMode(false);
    };

    const cancel = () => {
        setConfig(savedConfig);
        setEditMode(false);
    };

    const reset = () => setConfig(initialConfig);

    const dashboard = (
        <div style={{flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: editMode ? 96 : 0}}>
            <DashKit config={config} editMode={editMode} onChange={onChange} onDrop={onDrop} />
        </div>
    );

    return (
        <Flex
            direction="column"
            gap={4}
            style={{height: '100vh', minHeight: 480, padding: 'var(--g-spacing-6)', boxSizing: 'border-box'}}
        >
            <Flex alignItems="center" justifyContent="space-between" gap={3} wrap style={{flexShrink: 0}}>
                <Text variant="header-1">Дашборд</Text>
                {editMode ? (
                    <Flex gap={2}>
                        <Button view="outlined" onClick={reset}>
                            <Icon data={ArrowRotateLeft} size={16} />
                            Сбросить
                        </Button>
                        <Button view="outlined" onClick={cancel}>
                            <Icon data={Xmark} size={16} />
                            Отмена
                        </Button>
                        <Button view="action" onClick={save}>
                            <Icon data={Check} size={16} />
                            Сохранить
                        </Button>
                    </Flex>
                ) : (
                    <Button view="outlined" onClick={() => setEditMode(true)}>
                        <Icon data={Pencil} size={16} />
                        Редактировать
                    </Button>
                )}
            </Flex>

            <DashKitDnDWrapper>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}>
                    {dashboard}
                    {editMode && <ActionPanel items={actionPanelItems} />}
                </div>
            </DashKitDnDWrapper>
        </Flex>
    );
}
