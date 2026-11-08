import { PageConstructor, PageConstructorProvider } from '@gravity-ui/page-constructor';
import type { PageContent } from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.scss';
import './App.css';

const CTA_URL = '#';

const content: PageContent = {
  blocks: [
    {
      type: 'header-block',
      title: 'Учёт времени для команд — без лишней рутины',
      description:
        'Понятно, на что уходит время команды: фиксируйте задачи в пару кликов и видите общую картину по проектам.',
      width: 'm',
      buttons: [{ text: 'Попробовать бесплатно', theme: 'action', url: CTA_URL }],
    },
    {
      type: 'extended-features-block',
      items: [
        {
          title: 'Быстрый старт',
          text: 'Запускайте и останавливайте таймер в один клик — команде не нужно долго привыкать.',
        },
        {
          title: 'Прозрачность по проектам',
          text: 'Сколько времени ушло на каждый проект и задачу — всё в одном месте и без ручных таблиц.',
        },
        {
          title: 'Работа всей командой',
          text: 'Общие проекты и единая картина по загрузке помогают планировать сроки и распределять работу.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время уже сегодня',
      subtitle: 'Подключите команду за несколько минут.',
      button: { text: 'Попробовать бесплатно', theme: 'action', url: CTA_URL },
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
