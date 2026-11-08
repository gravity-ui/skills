import * as React from 'react';
import { Container } from '@gravity-ui/uikit';

import { Header } from './components/Header';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SettingsPage } from './pages/SettingsPage';
import { ROUTES, useHashRoute } from './router';
import { AppThemeProvider } from './theme';

function Page({ route }: { route: ReturnType<typeof useHashRoute> }) {
  switch (route) {
    case 'home':
      return <HomePage />;
    case 'about':
      return <AboutPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <NotFoundPage />;
  }
}

function Layout() {
  const route = useHashRoute();

  React.useEffect(() => {
    const title = ROUTES.find((r) => r.id === route)?.title ?? 'Страница не найдена';
    document.title = `${title} — Мини-приложение`;
  }, [route]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--g-color-base-background)' }}>
      <Header activeRoute={route} />
      <Container as="main" maxWidth="m" style={{ padding: '32px 24px' }}>
        <Page route={route} />
      </Container>
    </div>
  );
}

export function App() {
  return (
    <AppThemeProvider>
      <Layout />
    </AppThemeProvider>
  );
}
