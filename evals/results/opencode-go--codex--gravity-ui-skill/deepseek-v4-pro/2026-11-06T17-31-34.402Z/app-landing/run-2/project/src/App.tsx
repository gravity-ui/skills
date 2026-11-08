import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';

const content = {
  blocks: [
    {
      type: 'hero-block',
      title: 'Учёт времени для команд',
      text: 'Простой инструмент, который помогает командам отслеживать затраты времени на проекты, видеть, куда уходят часы, и выставлять счета без лишних усилий.',
      buttons: [
        {text: 'Попробовать бесплатно', theme: 'action', url: '#signup'},
        {text: 'Узнать больше', theme: 'outlined', url: '#features'},
      ],
      background: {
        color: '#f5f7fa',
      },
      verticalOffset: 'l',
    },
    {
      type: 'card-layout-block',
      title: 'Что вы получаете',
      colSizes: {all: 12, sm: 4, md: 4},
      children: [
        {
          type: 'basic-card',
          title: 'Точный трекинг',
          text: 'Отслеживайте время по проектам и задачам в один клик. Хронометраж с точностью до минуты.',
          size: 'm',
          border: 'none',
          gravityIcon: {name: 'Stopwatch', color: 'brand'},
        },
        {
          type: 'basic-card',
          title: 'Командная работа',
          text: 'Приглашайте участников, распределяйте роли и видите, кто над чем работает в реальном времени.',
          size: 'm',
          border: 'none',
          gravityIcon: {name: 'Persons', color: 'brand'},
        },
        {
          type: 'basic-card',
          title: 'Понятная аналитика',
          text: 'Смотрите отчёты по проектам, сотрудникам и клиентам. Экспортируйте данные в один клик.',
          size: 'm',
          border: 'none',
          gravityIcon: {name: 'ChartBar', color: 'brand'},
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Готовы навести порядок в учёте времени?',
      subtitle: 'Начните бесплатно и подключите команду за пару минут.',
      button: {text: 'Зарегистрироваться', url: '#signup'},
      color: '#f5f7fa',
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
