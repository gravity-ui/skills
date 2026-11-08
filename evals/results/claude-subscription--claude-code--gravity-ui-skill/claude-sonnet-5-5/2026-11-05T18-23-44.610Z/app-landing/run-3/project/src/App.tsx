import { PageConstructor, PageConstructorProvider } from '@gravity-ui/page-constructor';
import type { PageContent } from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.scss';

import './app.css';

// TODO: replace with the real sign-up URL.
const CTA_URL = '#';

const content: PageContent = {
  blocks: [
    {
      type: 'header-block',
      title: 'Учёт времени команды без лишних кликов',
      description:
        'Понятный инструмент, который показывает, куда уходит время команды, и помогает планировать загрузку без таблиц и ручных отчётов.',
      centered: true,
      width: 'm',
    },
    {
      type: 'extended-features-block',
      colSizes: { all: 12, sm: 6, md: 4 },
      items: [
        {
          title: 'Старт за минуту',
          text: 'Добавьте команду и начинайте отмечать время — без сложной настройки и обучения.',
        },
        {
          title: 'Прозрачная картина',
          text: 'Видно, сколько времени уходит на проекты и задачи, а значит — где команда перегружена.',
        },
        {
          title: 'Отчёты без рутины',
          text: 'Сводки по людям и проектам собираются сами, их не нужно готовить вручную.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время уже сегодня',
      subtitle: 'Подключите команду и увидите первые данные в тот же день.',
      button: { text: 'Попробовать', url: CTA_URL, theme: 'action' },
    },
  ],
};

export function App() {
  return (
    <PageConstructorProvider locale={{ lang: 'ru' }}>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  );
}
