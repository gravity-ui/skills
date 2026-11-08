import {
  BlockType,
  PageConstructor,
  PageConstructorProvider,
  SubBlockType,
} from '@gravity-ui/page-constructor';
import type {PageContent} from '@gravity-ui/page-constructor';

const content: PageContent = {
  blocks: [
    {
      type: BlockType.HeaderBlock,
      overtitle: 'Учёт времени для команд',
      title: 'ТаймТрек — простой учёт рабочего времени команды',
      description:
        'Фиксируйте часы по проектам, собирайте отчёты и понимайте, куда уходит время команды — без сложных настроек и лишних функций.',
      centered: true,
    },
    {
      type: BlockType.CardLayoutBlock,
      title: 'Почему команды выбирают ТаймТрек',
      children: [
        {
          type: SubBlockType.BasicCard,
          title: 'Запуск в один клик',
          text: 'Таймер стартует одной кнопкой прямо из задачи. Команда тратит секунды на учёт, а не на заполнение таблиц.',
          border: 'line',
        },
        {
          type: SubBlockType.BasicCard,
          title: 'Прозрачные отчёты',
          text: 'Готовые отчёты по проектам и людям за любой период: видно, куда уходит время и во что реально обходится задача.',
          border: 'line',
        },
        {
          type: SubBlockType.BasicCard,
          title: 'Ничего лишнего',
          text: 'Только учёт времени и отчёты. Без корпоративного портала и модулей, которыми никто не пользуется.',
          border: 'line',
        },
      ],
    },
    {
      type: BlockType.BannerBlock,
      title: 'Начните учитывать время уже сегодня',
      subtitle: 'Бесплатно для команд до пяти человек. Карта не нужна.',
      button: {
        text: 'Попробовать бесплатно',
        url: '/signup',
        theme: 'action',
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
