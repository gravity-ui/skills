import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  COLS,
  bottomOf,
  moveItem,
  resizeItem,
  resolve,
  type GridItem,
  type LimitsMap,
} from './layout';

type PointerHandlers = Pick<
  React.HTMLAttributes<HTMLElement>,
  'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'
>;

/** Всё, что виджет должен повесить на свои элементы, чтобы его можно было двигать. */
export interface ItemBinding {
  /** Область захвата (обычно шапка виджета). Кнопки внутри помечаются data-no-drag. */
  dragProps: PointerHandlers;
  /** Кнопка-«ручка» для клавиатуры: стрелки двигают, Shift+стрелки меняют размер. */
  gripProps: Pick<React.HTMLAttributes<HTMLElement>, 'onKeyDown'>;
  /** Уголок для изменения размера. */
  resizeProps: PointerHandlers;
  dragging: boolean;
  resizing: boolean;
  /** На узких экранах виджеты складываются в колонку и не двигаются. */
  disabled: boolean;
}

interface GridProps {
  items: GridItem[];
  limits: LimitsMap;
  compact: boolean;
  onChange: (items: GridItem[]) => void;
  renderItem: (id: string, binding: ItemBinding) => React.ReactNode;
  /** Текст для скринридера после перемещения с клавиатуры. */
  describe?: (item: GridItem) => string;
  rowHeight?: number;
  gap?: number;
  /** Ниже этой ширины контейнера сетка превращается в одну колонку. */
  stackBelow?: number;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Live extends Rect {
  id: string;
  kind: 'drag' | 'resize';
  preview: GridItem[];
}

interface Session {
  id: string;
  kind: 'drag' | 'resize';
  pointerId: number;
  /** Позиция указателя относительно контейнера в момент нажатия. */
  startX: number;
  startY: number;
  /** Смещение точки захвата внутри элемента. */
  grabX: number;
  grabY: number;
  startClientX: number;
  startClientY: number;
  clientX: number;
  clientY: number;
  base: GridItem[];
  origin: GridItem;
  started: boolean;
  preview: GridItem[];
  raf: number;
}

const DRAG_THRESHOLD = 4;
const SCROLL_EDGE = 80;

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export function Grid({
  items,
  limits,
  compact,
  onChange,
  renderItem,
  describe,
  rowHeight = 40,
  gap = 12,
  stackBelow = 720,
}: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [live, setLive] = useState<Live | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const session = useRef<Session | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current!;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stacked = width > 0 && width < stackBelow;
  const colW = (width - gap * (COLS - 1)) / COLS;
  const stepX = colW + gap;
  const stepY = rowHeight + gap;

  // Обработчики живут дольше одного рендера (window-слушатели, rAF) — читают свежие значения из ref.
  const latest = useRef({ items, limits, compact, onChange, width, colW, stepX, stepY, stacked });
  latest.current = { items, limits, compact, onChange, width, colW, stepX, stepY, stacked };

  const pxRect = (it: GridItem): Rect => ({
    left: it.x * stepX,
    top: it.y * stepY,
    width: it.w * colW + (it.w - 1) * gap,
    height: it.h * rowHeight + (it.h - 1) * gap,
  });

  const compute = useCallback(() => {
    const s = session.current;
    const container = containerRef.current;
    if (!s || !container || !s.started) return;
    const { compact, limits, width, colW, stepX, stepY } = latest.current;
    const box = container.getBoundingClientRect();
    const cx = s.clientX - box.left;
    const cy = s.clientY - box.top;
    const itemW = s.origin.w * colW + (s.origin.w - 1) * gap;
    const itemH = s.origin.h * rowHeight + (s.origin.h - 1) * gap;
    const originLeft = s.origin.x * stepX;
    const originTop = s.origin.y * stepY;

    if (s.kind === 'drag') {
      const left = Math.min(Math.max(cx - s.grabX, 0), Math.max(0, width - itemW));
      const top = Math.max(0, cy - s.grabY);
      const preview = moveItem(s.base, s.id, left / stepX, top / stepY, compact);
      s.preview = preview;
      setLive({ id: s.id, kind: 'drag', left, top, width: itemW, height: itemH, preview });
    } else {
      const min = limits[s.id] ?? { minW: 1, minH: 1 };
      const minPxW = min.minW * colW + (min.minW - 1) * gap;
      const minPxH = min.minH * rowHeight + (min.minH - 1) * gap;
      const w = Math.min(Math.max(itemW + (cx - s.startX), minPxW), width - originLeft);
      const h = Math.max(itemH + (cy - s.startY), minPxH);
      const preview = resizeItem(
        s.base,
        s.id,
        (w + gap) / stepX,
        (h + gap) / stepY,
        limits,
        compact,
      );
      s.preview = preview;
      setLive({ id: s.id, kind: 'resize', left: originLeft, top: originTop, width: w, height: h, preview });
    }
  }, [gap, rowHeight]);

  // Стабильный обработчик Escape: один и тот же объект при добавлении и снятии слушателя.
  const endRef = useRef<() => void>(() => {});
  const onEscape = useRef((e: KeyboardEvent) => {
    if (e.key === 'Escape') endRef.current();
  }).current;

  const endSession = useCallback(() => {
    const s = session.current;
    if (s) cancelAnimationFrame(s.raf);
    session.current = null;
    window.removeEventListener('keydown', onEscape);
    setLive(null);
  }, [onEscape]);
  endRef.current = endSession;

  // Автоскролл страницы, когда виджет тянут к верхнему/нижнему краю окна.
  const tick = useCallback(() => {
    const s = session.current;
    if (!s) return;
    if (s.started) {
      const vh = window.innerHeight;
      let dy = 0;
      if (s.clientY < SCROLL_EDGE) dy = -Math.ceil((SCROLL_EDGE - s.clientY) / 5);
      else if (s.clientY > vh - SCROLL_EDGE) dy = Math.ceil((s.clientY - (vh - SCROLL_EDGE)) / 5);
      if (dy) {
        const before = window.scrollY;
        window.scrollBy(0, dy);
        if (window.scrollY !== before) compute();
      }
    }
    s.raf = requestAnimationFrame(tick);
  }, [compute]);

  useEffect(() => () => endSession(), [endSession]);

  const begin =
    (id: string, kind: 'drag' | 'resize') =>
    (e: React.PointerEvent<HTMLElement>) => {
      const { items, stacked, stepX, stepY } = latest.current;
      if (stacked || session.current) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (kind === 'drag' && (e.target as HTMLElement).closest('[data-no-drag]')) return;
      const origin = items.find((i) => i.id === id);
      const container = containerRef.current;
      if (!origin || !container) return;

      const box = container.getBoundingClientRect();
      const cx = e.clientX - box.left;
      const cy = e.clientY - box.top;
      session.current = {
        id,
        kind,
        pointerId: e.pointerId,
        startX: cx,
        startY: cy,
        grabX: cx - origin.x * stepX,
        grabY: cy - origin.y * stepY,
        startClientX: e.clientX,
        startClientY: e.clientY,
        clientX: e.clientX,
        clientY: e.clientY,
        base: items,
        origin,
        started: false,
        preview: items,
        raf: requestAnimationFrame(tick),
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      window.addEventListener('keydown', onEscape);
      if (kind === 'resize') e.preventDefault();
    };

  const move = (e: React.PointerEvent<HTMLElement>) => {
    const s = session.current;
    if (!s || s.pointerId !== e.pointerId) return;
    s.clientX = e.clientX;
    s.clientY = e.clientY;
    if (!s.started) {
      if (Math.hypot(e.clientX - s.startClientX, e.clientY - s.startClientY) < DRAG_THRESHOLD) return;
      s.started = true;
    }
    compute();
  };

  const finish = (commit: boolean) => (e: React.PointerEvent<HTMLElement>) => {
    const s = session.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const { compact, onChange } = latest.current;
    const changed = commit && s.started;
    const preview = s.preview;
    endSession();
    if (changed) onChange(resolve(preview, { compact }));
  };

  const bindingFor = (id: string): ItemBinding => ({
    dragProps: {
      onPointerDown: begin(id, 'drag'),
      onPointerMove: move,
      onPointerUp: finish(true),
      onPointerCancel: finish(false),
    },
    resizeProps: {
      onPointerDown: begin(id, 'resize'),
      onPointerMove: move,
      onPointerUp: finish(true),
      onPointerCancel: finish(false),
    },
    gripProps: {
      onKeyDown: (e) => {
        const dir = ARROWS[e.key];
        const { items, compact, limits, onChange, stacked } = latest.current;
        if (!dir || stacked || e.altKey || e.ctrlKey || e.metaKey) return;
        const it = items.find((i) => i.id === id);
        if (!it) return;
        e.preventDefault();
        const [dx, dy] = dir;
        const next = e.shiftKey
          ? resizeItem(items, id, it.w + dx, it.h + dy, limits, compact)
          : moveItem(items, id, it.x + dx, it.y + dy, compact);
        const final = resolve(next, { compact });
        const after = final.find((i) => i.id === id)!;
        onChange(final);
        setAnnouncement(describe?.(after) ?? '');
      },
    },
    dragging: live?.id === id && live.kind === 'drag',
    resizing: live?.id === id && live.kind === 'resize',
    disabled: stacked,
  });

  // --- Геометрия ---
  const layout = live ? live.preview : items;

  let rects: Record<string, Rect> = {};
  let totalHeight: number;
  if (stacked) {
    let top = 0;
    [...items]
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .forEach((it) => {
        const height = it.h * rowHeight + (it.h - 1) * gap;
        rects[it.id] = { left: 0, top, width, height };
        top += height + gap;
      });
    totalHeight = Math.max(0, top - gap);
  } else {
    layout.forEach((it) => (rects[it.id] = pxRect(it)));
    // Во время перетаскивания оставляем запас снизу, чтобы можно было бросить виджет ниже всех.
    const rows = bottomOf(layout) + (live ? 3 : 0);
    totalHeight = Math.max(0, rows * stepY - gap);
  }

  const placeholder = live && !stacked ? rects[live.id] : null;

  return (
    <div
      ref={containerRef}
      className="grid"
      style={{ height: totalHeight, minHeight: rowHeight * 4 }}
    >
      {width > 0 &&
        items.map((it) => {
          const binding = bindingFor(it.id);
          const r =
            live && live.id === it.id
              ? { left: live.left, top: live.top, width: live.width, height: live.height }
              : rects[it.id];
          if (!r) return null;
          const active = binding.dragging || binding.resizing;
          return (
            <div
              key={it.id}
              className={'grid__item' + (active ? ' grid__item_active' : '')}
              style={{
                transform: `translate(${r.left}px, ${r.top}px)`,
                width: r.width,
                height: r.height,
              }}
            >
              {renderItem(it.id, binding)}
            </div>
          );
        })}
      {placeholder && <div className="grid__placeholder" style={{
        transform: `translate(${placeholder.left}px, ${placeholder.top}px)`,
        width: placeholder.width,
        height: placeholder.height,
      }} />}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}
