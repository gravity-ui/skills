import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';

import './App.css';

const landingContent = {
  blocks: [
    {
      type: 'header-block',
      title: 'Учёт времени, который не отнимает время',
      description:
        'TimeDeck показывает, над чем работает команда, сколько это занимает и где теряются часы. Достаточно одного клика — никакой лишней отчётности.',
      width: 's',
      verticalOffset: 's',
      background: {
        light: {color: 'var(--g-color-base-float)'},
        dark: {color: 'var(--g-color-base-float)'},
      },
    },
    {
      type: 'extended-features-block',
      title: 'Три причины выбрать TimeDeck',
      items: [
        {
          title: 'Понятный ввод',
          text: 'Запускайте таймер или введите часы за секунду. Статусы видны всей команде.',
        },
        {
          title: 'Живая картина',
          text: 'Загрузка, проекты и незакрытые задачи обновляются вместе с учётом текущих статусов.',
        },
        {
          title: 'Полезные отчёты',
          text: 'Готовые сводки по проектам за текущую неделю и месяц без ручных выгрузок.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время команды',
      subtitle: 'Добавьте участников и увидите первую сводку уже сегодня.',
      button: {text: 'Открыть стартовый набор', url: '/start'},
      color: {
        light: 'var(--g-color-base-info-heavy)',
        dark: 'var(--g-color-base-info-heavy)',
      },
    },
  ],
};

export function App() {
  return (
    <PageConstructorProvider>
      <PageConstructor content={landingContent} />
    </PageConstructorProvider>
  );
}
