import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { compact, layoutHeight, moveItem, resizeItem, type GridItem, type Layout } from './layout';

export interface DragHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  tabIndex: number;
  role: 'button';
  'aria-roledescription': string;
  style: React.CSSProperties;
}

export interface RenderItemArgs {
  item: GridItem;
  dragHandleProps: DragHandleProps;
  isDragging: boolean;
}

interface Props {
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
  renderItem: (args: RenderItemArgs) => React.ReactNode;
  cols?: number;
  rowHeight?: number;
  gap?: number;
  /** Accessible names for the keyboard-operable handles. */
  labels?: { move: string; resize: string };
}

type Gesture =
  | { kind: 'move'; id: string; grabX: number; grabY: number; left: number; top: number }
  | { kind: 'resize'; id: string; width: number; height: number };

interface Active {
  gesture: Gesture;
  preview: Layout;
}

const EDGE_SCROLL_ZONE = 64;
const EDGE_SCROLL_STEP = 16;

export function GridLayout({
  layout,
  onLayoutChange,
  renderItem,
  cols = 12,
  rowHeight = 72,
  gap = 16,
  labels = { move: 'Move widget', resize: 'Resize widget' },
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<Active | null>(null);

  // Latest values for the window-level listeners attached during a gesture.
  const live = useRef({ layout, onLayoutChange });
  live.current = { layout, onLayoutChange };
  // Aborts the gesture in progress (used on unmount).
  const abortGesture = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const colWidth = Math.max((width - gap * (cols - 1)) / cols, 0);
  const stepX = colWidth + gap;
  const stepY = rowHeight + gap;
  const metrics = useRef({ stepX, stepY, gap, cols });
  metrics.current = { stepX, stepY, gap, cols };

  const rectOf = (it: GridItem) => ({
    left: it.x * stepX,
    top: it.y * stepY,
    width: it.w * stepX - gap,
    height: it.h * stepY - gap,
  });

  const startGesture = useCallback(
    (e: React.PointerEvent, item: GridItem, kind: 'move' | 'resize') => {
      if (e.button !== 0 || !containerRef.current) return;
      e.preventDefault();
      const container = containerRef.current;
      const m = metrics.current;
      const base = live.current.layout;
      const bounds = container.getBoundingClientRect();
      const left = item.x * m.stepX;
      const top = item.y * m.stepY;
      const grabX = e.clientX - bounds.left - left;
      const grabY = e.clientY - bounds.top - top;
      const startW = item.w * m.stepX - m.gap;
      const startH = item.h * m.stepY - m.gap;

      let last = '';
      const begin: Gesture =
        kind === 'move'
          ? { kind, id: item.id, grabX, grabY, left, top }
          : { kind, id: item.id, width: startW, height: startH };
      setActive({ gesture: begin, preview: base });
      let preview = base;

      const onMove = (ev: PointerEvent) => {
        const { stepX, stepY, gap, cols } = metrics.current;
        const rect = container.getBoundingClientRect();
        const pointerX = ev.clientX - rect.left;
        const pointerY = ev.clientY - rect.top;

        if (ev.clientY < EDGE_SCROLL_ZONE) window.scrollBy(0, -EDGE_SCROLL_STEP);
        else if (window.innerHeight - ev.clientY < EDGE_SCROLL_ZONE) window.scrollBy(0, EDGE_SCROLL_STEP);

        let gesture: Gesture;
        let next: Layout;
        if (kind === 'move') {
          const maxLeft = container.clientWidth - startW;
          const l = Math.min(Math.max(pointerX - grabX, 0), Math.max(maxLeft, 0));
          const t = Math.max(pointerY - grabY, 0);
          gesture = { kind, id: item.id, grabX, grabY, left: l, top: t };
          const cx = Math.round(l / stepX);
          const cy = Math.round(t / stepY);
          next = moveItem(base, item.id, cx, cy, cols);
        } else {
          const minW = (item.minW ?? 1) * stepX - gap;
          const minH = (item.minH ?? 1) * stepY - gap;
          const maxW = container.clientWidth - left;
          const w = Math.min(Math.max(pointerX - left + (startW - grabX), minW), maxW);
          const h = Math.max(pointerY - top + (startH - grabY), minH);
          gesture = { kind, id: item.id, width: w, height: h };
          const cw = Math.round((w + gap) / stepX);
          const ch = Math.max(Math.round((h + gap) / stepY), 1);
          next = resizeItem(base, item.id, cw, ch, cols);
        }
        // Only recompute the neighbours' layout when the target cell changes.
        const key = JSON.stringify(next);
        if (key !== last) {
          last = key;
          preview = next;
        }
        setActive({ gesture, preview });
      };

      const finish = (commit: boolean) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        window.removeEventListener('keydown', onKey);
        abortGesture.current = null;
        setActive(null);
        if (commit && last) live.current.onLayoutChange(compact(preview));
      };
      const onUp = () => finish(true);
      const onCancel = () => finish(false);
      const onKey = (ev: KeyboardEvent) => {
        if (ev.key === 'Escape') finish(false);
      };
      abortGesture.current = onCancel;
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
      window.addEventListener('keydown', onKey);
    },
    [],
  );

  useEffect(() => () => abortGesture.current?.(), []);

  const keyboard = (item: GridItem, kind: 'move' | 'resize') => (e: React.KeyboardEvent) => {
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    const next =
      kind === 'move'
        ? moveItem(layout, item.id, item.x + d[0], item.y + d[1], cols)
        : resizeItem(layout, item.id, item.w + d[0], item.h + d[1], cols);
    onLayoutChange(compact(next));
  };

  const shown = active ? active.preview : layout;
  const activeId = active?.gesture.id;
  const placeholder = activeId ? shown.find((it) => it.id === activeId) : undefined;
  const rows = layoutHeight(shown);
  const height = rows > 0 ? rows * stepY - gap : 0;

  return (
    <div
      ref={containerRef}
      className="grid"
      style={{ height, minHeight: active ? height + stepY : height }}
    >
      {width > 0 && placeholder && (
        <div className="grid__placeholder" style={toStyle(rectOf(placeholder))} aria-hidden />
      )}
      {width > 0 &&
        shown.map((item) => {
          const isActive = item.id === activeId;
          let rect = rectOf(item);
          if (isActive && active) {
            const g = active.gesture;
            rect =
              g.kind === 'move'
                ? { ...rect, left: g.left, top: g.top }
                : { ...rect, width: g.width, height: g.height };
          }
          const source = layout.find((it) => it.id === item.id) ?? item;
          return (
            <div
              key={item.id}
              className={`grid__item${isActive ? ' grid__item_active' : ''}`}
              style={toStyle(rect)}
            >
              {renderItem({
                item,
                isDragging: isActive,
                dragHandleProps: {
                  onPointerDown: (e) => startGesture(e, source, 'move'),
                  onKeyDown: keyboard(item, 'move'),
                  tabIndex: 0,
                  role: 'button',
                  'aria-roledescription': labels.move,
                  style: { touchAction: 'none', cursor: isActive ? 'grabbing' : 'grab' },
                },
              })}
              <div
                className="grid__resize"
                role="button"
                tabIndex={0}
                aria-label={labels.resize}
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => startGesture(e, source, 'resize')}
                onKeyDown={keyboard(item, 'resize')}
              />
            </div>
          );
        })}
    </div>
  );
}

function toStyle(r: { left: number; top: number; width: number; height: number }): React.CSSProperties {
  return {
    width: r.width,
    height: r.height,
    transform: `translate(${r.left}px, ${r.top}px)`,
  };
}
