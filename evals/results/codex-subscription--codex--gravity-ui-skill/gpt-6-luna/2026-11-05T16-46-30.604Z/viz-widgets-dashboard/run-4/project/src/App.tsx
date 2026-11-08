import {useCallback, useEffect, useState} from 'react';
import {Button, Card, Text} from '@gravity-ui/uikit';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {Config, ItemDropProps} from '@gravity-ui/dashkit';
import './App.css';

type WidgetKind = 'revenue' | 'visitors' | 'conversion' | 'channels' | 'activity';

type WidgetContext = {
    onRemove?: (id: string) => void;
};

const widgetNames: Record<WidgetKind, string> = {
    revenue: 'Выручка',
    visitors: 'Посетители',
    conversion: 'Конверсия',
    channels: 'Источники трафика',
    activity: 'Активность по дням',
};

const initialConfig: Config = {
    salt: 'northstar-analytics',
    counter: 5,
    aliases: {},
    connections: [],
    items: [
        {id: 'revenue', type: 'dashboard-widget', namespace: 'default', orderId: 0, data: {kind: 'revenue'}},
        {id: 'visitors', type: 'dashboard-widget', namespace: 'default', orderId: 1, data: {kind: 'visitors'}},
        {id: 'conversion', type: 'dashboard-widget', namespace: 'default', orderId: 2, data: {kind: 'conversion'}},
        {id: 'channels', type: 'dashboard-widget', namespace: 'default', orderId: 3, data: {kind: 'channels'}},
        {id: 'activity', type: 'dashboard-widget', namespace: 'default', orderId: 4, data: {kind: 'activity'}},
    ],
    layout: [
        {i: 'revenue', x: 0, y: 0, w: 8, h: 7},
        {i: 'visitors', x: 8, y: 0, w: 8, h: 7},
        {i: 'conversion', x: 16, y: 0, w: 8, h: 7},
        {i: 'activity', x: 0, y: 7, w: 16, h: 11},
        {i: 'channels', x: 16, y: 7, w: 8, h: 11},
    ],
};

const points = [5, 7, 6, 9, 8, 12, 10, 13, 11, 15, 14, 18, 16, 19, 17, 22, 20, 24];

function Sparkline({large = false}: {large?: boolean}) {
    const coords = points.map((point, index) => `${(index / (points.length - 1)) * 100},${34 - point}`).join(' ');
    return (
        <svg className={large ? 'sparkline sparkline_large' : 'sparkline'} viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
            <defs>
                <linearGradient id={large ? 'area-fill-large' : 'area-fill'} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" className="chart-fill-top" />
                    <stop offset="100%" className="chart-fill-bottom" />
                </linearGradient>
            </defs>
            <polygon points={`0,36 ${coords} 100,36`} fill={`url(#${large ? 'area-fill-large' : 'area-fill'})`} />
            <polyline points={coords} className="sparkline__line" />
        </svg>
    );
}

function MiniBars() {
    const bars = [36, 54, 44, 68, 50, 75, 60, 88, 70, 94, 73, 100, 84, 92, 75, 98, 86, 100];
    return <div className="mini-bars" aria-hidden="true">{bars.map((bar, index) => <i key={index} style={{height: `${bar}%`}} />)}</div>;
}

function WidgetBody({kind}: {kind: WidgetKind}) {
    if (kind === 'revenue') {
        return <><div className="metric-value">₽ 2 458 320</div><div className="metric-foot"><span className="trend trend_up">↗ 12,8%</span><span>к прошлому месяцу</span></div><Sparkline /></>;
    }
    if (kind === 'visitors') {
        return <><div className="metric-value">84 291</div><div className="metric-foot"><span className="trend trend_up">↗ 8,2%</span><span>к прошлому месяцу</span></div><MiniBars /></>;
    }
    if (kind === 'conversion') {
        return <><div className="metric-value">3,64<span className="metric-unit">%</span></div><div className="metric-foot"><span className="trend trend_down">↘ 0,4%</span><span>к прошлому месяцу</span></div><div className="progress-track"><span style={{width: '64%'}} /></div><div className="metric-caption">Цель месяца <b>4,0%</b></div></>;
    }
    if (kind === 'channels') {
        return <div className="channels-list">
            {[['Поиск', '42%', 'channel-search'], ['Прямые', '28%', 'channel-direct'], ['Соцсети', '18%', 'channel-social'], ['Рефералы', '12%', 'channel-referral']].map(([name, value, className]) => (
                <div className="channel" key={name}><div className="channel__top"><span>{name}</span><b>{value}</b></div><div className="channel__track"><i className={className} style={{width: value}} /></div></div>
            ))}
        </div>;
    }
    return <><div className="activity-summary"><strong>18 420</strong><span>событий за период</span><span className="trend trend_up">↗ 6,3%</span></div><div className="activity-chart"><div className="chart-grid"><i /><i /><i /><i /></div><Sparkline large /><div className="chart-labels"><span>1 ноя</span><span>5 ноя</span><span>10 ноя</span><span>15 ноя</span><span>20 ноя</span><span>25 ноя</span><span>30 ноя</span></div></div></>;
}

DashKit.registerPlugins({
    type: 'dashboard-widget',
    defaultLayout: {w: 8, h: 7},
    renderer: ({id, data, editMode, context}) => {
        const kind = (data.kind as WidgetKind) || 'revenue';
        const widgetContext = context as WidgetContext;
        return <Card className={`widget-card widget-card_${kind}`} type="container" view="filled">
            <div className="widget-card__header drag-handle">
                <div><Text variant="subheader-2">{widgetNames[kind]}</Text><span className="widget-period">Последние 30 дней</span></div>
                <div className="widget-card__tools">
                    <span className="widget-menu" aria-hidden="true">···</span>
                    {editMode && <Button className="widget-remove" view="flat-secondary" size="s" onClick={() => widgetContext.onRemove?.(id)} aria-label={`Удалить виджет «${widgetNames[kind]}»`}>×</Button>}
                </div>
            </div>
            <div className="widget-card__body"><WidgetBody kind={kind} /></div>
        </Card>;
    },
});

DashKit.setSettings({gridLayout: {cols: 24, rowHeight: 20, margin: [14, 14], containerPadding: [0, 0]}});

export function App() {
    const [config, setConfig] = useState(initialConfig);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 700px)');
        const updateLayoutMode = () => DashKit.setSettings({isMobile: media.matches});
        updateLayoutMode();
        media.addEventListener('change', updateLayoutMode);
        return () => media.removeEventListener('change', updateLayoutMode);
    }, []);

    const onDrop = useCallback((dropProps: ItemDropProps) => {
        const kind = (dropProps.dragProps.extra as {kind?: WidgetKind} | undefined)?.kind || 'revenue';
        setConfig((current) => DashKit.setItem({
            item: {
                type: 'dashboard-widget',
                namespace: 'default',
                data: {kind},
                layout: {w: dropProps.itemLayout.w, h: dropProps.itemLayout.h, x: dropProps.itemLayout.x, y: dropProps.itemLayout.y},
            },
            config: current,
            options: {updateLayout: dropProps.newLayout},
        }));
        dropProps.commit();
    }, []);

    const removeWidget = useCallback((id: string) => {
        setConfig((current) => DashKit.removeItem({id, config: current, itemsStateAndParams: {}}).config);
    }, []);

    const widgetTools = (Object.entries(widgetNames) as [WidgetKind, string][]).map(([kind, title]) => ({
        id: kind,
        title,
        icon: <span className="action-glyph">{kind === 'revenue' ? '₽' : kind === 'visitors' ? '◉' : kind === 'conversion' ? '%' : kind === 'channels' ? '≋' : '⌁'}</span>,
        dragProps: {type: 'dashboard-widget', layout: {w: kind === 'activity' ? 16 : 8, h: kind === 'activity' ? 11 : 7}, extra: {kind}},
    }));

    return <div className="dashboard-shell">
        <aside className="sidebar">
            <div className="brand-mark">n<span>.</span></div>
            <div className="sidebar-separator" />
            <Button className="nav-button nav-button_active" view="flat" size="l" aria-label="Обзор"><span>◫</span></Button>
            <Button className="nav-button" view="flat" size="l" aria-label="Отчёты"><span>▤</span></Button>
            <Button className="nav-button" view="flat" size="l" aria-label="Аудитория"><span>◉</span></Button>
            <Button className="nav-button" view="flat" size="l" aria-label="Настройки"><span>⚙</span></Button>
            <div className="sidebar-bottom"><div className="avatar">А</div></div>
        </aside>
        <main className="main-area">
            <header className="topbar">
                <div className="breadcrumbs"><span>Рабочее пространство</span><b>/</b><strong>Аналитика</strong></div>
                <div className="topbar-actions"><span className="sync-status"><i /> Данные обновлены</span><Button view="outlined" size="m">↻ <span>Обновить</span></Button><div className="avatar avatar_small">А</div></div>
            </header>
            <section className="page-content">
                <div className="page-heading">
                    <div><div className="eyebrow">СРЕДА, 5 НОЯБРЯ 2026</div><Text variant="header-1">Обзор</Text><p>Ключевые показатели вашего проекта за месяц</p></div>
                    <div className="heading-actions"><Button view="outlined" size="m">30 дней <span className="chevron">⌄</span></Button><Button view={editing ? 'normal' : 'action'} size="m" onClick={() => setEditing((value) => !value)}>{editing ? 'Готово' : 'Настроить'}</Button></div>
                </div>
                <div className={`edit-hint ${editing ? 'edit-hint_visible' : ''}`}><span>⠿</span> Перетаскивайте виджеты за заголовок и меняйте их размер за угол. Добавляйте виджеты из панели снизу.</div>
                <div className="dashboard-grid-wrap">
                    <DashKitDnDWrapper>
                        <div className="dashkit-dnd-content">
                            <div className={editing ? 'dashboard-grid dashboard-grid_edit' : 'dashboard-grid'}>
                                <DashKit
                                    config={config}
                                    editMode={editing}
                                    draggableHandleClassName="drag-handle"
                                    context={{onRemove: removeWidget}}
                                    onChange={({config: nextConfig}) => setConfig(nextConfig)}
                                    onDrop={onDrop}
                                />
                            </div>
                            {editing && <ActionPanel className="widget-drawer" items={widgetTools} />}
                        </div>
                    </DashKitDnDWrapper>
                </div>
                <footer className="page-footer"><span>Источник данных: Northstar Analytics</span><span>Последняя синхронизация · 10:42</span></footer>
            </section>
        </main>
    </div>;
}
