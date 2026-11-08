import {
  PageConstructor,
  PageConstructorProvider,
  type PageContent,
} from '@gravity-ui/page-constructor';

const content: PageContent = {
  blocks: [
    {
      type: 'header-block',
      overtitle: 'Тайм-трекер для команд',
      title: 'Учёт рабочего времени команды без лишних усилий',
      description:
        'Фиксируйте время по задачам, собирайте отчёты и понимайте, куда уходят часы вашей команды.',
      buttons: [{text: 'Начать бесплатно', theme: 'action', url: '#cta'}],
    },
    {
      type: 'extended-features-block',
      title: {text: 'Почему это удобно'},
      items: [
        {
          title: 'Запуск в один клик',
          text: 'Таймер стартует прямо из задачи — сотруднику не нужно вести таблицы вручную.',
        },
        {
          title: 'Отчёты по проектам',
          text: 'Часы автоматически группируются по проектам и людям — отчёт готов в любой момент.',
        },
        {
          title: 'Прозрачность загрузки',
          text: 'Каждый видит своё время, а руководитель — распределение часов по всей команде.',
        },
      ],
    },
    {
      type: 'banner-block',
      anchor: 'cta',
      title: 'Начните считать время уже сегодня',
      subtitle: 'Бесплатно для команд до пяти человек.',
      button: {text: 'Создать рабочее пространство', url: '#'},
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
