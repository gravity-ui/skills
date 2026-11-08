import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Button, SegmentedRadioGroup } from '@gravity-ui/uikit';
import { sliceRange, type RangeDays } from './data';
import {
  COLS,
  GAP,
  ROW_H,
  colWidthPx,
  gridHeightPx,
  isValidLayout,
  itemRectPx,
  updateItem,
  type Item,
} from './grid';
import { useElementSize } from './useElementSize';
import {
  DEFAULT_ITEMS,
  WIDGETS,
  WIDGET_IDS,
  sizeOfWidget,
  type DashboardData,
  type View,
} from './widgets';

const STORAGE_KEY = 'viz-dashboard-layout:v1';

function loadLayout(): Item[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidLayout(parsed, WIDGET_IDS, sizeOfWidget)) return parsed;
    }
  } catch {
    // Unreadable or unavailable storage: fall through to the default layout.
  }
  return DEFAULT_ITEMS;
}

function saveLayout(items: Item[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or disabled: the layout still works for this session.
  }
}

function sameLayout(a: Item[], b: Item[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((it, idx) => {
    const other = b[idx];
    return it.i === other.i && it.x === other.x && it.y === other.y && it.w === other.w && it.h === other.h;
  });
}

interface DragState {
  id: string;
  mode: 'move' | 'resize';
  pointerId: number;
  startX: number;
  startY: number;
  base: Item[];
  origin: Item;
  latest: Item[];
}

const ARROW_DELTA: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

interface Props {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function Dashboard({ theme, onThemeChange }: Props) {
  const [range, setRange] = useState<RangeDays>(30);
  const [editing, setEditing] = useState(false);
  const [layout, setLayout] = useState<Item[]>(loadLayout);
  const [preview, setPreview] = useState<Item[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [views, setViews] = useState<Record<string, View>>({});
  const [announce, setAnnounce] = useState('');
  const [gridRef, gridSize] = useElementSize<HTMLDivElement>();
  const drag = useRef<DragState | null>(null);

  useEffect(() => {
    saveLayout(layout);
  }, [layout]);

  const data: DashboardData = useMemo(() => {
    const { current, previous } = sliceRange(range);
    return { range, current, previous };
  }, [range]);

  const items = preview ?? layout;
  const colW = colWidthPx(gridSize.width);
  const gridHeight = gridHeightPx(items);

  const beginDrag = (e: PointerEvent<HTMLButtonElement>, id: string, mode: DragState['mode']) => {
    if (!editing) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const origin = layout.find((it) => it.i === id);
    if (!origin) return;
    drag.current = {
      id,
      mode,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      base: layout,
      origin,
      latest: layout,
    };
    setActiveId(id);
  };

  const onDragMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const stepX = colW + GAP;
    const stepY = ROW_H + GAP;
    if (stepX <= 0) return;
    const dx = Math.round((e.clientX - d.startX) / stepX);
    const dy = Math.round((e.clientY - d.startY) / stepY);
    const patch =
      d.mode === 'move'
        ? { x: d.origin.x + dx, y: d.origin.y + dy }
        : { w: d.origin.w + dx, h: d.origin.h + dy };
    const next = updateItem(d.base, d.id, patch, sizeOfWidget);
    if (!sameLayout(next, d.latest)) {
      d.latest = next;
      setPreview(next);
    }
  };

  const endDrag = (e: PointerEvent<HTMLButtonElement>, commit: boolean) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    if (commit && !sameLayout(d.latest, layout)) {
      setLayout(d.latest);
    }
    setPreview(null);
    setActiveId(null);
  };

  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>, id: string, mode: DragState['mode']) => {
    const delta = ARROW_DELTA[e.key];
    if (!delta) return;
    e.preventDefault();
    const it = layout.find((x) => x.i === id);
    if (!it) return;
    const [dx, dy] = delta;
    const patch = mode === 'move' ? { x: it.x + dx, y: it.y + dy } : { w: it.w + dx, h: it.h + dy };
    const next = updateItem(layout, id, patch, sizeOfWidget);
    if (sameLayout(next, layout)) {
      const t = WIDGETS.find((w) => w.id === id)?.title ?? id;
      setAnnounce(`${t}: дальше сдвинуть нельзя`);
      return;
    }
    setLayout(next);
    const moved = next.find((x) => x.i === id);
    const title = WIDGETS.find((w) => w.id === id)?.title ?? id;
    if (moved) {
      setAnnounce(
        mode === 'move'
          ? `${title}: колонка ${moved.x + 1}, строка ${moved.y + 1}`
          : `${title}: ${moved.w} колонок на ${moved.h} строк`,
      );
    }
  };

  const resetLayout = () => {
    setLayout(DEFAULT_ITEMS);
    setAnnounce('Раскладка сброшена к исходной');
  };

  const toggleView = (id: string) => {
    setViews((prev) => ({ ...prev, [id]: prev[id] === 'table' ? 'chart' : 'table' }));
  };

  return (
    <div className="dash" data-theme={theme}>
      <header className="dash-head">
        <div className="dash-titles">
          <h1 className="dash-title">Обзор продаж</h1>
          <p className="dash-sub">
            {editing
              ? 'Перетаскивайте виджеты за ручку и меняйте размер за правый нижний угол. Клавиатура: фокус на ручку, затем стрелки.'
              : 'Нажмите «Редактировать», чтобы переставить виджеты.'}
          </p>
        </div>
        <div className="dash-tools">
          <SegmentedRadioGroup
            size="m"
            value={String(range)}
            onUpdate={(v: string) => setRange(Number(v) as RangeDays)}
            options={[
              { value: '7', content: '7 дн.' },
              { value: '30', content: '30 дн.' },
              { value: '90', content: '90 дн.' },
            ]}
          />
          <SegmentedRadioGroup
            size="m"
            value={theme}
            onUpdate={(v: string) => onThemeChange(v === 'dark' ? 'dark' : 'light')}
            options={[
              { value: 'light', content: 'Светлая' },
              { value: 'dark', content: 'Тёмная' },
            ]}
          />
          <Button view={editing ? 'action' : 'outlined'} size="m" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Готово' : 'Редактировать'}
          </Button>
          {editing && (
            <Button view="flat" size="m" onClick={resetLayout}>
              Сбросить раскладку
            </Button>
          )}
        </div>
      </header>

      <div className="dash-grid" ref={gridRef} style={{ height: gridHeight }}>
        {colW > 0 &&
          WIDGETS.map((def) => {
            const it = items.find((x) => x.i === def.id);
            if (!it) return null;
            const rect = itemRectPx(it, colW);
            const view = views[def.id] ?? 'chart';
            const cls = ['dash-item', editing && 'is-editing', activeId === def.id && 'is-active']
              .filter(Boolean)
              .join(' ');
            return (
              <section
                key={def.id}
                className={cls}
                style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
                aria-labelledby={`${def.id}-title`}
              >
                <header className="w-head">
                  <h2 id={`${def.id}-title`} className="w-title">
                    {def.title}
                  </h2>
                  <div className="w-tools">
                    {def.hasTable && (
                      <Button size="s" view="flat" onClick={() => toggleView(def.id)}>
                        {view === 'table' ? 'График' : 'Таблица'}
                      </Button>
                    )}
                    {editing && (
                      <button
                        type="button"
                        className="w-handle"
                        aria-label={`Переместить виджет «${def.title}»`}
                        onPointerDown={(e) => beginDrag(e, def.id, 'move')}
                        onPointerMove={onDragMove}
                        onPointerUp={(e) => endDrag(e, true)}
                        onPointerCancel={(e) => endDrag(e, false)}
                        onKeyDown={(e) => onHandleKey(e, def.id, 'move')}
                      >
                        <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true">
                          {[3, 8, 13].map((cy) =>
                            [3, 9].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.5} />),
                          )}
                        </svg>
                      </button>
                    )}
                  </div>
                </header>

                <div className="w-body">{def.render(data, view)}</div>

                {editing && (
                  <button
                    type="button"
                    className="w-resize"
                    aria-label={`Изменить размер виджета «${def.title}»`}
                    onPointerDown={(e) => beginDrag(e, def.id, 'resize')}
                    onPointerMove={onDragMove}
                    onPointerUp={(e) => endDrag(e, true)}
                    onPointerCancel={(e) => endDrag(e, false)}
                    onKeyDown={(e) => onHandleKey(e, def.id, 'resize')}
                  />
                )}
              </section>
            );
          })}
      </div>

      <div className="sr-only" aria-live="polite">
        {announce}
      </div>
      <p className="dash-foot">
        Сетка из {COLS} колонок. Раскладка сохраняется в этом браузере.
      </p>
    </div>
  );
}
