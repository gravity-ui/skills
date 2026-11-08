import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import type {PageConstructorProps} from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.scss';

import './landing.css';

const content: PageConstructorProps['content'] = {
  blocks: [
    {
      type: 'header-block',
      overtitle: 'Учёт времени для команд',
      title: 'Учитывайте время команды без лишней рутины',
      description:
        'Таймтрекер для небольших команд: запускайте таймер из задачи, видите, где уходит время, и готовьте отчёты без ручных таблиц.',
      width: 'l',
      centered: true,
    },
    {
      type: 'extended-features-block',
      title: {text: 'Почему это удобно'},
      items: [
        {
          title: 'Учёт в один клик',
          text: 'Запускайте таймер прямо из задачи и останавливайте его, когда переключаетесь на другую. Никаких табелей в конце дня.',
        },
        {
          title: 'Прозрачность для команды',
          text: 'Видно, сколько времени уходит на проекты и задачи, без лишних созвонов и уточнений у каждого участника.',
        },
        {
          title: 'Отчёты без таблиц',
          text: 'Выгружайте сводку по проектам и сотрудникам за любой период, чтобы быстрее считать загрузку и выставлять счета.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время уже сегодня',
      subtitle: 'Команде из нескольких человек достаточно нескольких минут, чтобы начать.',
      button: {
        text: 'Начать работу',
        url: '#',
        theme: 'action',
      },
    },
  ],
};

export function App() {
  return (
    <PageConstructorProvider>
      <main className="landing">
        <PageConstructor content={content} />
      </main>
    </PageConstructorProvider>
  );
}
