import * as React from 'react';
import {Button, DropdownMenu, Flex, Icon, Switch, Text, ThemeProvider} from '@gravity-ui/uikit';
import type {RealTheme} from '@gravity-ui/uikit';
import {
  ArrowRotateLeft,
  ChartColumn,
  Heading,
  ListUl,
  Moon,
  Plus,
  Speedometer,
  Sun,
  Target,
} from '@gravity-ui/icons';
import {DashKit} from '@gravity-ui/dashkit';
import type {DashKitProps} from '@gravity-ui/dashkit';

import './dashkit-setup';
import {INITIAL_CONFIG, WIDGET_SIZES, WIDGET_TEMPLATES, type WidgetType} from './dashboard';
import './styles.css';

const STORAGE_KEY = 'gravity-demo-dashboard:v1';

type Config = DashKitProps['config'];

function loadConfig(): Config {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Config;
    }
  } catch {
    // corrupted or unavailable storage — fall back to the default config
  }
  return INITIAL_CONFIG;
}

function persistConfig(config: Config) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // storage is unavailable — keep the layout in memory only
  }
}

const WIDGET_ICONS: Record<WidgetType, typeof Plus> = {
  title: Heading,
  stat: Target,
  bars: ChartColumn,
  meter: Speedometer,
  list: ListUl,
};

const WIDGET_ORDER: WidgetType[] = ['title', 'stat', 'bars', 'meter', 'list'];

export function App() {
  const [config, setConfig] = React.useState<Config>(loadConfig);
  const [editMode, setEditMode] = React.useState(false);
  const [theme, setTheme] = React.useState<RealTheme>('light');

  const applyConfig = React.useCallback((next: Config) => {
    setConfig(next);
    persistConfig(next);
  }, []);

  const handleChange = React.useCallback(
    ({config: next}: {config: Config}) => {
      applyConfig(next);
    },
    [applyConfig],
  );

  const addWidget = React.useCallback((type: WidgetType) => {
    setConfig((current) => {
      const bottom = current.layout.reduce((max, l) => Math.max(max, l.y + l.h), 0);
      const next = DashKit.setItem({
        item: {
          type,
          namespace: 'default',
          data: WIDGET_TEMPLATES[type].data,
          layout: {x: 0, y: bottom, ...WIDGET_SIZES[type]},
        },
        config: current,
      });
      persistConfig(next);
      return next;
    });
    setEditMode(true);
  }, []);

  const resetLayout = React.useCallback(() => {
    applyConfig(INITIAL_CONFIG);
  }, [applyConfig]);

  const toggleTheme = React.useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeProvider theme={theme} scoped rootClassName="app">
      <header className="app__header">
        <Flex alignItems="center" gap={4}>
          <div className="app__title">
            <Text variant="header-1" ellipsis>
              Дашборд
            </Text>
          </div>
          <Flex alignItems="center" gap={3} className="app__controls">
            <Switch checked={editMode} onUpdate={setEditMode} content="Редактирование" />
            <DropdownMenu
              items={WIDGET_ORDER.map((type) => ({
                action: () => addWidget(type),
                text: WIDGET_TEMPLATES[type].menuText,
                iconStart: <Icon data={WIDGET_ICONS[type]} size={16} />,
              }))}
              renderSwitcher={(props) => (
                <Button {...props} view="action">
                  <Icon data={Plus} size={16} />
                  Виджет
                </Button>
              )}
            />
            <Button
              view="flat"
              onClick={resetLayout}
              title="Сбросить раскладку"
              aria-label="Сбросить раскладку"
            >
              <Icon data={ArrowRotateLeft} size={16} />
            </Button>
            <Button
              view="flat"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              aria-label={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            >
              <Icon data={theme === 'light' ? Moon : Sun} size={16} />
            </Button>
          </Flex>
        </Flex>
      </header>
      <main className="app__content">
        <DashKit config={config} editMode={editMode} onChange={handleChange} />
      </main>
    </ThemeProvider>
  );
}
