import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@gravity-ui/uikit';
import { WidgetContent } from './widgetContent';
import './dashboard.css';

type WidgetType = 'metric' | 'chart' | 'status' | 'tasks';

type Widget = {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
};

type DragMode = 'move' | 'resize';

type Interaction = {
  widgetId: string;
  mode: DragMode;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  originWidth: number;
  originHeight: number;
};

const GRID_COLUMNS = 8;
const ROW_HEIGHT = 76;
const GAP = 14;
const STORAGE_KEY = 'viz-widgets-dashboard/v1';

const WIDGET_META: Record<WidgetType, { title: string; label: string; width: number; height: number }> = {
  metric: { title: 'Активные сессии', label: 'Метрика', width: 2, height: 2 },
  chart: { title: 'Трафик по дням', label: 'График', width: 4, height: 3 },
  status: { title: 'Прогресс релиза', label: 'Статусы', width: 3, height: 2 },
  tasks: { title: 'Задачи', label: 'Список', width: 2, height: 2 },
};

const INITIAL_WIDGETS: Widget[] = [
  { id: 'metric', type: 'metric', x: 0, y: 0, width: 2, height: 2 },
  { id: 'chart', type: 'chart', x: 2, y: 0, width: 4, height: 3 },
  { id: 'status', type: 'status', x: 0, y: 2, width: 3, height: 2 },
  { id: 'tasks', type: 'tasks', x: 6, y: 0, width: 2, height: 2 },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isWidget(value: unknown): value is Widget {
  if (!value || typeof value !== 'object') return false;
  const widget = value as Record<string, unknown>;
  return (
    typeof widget.id === 'string' &&
    typeof widget.type === 'string' &&
    Object.prototype.hasOwnProperty.call(WIDGET_META, widget.type) &&
    isNumber(widget.x) &&
    isNumber(widget.y) &&
    isNumber(widget.width) &&
    isNumber(widget.height)
  );
}

function overlaps(left: Widget, right: Widget) {
  return (
    left.x < right.x + right.width &&
    left.x + left.width > right.x &&
    left.y < right.y + right.height &&
    left.y + left.height > right.y
  );
}

function canPlace(widgets: Widget[], candidate: Widget, ignoreId?: string) {
  return !widgets.some((widget) => widget.id !== ignoreId && overlaps(widget, candidate));
}

function placeWidget(widgets: Widget[], candidate: Widget, ignoreId?: string): Widget {
  for (let y = 0; y < 24; y += 1) {
    for (let x = 0; x <= GRID_COLUMNS - candidate.width; x += 1) {
      const placed = { ...candidate, x, y };
      if (canPlace(widgets, placed, ignoreId)) return placed;
    }
  }

  return { ...candidate, x: 0, y: 24 };
}

function normalizeWidgets(widgets: Widget[]) {
  return widgets.reduce<Widget[]>((normalized, widget) => {
    const meta = WIDGET_META[widget.type];
    const width = clamp(widget.width, 1, GRID_COLUMNS);
    const height = clamp(widget.height, 1, 12);
    const x = clamp(widget.x, 0, GRID_COLUMNS - width);
    const y = Math.max(0, widget.y);
    return [...normalized, placeWidget(normalized, { ...widget, x, y, width, height })];
  }, []);
}

function loadWidgets(): Widget[] {
  if (typeof window === 'undefined') return INITIAL_WIDGETS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_WIDGETS;
    const saved: unknown = JSON.parse(raw);
    if (!Array.isArray(saved) || !saved.every(isWidget)) return INITIAL_WIDGETS;
    return normalizeWidgets(saved);
  } catch {
    return INITIAL_WIDGETS;
  }
}

export function Dashboard() {
  const [widgets, setWidgets] = useState<Widget[]>(loadWidgets);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const gridRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch {
      /* localStorage may be unavailable in private browsing modes. */
    }
  }, [widgets]);

  useEffect(() => {
    if (!draggingId) return;

    const getCellSize = () => {
      const grid = gridRef.current;
      const gridWidth = grid?.clientWidth ?? window.innerWidth - 48;
      const columnWidth = (gridWidth - GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
      return { columnWidth, rowHeight: ROW_HEIGHT + GAP };
    };

    const handleMove = (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction || interaction.widgetId !== draggingId) return;

      const deltaX = event.clientX - interaction.startX;
      const deltaY = event.clientY - interaction.startY;
      const { columnWidth, rowHeight } = getCellSize();

      if (interaction.mode === 'move') {
        const nextX = clamp(Math.round(interaction.originX + deltaX / columnWidth), 0, GRID_COLUMNS - interaction.originWidth);
        const nextY = Math.max(0, Math.round(interaction.originY + deltaY / rowHeight));

        setWidgets((current) => {
          const widget = current.find((item) => item.id === interaction.widgetId);
          if (!widget) return current;
          const candidate = { ...widget, x: nextX, y: nextY };
          if (candidate.x === widget.x && candidate.y === widget.y) return current;
          return canPlace(current, candidate, candidate.id) ? current.map((item) => (item.id === candidate.id ? candidate : item)) : current;
        });
        return;
      }

      const nextWidth = clamp(
        interaction.originWidth + Math.round(deltaX / columnWidth),
        1,
        GRID_COLUMNS - interaction.originX,
      );
      const nextHeight = clamp(interaction.originHeight + Math.round(deltaY / rowHeight), 1, 12);

      setWidgets((current) => {
        const widget = current.find((item) => item.id === interaction.widgetId);
        if (!widget) return current;
        const candidate = { ...widget, width: nextWidth, height: nextHeight };
        if (candidate.width === widget.width && candidate.height === widget.height) return current;
        return canPlace(current, candidate, candidate.id) ? current.map((item) => (item.id === candidate.id ? candidate : item)) : current;
      });
    };

    const handleEnd = () => {
      interactionRef.current = null;
      setDraggingId(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };
  }, [draggingId]);

  const startDrag = useCallback((event: React.PointerEvent, widget: Widget) => {
    if (event.button !== 0) return;
    event.preventDefault();
    interactionRef.current = {
      widgetId: widget.id,
      mode: 'move',
      startX: event.clientX,
      startY: event.clientY,
      originX: widget.x,
      originY: widget.y,
      originWidth: widget.width,
      originHeight: widget.height,
    };
    setDraggingId(widget.id);
  }, []);

  const startResize = useCallback((event: React.PointerEvent, widget: Widget) => {
    if (event.button !== 0) return;
    event.preventDefault();
    interactionRef.current = {
      widgetId: widget.id,
      mode: 'resize',
      startX: event.clientX,
      startY: event.clientY,
      originX: widget.x,
      originY: widget.y,
      originWidth: widget.width,
      originHeight: widget.height,
    };
    setDraggingId(widget.id);
  }, []);

  const addWidget = useCallback((type: WidgetType) => {
    const meta = WIDGET_META[type];
    setWidgets((current) => {
      const id = `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      return [...current, placeWidget(current, { id, type, x: 0, y: 0, width: meta.width, height: meta.height })];
    });
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets((current) => {
      const remaining = current.filter((widget) => widget.id !== id);
      return remaining.length ? remaining : [];
    });
  }, []);

  const rows = useMemo(() => Math.max(...widgets.map((widget) => widget.y + widget.height), 1), [widgets]);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Операционный дашборд</h1>
          <p className="dashboard__subtitle">Перетаскивайте виджеты по сетке и меняйте их размер за уголок.</p>
        </div>
        <div className="dashboard__palette">
          {Object.entries(WIDGET_META).map(([type, meta]) => (
            <Button key={type} size="m" view="outlined" onClick={() => addWidget(type as WidgetType)}>
              + {meta.label}
            </Button>
          ))}
          <Button size="m" view="flat" onClick={() => setWidgets(INITIAL_WIDGETS)}>
            Сбросить
          </Button>
        </div>
      </header>

      <main
        ref={gridRef}
        className="dashboard__grid"
        style={{
          ['--dashboard-columns' as string]: GRID_COLUMNS,
          ['--dashboard-row-height' as string]: `${ROW_HEIGHT}px`,
          ['--dashboard-gap' as string]: `${GAP}px`,
          gridTemplateRows: `repeat(${rows + 1}, var(--dashboard-row-height))`,
        }}
      >
        {widgets.length === 0 ? (
          <div className="dashboard-widget__empty">Добавьте виджет с помощью кнопок выше.</div>
        ) : (
          widgets.map((widget) => (
            <section
              key={widget.id}
              className={`dashboard-widget${draggingId === widget.id ? ' dashboard-widget--dragging' : ''}`}
              style={{
                gridColumn: `${widget.x + 1} / span ${widget.width}`,
                gridRow: `${widget.y + 1} / span ${widget.height}`,
              }}
              aria-label={WIDGET_META[widget.type].title}
            >
              <header className="dashboard-widget__handle" onPointerDown={(event) => startDrag(event, widget)}>
                <span className="dashboard-widget__drag-icon" />
                <span className="dashboard-widget__title">{WIDGET_META[widget.type].title}</span>
                <button
                  type="button"
                  className="dashboard-widget__remove"
                  onClick={() => removeWidget(widget.id)}
                  aria-label={`Удалить ${WIDGET_META[widget.type].title}`}
                >
                  ✕
                </button>
              </header>
              <div className="dashboard-widget__body">
                <div className="dashboard-widget__content">
                  <WidgetContent type={widget.type} />
                </div>
              </div>
              <button
                type="button"
                className="dashboard-widget__resize"
                onPointerDown={(event) => startResize(event, widget)}
                aria-label={`Изменить размер ${WIDGET_META[widget.type].title}`}
              />
            </section>
          ))
        )}
      </main>

      <footer className="dashboard__footer">Раскладка сохраняется локально в вашем браузере.</footer>
    </div>
  );
}
