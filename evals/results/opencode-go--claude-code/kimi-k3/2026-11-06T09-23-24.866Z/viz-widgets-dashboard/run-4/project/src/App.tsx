import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ArrowsRotateRight,
  ChartColumn,
  ChartLine,
  ChartPie,
  LayoutCells,
  LayoutList,
  Lock,
  LockOpen,
  Moon,
  Plus,
  Sun,
} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon, SegmentedRadioGroup, Select, ThemeProvider} from '@gravity-ui/uikit';
import {Grid} from './components/Grid';
import {findFreeSlot} from './dashboard/grid';
import type {MetricKey, WidgetInstance, WidgetType} from './dashboard/types';
import {DEFAULT_WIDGETS, MIN_SIZE, widgetTitle} from './dashboard/types';
import {BarWidget, LineWidget, MixWidget} from './widgets/ChartWidgets';
import {KpiWidget} from './widgets/KpiWidget';
import './styles.css';

type Theme = 'light' | 'dark';
type RangeDays = 7 | 30 | 90;

const STORAGE_KEY = 'viz-widgets-dashboard-v1';

interface Persisted {
  widgets?: WidgetInstance[];
  theme?: Theme;
  range?: RangeDays;
  locked?: boolean;
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Persisted;
    if (!Array.isArray(parsed.widgets)) return {};
    return parsed;
  } catch {
    return {};
  }
}

let idCounter = 0;
function nextId(type: string): string {
  idCounter += 1;
  return `${type}-${Date.now().toString(36)}-${idCounter}`;
}

const KPI_ORDER: MetricKey[] = ['revenue', 'users', 'conv', 'churn'];

export function App() {
  const [initial] = useState(loadPersisted);
  const [widgets, setWidgets] = useState<WidgetInstance[]>(initial.widgets ?? DEFAULT_WIDGETS);
  const [theme, setTheme] = useState<Theme>(initial.theme ?? 'light');
  const [range, setRange] = useState<RangeDays>(initial.range ?? 30);
  const [locked, setLocked] = useState<boolean>(initial.locked ?? false);

  // Simulated refetch: hold the previous render at reduced opacity, no layout jump.
  const [shownRange, setShownRange] = useState<RangeDays>(range);
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (shownRange === range) return;
    setRefreshing(true);
    timerRef.current = window.setTimeout(() => {
      setShownRange(range);
      setRefreshing(false);
    }, 350);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [range, shownRange]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({widgets, theme, range, locked}));
    } catch {
      /* storage unavailable — layout just won't persist */
    }
  }, [widgets, theme, range, locked]);

  const removeWidget = useCallback(
    (id: string) => setWidgets((ws) => ws.filter((w) => w.id !== id)),
    [],
  );

  const setView = useCallback((id: string, view: 'chart' | 'table') => {
    setWidgets((ws) => ws.map((w) => (w.id === id ? {...w, view} : w)));
  }, []);

  const addWidget = useCallback((type: WidgetType) => {
    setWidgets((ws) => {
      const size = MIN_SIZE[type];
      const defaults: Record<WidgetType, {w: number; h: number}> = {
        kpi: {w: 3, h: 2},
        line: {w: 6, h: 5},
        bar: {w: 5, h: 5},
        mix: {w: 6, h: 3},
      };
      const rect = findFreeSlot(ws, defaults[type] ?? size);
      let metric: MetricKey | undefined;
      if (type === 'kpi') {
        const used = new Set(ws.filter((w) => w.type === 'kpi').map((w) => w.metric));
        metric = KPI_ORDER.find((m) => !used.has(m)) ?? KPI_ORDER[ws.length % KPI_ORDER.length];
      }
      return [...ws, {id: nextId(type), type, rect, metric, view: 'chart'}];
    });
  }, []);

  const resetLayout = useCallback(() => setWidgets(DEFAULT_WIDGETS), []);

  const renderBody = useCallback(
    (w: WidgetInstance) => {
      const view = w.view ?? 'chart';
      switch (w.type) {
        case 'kpi':
          return <KpiWidget metric={w.metric ?? 'revenue'} days={shownRange} />;
        case 'line':
          return <LineWidget days={shownRange} view={view} />;
        case 'bar':
          return <BarWidget days={shownRange} view={view} />;
        case 'mix':
          return <MixWidget days={shownRange} view={view} />;
      }
    },
    [shownRange],
  );

  const renderActions = useCallback(
    (w: WidgetInstance) => {
      if (w.type === 'kpi') return null;
      const chartIcon = w.type === 'line' ? ChartLine : w.type === 'bar' ? ChartColumn : ChartPie;
      return (
        <SegmentedRadioGroup
          size="s"
          value={w.view ?? 'chart'}
          onUpdate={(v) => setView(w.id, v as 'chart' | 'table')}
          options={[
            {value: 'chart', content: <Icon data={chartIcon} size={14} />, title: 'График'},
            {value: 'table', content: <Icon data={LayoutList} size={14} />, title: 'Таблица'},
          ]}
        />
      );
    },
    [setView],
  );

  const addMenuItems = useMemo(
    () => [
      {
        text: 'KPI-показатель',
        action: () => addWidget('kpi'),
      },
      {text: 'График динамики', action: () => addWidget('line')},
      {text: 'Столбчатая диаграмма', action: () => addWidget('bar')},
      {text: 'Структура по каналам', action: () => addWidget('mix')},
    ],
    [addWidget],
  );

  return (
    <div className="dash" data-theme={theme}>
      <ThemeProvider theme={theme} rootClassName="dash-root">
        <header className="dash-top">
          <div className="dash-brand">
            <Icon data={LayoutCells} size={18} />
            <h1 className="dash-title">Дашборд продаж</h1>
          </div>
          <div className="dash-filters">
            <Select
              className="dash-range"
              value={[String(range)]}
              onUpdate={(v) => setRange(Number(v[0]) as RangeDays)}
              options={[
                {value: '7', content: 'Последние 7 дней'},
                {value: '30', content: 'Последние 30 дней'},
                {value: '90', content: 'Последние 90 дней'},
              ]}
            />
            <DropdownMenu
              items={addMenuItems}
              renderSwitcher={({onClick, onKeyDown}) => (
                <Button view="outlined" onClick={onClick} onKeyDown={onKeyDown}>
                  <Icon data={Plus} size={14} />
                  Виджет
                </Button>
              )}
            />
            <span className="dash-filters-gap" />
            <Button
              view="flat"
              onClick={resetLayout}
              title="Сбросить расположение виджетов"
              aria-label="Сбросить расположение виджетов"
            >
              <Icon data={ArrowsRotateRight} size={16} />
            </Button>
            <Button
              view={locked ? 'flat' : 'outlined'}
              onClick={() => setLocked((l) => !l)}
              title={locked ? 'Разблокировать сетку' : 'Заблокировать сетку'}
              aria-label={locked ? 'Разблокировать сетку' : 'Заблокировать сетку'}
              aria-pressed={!locked}
            >
              <Icon data={locked ? Lock : LockOpen} size={16} />
            </Button>
            <Button
              view="flat"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
            >
              <Icon data={theme === 'light' ? Moon : Sun} size={16} />
            </Button>
          </div>
        </header>

        <main className={`dash-content${refreshing ? ' dash-refreshing' : ''}`} aria-busy={refreshing}>
          <Grid
            widgets={widgets}
            locked={locked}
            onChange={setWidgets}
            onRemove={removeWidget}
            titleOf={widgetTitle}
            renderBody={renderBody}
            renderActions={renderActions}
          />
        </main>
      </ThemeProvider>
    </div>
  );
}
