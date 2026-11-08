import { Button, Flex, Icon, Tab, TabList, Text } from '@gravity-ui/uikit';
import { Moon, Sun } from '@gravity-ui/icons';

import { ROUTES, type Route } from '../router';
import { useAppTheme } from '../theme';

interface HeaderProps {
  activeRoute: Route | null;
}

export function Header({ activeRoute }: HeaderProps) {
  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <Flex
      as="header"
      alignItems="center"
      justifyContent="space-between"
      gap={4}
      style={{
        padding: '0 24px',
        borderBottom: '1px solid var(--g-color-line-generic)',
        background: 'var(--g-color-base-background)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Flex alignItems="center" gap={6}>
        <Text variant="subheader-3" as="span">
          Мини-приложение
        </Text>
        <TabList value={activeRoute ?? undefined} size="l" aria-label="Основная навигация">
          {ROUTES.map((r) => (
            <Tab key={r.id} value={r.id} href={`#${r.path}`}>
              {r.title}
            </Tab>
          ))}
        </TabList>
      </Flex>

      <Button
        view="outlined"
        size="m"
        onClick={toggleTheme}
        aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
        title={isDark ? 'Светлая тема' : 'Тёмная тема'}
      >
        <Icon data={isDark ? Sun : Moon} size={16} />
        {isDark ? 'Светлая' : 'Тёмная'}
      </Button>
    </Flex>
  );
}
