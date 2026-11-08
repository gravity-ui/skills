import '@gravity-ui/page-constructor/styles/styles.scss';
import './landing.css';

import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import type {PageConstructorProps} from '@gravity-ui/page-constructor';

const content: PageConstructorProps['content'] = {
  blocks: [
    {
      type: 'header-block',
      overtitle: 'Учёт времени для команд',
      title: 'Все часы команды — в одном месте',
      description:
        'Фиксируйте время по задачам и проектам, видите загрузку людей и получайте отчёты без ручных сверок.',
      centered: true,
    },
    {
      type: 'extended-features-block',
      title: 'Почему команды выбирают нас',
      items: [
        {
          title: 'Учёт в один клик',
          text: 'Запускайте таймер прямо из задачи или добавляйте записи задним числом — без отдельных таблиц.',
        },
        {
          title: 'Видно загрузку команды',
          text: 'Сводка по людям и проектам показывает, кто перегружен, а где есть свободные часы.',
        },
        {
          title: 'Отчёты без ручной сверки',
          text: 'Данные собираются автоматически: выгрузите отчёт по проекту или клиенту за пару кликов.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните вести учёт времени сегодня',
      subtitle: 'Подключите команду и заполните первую неделю уже в день запуска.',
      button: {
        text: 'Начать работу',
        url: '#',
      },
    },
  ],
};

export function App() {
  return (
    <PageConstructorProvider locale={{lang: 'ru'}}>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  );
}
