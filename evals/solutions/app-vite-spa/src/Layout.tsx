import { Container, Flex, Switch, Tab, TabList, TabProvider, type Theme } from '@gravity-ui/uikit';
import { Outlet, useLocation, useNavigate } from 'react-router';

type LayoutProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export function Layout({ theme, onThemeChange }: LayoutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Container maxWidth="m">
      <Flex as="header" justifyContent="space-between" alignItems="center" gap={4}>
        <TabProvider value={pathname} onUpdate={(value) => navigate(value)}>
          <TabList>
            <Tab value="/">Главная</Tab>
            <Tab value="/about">О приложении</Tab>
            <Tab value="/contacts">Контакты</Tab>
          </TabList>
        </TabProvider>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
      </Flex>
      <Flex as="main" direction="column" gap={3} spacing={{ pt: 4 }}>
        <Outlet />
      </Flex>
    </Container>
  );
}
