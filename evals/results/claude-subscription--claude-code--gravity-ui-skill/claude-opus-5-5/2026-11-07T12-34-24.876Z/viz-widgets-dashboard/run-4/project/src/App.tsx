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
import {
    ArrowRotateLeft,
    ChartColumn,
    Heading,
    ListUl,
    Target,
    TextAlignLeft,
} from '@gravity-ui/icons';
import {Button, Card, Flex, Icon, Switch, Text} from '@gravity-ui/uikit';
import * as React from 'react';

import {WidgetSettingsDialog} from './dashboard/WidgetSettingsDialog';
import {createInitialConfig, createWidgetData, loadConfig, saveConfig} from './dashboard/config';
import {setupDashKit} from './dashboard/setup';
import {WIDGET_TYPE} from './dashboard/types';
import type {WidgetType} from './dashboard/types';
import {useMediaQuery} from './dashboard/useMediaQuery';

import './App.css';

setupDashKit();

const NAMESPACE = 'default';
const MOBILE_QUERY = '(max-width: 768px)';
/** «Копировать» без вставки бесполезно, оставляем только удаление; настройки — кнопка-шестерёнка. */
const OVERLAY_MENU: MenuItem[] = ['delete'];

const PALETTE: Array<{type: WidgetType; title: string; icon: React.ReactNode}> = [
    {type: WIDGET_TYPE.Metric, title: 'Метрика', icon: <Icon data={ChartColumn} />},
    {type: WIDGET_TYPE.Goals, title: 'Цели', icon: <Icon data={Target} />},
    {type: WIDGET_TYPE.Orders, title: 'Заказы', icon: <Icon data={ListUl} />},
    {type: WIDGET_TYPE.Note, title: 'Заметка', icon: <Icon data={TextAlignLeft} />},
    {type: WIDGET_TYPE.Title, title: 'Заголовок', icon: <Icon data={Heading} />},
];

export function App() {
    const [config, setConfig] = React.useState<Config>(loadConfig);
    const [itemsStateAndParams, setItemsStateAndParams] = React.useState<ItemsStateAndParams>(
        {} as ItemsStateAndParams,
    );
    const [editModeRequested, setEditMode] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState<ConfigItem | null>(null);

    const isMobile = useMediaQuery(MOBILE_QUERY);
    // На узком экране DashKit показывает виджеты в одну колонку — без перетаскивания.
    const editMode = editModeRequested && !isMobile;

    // Глобальная настройка DashKit, читается при рендере сетки; вызов идемпотентен,
    // поэтому выставляем её синхронно, до рендера <DashKit>.
    DashKit.setSettings({isMobile});

    React.useEffect(() => {
        saveConfig(config);
    }, [config]);

    const handleChange = React.useCallback<NonNullable<DashKitProps['onChange']>>((data) => {
        setConfig(data.config);
        setItemsStateAndParams(data.itemsStateAndParams);
    }, []);

    const addWidget = React.useCallback((type: WidgetType) => {
        setConfig((prev) =>
            DashKit.setItem({
                item: {type, namespace: NAMESPACE, data: createWidgetData(type)},
                config: prev,
            }),
        );
    }, []);

    const handleDrop = React.useCallback((dropProps: ItemDropProps) => {
        const type = dropProps.dragProps.type as WidgetType;
        const {x, y, w, h} = dropProps.itemLayout;
        setConfig((prev) =>
            DashKit.setItem({
                item: {type, namespace: NAMESPACE, data: createWidgetData(type), layout: {x, y, w, h}},
                config: prev,
                options: {updateLayout: dropProps.newLayout},
            }),
        );
        dropProps.commit();
    }, []);

    const handleApplySettings = React.useCallback((item: ConfigItem) => {
        setConfig((prev) => DashKit.setItem({item, config: prev}));
        setEditingItem(null);
    }, []);

    const handleReset = React.useCallback(() => {
        setConfig(createInitialConfig());
        setItemsStateAndParams({} as ItemsStateAndParams);
    }, []);

    const actionItems = React.useMemo<ActionPanelItem[]>(
        () =>
            PALETTE.map(({type, title, icon}) => ({
                id: type,
                title,
                icon,
                qa: `add-${type}`,
                onClick: () => addWidget(type),
                dragProps: {type},
            })),
        [addWidget],
    );

    const isEmpty = config.items.length === 0;

    return (
        <div className={`dashboard-page${editMode ? ' dashboard-page_edit' : ''}`}>
            <Flex
                className="dashboard-page__header"
                alignItems="center"
                justifyContent="space-between"
                gap={3}
                wrap
            >
                <Flex direction="column" gap={1} className="dashboard-page__heading">
                    <Text variant="header-1">Дашборд</Text>
                    <Text color="secondary">
                        {editMode
                            ? 'Перетаскивайте виджеты, тяните за угол для изменения размера, добавляйте новые с панели внизу'
                            : 'Включите редактирование, чтобы менять раскладку'}
                    </Text>
                </Flex>
                <Flex alignItems="center" gap={3} wrap className="dashboard-page__controls">
                    <Switch
                        checked={editMode}
                        onUpdate={setEditMode}
                        disabled={isMobile}
                        title={isMobile ? 'Редактирование доступно на широком экране' : undefined}
                        content="Редактирование"
                    />
                    <Button view="outlined" onClick={handleReset}>
                        <Icon data={ArrowRotateLeft} />
                        Сбросить
                    </Button>
                </Flex>
            </Flex>

            {isEmpty && (
                <Card className="dashboard-page__empty" view="filled" type="container">
                    <Text color="secondary">
                        На дашборде нет виджетов.{' '}
                        {editMode
                            ? 'Добавьте их с панели внизу — кликом или перетаскиванием на сетку.'
                            : 'Включите редактирование, чтобы добавить виджеты, или сбросьте раскладку.'}
                    </Text>
                </Card>
            )}

            <DashKitDnDWrapper>
                {/* DnD-обёртка принимает один элемент: сетку и панель кладём во фрагмент. */}
                <>
                    <DashKit
                        // Режим сетки читается из глобальных настроек — пересоздаём при смене.
                        key={isMobile ? 'mobile' : 'grid'}
                        config={config}
                        editMode={editMode}
                        itemsStateAndParams={itemsStateAndParams}
                        overlayMenuItems={OVERLAY_MENU}
                        onChange={handleChange}
                        onDrop={handleDrop}
                        onItemEdit={setEditingItem}
                    />
                    {editMode && <ActionPanel items={actionItems} />}
                </>
            </DashKitDnDWrapper>

            <WidgetSettingsDialog
                item={editingItem}
                onClose={() => setEditingItem(null)}
                onApply={handleApplySettings}
            />
        </div>
    );
}
