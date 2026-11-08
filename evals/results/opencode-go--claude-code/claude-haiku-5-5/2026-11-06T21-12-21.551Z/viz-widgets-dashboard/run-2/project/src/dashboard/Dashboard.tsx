import { useEffect, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Button, Text } from '@gravity-ui/uikit';
import {
  COLS,
  GAP,
  gridHeight,
  gridMetrics,
  placeItem,
  rectToPx,
  settle,
  type GridMetrics,
  type LayoutItem,
  type PxBox,
} from './layout';
import { DEFAULT_LAYOUT, WIDGETS } from './widgets';
import { useElementSize } from './useElementSize';
import { WidgetCard } from './WidgetCard';
import './dashboard.css';

const STORAGE_KEY = 'dashboard-layout:v1';
const specById = new Map(WIDGETS.map((w) => [w.id, w]));

type DragMode = 'move' | 'resize';

interface Drag {
  id: string;
  mode: DragMode;
  startX: number;
  startY: number;
  /** Committed position at the moment the drag started. */
  base: LayoutItem;
}

// ---------- persistence ----------

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function isSavedItem(e: unknown): e is LayoutItem {
  if (typeof e !== 'object' || e === null) return false;
  const o = e as Record<string, unknown>;
  return typeof o.id === 'string' && isNum(o.x) && isNum(o.y) && isNum(o.w) && isNum(o.h);
}

/** Restores the saved layout, ignoring anything malformed or belonging to widgets that no longer exist. */
function loadLayout(): LayoutItem[] {
  const fallback = settle(DEFAULT_LAYOUT);
  let raw: unknown;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return fallback;
  }
  if (!Array.isArray(raw)) return fallback;

  const saved = raw.filter(isSavedItem);
  const items = WIDGETS.map((spec): LayoutItem => {
    const found = saved.find((s) => s.id === spec.id);
    if (!found) return DEFAULT_LAYOUT.find((d) => d.id === spec.id)!;
    return {
      id: spec.id,
      x: found.x,
      y: found.y,
      w: Math.min(COLS, Math.max(spec.minW, found.w)),
      h: Math.max(spec.minH, found.h),
    };
  });
  return settle(items);
}

function saveLayout(layout: LayoutItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // storage full or disabled: the layout still works for this session
  }
}

// ---------- drag geometry ----------

/**
 * The grid cell a drag would land on. Move snaps the item's visual top-left to the nearest cell;
 * resize snaps the item's visual size to whole cells, never below the widget's minimum.
 */
function targetOf(drag: Drag, dx: number, dy: number, m: GridMetrics): LayoutItem {
  const { base } = drag;
  const spec = specById.get(base.id)!;
  const origin = rectToPx(base, m);

  if (drag.mode === 'move') {
    return {
      ...base,
      x: Math.round((origin.left + dx) / m.colStep),
      y: Math.round((origin.top + dy) / m.rowStep),
    };
  }

  const w = Math.min(COLS - base.x, Math.max(spec.minW, Math.round((origin.width + dx + GAP) / m.colStep)));
  const h = Math.max(spec.minH, Math.round((origin.height + dy + GAP) / m.rowStep));
  return { ...base, w, h };
}

const boxStyle = (b: PxBox) => ({ left: b.left, top: b.top, width: b.width, height: b.height });

const KEY_STEPS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

// ---------- component ----------

export function Dashboard() {
  const [layout, setLayout] = useState<LayoutItem[]>(loadLayout);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [pointer, setPointer] = useState({ dx: 0, dy: 0 });
  const [gridRef, gridSize] = useElementSize<HTMLDivElement>();

  useEffect(() => saveLayout(layout), [layout]);

  // Widgets are positioned in px, so they need the real width. Render them only after it is measured;
  // otherwise they would jump from a fallback width on first paint.
  const measured = gridSize.width > 0;
  const metrics = gridMetrics(gridSize.width || 1200);

  // While dragging, the other widgets reflow as if the dragged one were already at its target cell.
  // The dragged widget itself follows the pointer freely until it is dropped.
  const dragTarget = drag ? targetOf(drag, pointer.dx, pointer.dy, metrics) : null;
  const preview = dragTarget ? placeItem(layout, dragTarget) : layout;

  const beginDrag = (id: string, mode: DragMode, e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const base = layout.find((i) => i.id === id)!;
    setDrag({ id, mode, startX: e.clientX, startY: e.clientY, base });
    setPointer({ dx: 0, dy: 0 });
  };

  const moveDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setPointer({ dx: e.clientX - drag.startX, dy: e.clientY - drag.startY });
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const target = targetOf(drag, e.clientX - drag.startX, e.clientY - drag.startY, metrics);
    setLayout((prev) => placeItem(prev, target));
    setDrag(null);
  };

  const cancelDrag = () => setDrag(null);

  // Keyboard equivalent of drag: arrows move one cell, Shift+arrows resize one cell.
  const nudge = (id: string, e: KeyboardEvent<HTMLElement>) => {
    const step = KEY_STEPS[e.key];
    if (!step) return;
    e.preventDefault();
    const [dx, dy] = step;
    const resize = e.shiftKey;
    const spec = specById.get(id)!;
    setLayout((prev) => {
      const item = prev.find((i) => i.id === id)!;
      const next: LayoutItem = resize
        ? {
            ...item,
            w: Math.min(COLS - item.x, Math.max(spec.minW, item.w + dx)),
            h: Math.max(spec.minH, item.h + dy),
          }
        : { ...item, x: item.x + dx, y: Math.max(0, item.y + dy) };
      return placeItem(prev, next);
    });
  };

  const reset = () => {
    setLayout(settle(DEFAULT_LAYOUT));
  };

  const draggedPreview = drag ? preview.find((i) => i.id === drag.id) : undefined;

  return (
    <div className="dash-root">
      <header className="dash-header">
        <div>
          <Text as="h1" variant="header-2">
            Дашборд продаж
          </Text>
          <Text as="p" variant="body-1" color="secondary" className="dash-hint">
            Перетащите заголовок виджета, чтобы переставить его, и потяните за правый нижний угол, чтобы изменить размер.
            С клавиатуры: стрелки — переместить, Shift + стрелки — размер.
          </Text>
        </div>
        <Button view="outlined" onClick={reset}>
          Сбросить раскладку
        </Button>
      </header>

      <div
        ref={gridRef}
        className="dash-grid"
        style={{ height: gridHeight(preview) }}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
      >
        {draggedPreview && (
          <div className="dash-placeholder" aria-hidden="true" style={boxStyle(rectToPx(draggedPreview, metrics))} />
        )}

        {measured && WIDGETS.map((spec) => {
          const own = drag && drag.id === spec.id ? drag : null;
          let box = rectToPx(preview.find((i) => i.id === spec.id)!, metrics);
          if (own?.mode === 'move') {
            const origin = rectToPx(own.base, metrics);
            box = { ...origin, left: origin.left + pointer.dx, top: origin.top + pointer.dy };
          }
          return (
            <WidgetCard
              key={spec.id}
              spec={spec}
              box={box}
              dragging={own?.mode === 'move'}
              resizing={own?.mode === 'resize'}
              onGripDown={(e) => beginDrag(spec.id, 'move', e)}
              onResizeDown={(e) => beginDrag(spec.id, 'resize', e)}
              onKeyDown={(e) => nudge(spec.id, e)}
            />
          );
        })}
      </div>
    </div>
  );
}
