import {useEffect, useMemo, useState} from 'react';
import YagrChart from '@gravity-ui/yagr/react';
import type {MinimalValidConfig} from '@gravity-ui/yagr';
import {Flex, Switch, Text} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

const POINTS_COUNT = 20_000;
const now = Date.now();
const timeline = Array.from({length: POINTS_COUNT}, (_, index) => now - (POINTS_COUNT - index) * 5000);
const initialValues = timeline.map((_, index) => 45 + 20 * Math.sin(index / 80) + 5 * Math.sin(index / 11));

type AppProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export function App({theme, onThemeChange}: AppProps) {
  const [latestValue, setLatestValue] = useState(initialValues.at(-1) || 0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLatestValue(45 + Math.random() * 20);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const config = useMemo<MinimalValidConfig>(
    () => ({
      chart: {
        size: {adaptive: true},
        appearance: {theme: theme.startsWith('dark') ? 'dark' : 'light'},
      },
      timeline,
      series: [
        {
          id: 'cpu',
          name: 'CPU',
          type: 'line',
          data: [...initialValues.slice(0, -1), latestValue],
        },
      ],
    }),
    [latestValue, theme],
  );

  return (
    <Flex direction="column" gap={4} style={{padding: 24}}>
      <Flex justifyContent="space-between" alignItems="center">
        <Text variant="header-1">Загрузка CPU за сутки</Text>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
      </Flex>
      <div style={{height: 420, width: '100%'}}>
        <YagrChart id="cpu-monitoring" config={config} update="dynamic" />
      </div>
    </Flex>
  );
}
