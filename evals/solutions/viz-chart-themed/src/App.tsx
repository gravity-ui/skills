import { Chart } from '@gravity-ui/charts';
import type { ChartData } from '@gravity-ui/charts';
import { Switch, Text } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

// Линейный график на @gravity-ui/charts. Компонент <Chart> сам читает активную тему Gravity UI
// (светлая/тёмная) из контекста ThemeProvider: фон, оси, сетка, подписи и тултип перекрашиваются
// автоматически, вручную настраивать цвета не нужно.
const chartData: ChartData = {
  title: { text: 'Посещаемость сервиса по месяцам' },
  xAxis: {
    type: 'category',
    categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  },
  yAxis: [{ title: { text: 'Посетители, тыс.' } }],
  series: {
    data: [
      {
        type: 'line',
        name: 'Посетители',
        data: [
          { x: 'Янв', y: 12 },
          { x: 'Фев', y: 15 },
          { x: 'Мар', y: 18 },
          { x: 'Апр', y: 16 },
          { x: 'Май', y: 22 },
          { x: 'Июн', y: 27 },
          { x: 'Июл', y: 25 },
          { x: 'Авг', y: 24 },
          { x: 'Сен', y: 31 },
          { x: 'Окт', y: 36 },
          { x: 'Ноя', y: 34 },
          { x: 'Дек', y: 41 },
        ],
      },
      {
        type: 'line',
        name: 'Регистрации',
        data: [
          { x: 'Янв', y: 3 },
          { x: 'Фев', y: 4 },
          { x: 'Мар', y: 6 },
          { x: 'Апр', y: 5 },
          { x: 'Май', y: 8 },
          { x: 'Июн', y: 11 },
          { x: 'Июл', y: 10 },
          { x: 'Авг', y: 9 },
          { x: 'Сен', y: 13 },
          { x: 'Окт', y: 16 },
          { x: 'Ноя', y: 15 },
          { x: 'Дек', y: 19 },
        ],
      },
    ],
  },
};

type AppProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="header-1">Статистика</Text>
        {/* Переключатель темы всего приложения: график следует за ней без доп. настройки. */}
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
      </div>
      {/* <Chart> растягивается по родителю, поэтому контейнеру нужна явная высота. */}
      <div style={{ height: 400 }}>
        <Chart data={chartData} />
      </div>
    </div>
  );
}
