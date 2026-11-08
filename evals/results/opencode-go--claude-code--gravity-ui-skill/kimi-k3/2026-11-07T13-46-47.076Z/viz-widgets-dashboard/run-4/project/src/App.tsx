import React from 'react';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles.css';
import './setup';

import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {Config, ItemDropProps, ItemsStateAndParams} from '@gravity-ui/dashkit';
import {
    ArrowRotateLeft,
    ChartColumn,
    ChartLine,
    ChartPie,
    Hashtag,
    Heading,
    Moon,
    Sun,
    TextAlignLeft,
} from '@gravity-ui/icons';
import {Button, Flex, Icon, Switch, Text, ThemeProvider, Tooltip} from '@gravity-ui/uikit';

import type {WidgetTemplateId} from './templates';
import {WIDGET_TEMPLATES, createInitialConfig} from './templates';

const STORAGE_KEY = 'gravity-dashboard-config:v1';

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
        // corrupted or unavailable storage — fall back to the default config
    }
    return createInitialConfig();
}

type ActionPanelItems = React.ComponentProps<typeof ActionPanel>['items'];

const panelItem = (
    templateId: WidgetTemplateId,
    title: string,
    icon: React.ComponentProps<typeof Icon>['data'],
): ActionPanelItems[number] => ({
    id: templateId,
    title,
    icon: <Icon data={icon} size={16} />,
    dragProps: {
        type: WIDGET_TEMPLATES[templateId].type,
        layout: WIDGET_TEMPLATES[templateId].dragLayout,
        extra: {templateId},
    },
});

export function App() {
    const [config, setConfig] = React.useState<Config>(loadConfig);
    const [itemsStateAndParams, setItemsStateAndParams] = React.useState<ItemsStateAndParams>({});
    const [editMode, setEditMode] = React.useState(false);
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

    React.useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch {
            // storage unavailable — the dashboard still works without persistence
        }
    }, [config]);

    const handleChange = React.useCallback(
        (data: {config: Config; itemsStateAndParams: ItemsStateAndParams}) => {
            setConfig(data.config);
            setItemsStateAndParams(data.itemsStateAndParams);
        },
        [],
    );

    const handleDrop = React.useCallback((dropProps: ItemDropProps) => {
        const templateId = dropProps.dragProps.extra?.templateId as WidgetTemplateId | undefined;
        const template = templateId ? WIDGET_TEMPLATES[templateId] : undefined;

        if (template) {
            setConfig((current) =>
                DashKit.setItem({
                    item: {
                        type: template.type,
                        namespace: 'default',
                        data: template.createData(),
                        layout: dropProps.itemLayout,
                    },
                    config: current,
                    options: {updateLayout: dropProps.newLayout},
                }),
            );
        }

        dropProps.commit();
    }, []);

    const handleReset = React.useCallback(() => {
        setConfig(createInitialConfig());
        setItemsStateAndParams({});
    }, []);

    const toggleTheme = React.useCallback(() => {
        setTheme((current) => (current === 'light' ? 'dark' : 'light'));
    }, []);

    const actionPanelItems = React.useMemo<ActionPanelItems>(
        () => [
            panelItem('title', 'Заголовок', Heading),
            panelItem('note', 'Заметка', TextAlignLeft),
            panelItem('metric', 'Метрика', Hashtag),
            panelItem('chart-line', 'Линейный график', ChartLine),
            panelItem('chart-bar', 'Столбчатая диаграмма', ChartColumn),
            panelItem('chart-pie', 'Круговая диаграмма', ChartPie),
        ],
        [],
    );

    return (
        <ThemeProvider theme={theme} rootClassName="app-root">
            <>
            <header className="app__header">
                <Flex alignItems="center" gap={3} style={{minWidth: 0}}>
                    <Text variant="header-1" ellipsis>
                        Панель показателей
                    </Text>
                </Flex>
                <Flex alignItems="center" gap={4} style={{flexShrink: 0}}>
                    <Switch
                        size="l"
                        checked={editMode}
                        onUpdate={setEditMode}
                        content="Режим правки"
                    />
                    <Tooltip content="Сбросить раскладку">
                        <Button view="outlined" onClick={handleReset}>
                            <Icon data={ArrowRotateLeft} size={16} />
                            Сбросить
                        </Button>
                    </Tooltip>
                    <Tooltip content={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
                        <Button view="flat" onClick={toggleTheme}>
                            <Icon data={theme === 'light' ? Moon : Sun} size={18} />
                        </Button>
                    </Tooltip>
                </Flex>
            </header>
            <main className="app__main">
                <DashKitDnDWrapper>
                    <>
                    <DashKit
                        config={config}
                        editMode={editMode}
                        itemsStateAndParams={itemsStateAndParams}
                        onChange={handleChange}
                        onDrop={handleDrop}
                    />
                    {editMode ? <ActionPanel items={actionPanelItems} /> : null}
                    </>
                </DashKitDnDWrapper>
            </main>
            </>
        </ThemeProvider>
    );
}
