import React, { useCallback, useRef, useState } from 'react';
import { Card, Icon, Button } from '@gravity-ui/uikit';
import { Xmark, Grip } from '@gravity-ui/icons';
import { WidgetDef } from './types';
import { WidgetContent } from './WidgetContent';

interface WidgetCardProps {
  widget: WidgetDef;
  columns: number;
  cellW: number;
  cellH: number;
  gap: number;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
  onRemove: (id: string) => void;
}

export function WidgetCard({
  widget,
  columns,
  cellW,
  cellH,
  gap,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
}: WidgetCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const left = widget.col * (cellW + gap);
  const top = widget.row * (cellH + gap);
  const width = widget.colSpan * cellW + (widget.colSpan - 1) * gap;
  const height = widget.rowSpan * cellH + (widget.rowSpan - 1) * gap;

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', widget.id);
      onDragStart(widget.id);
      // Hide default ghost
      const ghost = document.createElement('div');
      ghost.style.display = 'none';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);
      setTimeout(() => document.body.removeChild(ghost), 0);
    },
    [widget.id, onDragStart],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOver(true);
      onDragOver(widget.id);
    },
    [widget.id, onDragOver],
  );

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      onDrop(widget.id);
      onDragEnd();
    },
    [widget.id, onDrop, onDragEnd],
  );

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        transition: 'left 0.15s ease, top 0.15s ease',
        cursor: 'grab',
      }}
    >
      <Card
        style={{
          height: '100%',
          boxSizing: 'border-box',
          outline: dragOver ? '2px solid var(--g-color-base-brand)' : undefined,
          backgroundColor: dragOver ? 'var(--g-color-base-generic-hover)' : undefined,
        }}
        type="container"
        view="raised"
        size="m"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderBottom: '1px solid var(--g-color-line-generic)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ cursor: 'grab', display: 'flex' }}>
              <Icon data={Grip} size={14} />
            </span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{widget.title}</span>
          </div>
          <Button
            view="flat"
            size="s"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widget.id);
            }}
          >
            <Icon data={Xmark} size={14} />
          </Button>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <WidgetContent widget={widget} />
        </div>
      </Card>
    </div>
  );
}
