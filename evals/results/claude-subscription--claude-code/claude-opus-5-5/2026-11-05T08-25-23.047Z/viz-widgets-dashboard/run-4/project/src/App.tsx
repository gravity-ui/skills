import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, DropdownMenu, Icon, SegmentedRadioGroup, Switch, Text } from '@gravity-ui/uikit';
import { ArrowRotateLeft, Plus } from '@gravity-ui/icons';

import { WidgetCard } from './WidgetCard';
import { type RangeKey, makeData } from './data';
import { DashboardGrid } from './grid/DashboardGrid';
import { type Layout, compact as compactLayout, findFreeSpot, fixOverlaps } from './grid/layout';
import { WIDGETS, WIDGET_BY_ID, WidgetDataTable } from './widgets';

import './dashboard.css';

const COLS = 12;
const STORAGE_KEY = 'viz-dashboard:v1';

function itemFor(id: string, pos?: { x: number; y: number; w: number; h: number }) {
  const def = WIDGET_BY_ID.get(id)!;
  const { minW, minH, ...defaults } = def.layout;
  return { i: id, ...(pos ?? defaults), minW, minH };
}

const defaultLayout = (): Layout => WIDGETS.map((w) => itemFor(w.id));

interface Saved {
  layout: Layout;
  compact: boolean;
}

function load(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (raw && Array.isArray(raw.layout)) {
      const seen = new Set<string>();
      const items: Layout = [];
      for (const it of raw.layout) {
        if (!it || typeof it.i !== 'string' || !WIDGET_BY_ID.has(it.i) || seen.has(it.i)) continue;
        if (![it.x, it.y, it.w, it.h].every((v) => Number.isFinite(v))) continue;
        seen.add(it.i);
        items.push(itemFor(it.i, { x: it.x, y: it.y, w: it.w, h: it.h }));
      }
      return { layout: fixOverlaps(items, COLS), compact: raw.compact === true };
    }
  } catch {
    // повреждённые данные — используем раскладку по умолчанию
  }
  return { layout: defaultLayout(), compact: false };
}

const RANGES: { value: RangeKey; content: string }[] = [
  { value: '7', content: '7 дней' },
  { value: '30', content: '30 дней' },
  { value: '90', content: '90 дней' },
];

export function App() {
  const [initial] = useState(load);
  const [layout, setLayout] = useState<Layout>(initial.layout);
  const [packed, setPacked] = useState(initial.compact);
  const [editing, setEditing] = useState(true);
  const [range, setRange] = useState<RangeKey>('30');
  const [tableView, setTableView] = useState<Record<string, boolean>>({});

  const data = useMemo(() => makeData(range), [range]);

  useEffect(() => {
    try {
      const plain = layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ layout: plain, compact: packed }));
    } catch {
      // хранилище недоступно — раскладка просто не сохранится
    }
  }, [layout, packed]);

  const apply = useCallback((next: Layout) => setLayout(packed ? compactLayout(next) : next), [packed]);

  const hidden = WIDGETS.filter((w) => !layout.some((it) => it.i === w.id));

  const addWidget = (id: string) => {
    const def = WIDGET_BY_ID.get(id)!;
    const spot = findFreeSpot(layout, def.layout.w, def.layout.h, COLS);
    apply([...layout, itemFor(id, { ...spot, w: def.layout.w, h: def.layout.h })]);
  };

  const removeWidget = (id: string) => apply(layout.filter((it) => it.i !== id));

  const togglePacked = (on: boolean) => {
    setPacked(on);
    if (on) setLayout(compactLayout(layout));
  };

  const reset = () => {
    setLayout(defaultLayout());
    setPacked(false);
    setTableView({});
  };

  const getLabel = useCallback((id: string) => WIDGET_BY_ID.get(id)?.title ?? id, []);

  return (
    <div className="dashboard viz-root">
      <header className="dashboard__header">
        <div>
          <Text as="h1" variant="header-2" className="dashboard__title">
            Продажи интернет-магазина
          </Text>
          <Text color="secondary">
            {editing
              ? 'Перетаскивайте виджеты за заголовок, тяните за правый нижний угол, чтобы изменить размер.'
              : 'Раскладка зафиксирована. Включите редактирование, чтобы переставить виджеты.'}
          </Text>
        </div>
        <div className="dashboard__controls">
          <Switch checked={editing} onUpdate={setEditing} content="Редактирование" />
          <Switch
            checked={packed}
            onUpdate={togglePacked}
            disabled={!editing}
            content="Прижимать вверх"
            title="Автоматически поднимать виджеты, убирая пустые строки"
          />
          <DropdownMenu
            disabled={!editing || hidden.length === 0}
            items={hidden.map((w) => ({ text: w.title, action: () => addWidget(w.id) }))}
            renderSwitcher={(props) => (
              <Button {...props} view="outlined" disabled={!editing || hidden.length === 0}>
                <Icon data={Plus} size={16} />
                Добавить виджет
              </Button>
            )}
          />
          <Button view="flat" onClick={reset} disabled={!editing}>
            <Icon data={ArrowRotateLeft} size={16} />
            Сбросить
          </Button>
        </div>
      </header>

      <div className="dashboard__filters">
        <Text color="secondary">Период</Text>
        <SegmentedRadioGroup<RangeKey> value={range} onUpdate={setRange} options={RANGES} />
      </div>

      {layout.length === 0 ? (
        <div className="dashboard__empty">
          <Text color="secondary">На дашборде нет виджетов.</Text>
          <Button view="action" onClick={() => setLayout(defaultLayout())}>
            Вернуть все виджеты
          </Button>
        </div>
      ) : (
        <DashboardGrid
          layout={layout}
          onLayoutChange={setLayout}
          editable={editing}
          compact={packed}
          cols={COLS}
          getLabel={getLabel}
          renderItem={(id, ctx) => {
            const def = WIDGET_BY_ID.get(id)!;
            const asTable = !!def.table && !!tableView[id];
            return (
              <WidgetCard
                title={def.title}
                ctx={ctx}
                scrollable={def.scrollable}
                showTable={asTable}
                onToggleTable={def.table ? () => setTableView((t) => ({ ...t, [id]: !t[id] })) : undefined}
                onRemove={() => removeWidget(id)}
              >
                {asTable ? <WidgetDataTable table={def.table!(data)} /> : def.render(data, range)}
              </WidgetCard>
            );
          }}
        />
      )}
    </div>
  );
}
