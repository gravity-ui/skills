import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Icon } from '@gravity-ui/uikit';
import { Plus } from '@gravity-ui/icons';
import { WidgetDef, DashboardState } from './types';
import { WidgetCard } from './WidgetCard';

const CELL_W = 240;
const CELL_H = 144;
const GAP = 16;
const HEADER_H = 56;

const INITIAL_WIDGETS: WidgetDef[] = [
  { id: 'chart', title: 'CPU Load', col: 0, row: 0, colSpan: 2, rowSpan: 2 },
  { id: 'bars', title: 'Monthly Revenue', col: 2, row: 0, colSpan: 2, rowSpan: 2 },
  { id: 'donut', title: 'Disk Usage', col: 4, row: 0, colSpan: 1, rowSpan: 2 },
  { id: 'stats', title: 'Key Metrics', col: 0, row: 2, colSpan: 2, rowSpan: 2 },
  { id: 'tasks', title: 'Pending Tasks', col: 2, row: 2, colSpan: 2, rowSpan: 2 },
  { id: 'table', title: 'Server Status', col: 4, row: 2, colSpan: 1, rowSpan: 2 },
];

const WIDGET_POOL: Omit<WidgetDef, 'col' | 'row'>[] = [
  { id: 'chart', title: 'CPU Load', colSpan: 2, rowSpan: 2 },
  { id: 'bars', title: 'Monthly Revenue', colSpan: 2, rowSpan: 2 },
  { id: 'donut', title: 'Disk Usage', colSpan: 1, rowSpan: 2 },
  { id: 'stats', title: 'Key Metrics', colSpan: 2, rowSpan: 2 },
  { id: 'tasks', title: 'Pending Tasks', colSpan: 2, rowSpan: 2 },
  { id: 'table', title: 'Server Status', colSpan: 1, rowSpan: 2 },
];

function isOverlapping(a: WidgetDef, b: WidgetDef): boolean {
  return (
    a.col < b.col + b.colSpan &&
    a.col + a.colSpan > b.col &&
    a.row < b.row + b.rowSpan &&
    a.row + a.rowSpan > b.row
  );
}

function findFreeSpot(
  widgets: WidgetDef[],
  colSpan: number,
  rowSpan: number,
  columns: number,
): { col: number; row: number } {
  for (let row = 0; row < 50; row++) {
    for (let col = 0; col + colSpan <= columns; col++) {
      const candidate: WidgetDef = {
        id: '_candidate',
        title: '',
        col,
        row,
        colSpan,
        rowSpan,
      };
      if (!widgets.some((w) => isOverlapping(candidate, w))) {
        return { col, row };
      }
    }
  }
  return { col: 0, row: 0 };
}

export function Dashboard() {
  const columns = 5;
  const [widgets, setWidgets] = useState<WidgetDef[]>(INITIAL_WIDGETS);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const usedIds = new Set(widgets.map((w) => w.id));
  const availablePool = WIDGET_POOL.filter((p) => !usedIds.has(p.id));

  const handleDragStart = useCallback((id: string) => setDraggedId(id), []);

  const handleDragEnd = useCallback(() => {
    if (draggedId == null) return;
    // Swap positions
    if (dragOverId && dragOverId !== draggedId) {
      setWidgets((prev) => {
        const a = prev.find((w) => w.id === draggedId);
        const b = prev.find((w) => w.id === dragOverId);
        if (!a || !b) return prev;
        return prev.map((w) => {
          if (w.id === draggedId)
            return { ...w, col: b.col, row: b.row };
          if (w.id === dragOverId)
            return { ...w, col: a.col, row: a.row };
          return w;
        });
      });
    }
    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId, dragOverId]);

  const handleDragOver = useCallback((id: string) => {
    if (id !== draggedId) {
      setDragOverId(id);
    }
  }, [draggedId]);

  const handleDropOn = useCallback(
    (targetId: string) => {
      if (draggedId == null || draggedId === targetId) return;
      setWidgets((prev) => {
        const a = prev.find((w) => w.id === draggedId);
        const b = prev.find((w) => w.id === targetId);
        if (!a || !b) return prev;
        return prev.map((w) => {
          if (w.id === draggedId)
            return { ...w, col: b.col, row: b.row };
          if (w.id === targetId)
            return { ...w, col: a.col, row: a.row };
          return w;
        });
      });
    },
    [draggedId],
  );

  const handleRemove = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleAddWidget = useCallback(
    (poolDef: Omit<WidgetDef, 'col' | 'row'>) => {
      setWidgets((prev) => {
        const spot = findFreeSpot(prev, poolDef.colSpan, poolDef.rowSpan, columns);
        const newWidget: WidgetDef = { ...poolDef, ...spot };
        return [...prev, newWidget];
      });
    },
    [columns],
  );

  // Compute container height
  const maxRow = widgets.reduce((max, w) => Math.max(max, w.row + w.rowSpan), 0);
  const containerHeight = maxRow * (CELL_H + GAP) - GAP;

  return (
    <div style={{ padding: 24, height: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {availablePool.map((p) => (
            <Button key={p.id} view="outlined" size="s" onClick={() => handleAddWidget(p)}>
              <Icon data={Plus} size={14} />
              <span style={{ marginLeft: 4 }}>{p.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          flex: 1,
          overflow: 'auto',
          minHeight: containerHeight + 32,
        }}
      >
        {widgets.map((w) => (
          <WidgetCard
            key={w.id}
            widget={w}
            columns={columns}
            cellW={CELL_W}
            cellH={CELL_H}
            gap={GAP}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDropOn}
            onDragEnd={handleDragEnd}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}
