import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import type {PageContent} from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.scss';
import './app.css';

const content: PageContent = {
  blocks: [
    {
      type: 'header-block',
      title: 'Учёт времени для команд без лишней рутины',
      description:
        'Запускайте таймер в один клик, а в конце недели получайте понятный отчёт по проектам и людям.',
      width: 'm',
      buttons: [{text: 'Попробовать бесплатно', theme: 'action', url: '#start'}],
    },
    {
      type: 'extended-features-block',
      title: {text: 'Почему команды выбирают нас'},
      colSizes: {all: 12, md: 4},
      items: [
        {
          title: 'Быстрый старт',
          text: 'Создайте проект, пригласите коллег и начинайте считать время — настройка занимает пару минут.',
        },
        {
          title: 'Прозрачные отчёты',
          text: 'Смотрите, сколько времени уходит на каждый проект и задачу, без таблиц и ручных подсчётов.',
        },
        {
          title: 'Удобно всей команде',
          text: 'Один общий список проектов, простой таймер и ясная картина загрузки для руководителя.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните считать время уже сегодня',
      subtitle: 'Первые 14 дней бесплатно, карта не нужна.',
      button: {text: 'Попробовать бесплатно', theme: 'action', url: '#start'},
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
