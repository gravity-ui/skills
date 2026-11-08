import * as React from 'react';
import {useEffect, useRef, useState} from 'react';

import {bottom, moveItem, resizeItem} from './layout';
import type {Layout, LayoutItem} from './types';

export interface DragHandleProps {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  style: React.CSSProperties;
}

export interface GridItemApi {
  item: LayoutItem;
  editable: boolean;
  /** The item is being dragged or resized right now. */
  isActive: boolean;
  dragHandleProps: DragHandleProps;
}

export interface GridLayoutProps {
  layout: Layout;
  cols: number;
  rowHeight: number;
  gap: number;
  /** Measured container width in px. */
  width: number;
  editable: boolean;
  onLayoutChange: (layout: Layout) => void;
  renderItem: (api: GridItemApi) => React.ReactNode;
  /** Accessible name of an item, e.g. the widget title. */
  getItemLabel: (item: LayoutItem) => string;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Interaction {
  kind: 'drag' | 'resize';
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  originBox: Box;
  /** Live pixel box of the active item (follows the pointer). */
  box: Box;
  /** Layout at the start of the interaction; every move is computed from it, so there is no drift. */
  base: Layout;
  /** Working layout shown while interacting. */
  layout: Layout;
}

const KEY_DELTAS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

function boxStyle(box: Box): React.CSSProperties {
  return {
    transform: `translate3d(${Math.round(box.left)}px, ${Math.round(box.top)}px, 0)`,
    width: Math.max(0, Math.round(box.width)),
    height: Math.max(0, Math.round(box.height)),
  };
}

/**
 * Absolute-positioned grid with pointer drag (via a handle), corner resize and keyboard editing.
 * Layout math lives in `layout.ts`; this component only translates pointer pixels into cells.
 */
export function GridLayout({
  layout,
  cols,
  rowHeight,
  gap,
  width,
  editable,
  onLayoutChange,
  renderItem,
  getItemLabel,
}: GridLayoutProps) {
  const colWidth = cols > 0 ? Math.max(0, (width - gap * (cols - 1)) / cols) : 0;
  const unitX = colWidth + gap;
  const unitY = rowHeight + gap;

  const toBox = (item: LayoutItem): Box => ({
    left: item.x * unitX,
    top: item.y * unitY,
    width: item.w * colWidth + (item.w - 1) * gap,
    height: item.h * rowHeight + (item.h - 1) * gap,
  });

  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const latest = useRef({cols, unitX, unitY, colWidth, rowHeight, gap, onLayoutChange});
  latest.current = {cols, unitX, unitY, colWidth, rowHeight, gap, onLayoutChange};

  const update = (next: Interaction | null) => {
    interactionRef.current = next;
    setInteraction(next);
  };

  const begin = (kind: Interaction['kind'], id: string, event: React.PointerEvent<HTMLElement>) => {
    if (!editable || event.button !== 0 || interactionRef.current) return;
    const item = layout.find((l) => l.i === id);
    if (!item) return;
    event.preventDefault();
    event.stopPropagation();
    const box = toBox(item);
    update({
      kind,
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originBox: box,
      box,
      base: layout,
      layout,
    });
  };

  const active = interaction !== null;
  useEffect(() => {
    if (!active) return undefined;

    const onMove = (event: PointerEvent) => {
      const cur = interactionRef.current;
      if (!cur || event.pointerId !== cur.pointerId) return;
      const u = latest.current;
      const dx = event.clientX - cur.startX;
      const dy = event.clientY - cur.startY;
      if (cur.kind === 'drag') {
        const box = {...cur.originBox, left: cur.originBox.left + dx, top: cur.originBox.top + dy};
        const x = Math.round(box.left / u.unitX);
        const y = Math.round(box.top / u.unitY);
        update({...cur, box, layout: moveItem(cur.base, cur.id, x, y, u.cols)});
      } else {
        const box = {
          ...cur.originBox,
          width: Math.max(u.colWidth, cur.originBox.width + dx),
          height: Math.max(u.rowHeight, cur.originBox.height + dy),
        };
        const w = Math.round((box.width + u.gap) / u.unitX);
        const h = Math.round((box.height + u.gap) / u.unitY);
        update({...cur, box, layout: resizeItem(cur.base, cur.id, w, h, u.cols)});
      }
    };

    const finish = (commit: boolean) => {
      const cur = interactionRef.current;
      if (!cur) return;
      update(null);
      if (commit && cur.layout !== cur.base) latest.current.onLayoutChange(cur.layout);
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId === interactionRef.current?.pointerId) finish(true);
    };
    const onCancel = (event: PointerEvent) => {
      if (event.pointerId === interactionRef.current?.pointerId) finish(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey);
    };
  }, [active]);

  const onItemKeyDown = (item: LayoutItem) => (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!editable || event.target !== event.currentTarget) return;
    const delta = KEY_DELTAS[event.key];
    if (!delta) return;
    event.preventDefault();
    const [dx, dy] = delta;
    const next = event.shiftKey
      ? resizeItem(layout, item.i, item.w + dx, item.h + dy, cols)
      : moveItem(layout, item.i, item.x + dx, item.y + dy, cols);
    if (next !== layout) onLayoutChange(next);
  };

  const working = interaction?.layout ?? layout;
  const height = Math.max(bottom(working) * unitY - gap, rowHeight);
  const activeItem = interaction ? working.find((l) => l.i === interaction.id) : undefined;

  return (
    <div className={`grid${editable ? ' grid_editable' : ''}`} style={{height}}>
      {interaction && activeItem ? <div className="grid__placeholder" style={boxStyle(toBox(activeItem))} /> : null}
      {working.map((item) => {
        const isActive = interaction?.id === item.i;
        const box = isActive && interaction ? interaction.box : toBox(item);
        const label = `${getItemLabel(item)}. Колонка ${item.x + 1}, строка ${item.y + 1}, ширина ${item.w}, высота ${item.h}.${
          editable ? ' Стрелки — переместить, Shift и стрелки — изменить размер.' : ''
        }`;
        return (
          <div
            key={item.i}
            className={`grid__item${isActive ? ' grid__item_active' : ''}`}
            style={boxStyle(box)}
            role="group"
            aria-label={label}
            tabIndex={editable ? 0 : undefined}
            onKeyDown={onItemKeyDown(item)}
          >
            {renderItem({
              item,
              editable,
              isActive,
              dragHandleProps: {
                onPointerDown: (event) => begin('drag', item.i, event),
                style: {cursor: editable ? (isActive ? 'grabbing' : 'grab') : undefined, touchAction: 'none'},
              },
            })}
            {editable ? (
              <div
                className="grid__resize"
                aria-hidden="true"
                title="Изменить размер"
                onPointerDown={(event) => begin('resize', item.i, event)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
