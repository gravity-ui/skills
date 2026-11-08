import React from 'react';

import { type Layout, type LayoutItem, bottom, moveItem, resizeItem } from './layout';
import { useElementSize } from '../useElementSize';
import './grid.css';

export interface ItemControls {
  /** Spread on the area that starts a pointer drag (e.g. the widget header). */
  dragAreaProps: React.HTMLAttributes<HTMLElement>;
  /** Spread on a focusable handle (mark it `data-grid-handle`): arrows move, Shift+arrows resize. */
  handleProps: React.HTMLAttributes<HTMLElement>;
  /** Whether items can currently be rearranged (false in the narrow one-column mode). */
  editable: boolean;
  /** The item is being dragged or resized right now. */
  active: boolean;
}

interface Props {
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
  renderItem: (item: LayoutItem, controls: ItemControls) => React.ReactNode;
  getItemLabel: (id: string) => string;
  cols?: number;
  rowHeight?: number;
  gap?: number;
  /** Below this container width the grid collapses into one read-only column. */
  stackBelow?: number;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Interaction {
  kind: 'move' | 'resize';
  id: string;
  pointerId: number;
  startLayout: Layout;
  startClient: { x: number; y: number };
  startScrollY: number;
  startRect: Rect;
  lastClient: { x: number; y: number };
}

/** Distance from the viewport edge (px) at which dragging starts auto-scrolling. */
const SCROLL_EDGE = 48;
const SCROLL_SPEED = 12;

export function GridLayout({
  layout,
  onLayoutChange,
  renderItem,
  getItemLabel,
  cols = 12,
  rowHeight = 56,
  gap = 12,
  stackBelow = 720,
}: Props) {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const width = size.width;
  const stacked = width > 0 && width < stackBelow;
  const colWidth = Math.max(0, (width - gap * (cols - 1)) / cols);

  const [preview, setPreview] = React.useState<Layout | null>(null);
  const [ghost, setGhost] = React.useState<{ id: string; rect: Rect; kind: Interaction['kind'] } | null>(null);
  const [announcement, setAnnouncement] = React.useState('');
  const interaction = React.useRef<Interaction | null>(null);
  const previewRef = React.useRef<Layout | null>(null);
  const scrollFrame = React.useRef<number | null>(null);

  const showPreview = (next: Layout | null) => {
    previewRef.current = next;
    setPreview(next);
  };

  const toRect = React.useCallback(
    (it: Pick<LayoutItem, 'x' | 'y' | 'w' | 'h'>): Rect => ({
      left: it.x * (colWidth + gap),
      top: it.y * (rowHeight + gap),
      width: it.w * colWidth + (it.w - 1) * gap,
      height: it.h * rowHeight + (it.h - 1) * gap,
    }),
    [colWidth, gap, rowHeight],
  );

  const announce = React.useCallback(
    (it: LayoutItem) =>
      setAnnouncement(
        `${getItemLabel(it.i)}: колонка ${it.x + 1}, строка ${it.y + 1}, ширина ${it.w}, высота ${it.h}`,
      ),
    [getItemLabel],
  );

  // ---- pointer interaction -------------------------------------------------

  const update = React.useCallback(() => {
    const act = interaction.current;
    if (!act) return;
    const dx = act.lastClient.x - act.startClient.x;
    const dy = act.lastClient.y - act.startClient.y + (window.scrollY - act.startScrollY);
    const stepX = colWidth + gap;
    const stepY = rowHeight + gap;
    const item = act.startLayout.find((it) => it.i === act.id)!;

    if (act.kind === 'move') {
      const rect = {
        ...act.startRect,
        left: Math.max(0, Math.min(width - act.startRect.width, act.startRect.left + dx)),
        top: Math.max(0, act.startRect.top + dy),
      };
      setGhost({ id: act.id, rect, kind: 'move' });
      showPreview(moveItem(act.startLayout, act.id, Math.round(rect.left / stepX), Math.round(rect.top / stepY), cols));
    } else {
      const minW = item.minW ?? 1;
      const minH = item.minH ?? 1;
      const rect = {
        ...act.startRect,
        width: Math.max(minW * colWidth + (minW - 1) * gap, Math.min(width - act.startRect.left, act.startRect.width + dx)),
        height: Math.max(minH * rowHeight + (minH - 1) * gap, act.startRect.height + dy),
      };
      setGhost({ id: act.id, rect, kind: 'resize' });
      showPreview(
        resizeItem(
          act.startLayout,
          act.id,
          Math.round((rect.width + gap) / stepX),
          Math.round((rect.height + gap) / stepY),
          cols,
        ),
      );
    }
  }, [colWidth, cols, gap, rowHeight, width]);

  const stopAutoScroll = () => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = null;
  };

  const autoScroll = React.useCallback(() => {
    const act = interaction.current;
    if (!act) return stopAutoScroll();
    const y = act.lastClient.y;
    const speed = y > window.innerHeight - SCROLL_EDGE ? SCROLL_SPEED : y < SCROLL_EDGE ? -SCROLL_SPEED : 0;
    if (speed !== 0) {
      const before = window.scrollY;
      window.scrollBy(0, speed);
      if (window.scrollY !== before) update();
    }
    scrollFrame.current = requestAnimationFrame(autoScroll);
  }, [update]);

  const finish = React.useCallback(
    (commit: boolean) => {
      const act = interaction.current;
      const result = previewRef.current;
      interaction.current = null;
      stopAutoScroll();
      document.body.classList.remove('grid-dragging', 'grid-resizing');
      setGhost(null);
      showPreview(null);
      if (commit && act && result) {
        onLayoutChange(result);
        const it = result.find((l) => l.i === act.id);
        if (it) announce(it);
      }
    },
    [announce, onLayoutChange],
  );

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const act = interaction.current;
      if (!act || e.pointerId !== act.pointerId) return;
      act.lastClient = { x: e.clientX, y: e.clientY };
      update();
    };
    const onUp = (e: PointerEvent) => {
      if (interaction.current?.pointerId === e.pointerId) finish(e.type === 'pointerup');
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && interaction.current) finish(false);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [finish, update]);

  React.useEffect(() => stopAutoScroll, []);

  const begin = (kind: Interaction['kind'], item: LayoutItem) => (e: React.PointerEvent<HTMLElement>) => {
    if (stacked || e.button !== 0 || interaction.current) return;
    // Buttons inside the header (remove, table view…) keep working as buttons.
    if (kind === 'move' && (e.target as HTMLElement).closest('button:not([data-grid-handle]), a, input, select')) return;
    e.preventDefault();
    interaction.current = {
      kind,
      id: item.i,
      pointerId: e.pointerId,
      startLayout: layout,
      startClient: { x: e.clientX, y: e.clientY },
      startScrollY: window.scrollY,
      startRect: toRect(item),
      lastClient: { x: e.clientX, y: e.clientY },
    };
    document.body.classList.add(kind === 'move' ? 'grid-dragging' : 'grid-resizing');
    showPreview(layout);
    setGhost({ id: item.i, rect: toRect(item), kind });
    scrollFrame.current = requestAnimationFrame(autoScroll);
  };

  // ---- keyboard interaction --------------------------------------------------

  const onHandleKeyDown = (item: LayoutItem) => (e: React.KeyboardEvent<HTMLElement>) => {
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const d = delta[e.key];
    if (stacked || !d) return;
    e.preventDefault();
    let next: Layout;
    if (e.shiftKey) {
      next = resizeItem(layout, item.i, item.w + d[0], item.h + d[1], cols);
    } else if (d[1] > 0) {
      // Gravity snaps a one-row nudge back, so step further until the item really moves down.
      next = layout;
      for (let y = item.y + 1; y <= bottom(layout); y++) {
        const candidate = moveItem(layout, item.i, item.x, y, cols);
        if (candidate.find((it) => it.i === item.i)!.y > item.y) {
          next = candidate;
          break;
        }
      }
    } else {
      next = moveItem(layout, item.i, item.x + d[0], item.y + d[1], cols);
    }
    if (next !== layout) onLayoutChange(next);
    const moved = next.find((it) => it.i === item.i);
    if (moved) announce(moved);
  };

  // ---- render ------------------------------------------------------------------

  if (stacked) {
    const ordered = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    return (
      <div ref={containerRef} className="grid-layout grid-layout_stacked" style={{ gap }}>
        {ordered.map((it) => (
          <div key={it.i} className="grid-item" style={{ height: it.h * rowHeight + (it.h - 1) * gap }}>
            {renderItem(it, { dragAreaProps: {}, handleProps: {}, editable: false, active: false })}
          </div>
        ))}
      </div>
    );
  }

  const shown = preview ?? layout;
  const extraRows = ghost ? Math.ceil(ghost.rect.height / (rowHeight + gap)) : 0;
  const height = Math.max(0, (bottom(shown) + extraRows) * (rowHeight + gap) - gap);
  const placeholder = ghost && shown.find((it) => it.i === ghost.id);

  return (
    <div ref={containerRef} className="grid-layout" style={{ height }}>
      {width > 0 && placeholder && <div className="grid-placeholder" style={rectStyle(toRect(placeholder))} aria-hidden />}
      {width > 0 &&
        // Stable DOM order: items are positioned by transform and never re-mounted while moving.
        layout.map((base) => {
          const it = shown.find((s) => s.i === base.i) ?? base;
          const isActive = ghost?.id === it.i;
          const rect = isActive && ghost ? ghost.rect : toRect(it);
          return (
            <div
              key={it.i}
              className={`grid-item${isActive && ghost ? ` grid-item_active grid-item_${ghost.kind}` : ''}`}
              style={rectStyle(rect)}
            >
              {renderItem(it, {
                editable: true,
                active: isActive,
                dragAreaProps: { onPointerDown: begin('move', it) },
                handleProps: {
                  onKeyDown: onHandleKeyDown(it),
                  'aria-roledescription': 'перетаскиваемый виджет',
                  'aria-keyshortcuts': 'ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight',
                } as React.HTMLAttributes<HTMLElement>,
              })}
              <div
                className="grid-resize-handle"
                onPointerDown={begin('resize', it)}
                title="Потяните, чтобы изменить размер"
                aria-hidden
              />
            </div>
          );
        })}
      <div className="grid-sr-only" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}

function rectStyle(r: Rect): React.CSSProperties {
  return { transform: `translate(${r.left}px, ${r.top}px)`, width: r.width, height: r.height };
}
