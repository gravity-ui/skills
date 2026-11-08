import './dashboard/setup';
import './App.css';

import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {
    ActionPanelItem,
    Config,
    ConfigItem,
    DashKitProps,
    ItemDropProps,
    ItemsStateAndParams,
    MenuItem,
} from '@gravity-ui/dashkit';
import {ArrowRotateLeft, ChartColumn, Check, Heading, ListCheck, Pencil, Bell, TextAlignLeft} from '@gravity-ui/icons';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import {useCallback, useEffect, useState, useSyncExternalStore} from 'react';

import {WidgetSettingsDialog} from './dashboard/WidgetSettingsDialog';
import {createWidgetData, initialConfig, loadConfig, saveConfig} from './dashboard/config';
import {WidgetType} from './dashboard/types';

const MOBILE_QUERY = '(max-width: 767px)';

function useIsMobile() {
    return useSyncExternalStore(
        (onChange) => {
            const mql = window.matchMedia(MOBILE_QUERY);
            mql.addEventListener('change', onChange);
            return () => mql.removeEventListener('change', onChange);
        },
        () => window.matchMedia(MOBILE_QUERY).matches,
    );
}

/** Copying needs a paste flow, so the widget menu offers only deletion. */
const OVERLAY_MENU: MenuItem[] = ['delete'];

const PALETTE: {type: string; title: string; icon: ActionPanelItem['icon']}[] = [
    {type: WidgetType.Title, title: 'Заголовок', icon: <Icon data={Heading} />},
    {type: WidgetType.Metric, title: 'Метрика', icon: <Icon data={ChartColumn} />},
    {type: WidgetType.Goals, title: 'Цели', icon: <Icon data={ListCheck} />},
    {type: WidgetType.Events, title: 'События', icon: <Icon data={Bell} />},
    {type: WidgetType.Note, title: 'Заметка', icon: <Icon data={TextAlignLeft} />},
];

const emptyStateAndParams = {} as ItemsStateAndParams;

export function App() {
    const [config, setConfig] = useState<Config>(loadConfig);
    const [itemsStateAndParams, setItemsStateAndParams] = useState(emptyStateAndParams);
    const [editMode, setEditMode] = useState(false);
    const [editedItem, setEditedItem] = useState<ConfigItem | null>(null);

    const isMobile = useIsMobile();
    // DashKit reads this global setting during render; the `key` below remounts it on change.
    DashKit.setSettings({isMobile});
    const isEditing = editMode && !isMobile;

    useEffect(() => saveConfig(config), [config]);

    const handleChange = useCallback<NonNullable<DashKitProps['onChange']>>((data) => {
        setConfig(data.config);
        setItemsStateAndParams(data.itemsStateAndParams);
    }, []);

    const addWidget = useCallback((type: string) => {
        setConfig((prev) =>
            DashKit.setItem({
                item: {type, data: createWidgetData(type), namespace: 'default'},
                config: prev,
            }),
        );
    }, []);

    const handleDrop = useCallback(({dragProps, itemLayout, newLayout, commit}: ItemDropProps) => {
        const {i: _tempId, ...layout} = itemLayout;
        setConfig((prev) =>
            DashKit.setItem({
                item: {
                    type: dragProps.type,
                    data: createWidgetData(dragProps.type),
                    namespace: 'default',
                    layout,
                },
                config: prev,
                options: {updateLayout: newLayout},
            }),
        );
        commit();
    }, []);

    const applySettings = (data: ConfigItem['data']) => {
        if (!editedItem) return;
        setConfig((prev) => DashKit.setItem({item: {...editedItem, data}, config: prev}));
        setEditedItem(null);
    };

    const reset = () => {
        setConfig(initialConfig);
        setItemsStateAndParams(emptyStateAndParams);
    };

    const actionItems: ActionPanelItem[] = PALETTE.map(({type, title, icon}) => ({
        id: type,
        title,
        icon,
        qa: `add-${type}`,
        dragProps: {type},
        onClick: () => addWidget(type),
    }));

    return (
        <div className={`dashboard-page${isEditing ? ' dashboard-page_editing' : ''}`}>
            <Flex className="dashboard-page__header" alignItems="center" gap={3} wrap>
                <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                    <Text variant="header-1" ellipsis>
                        Дашборд
                    </Text>
                    <Text color="secondary">
                        {isMobile
                            ? 'На узком экране виджеты выстроены в колонку; редактирование доступно на широком.'
                            : isEditing
                              ? 'Перетаскивайте виджеты, тяните за правый нижний угол для изменения размера, добавляйте новые с панели внизу.'
                              : 'Нажмите «Редактировать», чтобы менять расположение виджетов.'}
                    </Text>
                </Flex>
                <Flex gap={2} style={{flexShrink: 0}}>
                    <Button view="outlined" size="l" onClick={reset}>
                        <Icon data={ArrowRotateLeft} />
                        Сбросить
                    </Button>
                    {!isMobile && (
                        <Button
                            view={isEditing ? 'action' : 'outlined'}
                            size="l"
                            onClick={() => setEditMode((v) => !v)}
                        >
                            <Icon data={isEditing ? Check : Pencil} />
                            {isEditing ? 'Готово' : 'Редактировать'}
                        </Button>
                    )}
                </Flex>
            </Flex>

            <DashKitDnDWrapper>
                <div>
                    <DashKit
                        key={isMobile ? 'mobile' : 'desktop'}
                        config={config}
                        editMode={isEditing}
                        itemsStateAndParams={itemsStateAndParams}
                        overlayMenuItems={OVERLAY_MENU}
                        onChange={handleChange}
                        onDrop={handleDrop}
                        onItemEdit={setEditedItem}
                    />
                    {config.items.length === 0 && (
                        <Flex className="dashboard-page__empty" direction="column" alignItems="center" gap={2}>
                            <Text variant="subheader-2">На дашборде нет виджетов</Text>
                            <Text color="secondary">
                                {isMobile
                                    ? 'Откройте дашборд на широком экране, чтобы добавить виджеты.'
                                    : 'Включите редактирование и перетащите виджет с панели внизу.'}
                            </Text>
                        </Flex>
                    )}
                    {isEditing && <ActionPanel items={actionItems} />}
                </div>
            </DashKitDnDWrapper>

            {editedItem && (
                <WidgetSettingsDialog
                    key={editedItem.id}
                    item={editedItem}
                    onApply={applySettings}
                    onClose={() => setEditedItem(null)}
                />
            )}
        </div>
    );
}
