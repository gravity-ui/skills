import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';

export interface GridItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridMeta {
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
}

export interface DragHandleProps {
  onPointerDown: (e: ReactPointerEvent) => void;
}

export function collides(a: GridItem, b: GridItem): boolean {
  if (a.id === b.id) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Vertical compaction: every item rises to the highest free slot (order preserved). */
export function compact(items: GridItem[]): GridItem[] {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const out: GridItem[] = [];
  for (const it of sorted) {
    const cand = { ...it, y: 0 };
    while (out.some((p) => collides(cand, p))) cand.y += 1;
    out.push(cand);
  }
  return out;
}

/**
 * Live collision resolution while dragging/resizing: whatever overlaps the
 * active item is pushed out of the way (down when the active item is above it,
 * up when below), then the rest of the grid settles around them.
 */
export function resolveLayout(items: GridItem[], moved: GridItem): GridItem[] {
  let res = items.map((i) => (i.id === moved.id ? { ...moved } : { ...i }));
  for (let iter = 0; iter < 60; iter++) {
    let any = false;
    const m = res.find((i) => i.id === moved.id);
    if (!m) break;
    for (const it of res) {
      if (it.id === m.id || !collides(m, it)) continue;
      const mMid = m.y + m.h / 2;
      const itMid = it.y + it.h / 2;
      if (mMid <= itMid) {
        it.y = m.y + m.h; // active item is above: push the other down
      } else {
        // active item is below: swap — push the other up, unless there's no room
        it.y = m.y - it.h >= 0 ? m.y - it.h : m.y + m.h;
      }
      any = true;
    }
    const sorted = [...res].sort((a, b) => a.y - b.y || a.x - b.x);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (collides(sorted[i], sorted[j])) {
          sorted[j].y = sorted[i].y + sorted[i].h;
          any = true;
        }
      }
    }
    res = sorted;
    if (!any) break;
  }
  return res;
}

export function bottom(items: GridItem[]): number {
  return items.reduce((m, i) => Math.max(m, i.y + i.h), 0);
}

interface DragState {
  id: string;
  mode: 'move' | 'resize';
  offX: number;
  offY: number;
  px: { left: number; top: number; width: number; height: number };
}

export function GridLayout({
  items,
  meta,
  onChange,
  renderItem,
  cols = 12,
  rowH = 84,
  gap = 12,
}: {
  items: GridItem[];
  meta: Record<string, GridMeta>;
  onChange: (items: GridItem[]) => void;
  renderItem: (id: string, handle: DragHandleProps) => ReactNode;
  cols?: number;
  rowH?: number;
  gap?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setWidth(r.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const colW = width > 0 ? (width - gap * (cols - 1)) / cols : 0;
  const pitchX = colW + gap;
  const pitchY = rowH + gap;

  const toPx = (it: { x: number; y: number; w: number; h: number }) => ({
    left: it.x * pitchX,
    top: it.y * pitchY,
    width: it.w * colW + (it.w - 1) * gap,
    height: it.h * rowH + (it.h - 1) * gap,
  });

  const startDrag = (e: ReactPointerEvent, item: GridItem, mode: 'move' | 'resize') => {
    if (e.button !== 0 || !ref.current) return;
    e.preventDefault();
    const rect = ref.current.getBoundingClientRect();
    const itPx = toPx(item);
    setDrag({
      id: item.id,
      mode,
      offX: e.clientX - rect.left - itPx.left,
      offY: e.clientY - rect.top - itPx.top,
      px: itPx,
    });
  };

  const dragging = drag !== null;

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      const el = ref.current;
      if (!d || !el) return;
      const rect = el.getBoundingClientRect();
      const itemsNow = itemsRef.current;
      const item = itemsNow.find((i) => i.id === d.id);
      if (!item) return;
      const m = meta[d.id] ?? { minW: 1, minH: 1 };
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const wNow = el.clientWidth;
      const colWNow = (wNow - gap * (cols - 1)) / cols;
      const pitchXNow = colWNow + gap;
      const pitchYNow = rowH + gap;

      if (d.mode === 'move') {
        const itPxW = item.w * colWNow + (item.w - 1) * gap;
        const left = Math.min(Math.max(px - d.offX, 0), Math.max(0, wNow - itPxW));
        const top = Math.max(0, py - d.offY);
        const gx = Math.min(Math.max(Math.round(left / pitchXNow), 0), cols - item.w);
        const gy = Math.max(0, Math.round(top / pitchYNow));
        if (gx !== item.x || gy !== item.y) {
          onChangeRef.current(resolveLayout(itemsNow, { ...item, x: gx, y: gy }));
        }
        setDrag((cur) => (cur ? { ...cur, px: { ...cur.px, left, top } } : cur));
      } else {
        const itLeft = item.x * pitchXNow;
        const itTop = item.y * pitchYNow;
        const maxW = Math.min(m.maxW ?? cols, cols - item.x);
        const gw = Math.min(
          Math.max(Math.round((px - itLeft + gap) / pitchXNow), m.minW),
          maxW,
        );
        const gh = Math.min(
          Math.max(Math.round((py - itTop + gap) / pitchYNow), m.minH),
          m.maxH ?? 50,
        );
        if (gw !== item.w || gh !== item.h) {
          onChangeRef.current(resolveLayout(itemsNow, { ...item, w: gw, h: gh }));
        }
        setDrag((cur) =>
          cur
            ? {
                ...cur,
                px: {
                  left: itLeft,
                  top: itTop,
                  width: gw * colWNow + (gw - 1) * gap,
                  height: gh * rowH + (gh - 1) * gap,
                },
              }
            : cur,
        );
      }
    };
    const onUp = () => {
      onChangeRef.current(compact(itemsRef.current));
      setDrag(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, cols, rowH, gap]);

  const containerH = Math.max(0, bottom(items) * pitchY - gap);
  const dragItem = drag ? items.find((i) => i.id === drag.id) : undefined;

  return (
    <div
      ref={ref}
      className={dragging ? 'grid grid--dragging' : 'grid'}
      style={{ height: containerH }}
      aria-label="Widget grid. Drag a widget by its header, resize it from its bottom-right corner."
    >
      {dragItem && drag && (
        <div
          className="grid-placeholder"
          style={{
            transform: `translate(${toPx(dragItem).left}px, ${toPx(dragItem).top}px)`,
            width: toPx(dragItem).width,
            height: toPx(dragItem).height,
          }}
          aria-hidden
        />
      )}
      {items.map((it) => {
        const p = drag && drag.id === it.id ? drag.px : toPx(it);
        return (
          <div
            key={it.id}
            className={drag && drag.id === it.id ? 'grid-item grid-item--dragging' : 'grid-item'}
            style={{
              transform: `translate(${p.left}px, ${p.top}px)`,
              width: p.width,
              height: p.height,
            }}
          >
            {renderItem(it.id, { onPointerDown: (e) => startDrag(e, it, 'move') })}
            <button
              type="button"
              className="grid-item__resize"
              aria-label={`Resize ${it.id} widget`}
              title="Resize"
              onPointerDown={(e) => {
                e.stopPropagation();
                startDrag(e, it, 'resize');
              }}
            >
              <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden>
                <path
                  d="M11 3 L3 11 M11 7 L7 11"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
