import { useState, type ReactNode } from 'react';
import {
  Button,
  Card,
  Container,
  Flex,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabProvider,
  Text,
} from '@gravity-ui/uikit';
import {
  CircleInfo,
  Code,
  Gear,
  House,
  Layers,
  Moon,
  Rocket,
  Sun,
} from '@gravity-ui/icons';

export type AppTheme = 'light' | 'dark';

interface AppProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

type PageId = 'home' | 'features' | 'about';

const pageIconStyle = { width: 40, height: 40, borderRadius: 12 } as const;

function IconTile({ children, color }: { children: ReactNode; color: string }) {
  return (
    <Flex
      centerContent
      style={{
        ...pageIconStyle,
        backgroundColor: color,
        color: 'var(--g-color-text-light-primary)',
      }}
    >
      {children}
    </Flex>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Card view="outlined" style={{ flex: '1 1 260px', minWidth: 240 }}>
      <Flex direction="column" gap={3}>
        <IconTile color={color}>{icon}</IconTile>
        <Text variant="subheader-2">{title}</Text>
        <Text variant="body-1" color="secondary">
          {description}
        </Text>
      </Flex>
    </Card>
  );
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <Card view="filled" style={{ flex: '1 1 180px', minWidth: 150 }}>
      <Flex direction="column" gap={2}>
        <Flex centerContent style={{ width: 32, height: 32 }}>
          {icon}
        </Flex>
        <Text variant="display-1">{value}</Text>
        <Text variant="body-1" color="secondary">
          {label}
        </Text>
      </Flex>
    </Card>
  );
}

export function App({ theme, onThemeChange }: AppProps) {
  const [activePage, setActivePage] = useState<PageId>('home');

  const handlePageChange = (value: string) => {
    setActivePage(value as PageId);
  };

  const isDark = theme === 'dark';

  return (
    <Container maxWidth="l" style={{ paddingTop: 28, paddingBottom: 48 }}>
      <Flex direction="column" gap={6}>
        <Flex as="header" alignItems="center" justifyContent="space-between" gap={4} wrap>
          <Flex alignItems="center" gap={3}>
            <IconTile color="var(--g-color-base-brand)">
              <Layers width={20} height={20} />
            </IconTile>
            <Flex direction="column">
              <Text variant="header-1">Мини-приложение</Text>
              <Text variant="body-1" color="secondary">
                Навигация и переключение темы
              </Text>
            </Flex>
          </Flex>

          <Switch
            size="l"
            checked={isDark}
            onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
          >
            <Flex alignItems="center" gap={2}>
              {isDark ? <Moon width={16} height={16} /> : <Sun width={16} height={16} />}
              <Text variant="body-2">{isDark ? 'Тёмная тема' : 'Светлая тема'}</Text>
            </Flex>
          </Switch>
        </Flex>

        <TabProvider value={activePage} onUpdate={handlePageChange}>
          <TabList size="xl">
            <Tab value="home" icon={<House width={16} height={16} />}>
              Главная
            </Tab>
            <Tab value="features" icon={<Rocket width={16} height={16} />}>
              Возможности
            </Tab>
            <Tab value="about" icon={<CircleInfo width={16} height={16} />}>
              О приложении
            </Tab>
          </TabList>

          <TabPanel value="home">
            <Flex direction="column" gap={5}>
              <Card view="filled" size="l">
                <Flex direction="column" gap={4}>
                  <Text variant="display-2">Добро пожаловать</Text>
                  <Text variant="body-2" color="secondary" style={{ maxWidth: 640 }}>
                    Небольшое приложение на React и Gravity UI. Здесь три экрана, навигация
                    вкладками и переключатель светлой и тёмной темы в шапке.
                  </Text>
                  <Flex gap={3} wrap>
                    <Button
                      view="action"
                      size="l"
                      onClick={() => setActivePage('features')}
                    >
                      <Button.Icon side="start">
                        <Rocket width={16} height={16} />
                      </Button.Icon>
                      Смотреть возможности
                    </Button>
                    <Button view="normal" size="l" onClick={() => setActivePage('about')}>
                      О приложении
                    </Button>
                  </Flex>
                </Flex>
              </Card>

              <Flex gap={4} wrap>
                <StatCard icon={<Layers width={20} height={20} />} value="3" label="Экрана" />
                <StatCard icon={<Sun width={20} height={20} />} value="2" label="Темы" />
                <StatCard icon={<Code width={20} height={20} />} value="React" label="Стек" />
              </Flex>
            </Flex>
          </TabPanel>

          <TabPanel value="features">
            <Flex direction="column" gap={5}>
              <Text variant="subheader-3">Что умеет приложение</Text>
              <Flex gap={4} wrap>
                <FeatureCard
                  icon={<Gear width={20} height={20} />}
                  title="Навигация"
                  description="Переключение между экранами через вкладки без перезагрузки страницы."
                  color="var(--g-color-base-info-heavy)"
                />
                <FeatureCard
                  icon={<Sun width={20} height={20} />}
                  title="Темы"
                  description="Мгновенный переход между светлой и тёмной темой оформления."
                  color="var(--g-color-base-warning-heavy)"
                />
                <FeatureCard
                  icon={<Code width={20} height={20} />}
                  title="Компоненты"
                  description="Интерфейс собран на готовых компонентах Gravity UI."
                  color="var(--g-color-base-positive-heavy)"
                />
              </Flex>
            </Flex>
          </TabPanel>

          <TabPanel value="about">
            <Card view="outlined" size="l">
              <Flex direction="column" gap={4}>
                <Text variant="header-1">О приложении</Text>
                <Text variant="body-1" color="secondary" style={{ maxWidth: 640 }}>
                  Это демонстрационный пример SPA на React с Vite. Тема хранится в состоянии
                  корневого компонента и передаётся в ThemeProvider, поэтому все компоненты
                  Gravity UI автоматически перерисовываются при переключении.
                </Text>
                <Flex gap={2} wrap>
                  <Card view="filled">
                    <Text variant="code-1">React 18</Text>
                  </Card>
                  <Card view="filled">
                    <Text variant="code-1">TypeScript</Text>
                  </Card>
                  <Card view="filled">
                    <Text variant="code-1">Gravity UI</Text>
                  </Card>
                </Flex>
              </Flex>
            </Card>
          </TabPanel>
        </TabProvider>
      </Flex>
    </Container>
  );
}
