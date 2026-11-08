import './plugins';
import './app.css';

import React from 'react';
import {
    ActionPanel,
    DashKit,
    DashKitDnDWrapper,
    type DashKitProps,
    type ItemDropProps,
} from '@gravity-ui/dashkit';
import {ArrowsRotateRight, Check, Moon, Pencil, Sun} from '@gravity-ui/icons';
import {Button, Flex, Icon, Text, ThemeProvider} from '@gravity-ui/uikit';

import {
    WIDGET_CATALOG,
    createWidgetData,
    initialConfig,
    loadStoredConfig,
    resetStoredConfig,
    storeConfig,
} from './dashboard';

type AppTheme = 'light' | 'dark';

const actionPanelItems = WIDGET_CATALOG.map((widget) => ({
    id: widget.type,
    title: widget.title,
    icon: <Icon data={widget.icon} size={18} />,
    dragProps: {
        type: widget.type,
        layout: {w: widget.defaultLayout.w, h: widget.defaultLayout.h},
    },
}));

export function App() {
    const [theme, setTheme] = React.useState<AppTheme>('light');
    const [editMode, setEditMode] = React.useState(false);
    const [config, setConfig] = React.useState<DashKitProps['config']>(
        () => loadStoredConfig() ?? initialConfig,
    );

    const handleChange = React.useCallback(
        ({config: newConfig}: {config: DashKitProps['config']}) => {
            setConfig(newConfig);
            storeConfig(newConfig);
        },
        [],
    );

    const handleDrop = React.useCallback(
        (dropProps: ItemDropProps) => {
            const {h, w, x, y} = dropProps.itemLayout;
            const newConfig = DashKit.setItem({
                item: {
                    type: dropProps.dragProps.type,
                    namespace: 'default',
                    data: createWidgetData(dropProps.dragProps.type),
                    layout: {h, w, x, y},
                },
                config,
                options: {updateLayout: dropProps.newLayout},
            });
            setConfig(newConfig);
            storeConfig(newConfig);
            dropProps.commit();
        },
        [config],
    );

    const handleReset = React.useCallback(() => {
        resetStoredConfig();
        setConfig(initialConfig);
    }, []);

    return (
        <ThemeProvider scoped theme={theme}>
            <div className="app">
                <header className="app__header">
                    <Text variant="header-1">Дашборд</Text>
                    <Flex gap={2} alignItems="center">
                        {editMode ? (
                            <Button view="flat" size="l" onClick={handleReset}>
                                <Icon data={ArrowsRotateRight} size={16} />
                                Сбросить
                            </Button>
                        ) : null}
                        <Button
                            view="flat"
                            size="l"
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                        >
                            <Icon data={theme === 'light' ? Moon : Sun} size={18} />
                        </Button>
                        <Button
                            view={editMode ? 'action' : 'outlined'}
                            size="l"
                            onClick={() => setEditMode(!editMode)}
                        >
                            <Icon data={editMode ? Check : Pencil} size={16} />
                            {editMode ? 'Готово' : 'Настроить'}
                        </Button>
                    </Flex>
                </header>
                <main className="app__grid">
                    <DashKitDnDWrapper>
                        <>
                            <DashKit
                                config={config}
                                editMode={editMode}
                                onChange={handleChange}
                                onDrop={handleDrop}
                            />
                            {editMode ? <ActionPanel items={actionPanelItems} /> : null}
                        </>
                    </DashKitDnDWrapper>
                </main>
            </div>
        </ThemeProvider>
    );
}
