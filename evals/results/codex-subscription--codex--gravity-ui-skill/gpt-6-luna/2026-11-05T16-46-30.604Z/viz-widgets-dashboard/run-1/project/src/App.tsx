import {useMemo, useState} from 'react';
import {Chart} from '@gravity-ui/charts';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {Config, ConfigItem, ItemDropProps} from '@gravity-ui/dashkit';
import {Button, Text} from '@gravity-ui/uikit';
import './dashboard.css';

type WidgetKind = 'revenue' | 'channels' | 'campaigns' | 'activity' | 'orders' | 'conversion';

const widgetMeta: Record<WidgetKind, {title: string; icon: string}> = {
    revenue: {title: 'Выручка', icon: '↗'},
    channels: {title: 'Источники трафика', icon: '◉'},
    campaigns: {title: 'Кампании', icon: '▥'},
    activity: {title: 'Последние события', icon: '⋯'},
    orders: {title: 'Заказы', icon: '▤'},
    conversion: {title: 'Конверсия', icon: '◎'},
};

const makeConfig = (): Config => ({
    salt: 'studio-analytics',
    counter: 6,
    aliases: {},
    connections: [],
    items: [
        {id: 'revenue', type: 'metric-widget', namespace: 'default', data: {kind: 'revenue'}},
        {id: 'channels', type: 'metric-widget', namespace: 'default', data: {kind: 'channels'}},
        {id: 'campaigns', type: 'metric-widget', namespace: 'default', data: {kind: 'campaigns'}},
        {id: 'activity', type: 'metric-widget', namespace: 'default', data: {kind: 'activity'}},
        {id: 'orders', type: 'metric-widget', namespace: 'default', data: {kind: 'orders'}},
        {id: 'conversion', type: 'metric-widget', namespace: 'default', data: {kind: 'conversion'}},
    ],
    layout: [
        {i: 'revenue', x: 0, y: 0, w: 8, h: 10},
        {i: 'channels', x: 8, y: 0, w: 4, h: 10},
        {i: 'campaigns', x: 0, y: 10, w: 4, h: 7},
        {i: 'orders', x: 4, y: 10, w: 4, h: 7},
        {i: 'conversion', x: 8, y: 10, w: 4, h: 7},
        {i: 'activity', x: 0, y: 17, w: 12, h: 9},
    ],
});

const initialConfig = makeConfig();
const savedConfig = (): Config => {
    try {
        const stored = localStorage.getItem('metric-studio-layout');
        return stored ? (JSON.parse(stored) as Config) : initialConfig;
    } catch {
        return initialConfig;
    }
};

DashKit.setSettings({
            gridLayout: {
        cols: 12,
        rowHeight: 27,
        margin: [14, 14],
        containerPadding: [0, 0],
        compactType: 'vertical',
    },
});

DashKit.registerPlugins({
    type: 'metric-widget',
    defaultLayout: {w: 4, h: 8, minW: 3, minH: 5},
    renderer: (props) => <MetricWidget item={props.data as ConfigItem['data']} />,
});

function WidgetFrame({kind, children, extra}: {kind: WidgetKind; children: React.ReactNode; extra?: React.ReactNode}) {
    return (
        <section className="widget-card">
            <header className="widget-head">
                <span className="widget-title">{widgetMeta[kind].title}</span>
                {extra ?? <button className="widget-more" aria-label="Действия виджета">···</button>}
            </header>
            <div className="widget-content">{children}</div>
        </section>
    );
}

const revenueData = {
    series: {data: [{
        type: 'line' as const,
        name: 'Выручка',
        data: [18, 24, 20, 33, 28, 37, 32, 46, 41, 53, 48, 62, 56, 73, 68, 81, 76, 93, 87, 105, 99, 120, 113, 132].map((y, x) => ({x, y})),
    }]},
};

function MetricWidget({item}: {item: ConfigItem['data']}) {
    const kind = (item.kind as WidgetKind) || 'revenue';
    if (kind === 'revenue') {
        return <WidgetFrame kind={kind} extra={<span className="widget-period">Последние 30 дней⌄</span>}>
            <div className="metric-primary"><strong>₽ 2 480 560</strong><span className="trend positive">↗ 12,8%</span></div>
            <div className="metric-caption">Общая выручка <span>сравнение с прошлым месяцем</span></div>
            <div className="chart-wrap"><Chart data={revenueData} /></div>
            <div className="chart-axis"><span>1 окт</span><span>6 окт</span><span>12 окт</span><span>18 окт</span><span>24 окт</span><span>30 окт</span></div>
        </WidgetFrame>;
    }
    if (kind === 'channels') {
        return <WidgetFrame kind={kind}>
            <div className="channel-total">48 294 <small>посетителей</small></div>
            <div className="channel-list">
                {[
                    ['Прямые переходы', '19 318', '40%', 'channel-blue'],
                    ['Поиск', '14 488', '30%', 'channel-violet'],
                    ['Соцсети', '8 212', '17%', 'channel-orange'],
                    ['Рефералы', '6 276', '13%', 'channel-green'],
                ].map(([name, value, percent, color]) => <div className="channel-row" key={name}>
                    <div className="channel-label"><span className={`channel-dot ${color}`} />{name}<b>{percent}</b></div>
                    <div className="channel-track"><i className={color} style={{width: percent}} /></div>
                    <span className="channel-value">{value}</span>
                </div>)}
            </div>
        </WidgetFrame>;
    }
    if (kind === 'campaigns') {
        return <WidgetFrame kind={kind}>
            <div className="metric-primary"><strong>18 420</strong><span className="trend positive">↗ 8,2%</span></div>
            <div className="metric-caption">Переходы из кампаний</div>
            <div className="mini-bars">{[42, 58, 46, 72, 60, 85, 69, 94, 76, 100, 84, 93, 72, 88, 65, 82].map((height, i) => <i key={i} style={{height: `${height}%`}} />)}</div>
            <div className="mini-foot"><span>Расходы <b>₽ 124 800</b></span><span>ROI <b className="positive-text">3,8×</b></span></div>
        </WidgetFrame>;
    }
    if (kind === 'orders') {
        return <WidgetFrame kind={kind}>
            <div className="metric-primary"><strong>1 284</strong><span className="trend positive">↗ 6,4%</span></div>
            <div className="metric-caption">Заказов за период</div>
            <div className="orders-summary"><div><span>Средний чек</span><b>₽ 1 932</b></div><div><span>К возврату</span><b>24</b></div></div>
            <div className="sparkline">{[35, 50, 41, 62, 48, 70, 58, 81, 66, 92, 74, 100, 80, 96].map((height, i) => <i key={i} style={{height: `${height}%`}} />)}</div>
        </WidgetFrame>;
    }
    if (kind === 'conversion') {
        return <WidgetFrame kind={kind}>
            <div className="metric-primary"><strong>4,86%</strong><span className="trend positive">↗ 0,7%</span></div>
            <div className="metric-caption">Конверсия сайта</div>
            <div className="conversion-steps"><div><span>Посетители</span><b>48 294</b><i style={{width: '100%'}} /></div><div><span>Добавили в корзину</span><b>8 210</b><i style={{width: '58%'}} /></div><div><span>Оформили заказ</span><b>2 348</b><i style={{width: '31%'}} /></div></div>
            <div className="conversion-foot">Цель на месяц <b>5,2%</b></div>
        </WidgetFrame>;
    }
    return <WidgetFrame kind="activity">
        <div className="activity-table">
            <div className="activity-row activity-header"><span>Событие</span><span>Канал</span><span>Время</span><span>Статус</span></div>
            {[
                ['Новый заказ #48291', 'Прямой', '2 мин назад', 'Оплачен'],
                ['Новый подписчик', 'Рассылка', '14 мин назад', 'Новый'],
                ['Заказ #48289', 'Поиск', '28 мин назад', 'В обработке'],
                ['Новый заказ #48288', 'Соцсети', '42 мин назад', 'Оплачен'],
            ].map((row) => <div className="activity-row" key={row[0]}><b>{row[0]}</b><span>{row[1]}</span><span>{row[2]}</span><span className={`status status-${row[3] === 'Оплачен' ? 'ok' : row[3] === 'Новый' ? 'new' : 'pending'}`}>{row[3]}</span></div>)}
        </div>
    </WidgetFrame>;
}

export function App() {
    const [config, setConfig] = useState<Config>(savedConfig);
    const [editMode, setEditMode] = useState(true);
    const actionItems = useMemo(() => (Object.entries(widgetMeta) as [WidgetKind, {title: string; icon: string}][]).map(([kind, meta]) => ({
        id: kind,
        title: meta.title,
        icon: <span className="action-glyph">{meta.icon}</span>,
        dragProps: {type: 'metric-widget', extra: {kind}},
    })), []);

    const handleChange = ({config: nextConfig}: {config: Config}) => {
        setConfig(nextConfig);
        localStorage.setItem('metric-studio-layout', JSON.stringify(nextConfig));
    };
    const handleDrop = ({dragProps, itemLayout, newLayout, commit}: ItemDropProps) => {
        const kind = (dragProps.extra?.kind ?? 'revenue') as WidgetKind;
        const item = {
            type: 'metric-widget',
            namespace: 'default',
            data: {kind},
            layout: {h: itemLayout.h, w: itemLayout.w, x: itemLayout.x, y: itemLayout.y},
        };
        const nextConfig = DashKit.setItem({
            item,
            config,
            options: {updateLayout: newLayout},
        });
        setConfig(nextConfig);
        localStorage.setItem('metric-studio-layout', JSON.stringify(nextConfig));
        commit();
    };

    return <div className="app-shell">
        <aside className="sidebar">
            <div className="brand-mark">m<span>.</span></div>
            <div className="workspace-switch"><span className="workspace-avatar">M</span><span><b>Мой магазин</b><small>Рабочее пространство</small></span><i>⌄</i></div>
            <nav className="side-nav">
                <div className="nav-label">РАБОЧЕЕ</div>
                <a className="nav-item active"><span>▦</span>Обзор</a>
                <a className="nav-item"><span>◷</span>Аналитика</a>
                <a className="nav-item"><span>▤</span>Отчёты</a>
                <a className="nav-item"><span>♧</span>Аудитория</a>
                <div className="nav-label nav-label-spaced">УПРАВЛЕНИЕ</div>
                <a className="nav-item"><span>◉</span>Кампании</a>
                <a className="nav-item"><span>◈</span>Интеграции</a>
            </nav>
            <div className="sidebar-bottom"><span className="help-icon">?</span><span>Центр помощи</span><div className="profile"><span className="profile-avatar">А</span><span><b>Александра</b><small>Администратор</small></span><i>···</i></div></div>
        </aside>
        <main className="main-area">
            <header className="topbar"><div className="breadcrumbs">Мой магазин <span>/</span> <b>Обзор</b></div><div className="top-actions"><span className="live-indicator"><i />Данные обновлены</span><button className="icon-button" aria-label="Уведомления">♧<i /></button><span className="top-avatar">А</span></div></header>
            <div className="page-content">
                <div className="page-heading"><div><Text variant="header-1">Обзор</Text><p>Сводка по ключевым показателям вашего магазина</p></div><div className="heading-actions"><button className="date-button">◷ <span>1 — 30 октября 2024</span>⌄</button><Button view={editMode ? 'action' : 'outlined'} onClick={() => setEditMode(!editMode)}>{editMode ? 'Готово' : 'Настроить'}</Button></div></div>
                <div className="summary-strip">
                    <div className="summary-card"><div className="summary-label">Общая выручка <span>↗</span></div><strong>₽ 2 480 560</strong><small className="positive-text">↗ 12,8% <em>к прошлому месяцу</em></small></div>
                    <div className="summary-card"><div className="summary-label">Заказы <span>▤</span></div><strong>1 284</strong><small className="positive-text">↗ 6,4% <em>к прошлому месяцу</em></small></div>
                    <div className="summary-card"><div className="summary-label">Посетители <span>◉</span></div><strong>48 294</strong><small className="positive-text">↗ 18,2% <em>к прошлому месяцу</em></small></div>
                    <div className="summary-card"><div className="summary-label">Средний чек <span>◫</span></div><strong>₽ 1 932</strong><small className="negative-text">↘ 2,1% <em>к прошлому месяцу</em></small></div>
                </div>
                <div className="dashboard-caption"><span>МОЙ ДАШБОРД</span>{editMode && <span className="drag-hint">Перетаскивайте виджеты, чтобы изменить их расположение</span>}</div>
                <DashKitDnDWrapper>
                    <div className="dashkit-area">
                        <DashKit config={config} editMode={editMode} onChange={handleChange} onDrop={handleDrop} />
                        {editMode && <ActionPanel items={actionItems} className="widget-palette" />}
                    </div>
                </DashKitDnDWrapper>
                <footer className="page-footer">Показаны данные за 1–30 октября 2024 <span>Последняя синхронизация 2 минуты назад</span></footer>
            </div>
        </main>
    </div>;
}
