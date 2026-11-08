import { useCallback, useMemo, useState } from 'react';
import GridLayout, { type Layout } from 'react-grid-layout';
import './dashboard.css';
import { WIDGET_DEFS, buildInitialLayout, getWidgetComponent } from './widgets/registry';
import type { WidgetDef } from './widgets/types';
import { Text } from '@gravity-ui/uikit';

const widgetDefsById = new Map<string, WidgetDef>();
for (const def of WIDGET_DEFS) {
  widgetDefsById.set(def.id, def);
}

export function Dashboard() {
  const [layout, setLayout] = useState<Layout[]>(() => buildInitialLayout());

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
  }, []);

  const children = useMemo(
    () =>
      layout.map((item) => {
        const def = widgetDefsById.get(item.i);
        if (!def) return null;
        const Component = getWidgetComponent(def);
        return (
          <div key={item.i} style={{ overflow: 'hidden' }}>
            <Component id={def.id} />
          </div>
        );
      }),
    [layout],
  );

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Text variant="header-1" style={{ marginBottom: 24 }}>
        Dashboard
      </Text>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={64}
        width={1350}
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
        margin={[16, 16]}
        isResizable
        isDraggable
        useCSSTransforms
      >
        {children}
      </GridLayout>
    </div>
  );
}
