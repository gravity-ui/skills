import { useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import type { DashboardData } from './data';
import { applyChange, clamp, COLS, GAP, MAX_ROWS, ROW_HEIGHT, stackLayout, type Layout, type Rect } from './grid';
import { useElementSize } from './useElementSize';
import { WIDGET_BY_ID, type ViewMode, type WidgetDef } from './widgets';

/** Below this width the grid collapses to one full-width column and stops accepting drags. */
const STACK_BELOW_PX = 760;

const KEY_STEPS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

interface Gesture {
  kind: 'move' | 'resize';
  id: string;
  base: Layout; // layout when the gesture started: every preview is computed from it
  origin: Rect; // the item's rect when the gesture started
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  pointerId: number;
}

interface Metrics {
  colW: number;
  colStep: number;
  rowStep: number;
}

/** Layout that the current pointer position would produce. Snaps to whole cells. */
function previewFor(g: Gesture, m: Metrics): Layout {
  if (g.kind === 'move') {
    const x = clamp(g.origin.x + Math.round(g.dx / m.colStep), 0, COLS - g.origin.w);
    const y = Math.max(0, g.origin.y + Math.round(g.dy / m.rowStep));
    return applyChange(g.base, g.id, { x, y });
  }
  const def = WIDGET_BY_ID.get(g.id);
  const w = clamp(g.origin.w + Math.round(g.dx / m.colStep), def?.minW ?? 1, COLS - g.origin.x);
  const h = clamp(g.origin.h + Math.round(g.dy / m.rowStep), def?.minH ?? 1, MAX_ROWS);
  return applyChange(g.base, g.id, { w, h });
}

function cellStyle(item: Rect, m: Metrics): CSSProperties {
  return {
    left: item.x * m.colStep,
    top: item.y * m.rowStep,
    width: item.w * m.colW + (item.w - 1) * GAP,
    height: item.h * ROW_HEIGHT + (item.h - 1) * GAP,
  };
}

interface DashboardProps {
  data: DashboardData;
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
}

export function Dashboard({ data, layout, onLayoutChange }: DashboardProps) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const [gesture, setGesture] = useState<Gesture | null>(null);

  const colW = Math.max(1, (width - GAP * (COLS - 1)) / COLS);
  const metrics: Metrics = { colW, colStep: colW + GAP, rowStep: ROW_HEIGHT + GAP };
  const ready = width > 0;
  const stacked = ready && width < STACK_BELOW_PX;
  const interactive = ready && !stacked;

  // While dragging, every other card reflows live; the grabbed card follows the pointer.
  const preview = gesture ? previewFor(gesture, metrics) : layout;
  const rendered = stacked ? stackLayout(layout) : preview;
  const rows = rendered.reduce((max, item) => Math.max(max, item.y + item.h), 0);
  const gridHeight = rows > 0 ? rows * metrics.rowStep - GAP : 0;

  const beginGesture = (kind: Gesture['kind'], id: string, e: PointerEvent<HTMLElement>) => {
    if (!interactive || e.button !== 0) return;
    // Buttons in a header (e.g. the table toggle) must keep their own clicks.
    if (kind === 'move' && (e.target as HTMLElement).closest('button')) return;
    const item = layout.find((i) => i.id === id);
    if (!item) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setGesture({
      kind,
      id,
      base: layout,
      origin: { x: item.x, y: item.y, w: item.w, h: item.h },
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0,
      pointerId: e.pointerId,
    });
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    setGesture((g) =>
      g && g.pointerId === e.pointerId ? { ...g, dx: e.clientX - g.startX, dy: e.clientY - g.startY } : g,
    );
  };

  const endGesture = (e: PointerEvent<HTMLDivElement>) => {
    if (!gesture || gesture.pointerId !== e.pointerId) return;
    onLayoutChange(preview);
    setGesture(null);
  };

  const cancelGesture = (e: PointerEvent<HTMLDivElement>) => {
    if (gesture && gesture.pointerId === e.pointerId) setGesture(null);
  };

  const onHeaderKeyDown = (def: WidgetDef, e: KeyboardEvent<HTMLElement>) => {
    if (!interactive) return;
    const step = KEY_STEPS[e.key];
    if (!step) return;
    e.preventDefault();
    const item = layout.find((i) => i.id === def.id);
    if (!item) return;
    const [dx, dy] = step;
    if (e.shiftKey) {
      const w = clamp(item.w + dx, def.minW, COLS - item.x);
      const h = clamp(item.h + dy, def.minH, MAX_ROWS);
      onLayoutChange(applyChange(layout, def.id, { w, h }));
    } else {
      onLayoutChange(applyChange(layout, def.id, { x: item.x + dx, y: Math.max(0, item.y + dy) }));
    }
  };

  return (
    <div
      ref={ref}
      className="dash-grid"
      style={{ height: gridHeight }}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={cancelGesture}
    >
      {ready &&
        rendered.map((item) => {
          const def = WIDGET_BY_ID.get(item.id);
          if (!def) return null;
          const active = gesture && gesture.id === item.id ? gesture : null;
          const dragging = active?.kind === 'move';
          const resizing = active?.kind === 'resize';
          const style =
            active && active.kind === 'move'
              ? {
                  ...cellStyle(item, metrics),
                  left: active.origin.x * metrics.colStep + active.dx,
                  top: active.origin.y * metrics.rowStep + active.dy,
                }
              : cellStyle(item, metrics);
          return (
            <WidgetFrame
              key={item.id}
              def={def}
              data={data}
              style={style}
              className={[dragging && 'is-dragging', resizing && 'is-resizing'].filter(Boolean).join(' ')}
              interactive={interactive}
              onHeaderPointerDown={(e) => beginGesture('move', def.id, e)}
              onResizePointerDown={(e) => beginGesture('resize', def.id, e)}
              onHeaderKeyDown={(e) => onHeaderKeyDown(def, e)}
            />
          );
        })}
    </div>
  );
}

interface WidgetFrameProps {
  def: WidgetDef;
  data: DashboardData;
  style: CSSProperties;
  className: string;
  interactive: boolean;
  onHeaderPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onResizePointerDown: (e: PointerEvent<HTMLElement>) => void;
  onHeaderKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

function WidgetFrame({
  def,
  data,
  style,
  className,
  interactive,
  onHeaderPointerDown,
  onResizePointerDown,
  onHeaderKeyDown,
}: WidgetFrameProps) {
  const [view, setView] = useState<ViewMode>('chart');
  const titleId = `${def.id}-title`;

  return (
    <section className={`widget ${className}`} style={style} aria-labelledby={titleId}>
      <header
        className="widget-header"
        tabIndex={interactive ? 0 : -1}
        aria-describedby={interactive ? 'dash-keys-hint' : undefined}
        onPointerDown={onHeaderPointerDown}
        onKeyDown={onHeaderKeyDown}
      >
        {interactive && <span className="widget-grip" aria-hidden="true" />}
        <h2 id={titleId} className="widget-title">
          {def.title}
        </h2>
        {def.hasTable && (
          <button
            type="button"
            className="widget-toggle"
            aria-pressed={view === 'table'}
            onClick={() => setView((v) => (v === 'chart' ? 'table' : 'chart'))}
          >
            {view === 'table' ? 'График' : 'Таблица'}
          </button>
        )}
      </header>
      <div className="widget-body">{def.render({ data, view })}</div>
      {interactive && <div className="widget-resize" aria-hidden="true" onPointerDown={onResizePointerDown} />}
    </section>
  );
}
