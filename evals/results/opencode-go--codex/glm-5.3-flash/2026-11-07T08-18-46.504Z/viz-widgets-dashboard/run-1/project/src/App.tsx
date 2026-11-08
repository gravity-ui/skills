import { useCallback, useState } from 'react';

import { DashboardGrid } from './DashboardGrid';
import { defaultLayouts, widgetDefinitions } from './dashboardData';
import type { WidgetId, WidgetLayout } from './dashboardData';
import './dashboard.css';

export function App() {
  const [layouts, setLayouts] = useState<WidgetLayout[]>(defaultLayouts);

  const addWidget = useCallback((widgetId: WidgetId) => {
    setLayouts((currentLayouts) => {
      if (currentLayouts.some((layout) => layout.id === widgetId)) {
        return currentLayouts;
      }

      const definition = widgetDefinitions[widgetId];
      const nextY = currentLayouts.reduce(
        (bottom, layout) => Math.max(bottom, layout.y + layout.height),
        0,
      );
      return [
        ...currentLayouts,
        { id: widgetId, x: 0, y: nextY, width: definition.defaultWidth, height: definition.defaultHeight },
      ];
    });
  }, []);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Team dashboard</h1>
          <p className="dashboard-subtitle">
            Drag widget headers to move them, use the corner handle to resize, and add widgets from the palette.
          </p>
        </div>
        <div className="dashboard-actions">
          <button
            className="g-button g-button_view_action g-button_size_m"
            type="button"
            onClick={() => setLayouts(defaultLayouts)}
          >
            <span className="g-button__text">Reset layout</span>
          </button>
        </div>
      </header>

      <section>
        <div className="palette">
          {Object.entries(widgetDefinitions).map(([widgetId, definition]) => {
            const isPresent = layouts.some((layout) => layout.id === widgetId);
            return (
              <div
                className="palette-item"
                key={widgetId}
                style={{ ['--palette-color' as string]: definition.color }}
                title={isPresent ? 'Already added' : 'Add to dashboard'}
              >
                <button
                  className="palette-label"
                  disabled={isPresent}
                  type="button"
                  onClick={() => addWidget(widgetId as WidgetId)}
                >
                  <span className="palette-accent" />
                  {definition.title}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <DashboardGrid layouts={layouts} onLayoutsChange={setLayouts} />
    </main>
  );
}
