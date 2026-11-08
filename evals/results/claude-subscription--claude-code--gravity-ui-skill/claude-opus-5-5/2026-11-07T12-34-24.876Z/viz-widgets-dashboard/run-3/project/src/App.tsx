import {useCallback, useEffect, useState} from 'react';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {
    ActionPanelItem,
    Config,
    ConfigItem,
    ItemDropProps,
    ItemsStateAndParams,
} from '@gravity-ui/dashkit';
import {Button, Card, Dialog, Flex, Icon, Lang, Switch, Text, TextInput, configure} from '@gravity-ui/uikit';
import {ArrowRotateLeft, ChartColumn, Clock, Heading, ListUl, Target} from '@gravity-ui/icons';

import {
    INITIAL_CONFIG,
    WIDGET_PRESETS,
    WIDGET_TYPES,
    setDashKitMobile,
    setupDashKit,
} from './dashboard/plugins';
import type {WidgetType} from './dashboard/plugins';
import './dashboard/dashboard.css';

// Встроенные подписи DashKit (меню виджета, кнопки) — на русском.
configure({lang: Lang.Ru});
// DashKit должен быть сконфигурирован до первого рендера.
setupDashKit();

const STORAGE_KEY = 'viz-widgets-dashboard:config:v1';
const MOBILE_QUERY = '(max-width: 767px)';

function loadConfig(): Config {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<Config>;
            if (Array.isArray(parsed.items) && Array.isArray(parsed.layout)) {
                return {...INITIAL_CONFIG, ...parsed} as Config;
            }
        }
    } catch {
        // Повреждённые данные — просто начинаем с раскладки по умолчанию.
    }
    return INITIAL_CONFIG;
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => {
        const matches = window.matchMedia(MOBILE_QUERY).matches;
        setDashKitMobile(matches);
        return matches;
    });

    useEffect(() => {
        const mql = window.matchMedia(MOBILE_QUERY);
        const onChange = (event: MediaQueryListEvent) => {
            // Глобальная настройка DashKit меняется до перерисовки.
            setDashKitMobile(event.matches);
            setIsMobile(event.matches);
        };
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return isMobile;
}

/** Заголовок виджета хранится в `text` у плагина title и в `title` у остальных. */
function getTitleKey(item: ConfigItem) {
    return item.type === WIDGET_TYPES.title ? 'text' : 'title';
}

const PANEL_WIDGETS: Array<{type: WidgetType; title: string; icon: typeof Heading}> = [
    {type: WIDGET_TYPES.title, title: 'Заголовок', icon: Heading},
    {type: WIDGET_TYPES.kpi, title: 'Показатель', icon: ChartColumn},
    {type: WIDGET_TYPES.goals, title: 'Цели', icon: Target},
    {type: WIDGET_TYPES.deals, title: 'Сделки', icon: ListUl},
    {type: WIDGET_TYPES.activity, title: 'Активность', icon: Clock},
];

export function App() {
    const [config, setConfig] = useState<Config>(loadConfig);
    const [itemsStateAndParams, setItemsStateAndParams] = useState<ItemsStateAndParams>(
        {} as ItemsStateAndParams,
    );
    const [editMode, setEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
    const [draftTitle, setDraftTitle] = useState('');
    const isMobile = useIsMobile();
    const isEditing = editMode && !isMobile;

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch {
            // Хранилище недоступно (приватный режим, квота) — раскладка живёт до перезагрузки.
        }
    }, [config]);

    const handleChange = useCallback(
        (data: {config: Config; itemsStateAndParams: ItemsStateAndParams}) => {
            setConfig(data.config);
            setItemsStateAndParams(data.itemsStateAndParams);
        },
        [],
    );

    const addWidget = useCallback((type: WidgetType) => {
        setConfig((current) =>
            DashKit.setItem({
                item: {type, data: {...WIDGET_PRESETS[type]}},
                config: current,
            }),
        );
    }, []);

    const handleDrop = useCallback(({dragProps, itemLayout, newLayout, commit}: ItemDropProps) => {
        const type = dragProps.type as WidgetType;
        const {i: _ignored, ...layout} = itemLayout;
        setConfig((current) =>
            DashKit.setItem({
                item: {type, data: {...WIDGET_PRESETS[type]}, layout},
                config: current,
                options: {updateLayout: newLayout},
            }),
        );
        commit();
    }, []);

    const handleItemEdit = useCallback((item: ConfigItem) => {
        setEditingItem(item);
        setDraftTitle(String(item.data[getTitleKey(item)] ?? ''));
    }, []);

    const closeEditDialog = () => setEditingItem(null);

    const applyEdit = () => {
        if (!editingItem) return;
        const title = draftTitle.trim();
        if (title) {
            setConfig((current) =>
                DashKit.setItem({
                    item: {...editingItem, data: {...editingItem.data, [getTitleKey(editingItem)]: title}},
                    config: current,
                }),
            );
        }
        closeEditDialog();
    };

    const resetLayout = () => {
        setConfig(INITIAL_CONFIG);
        setItemsStateAndParams({} as ItemsStateAndParams);
    };

    const panelItems: ActionPanelItem[] = PANEL_WIDGETS.map(({type, title, icon}) => ({
        id: type,
        title,
        icon: <Icon data={icon} size={16} />,
        qa: `add-${type}`,
        // Виджет можно перетащить в нужное место сетки или просто кликнуть — он добавится в конец.
        dragProps: {type},
        onClick: () => addWidget(type),
    }));

    const isEmpty = config.items.length === 0;

    return (
        <div className={`dashboard${isEditing ? ' dashboard_editing' : ''}`}>
            <Flex className="dashboard__toolbar" alignItems="center" justifyContent="space-between" gap={4} wrap>
                <Flex direction="column" gap={1} className="dashboard__heading">
                    <Text variant="header-1" ellipsis>
                        Дашборд отдела продаж
                    </Text>
                    <Text variant="body-1" color="secondary">
                        {isEditing
                            ? 'Перетаскивайте виджеты за любую область, меняйте размер за правый нижний угол, добавляйте новые из панели внизу.'
                            : isMobile
                              ? 'На узком экране виджеты выстроены в колонку. Редактирование доступно на широком экране.'
                              : 'Включите редактирование, чтобы переставлять, менять размер и добавлять виджеты.'}
                    </Text>
                </Flex>
                <Flex alignItems="center" gap={3} className="dashboard__actions">
                    <Switch
                        size="l"
                        checked={isEditing}
                        disabled={isMobile}
                        onUpdate={setEditMode}
                        content="Редактирование"
                    />
                    <Button view="outlined" size="l" onClick={resetLayout}>
                        <Icon data={ArrowRotateLeft} size={16} />
                        Сбросить
                    </Button>
                </Flex>
            </Flex>

            {isEmpty ? (
                <Card view="filled" className="dashboard__empty">
                    <Flex direction="column" alignItems="center" gap={2}>
                        <Text variant="subheader-3">На дашборде нет виджетов</Text>
                        <Text variant="body-1" color="secondary">
                            {isEditing
                                ? 'Перетащите виджет из панели внизу или кликните по нему.'
                                : 'Включите редактирование и добавьте виджеты из панели.'}
                        </Text>
                        {!isEditing && !isMobile ? (
                            <Button view="action" onClick={() => setEditMode(true)}>
                                Добавить виджеты
                            </Button>
                        ) : null}
                    </Flex>
                </Card>
            ) : null}

            <DashKitDnDWrapper>
                <>
                    <DashKit
                        key={isMobile ? 'mobile' : 'desktop'}
                        config={config}
                        editMode={isEditing}
                        itemsStateAndParams={itemsStateAndParams}
                        onChange={handleChange}
                        onDrop={handleDrop}
                        onItemEdit={handleItemEdit}
                        overlayMenuItems={['delete']}
                    />
                    {isEditing ? <ActionPanel items={panelItems} /> : null}
                </>
            </DashKitDnDWrapper>

            <Dialog open={editingItem !== null} onClose={closeEditDialog} size="s">
                <Dialog.Header caption="Настройки виджета" />
                <Dialog.Body>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyEdit();
                        }}
                    >
                        <TextInput
                            label="Название"
                            size="l"
                            value={draftTitle}
                            onUpdate={setDraftTitle}
                            autoFocus
                            hasClear
                            validationState={draftTitle.trim() ? undefined : 'invalid'}
                            errorMessage="Название не может быть пустым"
                        />
                    </form>
                </Dialog.Body>
                <Dialog.Footer
                    textButtonApply="Сохранить"
                    textButtonCancel="Отмена"
                    onClickButtonApply={applyEdit}
                    onClickButtonCancel={closeEditDialog}
                    propsButtonApply={{disabled: !draftTitle.trim()}}
                />
            </Dialog>
        </div>
    );
}
