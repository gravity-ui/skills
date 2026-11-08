import type {WidgetData} from './types';

export const SAMPLE_DATA: WidgetData = {
  line: [
    {label: 'Янв', value: 120},
    {label: 'Фев', value: 190},
    {label: 'Мар', value: 140},
    {label: 'Апр', value: 220},
    {label: 'Май', value: 270},
    {label: 'Июн', value: 200},
    {label: 'Июл', value: 310},
    {label: 'Авг', value: 350},
    {label: 'Сен', value: 290},
    {label: 'Окт', value: 330},
    {label: 'Ноя', value: 370},
    {label: 'Дек', value: 410},
  ],
  // плотный временной ряд: по точке каждые 5 минут за 2 часа
  monitor: Array.from({length: 24}, (_, i) => {
    const t = new Date('2026-01-01T08:00:00Z').getTime() + i * 5 * 60_000;
    const base = 50 + Math.sin(i * 0.9) * 18 + Math.random() * 10;
    return {
      ts: t,
      value: Math.round(base * 10) / 10,
      alert: base > 72,
    };
  }),
};
