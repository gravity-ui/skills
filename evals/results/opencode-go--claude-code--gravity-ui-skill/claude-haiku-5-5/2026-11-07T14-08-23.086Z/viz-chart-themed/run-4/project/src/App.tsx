import {useEffect, useState} from 'react';
import {Chart} from '@gravity-ui/charts';
import {useThemeValue} from '@gravity-ui/uikit';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
// Пример данных: выручка по месяцам, млн ₽
const REVENUE = [120, 135, 128, 150, 162, 158, 171, 169, 185, 190, 204, 218];

export function App() {
  const themeValue = useThemeValue();
  const [accent, setAccent] = useState<string>();

  // Цвет линии берём из семантического токена текущей темы, а не из захардкоженного HEX.
  // ThemeProvider ставит класс темы на <body> в layout-эффекте, поэтому читаем в useEffect —
  // к этому моменту класс уже обновлён. useThemeValue перезапускает эффект при смене темы.
  useEffect(() => {
    const value = getComputedStyle(document.body).getPropertyValue('--g-color-base-brand').trim();
    setAccent(value || undefined);
  }, [themeValue]);

  return (
    <div style={{padding: 24}}>
      <div style={{height: 400}}>
        {accent && (
          <Chart
            key={themeValue}
            data={{
              title: {text: 'Выручка по месяцам, млн ₽'},
              xAxis: {type: 'category', categories: MONTHS},
              legend: {enabled: false},
              colors: [accent],
              series: {
                data: [
                  {
                    type: 'line',
                    name: 'Выручка',
                    marker: {enabled: true, radius: 4},
                    data: REVENUE.map((y, i) => ({x: MONTHS[i], y})),
                  },
                ],
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
