import { PageConstructor, PageConstructorProvider } from '@gravity-ui/page-constructor';
import type { PageContent } from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.scss';
import './app.css';

const content: PageContent = {
  blocks: [
    {
      type: 'header-block',
      title: 'Учёт времени для команд без лишней рутины',
      description:
        'Фиксируйте часы по проектам и задачам в пару кликов и видите, куда уходит время команды.',
      width: 'm',
      centered: true,
      buttons: [{ text: 'Попробовать бесплатно', theme: 'action', url: '#start' }],
    },
    {
      type: 'card-layout-block',
      colSizes: { all: 12, sm: 6, md: 4 },
      children: [
        {
          type: 'basic-card',
          title: 'Быстрый старт',
          text: 'Таймер и ручной ввод часов работают сразу — без долгой настройки и обучения.',
        },
        {
          type: 'basic-card',
          title: 'Прозрачность для команды',
          text: 'Все видят загрузку по проектам и людям, поэтому планировать проще.',
        },
        {
          type: 'basic-card',
          title: 'Понятные отчёты',
          text: 'Сводки по времени за неделю и месяц собираются автоматически.',
        },
      ],
    },
    {
      type: 'banner-block',
      anchor: { url: 'start', text: 'Начать' },
      title: 'Начните считать время уже сегодня',
      subtitle: 'Подключите команду за пару минут.',
      button: { text: 'Попробовать бесплатно', theme: 'action', url: '#start' },
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
