import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import { clampItem, layoutHeight, moveItem, resizeItem, type Layout, type LayoutItem } from './layout';
import { useSize } from '../hooks/useSize';
import './GridLayout.css';

export interface DragHandleProps {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  'aria-label': string;
  'aria-describedby': string;
  tabIndex: number;
  className: string;
}

export interface ItemRenderApi {
  item: LayoutItem;
  dragHandleProps: DragHandleProps;
  isDragging: boolean;
  editable: boolean;
}

export interface GridLayoutProps {
  layout: Layout;
  cols: number;
  rowHeight: number;
  gap?: number;
  editable?: boolean;
  onLayoutChange: (layout: Layout) => void;
  renderItem: (api: ItemRenderApi) => ReactNode;
  className?: string;
}

interface DragState {
  kind: 'move' | 'resize';
  id: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startLayout: Layout;
  origin: LayoutItem;
  dx: number;
  dy: number;
}

const HINT_ID = 'grid-layout-keyboard-hint';

export function GridLayout({
  layout,
  cols,
  rowHeight,
  gap = 12,
  editable = true,
  onLayoutChange,
  renderItem,
  className,
}: GridLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useSize(containerRef);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const colWidth = width > 0 ? (width - gap * (cols - 1)) / cols : 0;
  const cellW = colWidth + gap;
  const cellH = rowHeight + gap;

  const toPx = useCallback(
    (item: LayoutItem) => ({
      left: item.x * cellW,
      top: item.y * cellH,
      width: item.w * colWidth + (item.w - 1) * gap,
      height: item.h * rowHeight + (item.h - 1) * gap,
    }),
    [cellW, cellH, colWidth, rowHeight, gap],
  );

  /** Раскладка «на лету» во время перетаскивания. */
  const previewLayout = useMemo<Layout>(() => {
    if (!drag || cellW === 0) return layout;
    const cellsX = Math.round(drag.dx / cellW);
    const cellsY = Math.round(drag.dy / cellH);
    if (drag.kind === 'move') {
      return moveItem(drag.startLayout, drag.id, drag.origin.x + cellsX, drag.origin.y + cellsY, cols);
    }
    return resizeItem(drag.startLayout, drag.id, drag.origin.w + cellsX, drag.origin.h + cellsY, cols);
  }, [drag, layout, cellW, cellH, cols]);

  const commit = useCallback(() => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!d) return;
    onLayoutChange(previewLayout);
  }, [onLayoutChange, previewLayout]);

  // Глобальные обработчики: указатель может уйти за пределы контейнера.
  useEffect(() => {
    if (!drag) return undefined;
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      const next = { ...d, dx: e.clientX - d.startClientX, dy: e.clientY - d.startClientY };
      dragRef.current = next;
      setDrag(next);
    };
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      commit();
    };
    const onCancel = () => {
      dragRef.current = null;
      setDrag(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [drag, commit]);

  const startDrag = useCallback(
    (kind: DragState['kind'], id: string, e: ReactPointerEvent<HTMLElement>) => {
      if (!editable || e.button !== 0) return;
      const origin = layout.find((i) => i.id === id);
      if (!origin) return;
      e.preventDefault();
      e.stopPropagation();
      const state: DragState = {
        kind,
        id,
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startLayout: layout,
        origin,
        dx: 0,
        dy: 0,
      };
      dragRef.current = state;
      setDrag(state);
    },
    [editable, layout],
  );

  const onHandleKeyDown = useCallback(
    (id: string, e: KeyboardEvent<HTMLElement>) => {
      if (!editable) return;
      const item = layout.find((i) => i.id === id);
      if (!item) return;
      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const d = delta[e.key];
      if (!d) return;
      e.preventDefault();
      const next = e.shiftKey
        ? resizeItem(layout, id, item.w + d[0], item.h + d[1], cols)
        : moveItem(layout, id, item.x + d[0], item.y + d[1], cols);
      onLayoutChange(next);
    },
    [editable, layout, cols, onLayoutChange],
  );

  const rows = Math.max(layoutHeight(previewLayout), 1) + (drag ? 1 : 0);
  const containerHeight = rows * rowHeight + (rows - 1) * gap;

  const draggedPreview = drag ? previewLayout.find((i) => i.id === drag.id) : undefined;

  return (
    <div
      ref={containerRef}
      className={['grid-layout', drag && 'grid-layout_dragging', className].filter(Boolean).join(' ')}
      style={{ height: containerHeight }}
    >
      <span id={HINT_ID} hidden>
        Стрелки — переместить виджет, Shift + стрелки — изменить размер.
      </span>

      {drag && draggedPreview && (
        <div className="grid-layout__placeholder" style={toPx(draggedPreview)} aria-hidden="true" />
      )}

      {width > 0 &&
        previewLayout.map((item) => {
          const isDragging = drag?.id === item.id;
          let px = toPx(item);
          if (isDragging && drag) {
            const originPx = toPx(clampItem(drag.origin, cols));
            px =
              drag.kind === 'move'
                ? { ...originPx, left: originPx.left + drag.dx, top: originPx.top + drag.dy }
                : {
                    ...originPx,
                    width: Math.max(colWidth, originPx.width + drag.dx),
                    height: Math.max(rowHeight, originPx.height + drag.dy),
                  };
          }
          const dragHandleProps: DragHandleProps = {
            onPointerDown: (e) => startDrag('move', item.id, e),
            onKeyDown: (e) => onHandleKeyDown(item.id, e),
            'aria-label': 'Переместить виджет',
            'aria-describedby': HINT_ID,
            tabIndex: 0,
            className: 'grid-layout__handle',
          };
          return (
            <div
              key={item.id}
              className={[
                'grid-layout__item',
                isDragging && 'grid-layout__item_dragging',
                isDragging && drag?.kind === 'resize' && 'grid-layout__item_resizing',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                transform: `translate(${px.left}px, ${px.top}px)`,
                width: px.width,
                height: px.height,
              }}
              data-grid-id={item.id}
            >
              {renderItem({ item, dragHandleProps, isDragging, editable })}
              {editable && (
                <div
                  className="grid-layout__resize"
                  role="presentation"
                  title="Изменить размер"
                  onPointerDown={(e) => startDrag('resize', item.id, e)}
                />
              )}
            </div>
          );
        })}
    </div>
  );
}
