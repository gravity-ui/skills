import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Button, Icon } from '@gravity-ui/uikit';
import Xmark from '@gravity-ui/icons/Xmark';
import Grip from '@gravity-ui/icons/Grip';
import { bottom, moveItem, resizeItem, type Item, type Layout } from './layout';

export interface GridProps {
  layout: Layout;
  onChange: (layout: Layout) => void;
  renderItem: (item: Item) => ReactNode;
  labelOf: (id: string) => string;
  onRemove: (id: string) => void;
  /** Drag / resize / remove controls are active. */
  editing: boolean;
  /** Vertical compaction: items float up into free space. */
  gravity: boolean;
  /** Narrow screens: widgets are stacked in reading order, no positioning. */
  stacked?: boolean;
  cols?: number;
  rowHeight?: number;
  gap?: number;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Session {
  id: string;
  mode: 'move' | 'resize';
  pointerId: number;
  startX: number;
  startY: number;
  startScroll: number;
  origin: Rect;
  base: Layout;
  preview: Layout;
  cell: [number, number, number, number]; // last x,y,w,h that produced `preview`
}

const KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export function Grid({ layout, onChange, renderItem, labelOf, onRemove, editing, gravity, stacked = false, cols = 12, rowHeight = 72, gap = 12 }: GridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<{ id: string; mode: 'move' | 'resize'; rect: Rect; preview: Layout } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const session = useRef<Session | null>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stacked]);

  const colWidth = Math.max(0, (width - gap * (cols - 1)) / cols);
  const stepX = colWidth + gap;
  const stepY = rowHeight + gap;

  const rectOf = useCallback(
    (i: Item): Rect => ({ left: i.x * stepX, top: i.y * stepY, width: i.w * stepX - gap, height: i.h * stepY - gap }),
    [stepX, stepY, gap],
  );

  const shown = active ? active.preview : layout;
  const rows = Math.max(bottom(shown), 1) + (active ? 1 : 0);
  const height = rows * stepY - gap;

  // ---- pointer interaction -------------------------------------------------

  const start = (e: PointerEvent<HTMLElement>, item: Item, mode: 'move' | 'resize') => {
    if (!editing || stacked || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (mode === 'resize') e.preventDefault();
    const origin = rectOf(item);
    session.current = {
      id: item.id,
      mode,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startScroll: window.scrollY,
      origin,
      base: layout,
      preview: layout,
      cell: [item.x, item.y, item.w, item.h],
    };
    setActive({ id: item.id, mode, rect: origin, preview: layout });
  };

  const drag = (e: PointerEvent<HTMLElement>) => {
    const s = session.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY + window.scrollY - (s.startY + s.startScroll);
    const item = s.base.find((i) => i.id === s.id)!;
    let rect: Rect;
    let cell: Session['cell'];

    if (s.mode === 'move') {
      const left = Math.min(Math.max(s.origin.left + dx, 0), width - s.origin.width);
      const top = Math.max(s.origin.top + dy, 0);
      rect = { ...s.origin, left, top };
      cell = [Math.round(left / stepX), Math.round(top / stepY), item.w, item.h];
    } else {
      const minW = Math.min(item.minW, cols) * stepX - gap;
      const minH = item.minH * stepY - gap;
      const w = Math.min(Math.max(s.origin.width + dx, minW), width - s.origin.left);
      const h = Math.max(s.origin.height + dy, minH);
      rect = { ...s.origin, width: w, height: h };
      cell = [item.x, item.y, Math.round((w + gap) / stepX), Math.round((h + gap) / stepY)];
    }

    if (cell.some((v, k) => v !== s.cell[k])) {
      s.cell = cell;
      s.preview = s.mode === 'move' ? moveItem(s.base, s.id, cell[0], cell[1], cols, gravity) : resizeItem(s.base, s.id, cell[2], cell[3], cols, gravity);
    }
    setActive({ id: s.id, mode: s.mode, rect, preview: s.preview });
  };

  const finish = (e: PointerEvent<HTMLElement>, commit: boolean) => {
    const s = session.current;
    if (!s || s.pointerId !== e.pointerId) return;
    session.current = null;
    setActive(null);
    if (commit && s.preview !== s.base) onChange(s.preview);
  };

  // ---- keyboard: arrows move, Shift+arrows resize, Esc cancels a drag ------

  const onKeyDown = (e: KeyboardEvent<HTMLElement>, item: Item) => {
    if (e.key === 'Escape' && session.current) {
      session.current = null;
      setActive(null);
      return;
    }
    const dir = KEYS[e.key];
    if (!dir || !editing || stacked) return;
    e.preventDefault();
    const next = e.shiftKey ? resizeItem(layout, item.id, item.w + dir[0], item.h + dir[1], cols, gravity) : moveItem(layout, item.id, item.x + dir[0], item.y + dir[1], cols, gravity);
    onChange(next);
    const it = next.find((i) => i.id === item.id)!;
    setAnnouncement(`${labelOf(item.id)}: столбец ${it.x + 1}, строка ${it.y + 1}, размер ${it.w} на ${it.h}`);
  };

  // ---- render --------------------------------------------------------------

  const guideRows = rows;
  const guides = useMemo(() => (editing && !stacked ? Array.from({ length: guideRows * cols }, (_, k) => k) : []), [editing, stacked, guideRows, cols]);

  if (stacked) {
    const ordered = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    return (
      <div className="dash-grid dash-grid_stacked">
        {ordered.map((i) => (
          <div key={i.id} className="dash-item" style={{ height: i.h * stepY - gap }}>
            {renderItem(i)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`dash-grid${editing ? ' dash-grid_editing' : ''}`} style={{ height: width ? height : undefined }}>
      {width > 0 && (
        <>
          {guides.map((k) => (
            <div
              key={k}
              className="dash-guide"
              style={{ left: (k % cols) * stepX, top: Math.floor(k / cols) * stepY, width: colWidth, height: rowHeight }}
            />
          ))}

          {active && (() => {
            const target = active.preview.find((i) => i.id === active.id)!;
            return <div className="dash-placeholder" style={toStyle(rectOf(target))} />;
          })()}

          {layout.map((base) => {
            const item = shown.find((i) => i.id === base.id)!;
            const isActive = active?.id === item.id;
            const rect = isActive ? active.rect : rectOf(item);
            return (
              <div
                key={item.id}
                className={`dash-item${isActive ? ' dash-item_active' : ''}`}
                style={{ ...toStyle(rect), ...(isActive ? { transition: 'none' } : null) }}
              >
                {renderItem(item)}
                {editing && (
                  <>
                    <div
                      className="dash-handle"
                      role="button"
                      tabIndex={0}
                      aria-label={`${labelOf(item.id)}. Стрелки — переместить, Shift и стрелки — изменить размер`}
                      onPointerDown={(e) => start(e, item, 'move')}
                      onPointerMove={drag}
                      onPointerUp={(e) => finish(e, true)}
                      onPointerCancel={(e) => finish(e, false)}
                      onKeyDown={(e) => onKeyDown(e, item)}
                    >
                      <span className="dash-handle__badge">
                        <Icon data={Grip} size={14} />
                        {labelOf(item.id)}
                      </span>
                    </div>
                    <div className="dash-remove">
                      <Button view="raised" size="s" aria-label={`Убрать виджет «${labelOf(item.id)}»`} onClick={() => onRemove(item.id)}>
                        <Icon data={Xmark} size={14} />
                      </Button>
                    </div>
                    <div
                      className="dash-resize"
                      aria-hidden
                      onPointerDown={(e) => start(e, item, 'resize')}
                      onPointerMove={drag}
                      onPointerUp={(e) => finish(e, true)}
                      onPointerCancel={(e) => finish(e, false)}
                    />
                  </>
                )}
              </div>
            );
          })}
        </>
      )}
      <div className="dash-sr" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}

function toStyle(r: Rect): CSSProperties {
  return { width: r.width, height: r.height, transform: `translate3d(${r.left}px, ${r.top}px, 0)` };
}
