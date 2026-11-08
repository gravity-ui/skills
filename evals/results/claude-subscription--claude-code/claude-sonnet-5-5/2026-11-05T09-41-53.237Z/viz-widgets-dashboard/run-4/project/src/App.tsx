import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, DropdownMenu, SegmentedRadioGroup, Switch, Text, configure } from '@gravity-ui/uikit';
import { Grid } from './grid/Grid';
import { appendItem, removeItem, sanitizeLayout, type GridItem } from './grid/layout';
import { PlusIcon, ResetIcon } from './icons';
import { DEFAULT_LAYOUT, LIMITS, WIDGETS, WIDGET_BY_ID } from './widgets/registry';
import { WidgetFrame } from './widgets/WidgetFrame';
import './dashboard.css';

configure({ lang: 'ru' });

const STORAGE_KEY = 'widget-dashboard:v1';
const RANGES = [7, 30, 90] as const;

interface Saved {
  layout: GridItem[];
  compact: boolean;
  days: number;
}

function load(): Saved {
  const fallback: Saved = { layout: DEFAULT_LAYOUT, compact: true, days: 30 };
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!raw || typeof raw !== 'object') return fallback;
    const layout = sanitizeLayout(raw.layout, LIMITS);
    return {
      layout: layout ?? fallback.layout,
      compact: typeof raw.compact === 'boolean' ? raw.compact : true,
      days: RANGES.includes(raw.days) ? raw.days : 30,
    };
  } catch {
    return fallback;
  }
}

export function App() {
  const [state, setState] = useState<Saved>(load);
  const { layout, compact, days } = state;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* приватный режим или переполнение — раскладка просто не сохранится */
    }
  }, [state]);

  const setLayout = useCallback((next: GridItem[]) => setState((s) => ({ ...s, layout: next })), []);

  const missing = useMemo(() => WIDGETS.filter((w) => !layout.some((i) => i.id === w.id)), [layout]);

  const describe = useCallback(
    (it: GridItem) =>
      `${WIDGET_BY_ID[it.id].title}: колонка ${it.x + 1}, строка ${it.y + 1}, ширина ${it.w}, высота ${it.h}`,
    [],
  );

  return (
    <main className="page">
      <div className="page__bar">
        <Text variant="header-1" as="h1" className="page__title">
          Обзор продукта
        </Text>
        <div className="page__tools">
          <Switch
            size="m"
            checked={compact}
            onUpdate={(v) =>
              setState((s) => ({
                ...s,
                compact: v,
              }))
            }
            content="Уплотнять вверх"
          />
          <DropdownMenu
            size="m"
            disabled={missing.length === 0}
            items={missing.map((w) => ({
              text: w.title,
              action: () =>
                setState((s) => ({
                  ...s,
                  layout: appendItem(s.layout, { id: w.id, w: w.initial.w, h: w.initial.h }, s.compact),
                })),
            }))}
            renderSwitcher={(props) => (
              <Button {...props} view="outlined" disabled={missing.length === 0}>
                <PlusIcon />
                Добавить виджет
              </Button>
            )}
          />
          <Button view="flat" onClick={() => setLayout(DEFAULT_LAYOUT)}>
            <ResetIcon />
            Сбросить раскладку
          </Button>
        </div>
      </div>

      <div className="page__filters" role="group" aria-label="Фильтры">
        <Text color="secondary">Период</Text>
        <SegmentedRadioGroup
          size="m"
          value={String(days)}
          onUpdate={(v) => setState((s) => ({ ...s, days: Number(v) }))}
        >
          {RANGES.map((r) => (
            <SegmentedRadioGroup.Option key={r} value={String(r)} content={`${r} дней`} />
          ))}
        </SegmentedRadioGroup>
      </div>

      {layout.length === 0 ? (
        <div className="empty">
          <Text variant="subheader-2">На дашборде нет виджетов</Text>
          <Text color="secondary">Добавьте их через «Добавить виджет» или верните исходную раскладку.</Text>
        </div>
      ) : (
        <Grid
          items={layout}
          limits={LIMITS}
          compact={compact}
          onChange={setLayout}
          describe={describe}
          renderItem={(id, binding) => (
            <WidgetFrame
              def={WIDGET_BY_ID[id]}
              days={days}
              binding={binding}
              onRemove={() => setState((s) => ({ ...s, layout: removeItem(s.layout, id, s.compact) }))}
            />
          )}
        />
      )}
    </main>
  );
}
