import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, DropdownMenu, SegmentedRadioGroup } from '@gravity-ui/uikit';
import './dashboard.css';
import { DashboardGrid } from './DashboardGrid';
import { RANGES, sliceRange } from './data';
import { PlusIcon, ResetIcon } from './icons';
import { addItem, isValidLayout, removeItem, type Item } from './layout';
import { DEFAULT_LAYOUT, LIMITS, WIDGETS, WIDGET_BY_ID, defaultSize } from './registry';
import { WidgetFrame } from './WidgetFrame';

const STORAGE_KEY = 'dashboard-layout-v1';
const IDS = WIDGETS.map((w) => w.id);

function loadLayout(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidLayout(parsed, IDS)) return parsed;
    }
  } catch {
    /* повреждённое или недоступное хранилище — берём раскладку по умолчанию */
  }
  return DEFAULT_LAYOUT;
}

export function App() {
  const [layout, setLayout] = useState<Item[]>(loadLayout);
  const [range, setRange] = useState<number>(30);
  const data = useMemo(() => sliceRange(range), [range]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      /* хранилище недоступно — раскладка просто не переживёт перезагрузку */
    }
  }, [layout]);

  const hidden = WIDGETS.filter((w) => !layout.some((i) => i.id === w.id));
  const isDefault = JSON.stringify(layout) === JSON.stringify(DEFAULT_LAYOUT);

  const remove = useCallback((id: string) => setLayout((l) => removeItem(l, id)), []);

  return (
    <div className="dash">
      <div className="dash__bar">
        <h1 className="dash__title">Продажи</h1>
        <div className="dash__filters">
          <SegmentedRadioGroup
            size="m"
            value={String(range)}
            onUpdate={(v) => setRange(Number(v))}
            aria-label="Период"
          >
            {RANGES.map((r) => (
              <SegmentedRadioGroup.Option key={r} value={String(r)}>
                {r} дн.
              </SegmentedRadioGroup.Option>
            ))}
          </SegmentedRadioGroup>
        </div>
        <div className="dash__actions">
          <DropdownMenu
            renderSwitcher={(props) => (
              <Button {...props} view="outlined" disabled={hidden.length === 0}>
                <PlusIcon />
                Добавить виджет
              </Button>
            )}
            items={hidden.map((w) => ({
              text: w.title,
              action: () => setLayout((l) => addItem(l, defaultSize(w.id))),
            }))}
          />
          <Button view="flat" disabled={isDefault} onClick={() => setLayout(DEFAULT_LAYOUT)}>
            <ResetIcon />
            Сбросить
          </Button>
        </div>
      </div>

      {layout.length === 0 && (
        <div className="dash__empty">
          Все виджеты скрыты. Добавьте нужные кнопкой «Добавить виджет» или верните исходную раскладку.
        </div>
      )}

      <DashboardGrid
        layout={layout}
        limits={LIMITS}
        onChange={setLayout}
        renderWidget={(id, api) => {
          const def = WIDGET_BY_ID[id];
          return (
            <WidgetFrame title={def.title} api={api} onRemove={() => remove(id)}>
              {def.render(data)}
            </WidgetFrame>
          );
        }}
      />
    </div>
  );
}
