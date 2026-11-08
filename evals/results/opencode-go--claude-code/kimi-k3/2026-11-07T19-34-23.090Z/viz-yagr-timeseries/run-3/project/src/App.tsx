import {useState} from 'react';
import {Button, Card, Flex, Icon, Text, ThemeProvider} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import {CpuLoadChart, type ChartTheme} from './cpu/CpuLoadChart';

import './app.css';

export function App() {
  const [theme, setTheme] = useState<ChartTheme>('light');
  const [currentCpu, setCurrentCpu] = useState<number | null>(null);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <div className="page">
        <Flex justifyContent="space-between" alignItems="center" className="page-header">
          <Text variant="display-1">Мониторинг</Text>
          <Button
            view="outlined"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
          >
            <Icon data={theme === 'light' ? Moon : Sun} size={16} />
          </Button>
        </Flex>

        <Card className="chart-card" view="filled" type="container" size="l">
          <Flex justifyContent="space-between" alignItems="baseline" className="chart-card__header">
            <Text variant="subheader-2" color="secondary">
              Загрузка CPU · последние 24 часа
            </Text>
            <Flex alignItems="baseline" gap="2">
              <span className={`live-dot${currentCpu === null ? ' live-dot_off' : ''}`} />
              <Text variant="display-2">{currentCpu === null ? '—' : currentCpu.toFixed(1)}</Text>
              <Text variant="body-2" color="secondary">
                %
              </Text>
            </Flex>
          </Flex>

          <CpuLoadChart theme={theme} onCurrentValue={setCurrentCpu} />
        </Card>
      </div>
    </ThemeProvider>
  );
}
