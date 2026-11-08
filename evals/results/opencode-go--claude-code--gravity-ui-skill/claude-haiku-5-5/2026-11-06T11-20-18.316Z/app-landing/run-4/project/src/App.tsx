import '@gravity-ui/page-constructor/styles/styles.scss';
import './index.css';

import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import type {PageContent} from '@gravity-ui/page-constructor';

const content: PageContent = {
  blocks: [
    {
      type: 'header-block',
      overtitle: 'Учёт времени для команд',
      title: 'Понятно, куда уходит время вашей команды',
      description:
        'Простой трекер времени: запускайте таймер в один клик, отмечайте задачи и смотрите отчёты по людям и проектам.',
      width: 'l',
    },
    {
      type: 'extended-features-block',
      title: 'Что вы получаете',
      items: [
        {
          title: 'Таймер в один клик',
          text: 'Запускайте и останавливайте учёт прямо из списка задач, не переключаясь между окнами.',
        },
        {
          title: 'Отчёты по командам и проектам',
          text: 'Видно, сколько времени уходит на задачи, проекты и участников за любой период.',
        },
        {
          title: 'Быстрый старт',
          text: 'Подключите команду за несколько минут, без сложной настройки и долгого обучения.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время уже сегодня',
      subtitle: 'Создайте рабочее пространство для команды за пару минут.',
      button: {
        text: 'Начать работу',
        url: '#',
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
