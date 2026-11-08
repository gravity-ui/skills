import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { Text } from '@gravity-ui/uikit';
import { COLS, GAP, ROW_H, changeItem, type CellPatch, type LayoutItem, type LimitsById } from './layout';
import { loadLayout, saveLayout } from './layoutStorage';
import type { PeriodData } from './data';
import type { WidgetDef } from './widgets';
import { useElementSize } from './useElementSize';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Gesture {
  mode: 'move' | 'resize';
  id: string;
  pointerX: number;
  pointerY: number;
  /** Layout when the gesture began. Every preview is computed from this, so nothing drifts. */
  start: LayoutItem[];
  /** The item's pixel rect when the gesture began. */
  rect: Rect;
  lastPatch: string;
}

const ARROW_STEPS: Record<string, { dx: number; dy: number }> = {
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
};

interface Props {
  widgets: WidgetDef[];
  data: PeriodData;
}

export function Dashboard({ widgets, data }: Props) {
  const defaults = useMemo<LayoutItem[]>(
    () => widgets.map((w) => ({ id: w.id, ...w.initial })),
    [widgets],
  );
  const limits = useMemo<LimitsById>(
    () => Object.fromEntries(widgets.map((w) => [w.id, { minW: w.minW, minH: w.minH }])),
    [widgets],
  );

  const [layout, setLayout] = useState<LayoutItem[]>(() => loadLayout(defaults, limits));
  /** Live result of an in-progress drag or resize. Null when no gesture is running. */
  const [preview, setPreview] = useState<LayoutItem[] | null>(null);
  /** Pixel rect of the item being dragged, so it follows the pointer and not the snapped cell. */
  const [live, setLive] = useState<{ id: string; rect: Rect } | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const previewRef = useRef<LayoutItem[] | null>(null);

  const [gridRef, gridSize] = useElementSize<HTMLDivElement>();
  const colW = Math.max(0, (gridSize.width - GAP * (COLS - 1)) / COLS);
  const metrics = { colW, pitchX: colW + GAP, pitchY: ROW_H + GAP };

  const shown = preview ?? layout;
  const rows = shown.reduce((max, i) => Math.max(max, i.y + i.h), 0);
  const containerHeight = rows > 0 ? rows * metrics.pitchY - GAP : 0;

  const toRect = (item: LayoutItem): Rect => ({
    left: item.x * metrics.pitchX,
    top: item.y * metrics.pitchY,
    width: item.w * colW + (item.w - 1) * GAP,
    height: item.h * ROW_H + (item.h - 1) * GAP,
  });

  const commit = (next: LayoutItem[]) => {
    setLayout(next);
    saveLayout(next);
  };

  const startGesture = (e: PointerEvent<HTMLElement>, id: string, mode: 'move' | 'resize') => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const item = layout.find((i) => i.id === id);
    if (!item) return;
    const rect = toRect(item);
    gesture.current = { mode, id, pointerX: e.clientX, pointerY: e.clientY, start: layout, rect, lastPatch: '' };
    setLive({ id, rect });
  };

  const applyPatch = (g: Gesture, patch: CellPatch) => {
    const key = JSON.stringify(patch);
    if (key === g.lastPatch) return;
    g.lastPatch = key;
    const next = changeItem(g.start, limits, g.id, patch);
    previewRef.current = next;
    setPreview(next);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.pointerX;
    const dy = e.clientY - g.pointerY;

    // The live rect is kept inside the grid, so what the user sees is what gets committed.
    if (g.mode === 'move') {
      const left = clamp(g.rect.left + dx, 0, Math.max(0, gridSize.width - g.rect.width));
      const top = Math.max(0, g.rect.top + dy);
      const rect = { ...g.rect, left, top };
      setLive({ id: g.id, rect });
      applyPatch(g, {
        x: Math.round(rect.left / metrics.pitchX),
        y: Math.round(rect.top / metrics.pitchY),
      });
      return;
    }

    const width = clamp(g.rect.width + dx, colW, Math.max(colW, gridSize.width - g.rect.left));
    const height = Math.max(ROW_H, g.rect.height + dy);
    setLive({ id: g.id, rect: { ...g.rect, width, height } });
    applyPatch(g, {
      w: Math.round((width + GAP) / metrics.pitchX),
      h: Math.round((height + GAP) / metrics.pitchY),
    });
  };

  const endGesture = () => {
    if (!gesture.current) return;
    gesture.current = null;
    const next = previewRef.current;
    previewRef.current = null;
    setPreview(null);
    setLive(null);
    if (next) commit(next);
  };

  const onKey = (e: KeyboardEvent<HTMLElement>, id: string, mode: 'move' | 'resize') => {
    const step = ARROW_STEPS[e.key];
    const item = layout.find((i) => i.id === id);
    if (!step || !item) return;
    e.preventDefault();
    const patch: CellPatch =
      mode === 'move' ? { x: item.x + step.dx, y: item.y + step.dy } : { w: item.w + step.dx, h: item.h + step.dy };
    commit(changeItem(layout, limits, id, patch));
  };

  return (
    <div
      ref={gridRef}
      className="dashboard-grid"
      style={{ height: containerHeight }}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
    >
      {widgets.map((def) => {
        const item = shown.find((i) => i.id === def.id)!;
        const isLive = live?.id === def.id;
        const rect = isLive ? live.rect : toRect(item);
        const style: CSSProperties = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
        return (
          <section
            key={def.id}
            className={isLive ? 'widget is-live' : 'widget'}
            style={style}
            aria-label={def.title}
          >
            <header className="widget__header">
              <Text as="h2" variant="subheader-2" ellipsis className="widget__title">
                {def.title}
              </Text>
              <button
                type="button"
                className="widget__handle"
                aria-label={`Переместить виджет «${def.title}». Стрелки сдвигают на одну ячейку.`}
                onPointerDown={(e) => startGesture(e, def.id, 'move')}
                onKeyDown={(e) => onKey(e, def.id, 'move')}
              >
                <GripIcon />
              </button>
            </header>
            <div className="widget__body">{def.render(data)}</div>
            <button
              type="button"
              className="widget__resize"
              aria-label={`Изменить размер виджета «${def.title}». Стрелки меняют ширину и высоту.`}
              onPointerDown={(e) => startGesture(e, def.id, 'resize')}
              onKeyDown={(e) => onKey(e, def.id, 'resize')}
            >
              <ResizeIcon />
            </button>
          </section>
        );
      })}
    </div>
  );
}

function GripIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true">
      {[3, 8, 13].map((cy) => (
        <g key={cy} fill="currentColor">
          <circle cx="3" cy={cy} r="1.4" />
          <circle cx="9" cy={cy} r="1.4" />
        </g>
      ))}
    </svg>
  );
}

function ResizeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M11 3 L3 11 M11 7 L7 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
