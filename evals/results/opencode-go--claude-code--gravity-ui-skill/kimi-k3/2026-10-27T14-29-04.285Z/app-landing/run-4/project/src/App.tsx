import '@gravity-ui/page-constructor/styles/styles.css';
import './reset.css';

import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import type {PageContent} from '@gravity-ui/page-constructor';

const content: PageContent = {
  blocks: [
    {
      type: 'header-block',
      title: 'Учёт времени команды без лишней возни',
      description:
        'TeamTime помогает небольшим командам фиксировать время по задачам и понимать, куда уходят часы — без сложных отчётов и настроек.',
      width: 'm',
      verticalOffset: 'xl',
      buttons: [{text: 'Попробовать бесплатно', url: '#', theme: 'action'}],
    },
    {
      type: 'extended-features-block',
      title: {text: 'Почему TeamTime'},
      items: [
        {
          title: 'Запуск за пару минут',
          text: 'Создайте проекты, пригласите команду — и можно отмечать время. Никакой долгой настройки.',
        },
        {
          title: 'Время в один клик',
          text: 'Таймер или ручной ввод по задачам — команда фиксирует часы прямо в процессе работы.',
        },
        {
          title: 'Понятные итоги',
          text: 'Сводка по проектам и людям за неделю или месяц: сразу видно, сколько времени заняла каждая задача.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните считать время уже сегодня',
      subtitle: 'Бесплатно для команд до пяти человек.',
      button: {text: 'Создать рабочее пространство', url: '#', theme: 'action'},
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
