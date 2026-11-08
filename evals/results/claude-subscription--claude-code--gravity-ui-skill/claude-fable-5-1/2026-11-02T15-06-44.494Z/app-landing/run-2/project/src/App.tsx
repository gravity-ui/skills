import '@gravity-ui/page-constructor/styles/styles.scss';
import './App.css';

import { PageConstructor, PageConstructorProvider, Theme } from '@gravity-ui/page-constructor';
import type { PageContent } from '@gravity-ui/page-constructor';

const SIGNUP_URL = '#start';

const content: PageContent = {
  blocks: [
    {
      type: 'header-block',
      centered: true,
      width: 'm',
      verticalOffset: 'l',
      overtitle: 'Учёт времени для небольших команд',
      title: 'Знайте, куда уходит время команды',
      description:
        'Таймер в один клик, автоматические отчёты по проектам и клиентам. Никаких таблиц и ручного заполнения.',
      buttons: [{ text: 'Попробовать бесплатно', url: SIGNUP_URL, theme: 'action' }],
    },
    {
      type: 'extended-features-block',
      title: { text: 'Почему это удобно' },
      items: [
        {
          title: 'Запуск за минуту',
          text: 'Создайте проект, добавьте коллег и запускайте таймер. Обучение и настройка не нужны.',
        },
        {
          title: 'Отчёты без ручной работы',
          text: 'Сводка по людям, проектам и клиентам собирается автоматически за любой период.',
        },
        {
          title: 'Прозрачно для всей команды',
          text: 'Каждый видит свои часы и загрузку, а руководитель видит картину целиком.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время уже сегодня',
      subtitle: 'Бесплатно для команд до пяти человек. Без карты и обязательств.',
      // Fixed brand fill: white text (theme: dark) + a contrast button hold legibility in both uikit themes.
      color: 'var(--g-color-base-brand)',
      theme: 'dark',
      button: { text: 'Создать аккаунт', url: SIGNUP_URL, theme: 'normal-contrast' },
    },
  ],
};

export function App() {
  return (
    <PageConstructorProvider theme={Theme.Light}>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  );
}
