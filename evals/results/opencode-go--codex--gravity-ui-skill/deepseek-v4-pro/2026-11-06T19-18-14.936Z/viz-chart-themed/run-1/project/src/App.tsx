import { Button, Flex, Text, useThemeType } from '@gravity-ui/uikit';
import { Chart } from '@gravity-ui/charts';
import type { ChartData } from '@gravity-ui/charts';

interface AppProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (t: 'light' | 'dark' | 'system') => void;
}

const data: ChartData = {
  series: {
    data: [
      {
        type: 'line',
        name: 'Revenue',
        data: [
          { x: 'Jan', y: 400 },
          { x: 'Feb', y: 520 },
          { x: 'Mar', y: 380 },
          { x: 'Apr', y: 670 },
          { x: 'May', y: 590 },
          { x: 'Jun', y: 810 },
          { x: 'Jul', y: 750 },
        ],
      },
      {
        type: 'line',
        name: 'Expenses',
        data: [
          { x: 'Jan', y: 300 },
          { x: 'Feb', y: 350 },
          { x: 'Mar', y: 320 },
          { x: 'Apr', y: 410 },
          { x: 'May', y: 380 },
          { x: 'Jun', y: 450 },
          { x: 'Jul', y: 420 },
        ],
      },
    ],
  },
};

export function App({ theme, onThemeChange }: AppProps) {
  const themeType = useThemeType();

  return (
    <div style={{ padding: 'var(--g-spacing-6)', maxWidth: 900, margin: '0 auto' }}>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 'var(--g-spacing-4)' }}>
        <Text variant="header-1">Monthly Performance</Text>
        <Flex gap={2}>
          <Button
            view={themeType === 'light' ? 'action' : 'normal'}
            onClick={() => onThemeChange('light')}
          >
            Light
          </Button>
          <Button
            view={themeType === 'dark' ? 'action' : 'normal'}
            onClick={() => onThemeChange('dark')}
          >
            Dark
          </Button>
          <Button
            view={theme === 'system' ? 'action' : 'normal'}
            onClick={() => onThemeChange('system')}
          >
            System
          </Button>
        </Flex>
      </Flex>
      <div style={{ height: 400 }}>
        <Chart data={data} />
      </div>
    </div>
  );
}
