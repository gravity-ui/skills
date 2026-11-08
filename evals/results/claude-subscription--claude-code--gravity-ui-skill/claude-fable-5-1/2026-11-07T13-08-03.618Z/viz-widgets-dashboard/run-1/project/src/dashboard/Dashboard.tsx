import {useCallback, useEffect, useMemo, useState} from 'react';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {ActionPanelItem, ConfigItem, DashKitProps, ItemDropProps} from '@gravity-ui/dashkit';
import {
    ArrowsRotateLeft,
    ChartColumn,
    ChartLine,
    Check,
    Heading,
    LayoutHeaderCellsLarge,
    ListUl,
    Pencil,
    TextAlignLeft,
} from '@gravity-ui/icons';
import {Button, Dialog, Flex, Icon, Text, TextArea} from '@gravity-ui/uikit';

import {createDefaultData, initialConfig} from './initialConfig';
import {setupDashKit} from './setup';
import {WidgetType} from './types';

import './dashboard.css';

setupDashKit();

const STORAGE_KEY = 'gravity-dashboard-config';

type Config = DashKitProps['config'];
type ItemsStateAndParams = NonNullable<DashKitProps['itemsStateAndParams']>;

function loadConfig(): Config {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw) as Config;
        }
    } catch {
        // повреждённые данные игнорируем и показываем дашборд по умолчанию
    }
    return initialConfig;
}

const ACTION_PANEL_ITEMS: ActionPanelItem[] = [
    {id: WidgetType.Title, title: 'Заголовок', icon: <Icon data={Heading} />, dragProps: {type: WidgetType.Title}},
    {id: WidgetType.Text, title: 'Текст', icon: <Icon data={TextAlignLeft} />, dragProps: {type: WidgetType.Text}},
    {id: WidgetType.Metric, title: 'Метрика', icon: <Icon data={ChartLine} />, dragProps: {type: WidgetType.Metric}},
    {id: WidgetType.Progress, title: 'Прогресс', icon: <Icon data={ChartColumn} />, dragProps: {type: WidgetType.Progress}},
    {id: WidgetType.Table, title: 'Таблица', icon: <Icon data={LayoutHeaderCellsLarge} />, dragProps: {type: WidgetType.Table}},
    {id: WidgetType.List, title: 'Список', icon: <Icon data={ListUl} />, dragProps: {type: WidgetType.List}},
];

/** Какое текстовое поле редактируется через меню «Настройки» виджета. */
function getEditableField(item: ConfigItem): 'text' | 'title' {
    return item.type === WidgetType.Title || item.type === WidgetType.Text ? 'text' : 'title';
}

export function Dashboard() {
    const [config, setConfig] = useState<Config>(loadConfig);
    const [itemsStateAndParams, setItemsStateAndParams] = useState<ItemsStateAndParams>({});
    const [editMode, setEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
    const [draft, setDraft] = useState('');

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }, [config]);

    const handleChange = useCallback<NonNullable<DashKitProps['onChange']>>((data) => {
        setConfig(data.config);
        setItemsStateAndParams(data.itemsStateAndParams);
    }, []);

    const handleDrop = useCallback(
        (dropProps: ItemDropProps) => {
            const {dragProps, itemLayout, newLayout, commit} = dropProps;
            const {x, y, w, h} = itemLayout;
            setConfig((current) =>
                DashKit.setItem({
                    item: {
                        type: dragProps.type,
                        namespace: 'default',
                        data: createDefaultData(dragProps.type),
                        layout: {x, y, w, h},
                    },
                    config: current,
                    options: {updateLayout: newLayout},
                }),
            );
            commit();
        },
        [],
    );

    const handleItemEdit = useCallback((item: ConfigItem) => {
        const field = getEditableField(item);
        setDraft(String(item.data[field] ?? ''));
        setEditingItem(item);
    }, []);

    const closeEditDialog = useCallback(() => setEditingItem(null), []);

    const applyEdit = useCallback(() => {
        if (!editingItem) {
            return;
        }
        const field = getEditableField(editingItem);
        setConfig((current) =>
            DashKit.setItem({
                item: {...editingItem, data: {...editingItem.data, [field]: draft}},
                config: current,
            }),
        );
        setEditingItem(null);
    }, [draft, editingItem]);

    const resetLayout = useCallback(() => {
        setConfig(initialConfig);
        setItemsStateAndParams({});
    }, []);

    const actionPanelItems = useMemo(() => ACTION_PANEL_ITEMS, []);

    return (
        <div className="dashboard">
            <header className="dashboard__header">
                <div className="dashboard__header-text">
                    <Text variant="header-1">Дашборд</Text>
                    <Text variant="body-1" color="secondary">
                        {editMode
                            ? 'Перетаскивайте виджеты за любое место, тяните за правый нижний угол для изменения размера'
                            : 'Расположение виджетов сохраняется в браузере'}
                    </Text>
                </div>
                <Flex gap={2} className="dashboard__actions">
                    <Button view="flat" size="l" onClick={resetLayout}>
                        <Icon data={ArrowsRotateLeft} />
                        Сбросить
                    </Button>
                    <Button
                        view={editMode ? 'action' : 'normal'}
                        size="l"
                        onClick={() => setEditMode((value) => !value)}
                    >
                        <Icon data={editMode ? Check : Pencil} />
                        {editMode ? 'Готово' : 'Редактировать'}
                    </Button>
                </Flex>
            </header>

            <DashKitDnDWrapper>
                <div className="dashboard__grid">
                    <DashKit
                        config={config}
                        editMode={editMode}
                        itemsStateAndParams={itemsStateAndParams}
                        onChange={handleChange}
                        onDrop={handleDrop}
                        onItemEdit={handleItemEdit}
                    />
                    {editMode ? <ActionPanel items={actionPanelItems} /> : null}
                </div>
            </DashKitDnDWrapper>

            <Dialog open={editingItem !== null} onClose={closeEditDialog} size="s">
                <Dialog.Header caption="Редактирование виджета" />
                <Dialog.Body>
                    <TextArea value={draft} onUpdate={setDraft} minRows={2} maxRows={6} autoFocus />
                </Dialog.Body>
                <Dialog.Footer
                    textButtonApply="Сохранить"
                    textButtonCancel="Отмена"
                    onClickButtonApply={applyEdit}
                    onClickButtonCancel={closeEditDialog}
                />
            </Dialog>
        </div>
    );
}
