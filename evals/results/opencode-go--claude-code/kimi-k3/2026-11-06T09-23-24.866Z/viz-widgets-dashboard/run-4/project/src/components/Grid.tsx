import type {KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode} from 'react';
import {useCallback, useRef, useState} from 'react';
import {
  applyRects,
  clampRect,
  compactLayout,
  layoutHeight,
  minSizeOf,
  resolveLayout,
} from '../dashboard/grid';
import type {Rect, WidgetInstance} from '../dashboard/types';
import {GRID_COLS, GRID_GAP, GRID_ROW_H} from '../dashboard/types';
import {useMeasure} from '../dashboard/useMeasure';
import {WidgetFrame} from './WidgetFrame';

interface DragState {
  id: string;
  kind: 'move' | 'resize';
  startX: number;
  startY: number;
  orig: Rect;
  rect: Rect;
  dxPx: number;
  dyPx: number;
}

interface GridProps {
  widgets: WidgetInstance[];
  locked: boolean;
  onChange: (widgets: WidgetInstance[]) => void;
  onRemove: (id: string) => void;
  titleOf: (w: WidgetInstance) => string;
  renderBody: (w: WidgetInstance) => ReactNode;
  renderActions?: (w: WidgetInstance) => ReactNode;
}

const clampNum = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function Grid({
  widgets,
  locked,
  onChange,
  onRemove,
  titleOf,
  renderBody,
  renderActions,
}: GridProps) {
  const [wrapRef, size] = useMeasure<HTMLDivElement>();
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const width = Math.floor(size.width);
  const ready = width > 0;
  const colW = ready ? (width - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS : 0;

  const pxOf = useCallback(
    (r: Rect) => ({
      left: r.x * (colW + GRID_GAP),
      top: r.y * (GRID_ROW_H + GRID_GAP),
      width: r.w * colW + (r.w - 1) * GRID_GAP,
      height: r.h * GRID_ROW_H + (r.h - 1) * GRID_GAP,
    }),
    [colW],
  );

  const commit = useCallback(
    (id: string, rect: Rect) => {
      const resolved = resolveLayout(widgets, id, rect);
      const compacted = compactLayout(widgets, resolved);
      onChange(applyRects(widgets, compacted));
    },
    [widgets, onChange],
  );

  const startDrag = (e: ReactPointerEvent<HTMLElement>, w: WidgetInstance, kind: 'move' | 'resize') => {
    if (locked || !ready) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();

    const ds: DragState = {
      id: w.id,
      kind,
      startX: e.clientX,
      startY: e.clientY,
      orig: {...w.rect},
      rect: {...w.rect},
      dxPx: 0,
      dyPx: 0,
    };
    dragRef.current = ds;
    setDrag(ds);

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dxPx = ev.clientX - d.startX;
      const dyPx = ev.clientY - d.startY;
      const min = minSizeOf(w);
      let next: DragState;
      if (d.kind === 'move') {
        const nx = clampNum(
          Math.round((d.orig.x * (colW + GRID_GAP) + dxPx) / (colW + GRID_GAP)),
          0,
          GRID_COLS - d.orig.w,
        );
        const ny = Math.max(
          0,
          Math.round((d.orig.y * (GRID_ROW_H + GRID_GAP) + dyPx) / (GRID_ROW_H + GRID_GAP)),
        );
        next = {...d, rect: {x: nx, y: ny, w: d.orig.w, h: d.orig.h}, dxPx, dyPx};
      } else {
        const pxW = d.orig.w * colW + (d.orig.w - 1) * GRID_GAP + dxPx;
        const pxH = d.orig.h * GRID_ROW_H + (d.orig.h - 1) * GRID_GAP + dyPx;
        const nw = clampNum(
          Math.round((pxW + GRID_GAP) / (colW + GRID_GAP)),
          min.w,
          GRID_COLS - d.orig.x,
        );
        const nh = Math.max(
          min.h,
          Math.round((pxH + GRID_GAP) / (GRID_ROW_H + GRID_GAP)),
        );
        next = {...d, rect: {x: d.orig.x, y: d.orig.y, w: nw, h: nh}, dxPx, dyPx};
      }
      dragRef.current = next;
      setDrag(next);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      const d = dragRef.current;
      if (d) commit(d.id, d.rect);
      dragRef.current = null;
      setDrag(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const onHeaderKeyDown = (e: KeyboardEvent<HTMLElement>, w: WidgetInstance) => {
    if (locked) return;
    const dirs: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const dir = dirs[e.key];
    if (!dir) return;
    e.preventDefault();
    const min = minSizeOf(w);
    const r = {...w.rect};
    if (e.shiftKey) {
      r.w = clampNum(r.w + dir[0], min.w, GRID_COLS - r.x);
      r.h = Math.max(min.h, r.h + dir[1]);
    } else {
      r.x += dir[0];
      r.y += dir[1];
    }
    commit(w.id, clampRect(r, min));
  };

  const preview = drag ? resolveLayout(widgets, drag.id, drag.rect) : null;
  const gridRows = layoutHeight(widgets, preview ?? undefined);
  const gridHeight = ready ? gridRows * (GRID_ROW_H + GRID_GAP) - GRID_GAP : 0;

  const ghostRect = drag?.kind === 'move' && preview ? preview.get(drag.id) : null;

  return (
    <div
      ref={wrapRef}
      className={`grid${drag ? ' grid-dragging' : ''}${locked ? ' grid-locked' : ''}`}
      style={{
        height: gridHeight || undefined,
        backgroundSize: ready ? `${colW + GRID_GAP}px ${GRID_ROW_H + GRID_GAP}px` : undefined,
      }}
    >
      {ready &&
        widgets.map((w) => {
          const r = preview?.get(w.id) ?? w.rect;
          const isDragged = drag?.id === w.id;
          let box;
          if (isDragged && drag.kind === 'move') {
            // free pixel-follow from the original cell; ghost marks the snap target
            const o = pxOf(drag.orig);
            box = {left: o.left + drag.dxPx, top: o.top + drag.dyPx, width: o.width, height: o.height};
          } else {
            box = pxOf(isDragged ? drag.rect : r);
          }
          return (
            <div
              key={w.id}
              className={`grid-cell${isDragged ? ' grid-cell-active' : ''}`}
              style={{
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                zIndex: isDragged ? 5 : 1,
              }}
            >
              <WidgetFrame
                title={titleOf(w)}
                locked={locked}
                actions={renderActions?.(w)}
                onRemove={() => onRemove(w.id)}
                onHeaderKeyDown={(e) => onHeaderKeyDown(e, w)}
                dragHandleProps={{
                  onPointerDown: (e) => startDrag(e, w, 'move'),
                }}
                resizeHandleProps={{
                  onPointerDown: (e) => {
                    e.stopPropagation();
                    startDrag(e, w, 'resize');
                  },
                }}
              >
                {renderBody(w)}
              </WidgetFrame>
            </div>
          );
        })}
      {ready && ghostRect && (
        <div className="grid-ghost" style={pxOf(ghostRect)} aria-hidden />
      )}
    </div>
  );
}
