import { useCallback, useState } from 'react';
import { Button, Icon, Text } from '@gravity-ui/uikit';
import { CircleXmark } from '@gravity-ui/icons';
import type { WidgetDef } from './widgets/types';
import { MetricWidget } from './widgets/MetricWidget';
import { ChartWidget } from './widgets/ChartWidget';
import { ListWidget } from './widgets/ListWidget';
import { ProgressWidget } from './widgets/ProgressWidget';
import { TextWidget } from './widgets/TextWidget';

const COLS = 6;
const GAP = 12;
const HEADER_H = 48;

function renderWidget(w: WidgetDef) {
  switch (w.kind) {
    case 'metric':
      return <MetricWidget {...(w.data as any)} />;
    case 'chart':
      return <ChartWidget {...(w.data as any)} />;
    case 'list':
      return <ListWidget {...(w.data as any)} />;
    case 'progress':
      return <ProgressWidget {...(w.data as any)} />;
    case 'text':
      return <TextWidget {...(w.data as any)} />;
    default:
      return null;
  }
}

interface DashboardProps {
  widgets: WidgetDef[];
  onChange: (widgets: WidgetDef[]) => void;
}

export function Dashboard({ widgets, onChange }: DashboardProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);

  const handleDragStart = useCallback((id: string) => {
    setDragId(id);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragId && dragId !== id) {
        setDragOverId(id);
      }
    },
    [dragId],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      setDragOverId(null);
      setDragId(null);
      if (!dragId || dragId === targetId) return;

      const srcIdx = widgets.findIndex((w) => w.id === dragId);
      const tgtIdx = widgets.findIndex((w) => w.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1) return;

      const next = [...widgets];
      const src = next[srcIdx];
      const tgt = next[tgtIdx];

      // Swap positions
      const tmpCol = src.col;
      const tmpRow = src.row;
      const tmpColSpan = src.colSpan;
      const tmpRowSpan = src.rowSpan;

      src.col = tgt.col;
      src.row = tgt.row;
      src.colSpan = tgt.colSpan;
      src.rowSpan = tgt.rowSpan;

      tgt.col = tmpCol;
      tgt.row = tmpRow;
      tgt.colSpan = tmpColSpan;
      tgt.rowSpan = tmpRowSpan;

      onChange(next);
    },
    [dragId, widgets, onChange],
  );

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDragOverId(null);
  }, []);

  const removeWidget = useCallback(
    (id: string) => {
      onChange(widgets.filter((w) => w.id !== id));
    },
    [widgets, onChange],
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--g-color-base-background)' }}>
      {/* header */}
      <div
        style={{
          height: HEADER_H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--g-color-line-generic)',
          flexShrink: 0,
        }}
      >
        <Text variant="header-1">Дашборд</Text>
        <Button view={editMode ? 'action' : 'normal'} onClick={() => setEditMode((v) => !v)}>
          {editMode ? 'Режим редактирования' : 'Режим просмотра'}
        </Button>
      </div>

      {/* grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridAutoRows: '120px',
            gap: GAP,
          }}
        >
          {widgets.map((w) => {
            const isDrag = dragId === w.id;
            const isOver = dragOverId === w.id;
            return (
              <div
                key={w.id}
                draggable={editMode}
                onDragStart={() => handleDragStart(w.id)}
                onDragOver={(e) => handleDragOver(e, w.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, w.id)}
                onDragEnd={handleDragEnd}
                style={{
                  gridColumn: `${w.col} / span ${w.colSpan}`,
                  gridRow: `${w.row} / span ${w.rowSpan}`,
                  opacity: isDrag ? 0.4 : 1,
                  outline: isOver ? '2px dashed var(--g-color-line-brand)' : undefined,
                  outlineOffset: 2,
                  borderRadius: 8,
                  position: 'relative',
                  transition: 'opacity 0.15s ease',
                  cursor: editMode ? 'grab' : 'default',
                  minHeight: 0,
                }}
              >
                {editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWidget(w.id);
                    }}
                    title="Удалить виджет"
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      zIndex: 2,
                      background: 'var(--g-color-base-background)',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      padding: 2,
                      lineHeight: 0,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Icon data={CircleXmark} size={18} fill="var(--g-color-text-secondary)" />
                  </button>
                )}
                {/* title bar */}
                <div
                  style={{
                    background: 'var(--g-color-base-generic)',
                    borderRadius: '8px 8px 0 0',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="caption-2" color="secondary">
                    {w.title}
                  </Text>
                </div>
                <div style={{ height: 'calc(100% - 28px)' }}>{renderWidget(w)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
