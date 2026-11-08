import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useElementSize } from '../useElementSize';
import {
  type Layout,
  type LayoutItem,
  bottom,
  moveItem,
  nudgeItem,
  resizeItem,
  sameLayout,
} from './layout';

import './grid.css';

export interface DragHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  'aria-describedby': string;
}

export interface GridItemContext {
  editable: boolean;
  dragging: boolean;
  /** Навесить на заголовок виджета — за него виджет перетаскивают. */
  dragAreaProps: Pick<DragHandleProps, 'onPointerDown'>;
  /** Навесить на фокусируемую «ручку» — стрелки двигают, Shift+стрелки меняют размер. */
  handleProps: DragHandleProps;
}

interface DashboardGridProps {
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
  renderItem: (id: string, ctx: GridItemContext) => React.ReactNode;
  getLabel: (id: string) => string;
  editable: boolean;
  compact: boolean;
  cols?: number;
  rowHeight?: number;
  gap?: number;
  /** Ширина, ниже которой сетка превращается в одну колонку без редактирования. */
  stackBelow?: number;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Session {
  id: string;
  kind: 'move' | 'resize';
  startLayout: Layout;
  /** Точка захвата относительно левого верхнего угла виджета (move) или стартовая точка указателя (resize). */
  anchorX: number;
  anchorY: number;
  startRect: Rect;
  clientX: number;
  clientY: number;
  targetKey: string;
}

const HINT_ID = 'dashboard-grid-hint';
const EDGE = 56;

export function DashboardGrid({
  layout,
  onLayoutChange,
  renderItem,
  getLabel,
  editable: editableProp,
  compact,
  cols = 12,
  rowHeight = 72,
  gap = 12,
  stackBelow = 720,
}: DashboardGridProps) {
  const [containerRef, { width }] = useElementSize<HTMLDivElement>();
  const stacked = width > 0 && width < stackBelow;
  const editable = editableProp && !stacked;

  const [draft, setDraft] = useState<Layout | null>(null);
  const [activeRect, setActiveRect] = useState<Rect | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const session = useRef<Session | null>(null);
  const draftRef = useRef<Layout | null>(null);
  const scrollRaf = useRef<number>(0);

  const colWidth = (width - gap * (cols - 1)) / cols;
  const stepX = colWidth + gap;
  const stepY = rowHeight + gap;

  const toRect = useCallback(
    (it: LayoutItem): Rect => ({
      left: it.x * stepX,
      top: it.y * stepY,
      width: it.w * colWidth + (it.w - 1) * gap,
      height: it.h * rowHeight + (it.h - 1) * gap,
    }),
    [stepX, stepY, colWidth, gap, rowHeight],
  );

  const opts = { cols, compact };
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const geomRef = useRef({ stepX, stepY, width, gap, colWidth, rowHeight });
  geomRef.current = { stepX, stepY, width, gap, colWidth, rowHeight };

  const describe = useCallback(
    (l: Layout, id: string) => {
      const it = l.find((x) => x.i === id);
      if (!it) return '';
      return `«${getLabel(id)}»: колонка ${it.x + 1}, строка ${it.y + 1}, размер ${it.w}×${it.h}`;
    },
    [getLabel],
  );

  // ——— Перетаскивание и изменение размера мышью/пальцем ———

  const update = useCallback(() => {
    const s = session.current;
    const box = containerRef.current?.getBoundingClientRect();
    if (!s || !box) return;
    const g = geomRef.current;
    const px = s.clientX - box.left;
    const py = s.clientY - box.top;
    const item = s.startLayout.find((it) => it.i === s.id)!;

    let rect: Rect;
    let next: Layout;
    if (s.kind === 'move') {
      const left = Math.min(Math.max(px - s.anchorX, 0), Math.max(0, g.width - s.startRect.width));
      const top = Math.max(py - s.anchorY, 0);
      rect = { ...s.startRect, left, top };
      const gx = Math.round(left / g.stepX);
      const gy = Math.round(top / g.stepY);
      const key = `${gx}:${gy}`;
      if (key === s.targetKey && draftRef.current) {
        setActiveRect(rect);
        return;
      }
      s.targetKey = key;
      next = moveItem(s.startLayout, s.id, gx, gy, optsRef.current);
    } else {
      const minW = (item.minW ?? 1) * g.colWidth + ((item.minW ?? 1) - 1) * g.gap;
      const minH = (item.minH ?? 1) * g.rowHeight + ((item.minH ?? 1) - 1) * g.gap;
      const w = Math.min(Math.max(s.startRect.width + px - s.anchorX, minW), g.width - s.startRect.left);
      const h = Math.max(s.startRect.height + py - s.anchorY, minH);
      rect = { ...s.startRect, width: w, height: h };
      const gw = Math.round((w + g.gap) / g.stepX);
      const gh = Math.round((h + g.gap) / g.stepY);
      const key = `${gw}:${gh}`;
      if (key === s.targetKey && draftRef.current) {
        setActiveRect(rect);
        return;
      }
      s.targetKey = key;
      next = resizeItem(s.startLayout, s.id, gw, gh, optsRef.current);
    }
    draftRef.current = next;
    setDraft(next);
    setActiveRect(rect);
  }, [containerRef]);

  const autoScroll = useCallback(() => {
    const s = session.current;
    if (!s) return;
    let dy = 0;
    if (s.clientY < EDGE) dy = -Math.ceil((EDGE - s.clientY) / 4);
    else if (s.clientY > window.innerHeight - EDGE) dy = Math.ceil((s.clientY - (window.innerHeight - EDGE)) / 4);
    if (dy !== 0) {
      const before = window.scrollY;
      window.scrollBy(0, dy);
      if (window.scrollY !== before) update();
    }
    scrollRaf.current = requestAnimationFrame(autoScroll);
  }, [update]);

  const finish = useCallback(
    (commit: boolean) => {
      const s = session.current;
      if (!s) return;
      session.current = null;
      cancelAnimationFrame(scrollRaf.current);
      document.body.classList.remove('dash-grid-dragging', 'dash-grid-dragging_move');
      const next = draftRef.current;
      draftRef.current = null;
      setDraft(null);
      setActiveRect(null);
      setActiveId(null);
      if (commit && next && !sameLayout(next, s.startLayout)) {
        onLayoutChange(next);
        setAnnouncement(describe(next, s.id));
      } else if (!commit) {
        setAnnouncement('Перемещение отменено');
      }
    },
    [describe, onLayoutChange],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const s = session.current;
      if (!s) return;
      e.preventDefault();
      s.clientX = e.clientX;
      s.clientY = e.clientY;
      update();
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && session.current) {
        e.preventDefault();
        finish(false);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey);
    };
  }, [update, finish]);

  // Выключили редактирование посреди жеста — откатываем.
  useEffect(() => {
    if (!editable && session.current) finish(false);
  }, [editable, finish]);

  useEffect(() => () => cancelAnimationFrame(scrollRaf.current), []);

  const start = (id: string, kind: Session['kind'], e: React.PointerEvent) => {
    if (!editable || e.button !== 0 || session.current) return;
    if (kind === 'move' && (e.target as Element).closest('[data-no-drag]')) return;
    const box = containerRef.current?.getBoundingClientRect();
    const item = layout.find((it) => it.i === id);
    if (!box || !item) return;
    e.preventDefault();
    const rect = toRect(item);
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    session.current = {
      id,
      kind,
      startLayout: layout,
      anchorX: kind === 'move' ? px - rect.left : px,
      anchorY: kind === 'move' ? py - rect.top : py,
      startRect: rect,
      clientX: e.clientX,
      clientY: e.clientY,
      targetKey: '',
    };
    draftRef.current = layout;
    setDraft(layout);
    setActiveRect(rect);
    setActiveId(id);
    document.body.classList.add('dash-grid-dragging');
    if (kind === 'move') document.body.classList.add('dash-grid-dragging_move');
    else document.body.classList.remove('dash-grid-dragging_move');
    scrollRaf.current = requestAnimationFrame(autoScroll);
  };

  // ——— Клавиатура ———

  const onHandleKeyDown = (id: string, e: React.KeyboardEvent) => {
    if (!editable) return;
    const dirs: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const d = dirs[e.key];
    if (!d) return;
    e.preventDefault();
    const item = layout.find((it) => it.i === id);
    if (!item) return;
    const next = e.shiftKey
      ? resizeItem(layout, id, item.w + d[0], item.h + d[1], opts)
      : nudgeItem(layout, id, d[0], d[1], opts);
    if (!sameLayout(next, layout)) {
      onLayoutChange(next);
      setAnnouncement(describe(next, id));
    } else {
      setAnnouncement(`«${getLabel(id)}»: дальше нельзя`);
    }
  };

  // ——— Рендер ———

  const shown = draft ?? layout;
  const live = (
    <div className="dash-grid__live" aria-live="polite" role="status">
      {announcement}
    </div>
  );
  const hint = (
    <p id={HINT_ID} className="dash-grid__sr-only">
      Перетащите заголовок виджета, чтобы переместить его, или угол — чтобы изменить размер. С клавиатуры:
      стрелки перемещают виджет, Shift и стрелки меняют размер.
    </p>
  );

  const ctxFor = (id: string): GridItemContext => ({
    editable,
    dragging: activeId === id,
    dragAreaProps: { onPointerDown: (e) => start(id, 'move', e) },
    handleProps: {
      onPointerDown: (e) => start(id, 'move', e),
      onKeyDown: (e) => onHandleKeyDown(id, e),
      'aria-describedby': HINT_ID,
    },
  });

  let content: React.ReactNode = null;
  let height: number | undefined;

  if (width > 0 && stacked) {
    const ordered = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    content = ordered.map((it) => (
      <div key={it.i} className="dash-grid__item" style={{ height: Math.max(it.h, 2) * stepY - gap }}>
        {renderItem(it.i, ctxFor(it.i))}
      </div>
    ));
  } else if (width > 0) {
    const activeItem = activeId ? shown.find((it) => it.i === activeId) : undefined;
    const rows = Math.max(
      bottom(shown) + (editable ? 2 : 0),
      activeRect ? Math.ceil((activeRect.top + activeRect.height + gap) / stepY) : 0,
      1,
    );
    height = rows * stepY - gap;
    content = (
      <>
        {editable && (
          <div className="dash-grid__guides" aria-hidden>
            {Array.from({ length: cols }, (_, c) => (
              <div key={c} className="dash-grid__guide" style={{ left: c * stepX, width: colWidth }} />
            ))}
          </div>
        )}

        {activeItem && (
          <div className="dash-grid__placeholder" style={rectStyle(toRect(activeItem))} aria-hidden />
        )}

        {shown.map((it) => {
          const isActive = it.i === activeId;
          const rect = isActive && activeRect ? activeRect : toRect(it);
          return (
            <div
              key={it.i}
              className={`dash-grid__item${isActive ? ' dash-grid__item_active' : ''}`}
              style={rectStyle(rect)}
            >
              {renderItem(it.i, ctxFor(it.i))}
              {editable && (
                <div
                  className="dash-grid__resize"
                  onPointerDown={(e) => start(it.i, 'resize', e)}
                  title="Потяните, чтобы изменить размер"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </>
    );
  }

  const className = ['dash-grid', stacked && 'dash-grid_stacked', editable && 'dash-grid_editable']
    .filter(Boolean)
    .join(' ');

  // Внешний элемент всегда один и тот же — за ним следит ResizeObserver.
  return (
    <div ref={containerRef} className={className} style={stacked ? { gap } : { height }}>
      {content}
      {hint}
      {live}
    </div>
  );
}

function rectStyle(r: Rect): React.CSSProperties {
  return {
    transform: `translate(${r.left}px, ${r.top}px)`,
    width: r.width,
    height: r.height,
  };
}
