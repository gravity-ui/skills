import React, { useCallback, useState } from 'react';
import GridLayout, { verticalCompactor } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { Card, Text, Button } from '@gravity-ui/uikit';
import { WIDGETS, WidgetContent, type WidgetDefinition } from './widgets';
import 'react-grid-layout/css/styles.css';

const COLS = 12;
const ROW_HEIGHT = 80;
const CONTAINER_PADDING: [number, number] = [16, 16];
const MARGIN: [number, number] = [12, 12];
const GRID_WIDTH = 1200;

const INITIAL_LAYOUT: Layout = [
  { i: 'stats-1', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'stats-2', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'chart-1', x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
  { i: 'chart-2', x: 0, y: 2, w: 6, h: 4, minW: 3, minH: 3 },
  { i: 'table-1', x: 6, y: 4, w: 6, h: 4, minW: 3, minH: 3 },
  { i: 'text-1', x: 0, y: 6, w: 4, h: 3, minW: 2, minH: 2 },
];

const widgetMap = new Map<string, WidgetDefinition>();
WIDGETS.forEach((w) => widgetMap.set(w.id, w));

export function App() {
  const [layout, setLayout] = useState<Layout>(INITIAL_LAYOUT);

  const handleLayoutChange = useCallback((next: Layout) => {
    setLayout(next);
  }, []);

  const handleAddRandomWidget = () => {
    const existing = new Set(layout.map((item) => item.i));
    const available = WIDGETS.filter((w) => !existing.has(w.id));
    if (available.length === 0) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    const newItem = {
      i: pick.id,
      x: 0,
      y: Infinity,
      w: pick.type === 'stats' ? 3 : pick.type === 'text' ? 4 : 6,
      h: pick.type === 'stats' ? 2 : pick.type === 'text' ? 2 : 4,
      minW: 2,
      minH: 2,
    };
    setLayout((prev) => [...prev, newItem]);
  };

  const handleRemoveWidget = (id: string) => {
    setLayout((prev) => prev.filter((item) => item.i !== id));
  };

  return (
    <div style={{ padding: '20px 24px', minHeight: '100vh' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Text variant="display-1" style={{ fontWeight: 600 }}>
          Dashboard
        </Text>
        <Button view="action" size="m" onClick={handleAddRandomWidget}>
          + Add Widget
        </Button>
      </div>

      <GridLayout
        className="layout"
        layout={layout}
        width={GRID_WIDTH}
        gridConfig={{ cols: COLS, rowHeight: ROW_HEIGHT, margin: MARGIN, containerPadding: CONTAINER_PADDING }}
        dragConfig={{ enabled: true, handle: '.widget-drag-handle' }}
        resizeConfig={{ enabled: true }}
        autoSize
        compactor={verticalCompactor}
        onLayoutChange={handleLayoutChange}
      >
        {layout.map((item) => {
          const widget = widgetMap.get(item.i);
          if (!widget) return null;

          return (
            <div key={item.i}>
              <Card
                view="raised"
                size="m"
                type="container"
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div
                  className="widget-drag-handle"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--g-color-line-generic)',
                    cursor: 'grab',
                    userSelect: 'none',
                    flexShrink: 0,
                  }}
                >
                  <Text variant="subheader-2" style={{ fontWeight: 600 }}>
                    {widget.title}
                  </Text>
                  <Button
                    view="flat"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveWidget(item.i);
                    }}
                  >
                    ✕
                  </Button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', padding: '10px 14px', minHeight: 0 }}>
                  <WidgetContent widget={widget} />
                </div>
              </Card>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
}
