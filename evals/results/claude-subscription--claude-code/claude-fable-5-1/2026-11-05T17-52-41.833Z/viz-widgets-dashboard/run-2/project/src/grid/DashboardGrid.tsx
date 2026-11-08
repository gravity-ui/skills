import * as React from 'react';

import { clampItem, isSameLayout, layoutHeight, moveItem, resizeItem, sortLayout, type Layout, type LayoutItem } from './layout';

export type DragMode = 'move' | 'resize';

export interface GridItemContextValue {
  id: string;
  isDragging: boolean;
  isResizing: boolean;
  locked: boolean;
  /** Пропсы для элемента, за который виджет тянут мышью/пальцем. */
  dragHandleProps: {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
    style: React.CSSProperties;
  };
  resizeHandleProps: {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  };
}

const GridItemContext = React.createContext<GridItemContextValue | null>(null);

export function useGridItem(): GridItemContextValue {
  const value = React.useContext(GridItemContext);
  if (!value) throw new Error('useGridItem must be used inside DashboardGrid');
  return value;
}

export interface DashboardGridProps {
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
  cols?: number;
  rowHeight?: number;
  gap?: number;
  /** Ширина, ниже которой сетка складывается в одну колонку. */
  stackBelow?: number;
  locked?: boolean;
  /** Дочерние элементы: по одному на элемент раскладки, `key` = id. */
  children: React.ReactNode;
}

interface DragState {
  id: string;
  mode: DragMode;
  startX: number;
  startY: number;
  origin: LayoutItem;
  dx: number;
  dy: number;
  preview: Layout;
}

function useElementWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    setWidth(node.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

export function DashboardGrid({
  layout,
  onLayoutChange,
  cols = 12,
  rowHeight = 56,
  gap = 16,
  stackBelow = 640,
  locked = false,
  children,
}: DashboardGridProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const layoutRef = React.useRef(layout);
  layoutRef.current = layout;

  const stacked = width > 0 && width < stackBelow;
  const colWidth = width > 0 ? (width - gap * (cols - 1)) / cols : 0;
  const colUnit = colWidth + gap;
  const rowUnit = rowHeight + gap;

  const toPx = React.useCallback(
    (item: LayoutItem) => ({
      left: item.x * colUnit,
      top: item.y * rowUnit,
      width: item.w * colWidth + (item.w - 1) * gap,
      height: item.h * rowHeight + (item.h - 1) * gap,
    }),
    [colUnit, rowUnit, colWidth, rowHeight, gap],
  );

  const commit = React.useCallback(
    (next: Layout) => {
      if (!isSameLayout(next, layoutRef.current)) onLayoutChange(next);
    },
    [onLayoutChange],
  );

  const updateDrag = React.useCallback(
    (patch: Partial<DragState>) => {
      const current = dragRef.current;
      if (!current) return;
      const next = { ...current, ...patch };
      dragRef.current = next;
      setDrag(next);
    },
    [],
  );

  const startDrag = React.useCallback(
    (id: string, mode: DragMode, event: React.PointerEvent<HTMLElement>) => {
      if (locked || stacked) return;
      if (event.button !== 0) return;
      const origin = layoutRef.current.find((item) => item.i === id);
      if (!origin) return;
      event.preventDefault();
      event.stopPropagation();
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);

      const state: DragState = {
        id,
        mode,
        startX: event.clientX,
        startY: event.clientY,
        origin,
        dx: 0,
        dy: 0,
        preview: layoutRef.current,
      };
      dragRef.current = state;
      setDrag(state);

      const onMove = (moveEvent: PointerEvent) => {
        const current = dragRef.current;
        if (!current || moveEvent.pointerId !== event.pointerId) return;
        const dx = moveEvent.clientX - current.startX;
        const dy = moveEvent.clientY - current.startY;
        let preview = current.preview;
        if (current.mode === 'move') {
          const x = current.origin.x + Math.round(dx / colUnit);
          const y = current.origin.y + Math.round(dy / rowUnit);
          const target = clampItem({ ...current.origin, x, y }, cols);
          const previewItem = current.preview.find((item) => item.i === id);
          if (!previewItem || previewItem.x !== target.x || previewItem.y !== target.y) {
            preview = moveItem(layoutRef.current, id, target.x, target.y, cols);
          }
        } else {
          const w = current.origin.w + Math.round(dx / colUnit);
          const h = current.origin.h + Math.round(dy / rowUnit);
          const target = clampItem({ ...current.origin, w, h }, cols);
          const previewItem = current.preview.find((item) => item.i === id);
          if (!previewItem || previewItem.w !== target.w || previewItem.h !== target.h) {
            preview = resizeItem(layoutRef.current, id, target.w, target.h, cols);
          }
        }
        updateDrag({ dx, dy, preview });
      };

      const finish = (endEvent: PointerEvent) => {
        if (endEvent.pointerId !== event.pointerId) return;
        target.removeEventListener('pointermove', onMove);
        target.removeEventListener('pointerup', finish);
        target.removeEventListener('pointercancel', finish);
        if (target.hasPointerCapture(endEvent.pointerId)) target.releasePointerCapture(endEvent.pointerId);
        const current = dragRef.current;
        dragRef.current = null;
        setDrag(null);
        if (current) commit(current.preview);
      };

      target.addEventListener('pointermove', onMove);
      target.addEventListener('pointerup', finish);
      target.addEventListener('pointercancel', finish);
    },
    [locked, stacked, cols, colUnit, rowUnit, commit, updateDrag],
  );

  const handleKey = React.useCallback(
    (id: string, mode: DragMode, event: React.KeyboardEvent<HTMLElement>) => {
      if (locked || stacked) return;
      const item = layoutRef.current.find((entry) => entry.i === id);
      if (!item) return;
      const step: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const delta = step[event.key];
      if (!delta) return;
      event.preventDefault();
      // Shift + стрелки меняют размер с любой ручки, без Shift на ручке размера тоже.
      const resizing = mode === 'resize' || event.shiftKey;
      // При перемещении шаг равен размеру виджета: так стрелка меняет его местами с соседом,
      // а не сдвигает соседа вниз.
      const next = resizing
        ? resizeItem(layoutRef.current, id, item.w + delta[0], item.h + delta[1], cols)
        : moveItem(layoutRef.current, id, item.x + delta[0] * item.w, item.y + delta[1] * item.h, cols);
      commit(next);
    },
    [locked, stacked, cols, commit],
  );

  const activeLayout = drag ? drag.preview : layout;
  const ordered = React.useMemo(() => sortLayout(activeLayout), [activeLayout]);
  const totalHeight = layoutHeight(activeLayout) * rowUnit - gap;

  const childMap = React.useMemo(() => {
    const map = new Map<string, React.ReactElement>();
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.key != null) map.set(String(child.key), child);
    });
    return map;
  }, [children]);

  const items = (stacked ? ordered : activeLayout).map((item) => {
    const child = childMap.get(item.i);
    if (!child) return null;
    const isDragging = drag?.id === item.i && drag.mode === 'move';
    const isResizing = drag?.id === item.i && drag.mode === 'resize';

    let style: React.CSSProperties;
    if (stacked) {
      style = { position: 'relative', width: '100%', height: item.h * rowHeight + (item.h - 1) * gap, marginBottom: gap };
    } else if (isDragging || isResizing) {
      const originPx = toPx(drag!.origin);
      style = isDragging
        ? { ...originPx, transform: `translate(${drag!.dx}px, ${drag!.dy}px)` }
        : {
            ...originPx,
            width: Math.max(colWidth, originPx.width + drag!.dx),
            height: Math.max(rowHeight, originPx.height + drag!.dy),
          };
    } else {
      style = toPx(item);
    }

    const context: GridItemContextValue = {
      id: item.i,
      isDragging,
      isResizing,
      locked: locked || stacked,
      dragHandleProps: {
        onPointerDown: (event) => startDrag(item.i, 'move', event),
        onKeyDown: (event) => handleKey(item.i, 'move', event),
        style: { cursor: locked || stacked ? 'default' : isDragging ? 'grabbing' : 'grab', touchAction: 'none' },
      },
      resizeHandleProps: {
        onPointerDown: (event) => startDrag(item.i, 'resize', event),
        onKeyDown: (event) => handleKey(item.i, 'resize', event),
      },
    };

    const className = [
      'dg-item',
      isDragging && 'dg-item_dragging',
      isResizing && 'dg-item_resizing',
      drag && !isDragging && !isResizing && 'dg-item_animated',
      !drag && 'dg-item_animated',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div key={item.i} className={className} style={style} data-grid-id={item.i}>
        <GridItemContext.Provider value={context}>{child}</GridItemContext.Provider>
      </div>
    );
  });

  const placeholder =
    drag && !stacked
      ? (() => {
          const item = drag.preview.find((entry) => entry.i === drag.id);
          return item ? <div className="dg-placeholder" style={toPx(item)} aria-hidden="true" /> : null;
        })()
      : null;

  return (
    <div
      ref={containerRef}
      className={['dg-grid', stacked && 'dg-grid_stacked', drag && 'dg-grid_active'].filter(Boolean).join(' ')}
      style={stacked ? undefined : { height: Math.max(totalHeight, rowHeight) }}
    >
      {width > 0 && placeholder}
      {width > 0 && items}
    </div>
  );
}
