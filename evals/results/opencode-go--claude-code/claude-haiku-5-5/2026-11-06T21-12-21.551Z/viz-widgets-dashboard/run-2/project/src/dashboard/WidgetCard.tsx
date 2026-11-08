import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Button, Text } from '@gravity-ui/uikit';
import type { PxBox } from './layout';
import type { WidgetDef } from './widgets';

interface Props {
  spec: WidgetDef;
  box: PxBox;
  dragging: boolean;
  resizing: boolean;
  onGripDown: (e: PointerEvent<HTMLElement>) => void;
  onResizeDown: (e: PointerEvent<HTMLElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

export function WidgetCard({ spec, box, dragging, resizing, onGripDown, onResizeDown, onKeyDown }: Props) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const titleId = `${spec.id}-title`;
  const showTable = view === 'table' && spec.table !== undefined;

  const className = ['dash-widget', dragging && 'is-dragging', resizing && 'is-resizing'].filter(Boolean).join(' ');

  return (
    <section
      className={className}
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
      aria-labelledby={titleId}
    >
      <header className="dash-widget__head">
        <div
          className="dash-widget__grip"
          tabIndex={0}
          onPointerDown={onGripDown}
          onKeyDown={onKeyDown}
          title="Перетащите, чтобы переставить. Стрелки — переместить, Shift + стрелки — размер"
        >
          <Text as="h2" variant="subheader-2" id={titleId} className="dash-widget__title">
            {spec.title}
          </Text>
          {spec.subtitle && (
            <Text as="p" variant="caption-2" color="secondary" className="dash-widget__subtitle">
              {spec.subtitle}
            </Text>
          )}
        </div>
        {spec.table !== undefined && (
          <Button size="s" view="flat" onClick={() => setView((v) => (v === 'chart' ? 'table' : 'chart'))}>
            {showTable ? 'График' : 'Таблица'}
          </Button>
        )}
      </header>

      <div className="dash-widget__body">{showTable ? spec.table : spec.body}</div>

      <div className="dash-widget__resize" aria-hidden="true" onPointerDown={onResizeDown} />
    </section>
  );
}
