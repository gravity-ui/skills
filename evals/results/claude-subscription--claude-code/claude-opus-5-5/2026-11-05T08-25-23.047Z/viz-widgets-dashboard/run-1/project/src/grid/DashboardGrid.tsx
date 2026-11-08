import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type {
    CSSProperties,
    KeyboardEvent as ReactKeyboardEvent,
    PointerEvent as ReactPointerEvent,
    ReactNode,
} from 'react';

import { useSize } from '../charts/useSize';
import { type LayoutItem, type PackMode, bottom, layoutsEqual, placeItem, sortByPosition } from './layout';

const DRAG_THRESHOLD = 4;
/** Below this width the grid collapses into a single read-only column. */
const STACK_BREAKPOINT = 640;

export interface ItemRenderProps {
    /** Spread on the element that starts a pointer drag (the widget header). */
    dragAreaProps: {
        onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    };
    /** Spread on a real <button> — the keyboard handle. */
    gripProps: {
        onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
        'aria-describedby': string;
    };
    editable: boolean;
    dragging: boolean;
}

interface Props<T extends LayoutItem> {
    layout: T[];
    cols: number;
    rowHeight: number;
    gap: number;
    mode: PackMode;
    locked: boolean;
    onLayoutChange: (next: T[]) => void;
    renderItem: (item: T, props: ItemRenderProps) => ReactNode;
    getItemLabel: (item: T) => string;
}

interface DragSession<T> {
    id: string;
    kind: 'move' | 'resize';
    base: T[];
    startX: number;
    startY: number;
    started: boolean;
    origin: { left: number; top: number; width: number; height: number };
}

interface DragView<T> {
    id: string;
    kind: 'move' | 'resize';
    dx: number;
    dy: number;
    preview: T[];
}

export function DashboardGrid<T extends LayoutItem>({
    layout,
    cols,
    rowHeight,
    gap,
    mode,
    locked,
    onLayoutChange,
    renderItem,
    getItemLabel,
}: Props<T>) {
    const [containerRef, { width }] = useSize<HTMLDivElement>();
    const helpId = useId();
    const session = useRef<DragSession<T> | null>(null);
    const [view, setView] = useState<DragView<T> | null>(null);
    const [announcement, setAnnouncement] = useState('');

    const stacked = width > 0 && width < STACK_BREAKPOINT;
    const editable = !locked && !stacked;
    const colWidth = (width - gap * (cols - 1)) / cols;
    const stepX = colWidth + gap;
    const stepY = rowHeight + gap;

    const toPx = useCallback(
        (item: LayoutItem) => ({
            left: item.x * stepX,
            top: item.y * stepY,
            width: item.w * colWidth + (item.w - 1) * gap,
            height: item.h * rowHeight + (item.h - 1) * gap,
        }),
        [stepX, stepY, colWidth, rowHeight, gap],
    );

    // Latest values for the window listeners, without re-binding them on every render.
    const live = useRef({ cols, mode, gap, stepX, stepY, onLayoutChange, getItemLabel, view });
    live.current = { cols, mode, gap, stepX, stepY, onLayoutChange, getItemLabel, view };

    const describe = useCallback(
        (item: LayoutItem, verb: string) =>
            `${verb}: столбец ${item.x + 1}, строка ${item.y + 1}, размер ${item.w}×${item.h}`,
        [],
    );

    // ---------------------------------------------------------------- pointer drag

    const endDrag = useCallback((commit: boolean) => {
        const s = session.current;
        const v = live.current.view;
        session.current = null;
        document.body.classList.remove('dash-dragging');
        setView(null);
        if (!s || !s.started || !v) return;
        const item = v.preview.find((l) => l.i === s.id)!;
        const label = live.current.getItemLabel(item);
        if (commit && !layoutsEqual(v.preview, s.base)) {
            live.current.onLayoutChange(v.preview);
            setAnnouncement(describe(item, `«${label}» ${s.kind === 'move' ? 'перемещён' : 'изменён'}`));
        } else if (!commit) {
            setAnnouncement(`Перемещение «${label}» отменено`);
        }
    }, [describe]);

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            const s = session.current;
            if (!s) return;
            const dx = e.clientX - s.startX;
            const dy = e.clientY - s.startY;
            if (!s.started) {
                if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
                s.started = true;
                document.body.classList.add('dash-dragging');
            }
            e.preventDefault();
            const { cols, mode, gap, stepX, stepY } = live.current;
            const others = s.base.filter((l) => l.i !== s.id);
            let rect: Partial<LayoutItem>;
            if (s.kind === 'move') {
                const maxY = bottom(others) + (mode === 'free' ? 6 : 0);
                rect = {
                    x: Math.round((s.origin.left + dx) / stepX),
                    y: Math.min(maxY, Math.round((s.origin.top + dy) / stepY)),
                };
            } else {
                // px size = w·colWidth + (w−1)·gap  ⇒  w = (px + gap) / stepX
                rect = {
                    w: Math.round((s.origin.width + dx + gap) / stepX),
                    h: Math.round((s.origin.height + dy + gap) / stepY),
                };
            }
            const preview = placeItem(s.base, s.id, rect, cols, mode);
            setView({ id: s.id, kind: s.kind, dx, dy, preview });
        };
        const onUp = () => session.current && endDrag(true);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && session.current?.started) endDrag(false);
        };
        window.addEventListener('pointermove', onMove, { passive: false });
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            window.removeEventListener('keydown', onKey);
        };
    }, [endDrag]);

    const beginDrag = (e: ReactPointerEvent<HTMLElement>, item: T, kind: 'move' | 'resize') => {
        if (!editable || e.button !== 0) return;
        if (kind === 'move' && (e.target as Element).closest('[data-no-drag]')) return;
        if (kind === 'resize') e.stopPropagation();
        session.current = {
            id: item.i,
            kind,
            base: layout,
            startX: e.clientX,
            startY: e.clientY,
            started: false,
            origin: toPx(item),
        };
    };

    // ---------------------------------------------------------------- keyboard

    const onGripKeyDown = (e: ReactKeyboardEvent<HTMLElement>, item: T) => {
        if (!editable) return;
        const dirs: Record<string, [number, number]> = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
        };
        const dir = dirs[e.key];
        if (!dir) return;
        e.preventDefault();
        const resize = e.shiftKey;
        let next = layout;
        // In compact mode a one-row step may settle back to where it started —
        // keep stepping until the layout actually changes (or we run out of room).
        for (let step = 1; step <= Math.max(cols, bottom(layout) + 1); step++) {
            const rect = resize
                ? { w: item.w + dir[0] * step, h: item.h + dir[1] * step }
                : { x: item.x + dir[0] * step, y: item.y + dir[1] * step };
            if ((rect.x ?? 0) < 0 || (rect.y ?? 0) < 0) break;
            const candidate = placeItem(layout, item.i, rect, cols, mode);
            if (!layoutsEqual(candidate, layout)) {
                next = candidate;
                break;
            }
            if (dir[0] !== 0) break; // horizontal steps never "settle back"
        }
        const moved = next.find((l) => l.i === item.i)!;
        if (next === layout) {
            setAnnouncement(`«${getItemLabel(item)}»: дальше двигать некуда`);
            return;
        }
        onLayoutChange(next);
        setAnnouncement(describe(moved, `«${getItemLabel(item)}» ${resize ? 'изменён' : 'перемещён'}`));
    };

    // ---------------------------------------------------------------- render

    const shown = view?.preview ?? layout;
    const rows = Math.max(bottom(shown) + (view ? (mode === 'free' ? 4 : 1) : 0), 1);
    const height = rows * stepY - gap;
    const ordered = useMemo(() => sortByPosition(layout), [layout]);

    const gridStyle: CSSProperties = stacked
        ? {}
        : ({
              height,
              '--grid-step-x': `${stepX}px`,
              '--grid-step-y': `${stepY}px`,
              '--grid-gap': `${gap}px`,
          } as CSSProperties);

    return (
        <div
            ref={containerRef}
            className={[
                'dash-grid',
                editable && 'dash-grid_editable',
                view && 'dash-grid_dragging',
                stacked && 'dash-grid_stacked',
            ]
                .filter(Boolean)
                .join(' ')}
            style={gridStyle}
        >
            <p id={helpId} className="visually-hidden">
                Стрелки — переместить виджет, Shift + стрелки — изменить размер. Мышью: тяните за заголовок,
                размер — за правый нижний угол.
            </p>
            <div className="visually-hidden" role="status" aria-live="polite">
                {announcement}
            </div>

            {view && !stacked && (
                <div
                    className="dash-grid__placeholder"
                    style={toPx(view.preview.find((l) => l.i === view.id)!)}
                    aria-hidden
                />
            )}

            {width > 0 &&
                (stacked ? ordered : layout).map((item) => {
                    const isActive = view?.id === item.i;
                    let style: CSSProperties;
                    if (stacked) {
                        style = { height: item.h * rowHeight + (item.h - 1) * gap };
                    } else if (isActive && session.current) {
                        const o = session.current.origin;
                        style =
                            view!.kind === 'move'
                                ? { width: o.width, height: o.height, transform: `translate(${o.left + view!.dx}px, ${o.top + view!.dy}px)` }
                                : {
                                      width: Math.max(colWidth, o.width + view!.dx),
                                      height: Math.max(rowHeight, o.height + view!.dy),
                                      transform: `translate(${o.left}px, ${o.top}px)`,
                                  };
                    } else {
                        const p = toPx(shown.find((l) => l.i === item.i) ?? item);
                        style = { width: p.width, height: p.height, transform: `translate(${p.left}px, ${p.top}px)` };
                    }
                    return (
                        <div
                            key={item.i}
                            className={`dash-grid__item${isActive ? ' dash-grid__item_active' : ''}`}
                            style={style}
                        >
                            {renderItem(item, {
                                editable,
                                dragging: isActive,
                                dragAreaProps: { onPointerDown: (e) => beginDrag(e, item, 'move') },
                                gripProps: {
                                    onKeyDown: (e) => onGripKeyDown(e, item),
                                    'aria-describedby': helpId,
                                },
                            })}
                            {editable && (
                                <div
                                    className="dash-grid__resize"
                                    onPointerDown={(e) => beginDrag(e, item, 'resize')}
                                    title="Потяните, чтобы изменить размер"
                                    aria-hidden
                                />
                            )}
                        </div>
                    );
                })}
        </div>
    );
}
