import { PageConstructor, PageConstructorProvider } from '@gravity-ui/page-constructor';
import type { PageContent } from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.css';

import './App.css';

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
        'Таймлог — простой трекер рабочего времени: запуск таймера в один клик, отчёты по проектам и людям, без лишних настроек.',
      buttons: [
        { text: 'Попробовать бесплатно', theme: 'action', url: '#start' },
        { text: 'Как это работает', theme: 'outlined', url: '#features' },
      ],
    },
    {
      type: 'card-layout-block',
      anchor: { text: 'Преимущества', url: 'features' },
      title: 'Почему Таймлог',
      colSizes: { all: 12, sm: 6, md: 4 },
      children: [
        {
          type: 'basic-card',
          border: 'line',
          gravityIcon: { name: 'Clock', color: 'brand' },
          title: 'Таймер в один клик',
          text: 'Запускайте и останавливайте учёт прямо из списка задач. Забыли нажать — добавьте время вручную задним числом.',
        },
        {
          type: 'basic-card',
          border: 'line',
          gravityIcon: { name: 'ChartColumn', color: 'brand' },
          title: 'Понятные отчёты',
          text: 'Сводка по проектам, сотрудникам и неделям собирается автоматически. Экспорт в CSV для счетов и зарплаты.',
        },
        {
          type: 'basic-card',
          border: 'line',
          gravityIcon: { name: 'Persons', color: 'brand' },
          title: 'Вся команда вместе',
          text: 'Пригласите коллег по ссылке, распределите по проектам и смотрите загрузку каждого в реальном времени.',
        },
      ],
    },
    {
      type: 'content-layout-block',
      anchor: { text: 'Начать', url: 'start' },
      centered: true,
      textWidth: 's',
      textContent: {
        title: 'Начните считать время уже сегодня',
        text: 'Бесплатно для команд до пяти человек. Без карты и без ограничений по проектам.',
        buttons: [{ text: 'Создать аккаунт', theme: 'action', url: '#start' }],
      },
    },
  ],
};

export function App() {
  return (
    <PageConstructorProvider>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  );
}
