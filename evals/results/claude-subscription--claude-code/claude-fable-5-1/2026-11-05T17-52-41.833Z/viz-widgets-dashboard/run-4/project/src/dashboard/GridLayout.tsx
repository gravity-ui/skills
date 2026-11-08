import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import { moveItem, resizeItem, stackLayout, bottom, type Layout, type LayoutItem } from './layout';
import { useElementSize } from './useElementSize';

import './GridLayout.css';

export interface DragHandleProps {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  tabIndex: number;
  role: 'button';
  'aria-label': string;
  'aria-describedby': string;
  style: CSSProperties;
}

export interface ItemRenderApi {
  item: LayoutItem;
  /** Повесить на элемент, за который можно таскать виджет. */
  dragHandleProps: DragHandleProps;
  /** Готовый уголок для изменения размера (рендерить внутри виджета). */
  resizeHandle: ReactNode;
  dragging: boolean;
  resizing: boolean;
  /** Режим редактирования выключен (узкий экран или блокировка). */
  editable: boolean;
}

export interface GridLayoutProps {
  layout: Layout;
  cols?: number;
  rowHeight?: number;
  gap?: number;
  /** Ширина, ниже которой сетка складывается в одну колонку и редактирование отключается. */
  stackBelow?: number;
  editable?: boolean;
  onLayoutChange: (layout: Layout) => void;
  renderItem: (api: ItemRenderApi) => ReactNode;
  itemLabel?: (item: LayoutItem) => string;
}

type Interaction =
  | { kind: 'drag'; id: string; startX: number; startY: number; origin: LayoutItem; dx: number; dy: number }
  | { kind: 'resize'; id: string; startX: number; startY: number; origin: LayoutItem; dx: number; dy: number };

const HINT_ID = 'grid-layout-keyboard-hint';

export function GridLayout({
  layout,
  cols = 12,
  rowHeight = 72,
  gap = 12,
  stackBelow = 640,
  editable = true,
  onLayoutChange,
  renderItem,
  itemLabel = (item) => item.id,
}: GridLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(containerRef);
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const stacked = width > 0 && width < stackBelow;
  const canEdit = editable && !stacked;
  const effectiveLayout = useMemo(() => (stacked ? stackLayout(layout, cols) : layout), [stacked, layout, cols]);

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
    [cellW, cellH, colWidth, gap, rowHeight],
  );

  const commit = useCallback(
    (next: Layout) => {
      if (next !== layoutRef.current) onLayoutChange(next);
    },
    [onLayoutChange],
  );

  const update = useCallback((next: Interaction | null) => {
    interactionRef.current = next;
    setInteraction(next);
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const cur = interactionRef.current;
      if (!cur || cellW <= 0) return;
      const dx = e.clientX - cur.startX;
      const dy = e.clientY - cur.startY;
      update({ ...cur, dx, dy });

      const current = layoutRef.current;
      if (cur.kind === 'drag') {
        const gx = Math.round((cur.origin.x * cellW + dx) / cellW);
        const gy = Math.round((cur.origin.y * cellH + dy) / cellH);
        commit(moveItem(current, cur.id, gx, gy, cols));
      } else {
        const pxW = cur.origin.w * colWidth + (cur.origin.w - 1) * gap + dx;
        const pxH = cur.origin.h * rowHeight + (cur.origin.h - 1) * gap + dy;
        const gw = Math.max(1, Math.round((pxW + gap) / cellW));
        const gh = Math.max(1, Math.round((pxH + gap) / cellH));
        commit(resizeItem(current, cur.id, gw, gh, cols));
      }
    },
    [cellW, cellH, colWidth, rowHeight, gap, cols, commit, update],
  );

  const handlePointerUp = useCallback(() => update(null), [update]);

  useEffect(() => {
    if (!interaction) return;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [interaction !== null, handlePointerMove, handlePointerUp]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = (kind: Interaction['kind'], item: LayoutItem) => (e: ReactPointerEvent<HTMLElement>) => {
    if (!canEdit || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    update({ kind, id: item.id, startX: e.clientX, startY: e.clientY, origin: item, dx: 0, dy: 0 });
  };

  const handleKeyDown = (item: LayoutItem) => (e: KeyboardEvent<HTMLElement>) => {
    if (!canEdit) return;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    const current = layoutRef.current;
    if (e.shiftKey) {
      commit(resizeItem(current, item.id, item.w + d[0], item.h + d[1], cols));
    } else {
      commit(moveItem(current, item.id, item.x + d[0], item.y + d[1], cols));
    }
  };

  const rows = bottom(effectiveLayout) + (canEdit && interaction ? 1 : 0);
  const containerHeight = Math.max(rows * cellH - gap, rowHeight);

  return (
    <div
      ref={containerRef}
      className={`grid-layout${interaction ? ' grid-layout_active' : ''}${canEdit ? ' grid-layout_editable' : ''}`}
      style={{ height: containerHeight }}
    >
      <span id={HINT_ID} className="grid-layout__sr-only">
        Стрелки перемещают виджет, Shift со стрелками меняет размер.
      </span>

      {interaction && (() => {
        const item = effectiveLayout.find((l) => l.id === interaction.id);
        if (!item) return null;
        return <div className="grid-layout__placeholder" style={toPx(item)} />;
      })()}

      {width > 0 &&
        effectiveLayout.map((item) => {
          const active = interaction?.id === item.id ? interaction : null;
          let box = toPx(item);
          if (active?.kind === 'drag') {
            const o = toPx(active.origin);
            box = { ...box, left: o.left + active.dx, top: o.top + active.dy };
          } else if (active?.kind === 'resize') {
            const o = toPx(active.origin);
            box = {
              ...box,
              left: o.left,
              top: o.top,
              width: Math.max(colWidth, o.width + active.dx),
              height: Math.max(rowHeight, o.height + active.dy),
            };
          }

          const style: CSSProperties = {
            transform: `translate(${box.left}px, ${box.top}px)`,
            width: box.width,
            height: box.height,
          };

          const label = itemLabel(item);
          const dragHandleProps: DragHandleProps = {
            onPointerDown: start('drag', item),
            onKeyDown: handleKeyDown(item),
            tabIndex: canEdit ? 0 : -1,
            role: 'button',
            'aria-label': `Переместить виджет «${label}»`,
            'aria-describedby': HINT_ID,
            style: { cursor: canEdit ? (active?.kind === 'drag' ? 'grabbing' : 'grab') : 'default', touchAction: 'none' },
          };

          const resizeHandle = canEdit ? (
            <div
              className="grid-layout__resize"
              onPointerDown={start('resize', item)}
              role="presentation"
              aria-hidden="true"
              title="Изменить размер"
            />
          ) : null;

          return (
            <div
              key={item.id}
              className={`grid-layout__item${active ? ` grid-layout__item_${active.kind}` : ''}`}
              style={style}
            >
              {renderItem({
                item,
                dragHandleProps,
                resizeHandle,
                dragging: active?.kind === 'drag',
                resizing: active?.kind === 'resize',
                editable: canEdit,
              })}
            </div>
          );
        })}
    </div>
  );
}
