import * as React from 'react';
import { Button, Icon, SegmentedRadioGroup, Switch, Text, ThemeProvider } from '@gravity-ui/uikit';

import './dashboard.css';
import { DashboardGrid } from './grid/DashboardGrid';
import { getDashboardData, RANGE_OPTIONS, type Range } from './data';
import { MoonIcon, PlusIcon, RotateIcon, SunIcon } from './icons';
import { useDashboardState } from './useDashboardState';
import { WIDGETS } from './widgets/registry';

export function App() {
  const [range, setRange] = React.useState<Range>('30d');
  const [locked, setLocked] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const { layout, hidden, setLayout, hideWidget, showWidget, reset, cols } = useDashboardState();

  const data = React.useMemo(() => getDashboardData(range), [range]);
  const visibleWidgets = WIDGETS.filter((w) => layout.some((item) => item.i === w.id));
  const hiddenWidgets = WIDGETS.filter((w) => hidden.includes(w.id));

  return (
    <ThemeProvider theme={theme} scoped>
      <div className="dashboard">
        <header className="dashboard__header">
          <div>
            <Text as="h1" variant="header-2">
              Обзор продукта
            </Text>
            <Text variant="body-1" color="secondary">
              Перетаскивайте виджеты за заголовок, тяните за правый нижний угол, чтобы изменить размер
            </Text>
          </div>
          <div className="dashboard__toolbar">
            <SegmentedRadioGroup<Range>
              size="m"
              value={range}
              onUpdate={setRange}
              aria-label="Период"
              options={RANGE_OPTIONS.map((o) => ({ value: o.value, content: o.label }))}
            />
            <Switch size="m" checked={locked} onUpdate={setLocked} content="Закрепить" />
            <Button view="outlined" size="m" onClick={reset} title="Вернуть раскладку по умолчанию">
              <Icon data={RotateIcon} size={14} />
              Сбросить
            </Button>
            <Button
              view="flat"
              size="m"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            >
              <Icon data={theme === 'light' ? MoonIcon : SunIcon} size={16} />
            </Button>
          </div>
        </header>

        {hiddenWidgets.length > 0 && (
          <div className="dashboard__hidden" role="group" aria-label="Скрытые виджеты">
            <Text variant="body-1" color="secondary">
              Скрытые виджеты:
            </Text>
            {hiddenWidgets.map((w) => (
              <Button key={w.id} view="outlined" size="s" onClick={() => showWidget(w.id)}>
                <Icon data={PlusIcon} size={12} />
                {w.title}
              </Button>
            ))}
          </div>
        )}

        {visibleWidgets.length === 0 ? (
          <Text variant="body-2" color="secondary" className="dashboard__hint">
            Все виджеты скрыты. Верните нужные кнопками выше или сбросьте раскладку.
          </Text>
        ) : (
          <DashboardGrid layout={layout} onLayoutChange={setLayout} cols={cols} rowHeight={56} gap={16} locked={locked}>
            {visibleWidgets.map((w) => (
              <React.Fragment key={w.id}>{w.render(data, () => hideWidget(w.id))}</React.Fragment>
            ))}
          </DashboardGrid>
        )}
      </div>
    </ThemeProvider>
  );
}
