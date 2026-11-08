import React from 'react';
import { ArrowRotateLeft, ChartColumn, Grip, ListUl, Plus, Xmark } from '@gravity-ui/icons';
import { Button, DropdownMenu, Icon, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { GridLayout, type ItemControls } from './grid/GridLayout';
import { type Layout, type LayoutItem, addItem, removeItem, sanitizeLayout } from './grid/layout';
import { RANGES, type RangeKey, getDashboardData } from './data';
import { DataTable } from './charts/DataTable';
import { DEFAULT_LAYOUT, WIDGETS, WIDGETS_BY_ID, type WidgetDef } from './widgets';
import './dashboard.css';

const COLS = 12;
const STORAGE_KEY = 'viz-dashboard:v1';

interface Saved {
  layout: Layout;
  range: RangeKey;
}

const KNOWN = new Map(DEFAULT_LAYOUT.map((it) => [it.i, it]));

function load(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    const layout = sanitizeLayout(raw?.layout, KNOWN, COLS);
    const range = RANGES.some((r) => r.value === raw?.range) ? (raw.range as RangeKey) : '30d';
    if (layout) return { layout, range };
  } catch {
    // Corrupted storage: fall back to defaults.
  }
  return { layout: DEFAULT_LAYOUT, range: '30d' };
}

/** Only geometry is persisted; size limits always come from the widget definitions. */
const toStored = (layout: Layout) => layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));

export function App() {
  const [{ layout, range }, setState] = React.useState<Saved>(load);
  const [tableViews, setTableViews] = React.useState<Set<string>>(() => new Set());
  const data = React.useMemo(() => getDashboardData(range), [range]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ layout: toStored(layout), range }));
  }, [layout, range]);

  const setLayout = React.useCallback((next: Layout) => setState((s) => ({ ...s, layout: next })), []);
  const hidden = WIDGETS.filter((w) => !layout.some((it) => it.i === w.id));
  const getItemLabel = React.useCallback((id: string) => WIDGETS_BY_ID.get(id)?.title ?? id, []);

  const toggleTable = (id: string) =>
    setTableViews((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const renderItem = (item: LayoutItem, controls: ItemControls) => {
    const def = WIDGETS_BY_ID.get(item.i);
    if (!def) return null;
    return (
      <WidgetFrame
        def={def}
        controls={controls}
        tableView={tableViews.has(def.id)}
        onToggleTable={() => toggleTable(def.id)}
        onRemove={() => setLayout(removeItem(layout, def.id, COLS))}
      >
        {def.table && tableViews.has(def.id) ? <DataTable view={def.table(data)} /> : def.render(data)}
      </WidgetFrame>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <Text as="h1" variant="header-1">
            Обзор магазина
          </Text>
          <Text as="p" color="secondary" className="dashboard__hint">
            Тяните виджет за заголовок, размер меняйте за правый нижний угол. С клавиатуры: фокус на&nbsp;
            <Icon data={Grip} size={12} /> и стрелки, Shift + стрелки — размер.
          </Text>
        </div>
      </header>

      <div className="dashboard__toolbar">
        <SegmentedRadioGroup
          aria-label="Период"
          value={range}
          onUpdate={(value) => setState((s) => ({ ...s, range: value as RangeKey }))}
          options={RANGES.map(({ value, content }) => ({ value, content }))}
        />
        <div className="dashboard__toolbar-spacer" />
        <DropdownMenu
          disabled={hidden.length === 0}
          renderSwitcher={(props) => (
            <Button {...props} view="outlined" disabled={hidden.length === 0}>
              <Icon data={Plus} size={16} />
              Добавить виджет
            </Button>
          )}
          items={hidden.map((w) => ({
            text: w.title,
            action: () => setLayout(addItem(layout, { i: w.id, ...w.layout }, COLS)),
          }))}
        />
        <Button view="flat" onClick={() => setLayout(DEFAULT_LAYOUT)}>
          <Icon data={ArrowRotateLeft} size={16} />
          Сбросить раскладку
        </Button>
      </div>

      {layout.length === 0 ? (
        <div className="dashboard__empty">
          <Text color="secondary">На дашборде нет виджетов.</Text>
          <Button view="action" onClick={() => setLayout(DEFAULT_LAYOUT)}>
            Вернуть стандартный набор
          </Button>
        </div>
      ) : (
        <GridLayout
          layout={layout}
          onLayoutChange={setLayout}
          renderItem={renderItem}
          getItemLabel={getItemLabel}
          cols={COLS}
          rowHeight={52}
          gap={12}
        />
      )}
    </div>
  );
}

interface FrameProps {
  def: WidgetDef;
  controls: ItemControls;
  tableView: boolean;
  onToggleTable: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}

function WidgetFrame({ def, controls, tableView, onToggleTable, onRemove, children }: FrameProps) {
  const titleId = `widget-title-${def.id}`;
  return (
    <section
      className={`widget${controls.active ? ' widget_active' : ''}${tableView ? ' widget_table' : ''}`}
      aria-labelledby={titleId}
    >
      <header className={`widget__header${controls.editable ? ' widget__header_draggable' : ''}`} {...controls.dragAreaProps}>
        {controls.editable && (
          <button
            type="button"
            className="widget__grip"
            data-grid-handle
            aria-label={`Переместить виджет «${def.title}»`}
            title="Перетащите или используйте стрелки"
            {...controls.handleProps}
          >
            <Icon data={Grip} size={14} />
          </button>
        )}
        <Text id={titleId} as="h2" variant="subheader-2" ellipsis className="widget__title">
          {def.title}
        </Text>
        <div className="widget__actions">
          {def.table && (
            <Button
              view="flat-secondary"
              size="s"
              selected={tableView}
              onClick={onToggleTable}
              aria-label={tableView ? 'Показать график' : 'Показать таблицей'}
              title={tableView ? 'Показать график' : 'Показать таблицей'}
            >
              <Icon data={tableView ? ChartColumn : ListUl} size={14} />
            </Button>
          )}
          <Button view="flat-secondary" size="s" onClick={onRemove} aria-label={`Убрать виджет «${def.title}»`} title="Убрать с дашборда">
            <Icon data={Xmark} size={14} />
          </Button>
        </div>
      </header>
      <div className="widget__body">{children}</div>
    </section>
  );
}
