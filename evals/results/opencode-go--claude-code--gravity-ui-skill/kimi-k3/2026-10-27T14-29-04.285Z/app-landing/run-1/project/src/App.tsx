import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import type {PageContent} from '@gravity-ui/page-constructor';

const content: PageContent = {
  blocks: [
    {
      type: 'header-block',
      overtitle: 'Такт — учёт времени для небольших команд',
      title: 'Знайте, на что уходит время вашей команды',
      description:
        'Простой трекер рабочего времени: команда отмечает часы в пару кликов, а вы видите картину по проектам и людям в реальном времени.',
      centered: true,
      verticalOffset: 'xl',
    },
    {
      type: 'extended-features-block',
      title: 'Три причины попробовать Такт',
      items: [
        {
          title: 'Учёт в один клик',
          text: 'Таймер и ручной ввод прямо в задаче. Команда тратит на отметки меньше минуты в день вместо табелей в конце недели.',
        },
        {
          title: 'Прозрачность по проектам',
          text: 'Часы автоматически раскладываются по проектам и клиентам — вы сразу видите, какие задачи съедают бюджет.',
        },
        {
          title: 'Отчёты без рутины',
          text: 'Готовые сводки по людям и проектам за любой период: для зарплаты, биллинга и планирования загрузки.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните считать время уже сегодня',
      subtitle: 'Подключите команду за 10 минут и получите первую сводку уже в конце дня.',
      button: {text: 'Попробовать бесплатно', url: '#signup', theme: 'action'},
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
