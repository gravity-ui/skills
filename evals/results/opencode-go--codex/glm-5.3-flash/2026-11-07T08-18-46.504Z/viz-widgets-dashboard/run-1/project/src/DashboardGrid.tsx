import { useCallback, useMemo, useRef, useState } from 'react';

import type { WidgetId, WidgetLayout } from './dashboardData';
import { widgetDefinitions } from './dashboardData';

const COLUMNS = 12;
const ROW_HEIGHT = 72;
const GAP = 16;

type DraftState = {
  id: WidgetId;
  x: number;
  y: number;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeLayouts(layouts: WidgetLayout[]): WidgetLayout[] {
  const sorted = [...layouts].sort((left, right) => left.y - right.y || left.x - right.x);
  const topEdge = new Map<number, number>();
  let lowestBottom = 0;

  for (const layout of sorted) {
    const width = Math.min(layout.width, COLUMNS);
    const x = clamp(layout.x, 0, COLUMNS - width);
    let y = Math.max(0, layout.y);
    const oldTop = topEdge.get(x) ?? topEdge.get(x + width - 1) ?? 0;
    y = Math.max(y, oldTop);

    for (let column = x; column < x + width; column += 1) {
      topEdge.set(column, y + layout.height);
    }

    lowestBottom = Math.max(lowestBottom, y + layout.height);
    layout.x = x;
    layout.y = y;
    layout.width = width;
  }

  if (sorted.length === 0) {
    return [];
  }

  return sorted.map((layout) => ({
    ...layout,
    y: lowestBottom - layout.height >= layout.y ? layout.y : lowestBottom - layout.height,
  }));
}

type DashboardGridProps = {
  layouts: WidgetLayout[];
  onLayoutsChange: (layouts: WidgetLayout[]) => void;
};

export function DashboardGrid({ layouts, onLayoutsChange }: DashboardGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [dragMode, setDragMode] = useState<'move' | 'resize'>('move');

  const maxBottom = layouts.reduce((bottom, layout) => Math.max(bottom, layout.y + layout.height), 0);

  const moveLayout = useCallback(
    (movedLayout: WidgetLayout, allLayouts: WidgetLayout[]) => {
      const updated = allLayouts.map((layout) =>
        layout.id === movedLayout.id ? movedLayout : layout,
      );
      onLayoutsChange(normalizeLayouts(updated));
    },
    [onLayoutsChange],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const grid = gridRef.current;
      if (!grid || !draft) {
        return;
      }

      const bounds = grid.getBoundingClientRect();
      const effectiveColumnWidth = (bounds.width - GAP * (COLUMNS - 1)) / COLUMNS;
      const pointerX = event.clientX - bounds.left;
      const pointerY = event.clientY - bounds.top;

      if (dragMode === 'move') {
        const width = Math.min(draft.width, COLUMNS);
        const x = clamp(
          Math.round((pointerX - dragOffsetRef.current.x) / (effectiveColumnWidth + GAP)),
          0,
          COLUMNS - width,
        );
        const y = Math.max(0, Math.round((pointerY - dragOffsetRef.current.y) / (ROW_HEIGHT + GAP)));
        setDraft({ ...draft, x, y, width });
        moveLayout({ ...draft, x, y, width }, layouts);
        return;
      }

      const deltaX = pointerX - resizeStartRef.current.x;
      const deltaY = pointerY - resizeStartRef.current.y;
      const width = clamp(
        Math.round((resizeStartRef.current.width + deltaX) / (effectiveColumnWidth + GAP)),
        1,
        COLUMNS - draft.x,
      );
      const height = clamp(
        Math.round((resizeStartRef.current.height + deltaY) / (ROW_HEIGHT + GAP)),
        2,
        12,
      );
      setDraft({ ...draft, width, height });
      moveLayout({ ...draft, width, height }, layouts);
    },
    [dragMode, draft, layouts, moveLayout],
  );

  const stopInteraction = useCallback(() => {
    setDraft(null);
    setDragMode('move');
  }, []);

  const startMove = (layout: WidgetLayout, event: React.PointerEvent<HTMLDivElement>) => {
    const grid = gridRef.current;
    if (!grid) return;

    const bounds = grid.getBoundingClientRect();
    const effectiveColumnWidth = (bounds.width - GAP * (COLUMNS - 1)) / COLUMNS;
    dragOffsetRef.current = {
      x: event.clientX - bounds.left - layout.x * (effectiveColumnWidth + GAP),
      y: event.clientY - bounds.top - layout.y * (ROW_HEIGHT + GAP),
    };
    setDragMode('move');
    setDraft({ ...layout });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const startResize = (layout: WidgetLayout, event: React.PointerEvent<HTMLElement>) => {
    const grid = gridRef.current;
    if (!grid) return;

    const bounds = grid.getBoundingClientRect();
    const effectiveColumnWidth = (bounds.width - GAP * (COLUMNS - 1)) / COLUMNS;
    resizeStartRef.current = {
      x: event.clientX - layout.x * (effectiveColumnWidth + GAP),
      y: event.clientY - layout.y * (ROW_HEIGHT + GAP),
      width: layout.width * (effectiveColumnWidth + GAP),
      height: layout.height * (ROW_HEIGHT + GAP),
    };
    setDragMode('resize');
    setDraft({ ...layout });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  if (layouts.length === 0) {
    return (
      <div className="grid-empty">
        Drag widgets here from the palette above, or click one to add it.
      </div>
    );
  }

  return (
    <div
      className={`grid${draft ? ' is-target' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerUp={stopInteraction}
      onPointerCancel={stopInteraction}
      ref={gridRef}
    >
      {layouts.map((layout) => {
        const definition = widgetDefinitions[layout.id];
        const isDrafting = draft?.id === layout.id;
        const currentLayout = isDrafting && draft ? draft : layout;

        return (
          <section
            className={`widget${isDrafting ? ' is-dragging' : ''}`}
            key={layout.id}
            style={{
              gridColumn: `${currentLayout.x + 1} / span ${currentLayout.width}`,
              gridRow: `${currentLayout.y + 1} / span ${currentLayout.height}`,
            }}
          >
            <div
              className="widget-header"
              onPointerDown={(event) => startMove(layout, event)}
            >
              <span className="widget-title">{definition.title}</span>
              <div className="widget-header-actions">
                <button
                  type="button"
                  className="g-button g-button_view_plain g-button_size_s"
                  title="Resize"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    startResize(layout, event);
                  }}
                >
                  <span className="g-button__text">Size</span>
                </button>
                <button
                  type="button"
                  className="g-button g-button_view_plain g-button_size_s"
                  title="Remove"
                  onClick={() => onLayoutsChange(layouts.filter((item) => item.id !== layout.id))}
                >
                  <span className="g-button__text">Close</span>
                </button>
              </div>
            </div>
            <div className="widget-content">{definition.content}</div>
            <div
              className="resize-handle"
              onPointerDown={(event) => {
                event.stopPropagation();
                startResize(layout, event);
              }}
            />
          </section>
        );
      })}
      <div style={{ gridColumn: '1 / -1', gridRow: maxBottom + 1, minHeight: 0 }} />
    </div>
  );
}
