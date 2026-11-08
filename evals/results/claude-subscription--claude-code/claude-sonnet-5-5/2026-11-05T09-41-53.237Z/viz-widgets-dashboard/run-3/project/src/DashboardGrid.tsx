import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { COLS, bottom, moveItem, resizeItem, type Item, type Limits } from './layout';
import { useElementSize } from './useElementSize';

export const ROW_HEIGHT = 72;
export const GAP = 12;
/** Ниже этой ширины сетка превращается в одну колонку без перетаскивания. */
const STACK_BELOW = 720;

/** То, что сетка отдаёт виджету для привязки к рамке. */
export interface FrameApi {
  /** Можно ли двигать (false в одноколоночном режиме). */
  interactive: boolean;
  state: 'idle' | 'moving' | 'resizing';
  /** Вешается на шапку: перетаскивание мышью/пальцем. */
  dragProps: { onPointerDown: (e: React.PointerEvent) => void };
  /** Вешается на кнопку-ручку: стрелки двигают, Shift+стрелки меняют размер. */
  keyProps: { onKeyDown: (e: React.KeyboardEvent) => void };
  /** Уголок для изменения размера. */
  resizeProps: { onPointerDown: (e: React.PointerEvent) => void };
}

interface Props {
  layout: Item[];
  limits: Record<string, Limits>;
  onChange: (layout: Item[]) => void;
  renderWidget: (id: string, api: FrameApi) => React.ReactNode;
}

type Gesture =
  | { kind: 'moving'; id: string; grabX: number; grabY: number }
  | { kind: 'resizing'; id: string; grabX: number; grabY: number };

interface Live {
  gesture: Gesture;
  /** Раскладка, как она ляжет, если отпустить сейчас. */
  preview: Item[];
  /** Пиксельная рамка перетаскиваемого виджета (следует за указателем свободно). */
  rect: { left: number; top: number; width: number; height: number };
}

export function DashboardGrid({ layout, limits, onChange, renderWidget }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(containerRef);
  const [live, setLive] = useState<Live | null>(null);
  const [mounted, setMounted] = useState(false);

  const stacked = width > 0 && width < STACK_BELOW;
  const colW = width > 0 ? (width - GAP * (COLS - 1)) / COLS : 0;
  const stepX = colW + GAP;
  const stepY = ROW_HEIGHT + GAP;

  // Анимацию включаем после первой отрисовки, чтобы виджеты не «влетали» при загрузке.
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const pxRect = useCallback(
    (i: Item) => ({
      left: i.x * stepX,
      top: i.y * stepY,
      width: i.w * colW + (i.w - 1) * GAP,
      height: i.h * ROW_HEIGHT + (i.h - 1) * GAP,
    }),
    [stepX, stepY, colW],
  );

  // Актуальные значения для обработчиков окна (они живут дольше одного рендера).
  const latest = useRef({ layout, limits, onChange, pxRect, stepX, stepY, colW, width });
  latest.current = { layout, limits, onChange, pxRect, stepX, stepY, colW, width };

  const startGesture = useCallback((e: React.PointerEvent, id: string, kind: Gesture['kind']) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.target as HTMLElement;
    if (kind === 'moving' && target.closest('[data-no-drag]')) return;
    const c = containerRef.current;
    const { layout: base, limits: lim, pxRect: toPx, stepX: sx, stepY: sy, width: cw } = latest.current;
    const item = base.find((i) => i.id === id);
    if (!c || !item) return;
    e.preventDefault();

    const origin = toPx(item);
    const box = c.getBoundingClientRect();
    // Смещение указателя внутри виджета (move) или относительно правого нижнего угла (resize).
    const grabX = kind === 'moving' ? e.clientX - box.left - origin.left : e.clientX - box.left - (origin.left + origin.width);
    const grabY = kind === 'moving' ? e.clientY - box.top - origin.top : e.clientY - box.top - (origin.top + origin.height);
    const gesture: Gesture = { kind, id, grabX, grabY };
    let pointer = { x: e.clientX, y: e.clientY };
    let raf = 0;
    let last: Live | null = null;

    const update = () => {
      const r = c.getBoundingClientRect();
      const mx = pointer.x - r.left - gesture.grabX;
      const my = pointer.y - r.top - gesture.grabY;
      let next: Live;
      if (kind === 'moving') {
        const left = Math.min(Math.max(mx, 0), cw - origin.width);
        const top = Math.max(my, 0);
        next = {
          gesture,
          rect: { ...origin, left, top },
          preview: moveItem(base, id, left / sx, top / sy),
        };
      } else {
        const l = lim[id];
        const width = Math.min(Math.max(mx - origin.left, 0), cw - origin.left);
        const height = Math.max(my - origin.top, 0);
        next = {
          gesture,
          rect: { ...origin, width, height },
          preview: resizeItem(base, id, (width + GAP) / sx, (height + GAP) / sy, l),
        };
      }
      last = next;
      setLive(next);
    };

    // Автопрокрутка у верхнего/нижнего края окна.
    const tick = () => {
      const edge = 72;
      const dy = pointer.y < edge ? -14 : pointer.y > window.innerHeight - edge ? 14 : 0;
      if (dy) {
        window.scrollBy(0, dy);
        update();
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (ev: PointerEvent) => {
      pointer = { x: ev.clientX, y: ev.clientY };
      update();
    };
    const finish = (commit: boolean) => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey);
      if (commit && last) latest.current.onChange(last.preview);
      setLive(null);
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') finish(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(tick);
    update();
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    const { layout: base, limits: lim, onChange: commit } = latest.current;
    const item = base.find((i) => i.id === id);
    if (!item) return;
    commit(
      e.shiftKey
        ? resizeItem(base, id, item.w + d[0], item.h + d[1], lim[id])
        : moveItem(base, id, item.x + d[0], item.y + d[1]),
    );
  }, []);

  const shown = live?.preview ?? layout;
  const rows = bottom(shown) + (live ? 2 : 0);
  const height = rows > 0 ? rows * stepY - GAP : 0;
  const movingRect = live?.rect;

  // Одноколоночный режим для узких экранов.
  const ordered = useMemo(() => [...layout].sort((a, b) => a.y - b.y || a.x - b.x), [layout]);
  const idleApi: Omit<FrameApi, 'dragProps' | 'keyProps' | 'resizeProps'> = { interactive: false, state: 'idle' };

  useLayoutEffect(() => {
    // Пока тащим — не даём тексту выделяться и фиксируем курсор.
    if (!live) return;
    document.body.classList.add(live.gesture.kind === 'moving' ? 'dash-grabbing' : 'dash-resizing');
    return () => document.body.classList.remove('dash-grabbing', 'dash-resizing');
  }, [live?.gesture.kind]);

  if (stacked) {
    const noop = () => {};
    return (
      <div ref={containerRef} className="dash-stack">
        {ordered.map((i) => (
          <div key={i.id} className="dash-stack__item" style={{ height: i.h * ROW_HEIGHT + (i.h - 1) * GAP }}>
            {renderWidget(i.id, {
              ...idleApi,
              dragProps: { onPointerDown: noop },
              keyProps: { onKeyDown: noop },
              resizeProps: { onPointerDown: noop },
            })}
          </div>
        ))}
      </div>
    );
  }

  const placeholder = live && shown.find((i) => i.id === live.gesture.id);

  return (
    <div
      ref={containerRef}
      className={'dash-grid' + (mounted ? ' dash-grid_animated' : '')}
      style={{ height }}
    >
      {width > 0 &&
        layout.map((orig) => {
          const id = orig.id;
          const isLive = live?.gesture.id === id;
          const item = shown.find((i) => i.id === id) ?? orig;
          const r = isLive && movingRect ? movingRect : pxRect(item);
          const state: FrameApi['state'] = isLive ? live!.gesture.kind : 'idle';
          return (
            <div
              key={id}
              className={'dash-grid__item' + (isLive ? ' dash-grid__item_live' : '')}
              style={{
                width: r.width,
                height: r.height,
                transform: `translate(${r.left}px, ${r.top}px)`,
              }}
            >
              {renderWidget(id, {
                interactive: true,
                state,
                dragProps: { onPointerDown: (e) => startGesture(e, id, 'moving') },
                keyProps: { onKeyDown: (e) => onKeyDown(e, id) },
                resizeProps: { onPointerDown: (e) => startGesture(e, id, 'resizing') },
              })}
            </div>
          );
        })}
      {placeholder && (
        <div
          className="dash-grid__placeholder"
          style={{
            width: pxRect(placeholder).width,
            height: pxRect(placeholder).height,
            transform: `translate(${pxRect(placeholder).left}px, ${pxRect(placeholder).top}px)`,
          }}
        />
      )}
    </div>
  );
}
