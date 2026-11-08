import { Button, Flex } from '@gravity-ui/uikit';
import React from 'react';
import { Route, routes, useHashRoute } from './navigation';
import { AboutPage, HomePage, SettingsPage } from './pages';
import { useThemeState } from './theme';

const pages: Record<Route, () => React.JSX.Element> = {
  home: HomePage,
  about: AboutPage,
  settings: SettingsPage,
};

export function App() {
  const route = useHashRoute();
  const { theme, toggleTheme } = useThemeState();
  const CurrentPage = pages[route];

  return (
    <Flex direction="column" height="100vh" style={{ padding: '24px' }}>
      <Flex alignItems="center" gap="3">
        {(Object.keys(routes) as Route[]).map((pageRoute) => (
          <Button
            href={routes[pageRoute].hash}
            key={pageRoute}
            selected={route === pageRoute}
            view={route === pageRoute ? 'normal' : 'flat'}
          >
            {routes[pageRoute].title}
          </Button>
        ))}
        <Button aria-label="Переключить тему" onClick={toggleTheme} view="flat">
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>
      </Flex>
      <Flex height="100%" justifyContent="center" style={{ padding: '24px 0' }}>
        <CurrentPage />
      </Flex>
    </Flex>
  );
}
