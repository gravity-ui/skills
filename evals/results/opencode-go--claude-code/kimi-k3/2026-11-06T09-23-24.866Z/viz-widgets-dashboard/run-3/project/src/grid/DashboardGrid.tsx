import { useCallback, useEffect, useRef, useState } from 'react';
import { COLS, bottom, moveItem, resizeItem, type Layout, type LayoutItem } from './layout';

const GAP = 12;
const ROW_H = 72;

export interface GridItem extends LayoutItem {
  minW: number;
  minH: number;
}

interface DragState {
  id: string;
  mode: 'move' | 'resize';
  /** смещение указателя от левого верхнего угла виджета, px (для move) */
  grabDX: number;
  grabDY: number;
}

export function DashboardGrid<T extends GridItem>({
  items,
  onChange,
  renderItem,
}: {
  items: T[];
  onChange: (layout: Layout) => void;
  renderItem: (item: T, dragHandleProps: DragHandleProps) => React.ReactNode;
}) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver((es) => setWidth(Math.round(es[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cellW = width > 0 ? (width - GAP * (COLS - 1)) / COLS : 0;
  const stepX = cellW + GAP;
  const stepY = ROW_H + GAP;

  const toPx = useCallback(
    (item: LayoutItem) => ({
      left: item.x * stepX,
      top: item.y * stepY,
      width: item.w * cellW + (item.w - 1) * GAP,
      height: item.h * ROW_H + (item.h - 1) * GAP,
    }),
    [stepX, stepY, cellW],
  );

  const gridPoint = (clientX: number, clientY: number) => {
    const rect = gridRef.current!.getBoundingClientRect();
    return { px: clientX - rect.left, py: clientY - rect.top };
  };

  const applyDrag = (clientX: number, clientY: number) => {
    const d = dragRef.current;
    if (!d || !gridRef.current) return;
    const { px, py } = gridPoint(clientX, clientY);
    const current = itemsRef.current;
    const item = current.find((i) => i.id === d.id);
    if (!item) return;

    if (d.mode === 'move') {
      const x = Math.round((px - d.grabDX) / stepX);
      const y = Math.round((py - d.grabDY) / stepY);
      if (x !== item.x || y !== item.y) onChange(moveItem(current, d.id, x, y));
    } else {
      const w = Math.round((px - item.x * stepX + GAP) / stepX);
      const h = Math.round((py - item.y * stepY + GAP) / stepY);
      if (w !== item.w || h !== item.h)
        onChange(resizeItem(current, d.id, w, h, item.minW, item.minH));
    }
  };

  const startDrag = (e: React.PointerEvent, id: string, mode: DragState['mode']) => {
    if (e.button !== 0 || !gridRef.current) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const item = itemsRef.current.find((i) => i.id === id)!;
    let grabDX = 0;
    let grabDY = 0;
    if (mode === 'move') {
      const { px, py } = gridPoint(e.clientX, e.clientY);
      grabDX = px - item.x * stepX;
      grabDY = py - item.y * stepY;
    }
    const d: DragState = { id, mode, grabDX, grabDY };
    dragRef.current = d;
    setDrag(d);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragRef.current) applyDrag(e.clientX, e.clientY);
  };
  const onPointerUp = () => {
    dragRef.current = null;
    setDrag(null);
  };

  const gridHeight = bottom(items) * stepY - GAP;
  const draggedItem = drag ? items.find((i) => i.id === drag.id) : null;

  return (
    <div
      ref={gridRef}
      className="viz-grid"
      style={{ height: Math.max(0, gridHeight) }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {draggedItem && drag?.mode === 'move' && (
        <div className="viz-grid__placeholder" style={toPx(draggedItem)} />
      )}
      {items.map((item) => {
        const px = toPx(item);
        return (
          <div
            key={item.id}
            className={`viz-grid__item${drag?.id === item.id ? ' viz-grid__item--active' : ''}`}
            style={{ ...px, zIndex: drag?.id === item.id ? 6 : 2 }}
          >
            {renderItem(item, {
              onPointerDown: (e) => startDrag(e, item.id, 'move'),
              'aria-label': 'Перетащить виджет',
            })}
            <span
              className="viz-widget__resize"
              role="separator"
              aria-label="Изменить размер виджета"
              onPointerDown={(e) => startDrag(e, item.id, 'resize')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13 5v6a2 2 0 0 1-2 2H5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path d="M13 10v1a1 1 0 0 1-1 1h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export interface DragHandleProps extends React.HTMLAttributes<HTMLElement> {
  'aria-label': string;
}
