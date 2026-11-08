import { Button, DropdownMenu, Icon, SegmentedRadioGroup, Switch, Text, ThemeProvider } from '@gravity-ui/uikit';
import { ArrowsRotateLeft, Moon, Plus, Sun } from '@gravity-ui/icons';
import { useEffect, useState } from 'react';

import { GridLayout } from './dashboard/GridLayout';
import { COLS, useDashboardState } from './dashboard/useDashboardState';
import { PERIODS, PeriodContext, type PeriodDays } from './widgets/PeriodContext';
import { WIDGETS, WIDGET_LIST } from './widgets/registry';

import './widgets/viz.css';
import './App.css';

const THEME_KEY = 'gravity-dashboard:theme';

function usePersistedTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* ignore */
    }
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, setTheme] as const;
}

export function App() {
  const [theme, setTheme] = usePersistedTheme();
  const [editable, setEditable] = useState(true);
  const [period, setPeriod] = useState<PeriodDays>(30);
  const { state, widgetById, setLayout, addWidget, removeWidget, reset } = useDashboardState();

  return (
    <ThemeProvider theme={theme} scoped rootClassName="dashboard-root">
      <PeriodContext.Provider value={period}>
        <div className="dashboard">
          <header className="dashboard__header">
            <div className="dashboard__heading">
              <Text variant="header-1" as="h1" className="dashboard__title">
                Дашборд
              </Text>
              <Text variant="body-1" color="secondary">
                Перетаскивайте виджеты за ручку, растягивайте за правый нижний угол. Раскладка сохраняется в браузере.
              </Text>
            </div>

            <div className="dashboard__toolbar">
              <SegmentedRadioGroup
                size="m"
                value={String(period)}
                onUpdate={(v) => setPeriod(Number(v) as PeriodDays)}
                aria-label="Период"
              >
                {PERIODS.map((p) => (
                  <SegmentedRadioGroup.Option key={p.value} value={String(p.value)}>
                    {p.label}
                  </SegmentedRadioGroup.Option>
                ))}
              </SegmentedRadioGroup>

              <Switch size="m" checked={editable} onUpdate={setEditable} content="Редактирование" />

              <DropdownMenu
                size="m"
                renderSwitcher={(props) => (
                  <Button {...props} view="action" size="m" disabled={!editable}>
                    <Icon data={Plus} size={16} />
                    Добавить виджет
                  </Button>
                )}
                items={WIDGET_LIST.map((def) => ({
                  text: (
                    <div className="dashboard__menu-item">
                      <span>{def.title}</span>
                      <Text variant="caption-2" color="secondary">
                        {def.description}
                      </Text>
                    </div>
                  ),
                  action: () => addWidget(def.type),
                }))}
              />

              <Button view="outlined" size="m" onClick={reset} disabled={!editable} title="Вернуть раскладку по умолчанию">
                <Icon data={ArrowsRotateLeft} size={16} />
                Сбросить
              </Button>

              <Button
                view="outlined"
                size="m"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
                title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              >
                <Icon data={theme === 'light' ? Moon : Sun} size={16} />
              </Button>
            </div>
          </header>

          {state.widgets.length === 0 ? (
            <div className="dashboard__empty">
              <Text variant="subheader-2">На дашборде пока нет виджетов</Text>
              <Text variant="body-1" color="secondary">
                Добавьте виджет через меню выше или верните раскладку по умолчанию.
              </Text>
              <Button view="action" size="l" onClick={reset}>
                Вернуть раскладку по умолчанию
              </Button>
            </div>
          ) : (
            <GridLayout
              layout={state.layout}
              cols={COLS}
              rowHeight={76}
              gap={12}
              editable={editable}
              onLayoutChange={setLayout}
              itemLabel={(item) => WIDGETS[widgetById.get(item.id)?.type ?? 'revenue'].title}
              renderItem={({ item, dragHandleProps, resizeHandle, dragging, editable: canEdit }) => {
                const instance = widgetById.get(item.id);
                if (!instance) return null;
                const def = WIDGETS[instance.type];
                const Widget = def.component;
                return (
                  <Widget
                    title={def.title}
                    dragHandleProps={dragHandleProps}
                    resizeHandle={resizeHandle}
                    editable={canEdit}
                    dragging={dragging}
                    onRemove={() => removeWidget(item.id)}
                  />
                );
              }}
            />
          )}
        </div>
      </PeriodContext.Provider>
    </ThemeProvider>
  );
}
