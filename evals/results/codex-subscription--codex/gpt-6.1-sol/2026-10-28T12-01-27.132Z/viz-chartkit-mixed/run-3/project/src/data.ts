import type {ChartMode, DataPoint, TimeRange} from './components/charts/types';

export const END_DATE = Date.UTC(2026, 9, 28, 9, 0);
const shape = [48, 54, 51, 58, 68, 61, 57, 66, 73, 69, 80, 76, 67, 73, 86, 81, 77, 89, 95, 88, 81, 91, 104, 96, 101, 116, 109, 112, 103, 119];
export function createData(mode: ChartMode, range: TimeRange, endDate = END_DATE, tick = 0): DataPoint[] {
  const count = mode === 'sales' ? ({'7d': 7, '30d': 30, '90d': 90})[range] : ({'7d': 3600, '30d': 7200, '90d': 14400})[range];
  const step = mode === 'sales' ? 86400000 : ({'7d': 1000, '30d': 3000, '90d': 6000})[range];
  const comparisonOffset = mode === 'sales' ? Array.from({length: count}, (_, i) => Math.cos(i * .8)).reduce((sum, v) => sum + v, 0) / count : 0;
  return Array.from({length: count}, (_, i) => {
    const timestamp = endDate - (count - i - 1) * step + (mode === 'monitoring' ? tick * 1000 : 0);
    const index = mode === 'sales' ? i : (timestamp - END_DATE) / step;
    const seed = Math.sin(index * 127.1) * 43758.5453;
    const random = seed - Math.floor(seed);
    const value = mode === 'sales' ? shape[Math.floor(i / count * shape.length)] * 1132 + Math.sin(i * 1.7) * 4200 : 145 + Math.sin(index / 180) * 33 + random * 70 + (random > .986 ? random * 180 : 0);
    return {timestamp, value, comparison: mode === 'sales' ? value / 1.128 + (Math.cos(i * .8) - comparisonOffset) * 5000 : value / .936 + Math.sin(index / 160) * 5};
  });
}
export const transactions = [
  {id: '10248', name: 'Александр Петров', initials: 'АП', color: 'peach', email: 'alex.petrov@gmail.com', product: 'Pro · Годовая подписка', amount: 24900, time: '12:42', status: 'Оплачен', channel: 'Сайт'},
  {id: '10247', name: 'Мария Иванова', initials: 'МИ', color: 'lavender', email: 'm.ivanova@ya.ru', product: 'Team · Месячная подписка', amount: 8900, time: '12:36', status: 'Оплачен', channel: 'Партнёры'},
  {id: '10246', name: 'Дмитрий Соколов', initials: 'ДС', color: 'sage', email: 'd.sokolov@gmail.com', product: 'Pro · Месячная подписка', amount: 2490, time: '12:28', status: 'В обработке', channel: 'Сайт'},
  {id: '10245', name: 'Анна Козлова', initials: 'АК', color: 'pink', email: 'anna.k@icloud.com', product: 'Pro · Годовая подписка', amount: 24900, time: '12:15', status: 'Оплачен', channel: 'Приложение'},
  {id: '10244', name: 'Илья Смирнов', initials: 'ИС', color: 'sage', email: 'ilya.s@ya.ru', product: 'Team · Месячная подписка', amount: 8900, time: '11:58', status: 'Оплачен', channel: 'Сайт'},
  {id: '10243', name: 'Елена Волкова', initials: 'ЕВ', color: 'lavender', email: 'elena.v@gmail.com', product: 'Pro · Месячная подписка', amount: 2490, time: '11:41', status: 'Оплачен', channel: 'Приложение'},
];
