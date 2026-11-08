import { useEffect, useMemo, useState } from 'react';
import { Button, Card, DropdownMenu, Icon, SegmentedRadioGroup, Switch, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';
import { ArrowRotateLeft, ChartLine, Ellipsis, Grip, ListUl, Lock, LockOpen, Plus, TrashBin } from '@gravity-ui/icons';

import { DashboardGrid } from './grid/DashboardGrid';
import type { ItemRenderProps } from './grid/DashboardGrid';
import { type LayoutItem, type PackMode, compact, findFreeSpot } from './grid/layout';
import { RANGES, type RangeKey, getDashboardData } from './data';
import { WIDGETS, WIDGET_GROUPS, type WidgetContext, type WidgetType } from './widgets';
import './styles.css';

const COLS = 12;
const ROW_HEIGHT = 64;
const GAP = 12;
const STORAGE_KEY = 'viz-dashboard/v1';

export interface WidgetItem extends LayoutItem {
    type: WidgetType;
}

interface Saved {
    items: { i: string; type: WidgetType; x: number; y: number; w: number; h: number }[];
    mode: PackMode;
    tableViews: string[];
}

function withLimits(item: Omit<WidgetItem, 'minW' | 'minH' | 'maxH'>): WidgetItem {
    const { minW, minH, maxH } = WIDGETS[item.type].size;
    return { ...item, minW, minH, maxH };
}

const DEFAULT_ITEMS: WidgetItem[] = (
    [
        ['revenue', 'kpi-revenue', 0, 0, 3, 2],
        ['orders', 'kpi-orders', 3, 0, 3, 2],
        ['conversion', 'kpi-conversion', 6, 0, 3, 2],
        ['aov', 'kpi-aov', 9, 0, 3, 2],
        ['trend', 'revenue-trend', 0, 2, 8, 5],
        ['channels', 'channels', 8, 2, 4, 5],
        ['devices', 'devices', 0, 7, 6, 2],
        ['goal', 'goal', 6, 7, 6, 2],
        ['products', 'top-products', 0, 9, 12, 5],
    ] as const
).map(([i, type, x, y, w, h]) => withLimits({ i, type, x, y, w, h }));

function load(): { items: WidgetItem[]; mode: PackMode; tableViews: Set<string> } {
    const fallback = { items: DEFAULT_ITEMS, mode: 'compact' as PackMode, tableViews: new Set<string>() };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return fallback;
        const saved = JSON.parse(raw) as Saved;
        const isInt = (v: unknown) => Number.isInteger(v) && (v as number) >= 0;
        const items = saved.items
            .filter((it) => it && it.type in WIDGETS && typeof it.i === 'string')
            .filter((it) => isInt(it.x) && isInt(it.y) && isInt(it.w) && isInt(it.h) && it.w > 0 && it.h > 0)
            .map(withLimits);
        return {
            items,
            mode: saved.mode === 'free' ? 'free' : 'compact',
            tableViews: new Set(Array.isArray(saved.tableViews) ? saved.tableViews : []),
        };
    } catch {
        return fallback;
    }
}

export function App() {
    const initial = useMemo(load, []);
    const [items, setItems] = useState<WidgetItem[]>(initial.items);
    const [mode, setMode] = useState<PackMode>(initial.mode);
    const [tableViews, setTableViews] = useState<Set<string>>(initial.tableViews);
    const [locked, setLocked] = useState(false);
    const [range, setRange] = useState<RangeKey>('30d');
    const [focusId, setFocusId] = useState<string | null>(null);

    const data = useMemo(() => getDashboardData(range), [range]);
    const rangeLabel = RANGES.find((r) => r.value === range)!.label;

    useEffect(() => {
        const saved: Saved = {
            items: items.map(({ i, type, x, y, w, h }) => ({ i, type, x, y, w, h })),
            mode,
            tableViews: [...tableViews].filter((id) => items.some((it) => it.i === id)),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }, [items, mode, tableViews]);

    // Bring a freshly added widget into view and put focus on its handle.
    useEffect(() => {
        if (!focusId) return;
        const el = document.querySelector<HTMLElement>(`[data-widget-id="${focusId}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        el?.querySelector<HTMLElement>('.widget__grip')?.focus({ preventScroll: true });
        setFocusId(null);
    }, [focusId]);

    const changeMode = (next: PackMode) => {
        setMode(next);
        if (next === 'compact') setItems((cur) => compact(cur));
    };

    const addWidget = (type: WidgetType) => {
        const { w, h } = WIDGETS[type].size;
        const spot = findFreeSpot(items, w, h, COLS);
        const id = `${type}-${Date.now().toString(36)}`;
        const next = [...items, withLimits({ i: id, type, ...spot })];
        setItems(mode === 'compact' ? compact(next) : next);
        setFocusId(id);
    };

    const removeWidget = (id: string) => {
        const next = items.filter((it) => it.i !== id);
        setItems(mode === 'compact' ? compact(next) : next);
    };

    const toggleTable = (id: string) =>
        setTableViews((cur) => {
            const next = new Set(cur);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const reset = () => {
        setItems(DEFAULT_ITEMS);
        setMode('compact');
        setTableViews(new Set());
    };

    const addMenu: DropdownMenuItem[][] = WIDGET_GROUPS.map((group) =>
        (Object.keys(WIDGETS) as WidgetType[])
            .filter((type) => WIDGETS[type].group === group)
            .map((type) => ({
                text: WIDGETS[type].title,
                iconStart: <Icon data={WIDGETS[type].icon} size={16} />,
                action: () => addWidget(type),
            })),
    );

    const renderItem = (item: WidgetItem, props: ItemRenderProps) => {
        const def = WIDGETS[item.type];
        const asTable = tableViews.has(item.i);
        const ctx: WidgetContext = { data, rangeLabel, asTable };
        const titleId = `widget-title-${item.i}`;
        const menu: DropdownMenuItem[] = [
            ...(def.hasTableView
                ? [
                      {
                          text: asTable ? 'Показать график' : 'Показать таблицей',
                          iconStart: <Icon data={asTable ? ChartLine : ListUl} size={16} />,
                          action: () => toggleTable(item.i),
                      },
                  ]
                : []),
            ...(props.editable
                ? [
                      {
                          text: 'Удалить виджет',
                          theme: 'danger' as const,
                          iconStart: <Icon data={TrashBin} size={16} />,
                          action: () => removeWidget(item.i),
                      },
                  ]
                : []),
        ];

        return (
            <Card
                view={props.dragging ? 'raised' : 'outlined'}
                className={`widget${props.dragging ? ' widget_dragging' : ''}`}
                data-widget-id={item.i}
            >
                <section className="widget__section" aria-labelledby={titleId}>
                    <header
                        className={`widget__header${props.editable ? ' widget__header_draggable' : ''}`}
                        {...props.dragAreaProps}
                    >
                        {props.editable && (
                            <button
                                type="button"
                                className="widget__grip"
                                aria-label={`Переместить или изменить размер: ${def.title}`}
                                {...props.gripProps}
                            >
                                <Icon data={Grip} size={14} />
                            </button>
                        )}
                        <div className="widget__titles">
                            <h2 id={titleId} className="widget__title">
                                {def.title}
                            </h2>
                            {def.subtitle && <div className="widget__subtitle">{def.subtitle(ctx)}</div>}
                        </div>
                        {menu.length > 0 && (
                            <div className="widget__actions" data-no-drag>
                                <DropdownMenu
                                    items={menu}
                                    size="m"
                                    renderSwitcher={(switcher) => (
                                        <Button
                                            {...switcher}
                                            view="flat-secondary"
                                            size="s"
                                            aria-label={`Действия: ${def.title}`}
                                        >
                                            <Icon data={Ellipsis} size={16} />
                                        </Button>
                                    )}
                                />
                            </div>
                        )}
                    </header>
                    <div className="widget__body">{def.render(ctx)}</div>
                </section>
            </Card>
        );
    };

    return (
        <div className="dash viz-root">
            <header className="dash__toolbar">
                <div>
                    <Text as="h1" variant="header-1" className="dash__title">
                        Обзор продаж
                    </Text>
                    <Text color="secondary">
                        {locked
                            ? 'Раскладка зафиксирована'
                            : 'Перетаскивайте виджеты за заголовок, меняйте размер за правый нижний угол'}
                    </Text>
                </div>
                <div className="dash__actions">
                    {!locked && (
                        <>
                            <Switch
                                checked={mode === 'compact'}
                                onUpdate={(on) => changeMode(on ? 'compact' : 'free')}
                                content="Уплотнять вверх"
                                title="Выключите, чтобы оставлять пустые места между виджетами"
                            />
                            <DropdownMenu
                                items={addMenu}
                                renderSwitcher={(switcher) => (
                                    <Button {...switcher} view="action">
                                        <Icon data={Plus} size={16} />
                                        Добавить виджет
                                    </Button>
                                )}
                            />
                            <Button view="outlined" onClick={reset}>
                                <Icon data={ArrowRotateLeft} size={16} />
                                Сбросить
                            </Button>
                        </>
                    )}
                    <Button
                        view={locked ? 'outlined-action' : 'outlined'}
                        selected={locked}
                        onClick={() => setLocked((v) => !v)}
                        aria-pressed={locked}
                    >
                        <Icon data={locked ? Lock : LockOpen} size={16} />
                        {locked ? 'Разблокировать' : 'Зафиксировать'}
                    </Button>
                </div>
            </header>

            <div className="dash__filters" role="group" aria-label="Фильтры">
                <Text color="secondary">Период</Text>
                <SegmentedRadioGroup
                    value={range}
                    onUpdate={(v) => setRange(v as RangeKey)}
                    options={RANGES.map((r) => ({ value: r.value, content: r.label }))}
                    aria-label="Период"
                />
            </div>

            {items.length === 0 ? (
                <div className="dash__empty">
                    <Text variant="subheader-2">На дашборде нет виджетов</Text>
                    <Text color="secondary">Добавьте виджет из каталога или верните стандартную раскладку.</Text>
                    <div className="dash__empty-actions">
                        <DropdownMenu
                            items={addMenu}
                            renderSwitcher={(switcher) => (
                                <Button {...switcher} view="action">
                                    <Icon data={Plus} size={16} />
                                    Добавить виджет
                                </Button>
                            )}
                        />
                        <Button view="outlined" onClick={reset}>
                            Стандартная раскладка
                        </Button>
                    </div>
                </div>
            ) : (
                <DashboardGrid
                    layout={items}
                    cols={COLS}
                    rowHeight={ROW_HEIGHT}
                    gap={GAP}
                    mode={mode}
                    locked={locked}
                    onLayoutChange={setItems}
                    renderItem={renderItem}
                    getItemLabel={(item) => WIDGETS[item.type].title}
                />
            )}
        </div>
    );
}
