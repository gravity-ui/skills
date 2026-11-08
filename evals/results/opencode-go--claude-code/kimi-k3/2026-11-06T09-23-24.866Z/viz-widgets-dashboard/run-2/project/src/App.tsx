import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, DropdownMenu, Icon, SegmentedRadioGroup, Switch, ThemeProvider } from '@gravity-ui/uikit';
import { ArrowRotateLeft, Moon, Plus, Sun } from '@gravity-ui/icons';

import { GridLayout, compact, type GridItem, type GridMeta } from './grid';
import { WIDGET_META, WidgetContent, type WidgetId } from './widgets';
import { getDashboardData, type RangeKey } from './data';
import './viz.css';

const ALL_IDS = Object.keys(WIDGET_META) as WidgetId[];
const LS_KEY = 'viz-dash-layout-v1';

const GRID_META: Record<string, GridMeta> = Object.fromEntries(
  ALL_IDS.map((id) => [id, { minW: WIDGET_META[id].minW, minH: WIDGET_META[id].minH }]),
);

function defaultItems(): GridItem[] {
  return ALL_IDS.map((id) => ({ id, ...WIDGET_META[id].def }));
}

function loadState(): { items: GridItem[]; hidden: WidgetId[] } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as { items?: GridItem[]; hidden?: string[] };
      if (Array.isArray(p.items) && Array.isArray(p.hidden)) {
        const items = p.items.filter(
          (i) => i && ALL_IDS.includes(i.id as WidgetId) && i.w > 0 && i.h > 0,
        );
        const hidden = p.hidden.filter((h): h is WidgetId => ALL_IDS.includes(h as WidgetId));
        if (items.length > 0) return { items, hidden };
      }
    }
  } catch {
    /* corrupted storage — fall back to defaults */
  }
  return { items: defaultItems(), hidden: [] };
}

export function App() {
  const [{ items, hidden }, setState] = useState(loadState);
  const [range, setRange] = useState<RangeKey>('30');
  const [dark, setDark] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false),
  );

  const data = useMemo(() => getDashboardData(range), [range]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ items, hidden }));
    } catch {
      /* storage may be unavailable */
    }
  }, [items, hidden]);

  const onChange = useCallback(
    (next: GridItem[]) => setState((s) => ({ ...s, items: next })),
    [],
  );

  const removeWidget = useCallback(
    (id: string) =>
      setState((s) => ({
        items: s.items.filter((i) => i.id !== id),
        hidden: [...s.hidden, id as WidgetId],
      })),
    [],
  );

  const addWidget = useCallback(
    (id: WidgetId) =>
      setState((s) => {
        const bottom = s.items.reduce((m, i) => Math.max(m, i.y + i.h), 0);
        return {
          items: compact([...s.items, { id, ...WIDGET_META[id].def, y: bottom }]),
          hidden: s.hidden.filter((h) => h !== id),
        };
      }),
    [],
  );

  const resetLayout = useCallback(() => setState({ items: defaultItems(), hidden: [] }), []);

  return (
    <ThemeProvider theme={dark ? 'dark' : 'light'} scoped>
      <div className="dash">
        <header className="dash__header">
          <div>
            <h1 className="dash__title">Product overview</h1>
            <p className="dash__subtitle">
              Drag widgets by their header, resize from the corner — the layout is yours.
            </p>
          </div>
          <div className="dash__controls">
            <SegmentedRadioGroup
              size="m"
              value={range}
              onUpdate={(v) => setRange(v as RangeKey)}
              aria-label="Date range"
              options={[
                { value: '7', content: '7 days' },
                { value: '30', content: '30 days' },
                { value: '90', content: '90 days' },
              ]}
            />
            <DropdownMenu
              disabled={hidden.length === 0}
              items={hidden.map((id) => ({
                action: () => addWidget(id),
                text: WIDGET_META[id].title,
              }))}
              renderSwitcher={({ onClick, onKeyDown }) => (
                <Button view="outlined" onClick={onClick} onKeyDown={onKeyDown} disabled={hidden.length === 0}>
                  <Icon data={Plus} size={16} /> Add widget
                </Button>
              )}
            />
            <Button view="flat-secondary" title="Reset layout" aria-label="Reset layout" onClick={resetLayout}>
              <Icon data={ArrowRotateLeft} size={16} />
            </Button>
            <span className="dash__theme">
              <Icon data={dark ? Moon : Sun} size={16} />
              <Switch checked={dark} onUpdate={setDark} aria-label="Dark theme" />
            </span>
          </div>
        </header>
        <main>
          <GridLayout
            items={items}
            meta={GRID_META}
            onChange={onChange}
            renderItem={(id, handle) => (
              <WidgetContent
                id={id as WidgetId}
                data={data}
                range={range}
                dragHandleProps={handle}
                onRemove={() => removeWidget(id)}
              />
            )}
          />
        </main>
      </div>
    </ThemeProvider>
  );
}
