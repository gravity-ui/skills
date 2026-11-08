import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useSize } from './charts';
import {
  type Direction,
  type Layout,
  type LayoutItem,
  growItem,
  layoutRows,
  moveItem,
  nudgeItem,
  resizeItem,
  sortLayout,
} from './layout';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface GridItemApi {
  /** Spread on the element that starts a drag (the widget header). */
  dragHandleProps: { onPointerDown: (e: React.PointerEvent<HTMLElement>) => void };
  /** Spread on the focusable grip button: arrows move, Shift+arrows resize. */
  gripProps: { onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void; 'data-grip': string };
  active: boolean;
}

interface Props {
  layout: Layout;
  cols: number;
  rowHeight: number;
  gap: number;
  editable: boolean;
  onLayoutChange: (layout: Layout) => void;
  onAnnounce: (message: string) => void;
  getLabel: (id: string) => string;
  renderItem: (id: string, api: GridItemApi) => React.ReactNode;
}

interface Interaction {
  kind: 'move' | 'resize';
  id: string;
  pointerId: number;
  startX: number; // page coordinates, so scrolling while dragging is accounted for
  startY: number;
  clientX: number;
  clientY: number;
  origin: Layout;
  rect: Rect;
  started: boolean;
  raf: number;
  preview: Preview | null;
  cleanup: () => void;
}

interface Preview {
  kind: 'move' | 'resize';
  id: string;
  layout: Layout;
  rect: Rect;
}

const DRAG_THRESHOLD = 4;
const EDGE = 56;

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

export function DashboardGrid({
  layout,
  cols,
  rowHeight,
  gap,
  editable,
  onLayoutChange,
  onAnnounce,
  getLabel,
  renderItem,
}: Props) {
  const [containerRef, { width }] = useSize<HTMLDivElement>();
  const [preview, setPreview] = useState<Preview | null>(null);
  const interaction = useRef<Interaction | null>(null);
  const pendingFocus = useRef<string | null>(null);

  const colWidth = Math.max(0, (width - gap * (cols - 1)) / cols);
  const toRect = (item: LayoutItem): Rect => ({
    left: item.x * (colWidth + gap),
    top: item.y * (rowHeight + gap),
    width: item.w * colWidth + (item.w - 1) * gap,
    height: item.h * rowHeight + (item.h - 1) * gap,
  });

  // Latest values for the window-level listeners.
  const latest = useRef({ colWidth, width, cols, rowHeight, gap, layout, onLayoutChange, onAnnounce, getLabel });
  latest.current = { colWidth, width, cols, rowHeight, gap, layout, onLayoutChange, onAnnounce, getLabel };

  const describe = (item: LayoutItem | undefined) =>
    item
      ? `«${latest.current.getLabel(item.id)}»: колонка ${item.x + 1}, строка ${item.y + 1}, размер ${item.w} × ${item.h}`
      : '';

  const update = () => {
    const it = interaction.current;
    if (!it) return;
    const { colWidth: cw, width: total, cols: c, rowHeight: rh, gap: g } = latest.current;
    const dx = it.clientX + window.scrollX - it.startX;
    const dy = it.clientY + window.scrollY - it.startY;
    if (!it.started) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      it.started = true;
      document.body.classList.add(it.kind === 'move' ? 'dash-dragging' : 'dash-resizing');
    }
    const item = it.origin.find((i) => i.id === it.id)!;
    let rect: Rect;
    let next: Layout;
    if (it.kind === 'move') {
      rect = {
        ...it.rect,
        left: Math.max(0, Math.min(total - it.rect.width, it.rect.left + dx)),
        top: Math.max(0, it.rect.top + dy),
      };
      next = moveItem(it.origin, it.id, Math.round(rect.left / (cw + g)), Math.round(rect.top / (rh + g)), c);
    } else {
      const minW = (item.minW ?? 1) * cw + ((item.minW ?? 1) - 1) * g;
      const minH = (item.minH ?? 1) * rh + ((item.minH ?? 1) - 1) * g;
      rect = {
        ...it.rect,
        width: Math.max(minW, Math.min(total - it.rect.left, it.rect.width + dx)),
        height: Math.max(minH, it.rect.height + dy),
      };
      next = resizeItem(
        it.origin,
        it.id,
        Math.round((rect.width + g) / (cw + g)),
        Math.round((rect.height + g) / (rh + g)),
        c,
      );
    }
    it.preview = { kind: it.kind, id: it.id, layout: next, rect };
    setPreview(it.preview);
  };

  const finish = (commit: boolean) => {
    const it = interaction.current;
    if (!it) return;
    it.cleanup();
    interaction.current = null;
    const result = it.preview;
    setPreview(null);
    if (!it.started) return;
    if (commit && result) {
      latest.current.onLayoutChange(result.layout);
      latest.current.onAnnounce(describe(result.layout.find((i) => i.id === it.id)));
    } else {
      latest.current.onAnnounce(`Перемещение «${latest.current.getLabel(it.id)}» отменено`);
    }
  };

  const begin = (kind: Interaction['kind'], id: string, e: React.PointerEvent<HTMLElement>) => {
    if (!editable || e.button !== 0 || interaction.current) return;
    const item = layout.find((i) => i.id === id);
    if (!item) return;

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== it.pointerId) return;
      it.clientX = ev.clientX;
      it.clientY = ev.clientY;
      update();
    };
    const onUp = (ev: PointerEvent) => ev.pointerId === it.pointerId && finish(true);
    const onCancel = (ev: PointerEvent) => ev.pointerId === it.pointerId && finish(false);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        finish(false);
      }
    };
    // Auto-scroll when the pointer approaches the top/bottom of the viewport.
    const tick = () => {
      if (it.started) {
        const y = it.clientY;
        const speed = y < EDGE ? -(EDGE - y) / 3 : y > window.innerHeight - EDGE ? (y - window.innerHeight + EDGE) / 3 : 0;
        if (speed) {
          window.scrollBy(0, speed);
          update();
        }
      }
      it.raf = requestAnimationFrame(tick);
    };

    const it: Interaction = {
      kind,
      id,
      pointerId: e.pointerId,
      startX: e.clientX + window.scrollX,
      startY: e.clientY + window.scrollY,
      clientX: e.clientX,
      clientY: e.clientY,
      origin: layout,
      rect: toRect(item),
      started: false,
      raf: requestAnimationFrame(tick),
      preview: null,
      cleanup: () => {
        cancelAnimationFrame(it.raf);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        window.removeEventListener('keydown', onKey, true);
        document.body.classList.remove('dash-dragging', 'dash-resizing');
      },
    };
    interaction.current = it;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey, true);
  };

  useEffect(() => () => interaction.current?.cleanup(), []);

  // Leaving edit mode mid-drag cancels the drag.
  useEffect(() => {
    if (!editable) finish(false);
  }, [editable]);

  // Keyboard moves re-order the DOM (it follows reading order), which drops
  // focus; put it back on the grip that was being used.
  useLayoutEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    containerRef.current?.querySelector<HTMLElement>(`[data-grip="${CSS.escape(id)}"]`)?.focus();
  }, [layout]);

  const onGripKey = (id: string) => (e: React.KeyboardEvent<HTMLElement>) => {
    const dir = KEY_DIRECTIONS[e.key];
    if (!editable || !dir) return;
    e.preventDefault();
    const next = e.shiftKey
      ? growItem(layout, id, dir === 'right' ? 1 : dir === 'left' ? -1 : 0, dir === 'down' ? 1 : dir === 'up' ? -1 : 0, cols)
      : nudgeItem(layout, id, dir, cols);
    const before = layout.find((i) => i.id === id);
    const after = next.find((i) => i.id === id);
    if (next === layout || JSON.stringify(before) === JSON.stringify(after)) {
      onAnnounce(`«${getLabel(id)}»: дальше двигать некуда`);
      return;
    }
    pendingFocus.current = id;
    onLayoutChange(next);
    onAnnounce(describe(after));
  };

  const shown = preview?.layout ?? layout;
  const activeRect = preview?.rect;
  const rows = layoutRows(shown);
  const bottom = Math.max(
    rows * (rowHeight + gap) - gap,
    activeRect ? activeRect.top + activeRect.height : 0,
  );
  const height = Math.max(0, bottom) + (preview ? 2 * (rowHeight + gap) : 0);

  return (
    <div
      ref={containerRef}
      className={`grid${editable ? ' grid_editable' : ''}${preview ? ' grid_interacting' : ''}`}
      style={{ height }}
    >
      {preview && width > 0 && (
        <div
          className="grid__guides"
          aria-hidden
          style={{
            backgroundImage: `linear-gradient(to right, var(--dash-guide) 0 ${colWidth}px, transparent ${colWidth}px)`,
            backgroundSize: `${colWidth + gap}px 100%`,
          }}
        />
      )}
      {preview && width > 0 && (
        <div className="grid__placeholder" aria-hidden style={rectStyle(toRect(shown.find((i) => i.id === preview.id)!))} />
      )}
      {width > 0 &&
        sortLayout(layout).map(({ id }) => {
          const item = shown.find((i) => i.id === id)!;
          const active = preview?.id === id;
          const rect = active ? preview.rect : toRect(item);
          return (
            <div
              key={id}
              className={`grid__item${active ? ' grid__item_active' : ''}`}
              style={rectStyle(rect)}
              data-id={id}
            >
              {renderItem(id, {
                dragHandleProps: {
                  onPointerDown: (e) => {
                    if (!e.currentTarget.contains(e.target as Node)) return; // portal (menus)
                    if ((e.target as Element).closest('[data-nodrag]')) return;
                    begin('move', id, e);
                  },
                },
                gripProps: { onKeyDown: onGripKey(id), 'data-grip': id },
                active,
              })}
              {editable && (
                <div
                  className="grid__resize"
                  aria-hidden
                  title="Потяните, чтобы изменить размер"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    begin('resize', id, e);
                  }}
                />
              )}
            </div>
          );
        })}
    </div>
  );
}

const rectStyle = (r: Rect): React.CSSProperties => ({
  transform: `translate(${r.left}px, ${r.top}px)`,
  width: r.width,
  height: r.height,
});
