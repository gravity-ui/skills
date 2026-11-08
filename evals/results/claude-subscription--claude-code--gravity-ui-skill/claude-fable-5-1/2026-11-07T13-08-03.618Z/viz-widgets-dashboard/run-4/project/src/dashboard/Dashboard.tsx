import {useCallback, useEffect, useMemo, useState} from 'react';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {ActionPanelItem, DashKitProps, ItemDropProps, MenuItem} from '@gravity-ui/dashkit';
import {ArrowRotateLeft, ChartColumn, Font, Hashtag, Heading, LayoutCells, Speedometer} from '@gravity-ui/icons';
import {Button, Flex, Icon, Switch, Text} from '@gravity-ui/uikit';

import {STORAGE_KEY, initialConfig, loadConfig, saveConfig} from './initialConfig';
import type {DashboardConfig} from './initialConfig';
import {WidgetType, setupDashKit} from './setup';
import type {ChartWidgetData} from './widgets/ChartWidget';
import type {MeterWidgetData} from './widgets/MeterWidget';
import type {StatWidgetData} from './widgets/StatWidget';
import type {TableWidgetData} from './widgets/TableWidget';

import './Dashboard.css';

setupDashKit();

type WidgetTypeValue = (typeof WidgetType)[keyof typeof WidgetType];

/** Data for a freshly added widget of each type. */
function defaultWidgetData(type: WidgetTypeValue): Record<string, unknown> {
    switch (type) {
        case WidgetType.Title:
            return {size: 's', text: 'Новый раздел', showInTOC: false};
        case WidgetType.Text:
            return {text: 'Новая заметка'};
        case WidgetType.Stat: {
            const data: StatWidgetData = {label: 'Новая метрика', value: 0};
            return data as unknown as Record<string, unknown>;
        }
        case WidgetType.Chart: {
            const data: ChartWidgetData = {
                title: 'Новый график',
                seriesName: 'Значение',
                categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                values: [12, 18, 15, 22, 27, 24],
            };
            return data as unknown as Record<string, unknown>;
        }
        case WidgetType.Meter: {
            const data: MeterWidgetData = {
                title: 'Новый индикатор',
                items: [{name: 'Заполнено', value: 40, max: 100, unit: '%'}],
            };
            return data as unknown as Record<string, unknown>;
        }
        case WidgetType.Table: {
            const data: TableWidgetData = {title: 'Новая таблица', rows: []};
            return data as unknown as Record<string, unknown>;
        }
        default:
            return {};
    }
}

const PALETTE: {type: WidgetTypeValue; title: string; icon: typeof ChartColumn}[] = [
    {type: WidgetType.Stat, title: 'Метрика', icon: Hashtag},
    {type: WidgetType.Chart, title: 'График', icon: ChartColumn},
    {type: WidgetType.Meter, title: 'Индикатор', icon: Speedometer},
    {type: WidgetType.Table, title: 'Таблица', icon: LayoutCells},
    {type: WidgetType.Title, title: 'Заголовок', icon: Heading},
    {type: WidgetType.Text, title: 'Текст', icon: Font},
];

export function Dashboard() {
    const [config, setConfig] = useState<DashboardConfig>(loadConfig);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        saveConfig(config);
    }, [config]);

    const handleChange: NonNullable<DashKitProps['onChange']> = useCallback(({config: next}) => {
        setConfig(next);
    }, []);

    const addWidget = useCallback((type: WidgetTypeValue) => {
        setConfig((prev) =>
            DashKit.setItem({
                item: {type, data: defaultWidgetData(type), namespace: 'default'},
                config: prev,
            }),
        );
    }, []);

    const handleDrop = useCallback((dropProps: ItemDropProps) => {
        const type = dropProps.dragProps.type as WidgetTypeValue;
        const {x, y, w, h} = dropProps.itemLayout;
        setConfig((prev) =>
            DashKit.setItem({
                item: {type, data: defaultWidgetData(type), namespace: 'default', layout: {x, y, w, h}},
                config: prev,
                options: {updateLayout: dropProps.newLayout},
            }),
        );
        dropProps.commit();
    }, []);

    const resetLayout = useCallback(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setConfig(initialConfig);
    }, []);

    const actionPanelItems = useMemo<ActionPanelItem[]>(
        () =>
            PALETTE.map(({type, title, icon}) => ({
                id: type,
                title,
                icon: <Icon data={icon} size={16} />,
                onClick: () => addWidget(type),
                dragProps: {type},
            })),
        [addWidget],
    );

    const overlayMenuItems = useMemo<MenuItem[]>(() => ['delete'], []);

    return (
        <div className="dashboard">
            <Flex as="header" className="dashboard__toolbar" alignItems="center" gap={4}>
                <Flex direction="column" className="dashboard__toolbar-title">
                    <Text variant="header-1">Дашборд</Text>
                    <Text variant="body-1" color="secondary">
                        {editMode
                            ? 'Перетаскивайте виджеты за любое место, тяните за правый нижний угол, чтобы изменить размер.'
                            : 'Расположение сохраняется в браузере.'}
                    </Text>
                </Flex>
                <Button view="flat" size="m" onClick={resetLayout} style={{flexShrink: 0}}>
                    <Icon data={ArrowRotateLeft} size={16} />
                    Сбросить
                </Button>
                <Switch size="l" checked={editMode} onUpdate={setEditMode} style={{flexShrink: 0}}>
                    Редактирование
                </Switch>
            </Flex>

            <DashKitDnDWrapper>
                <div className="dashboard__grid">
                    <DashKit
                        config={config}
                        editMode={editMode}
                        onChange={handleChange}
                        onDrop={handleDrop}
                        overlayMenuItems={overlayMenuItems}
                    />
                    <ActionPanel items={actionPanelItems} disable={!editMode} className="dashboard__action-panel" />
                </div>
            </DashKitDnDWrapper>
        </div>
    );
}
