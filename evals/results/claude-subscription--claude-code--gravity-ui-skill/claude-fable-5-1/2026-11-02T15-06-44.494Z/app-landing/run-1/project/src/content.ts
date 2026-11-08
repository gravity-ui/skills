import type { PageContent } from '@gravity-ui/page-constructor';

// Текстовые поля блоков поддерживают YFM только после серверной обработки
// (contentTransformer). Здесь контент статический, поэтому используем простой текст.
export const content: PageContent = {
  animated: false,
  blocks: [
    {
      type: 'header-block',
      centered: true,
      width: 'l',
      verticalOffset: 'l',
      title: 'Учёт времени для небольших команд',
      description:
        'Фиксируйте часы по проектам, видите загрузку команды и закрывайте отчёты за минуты, а не за вечер.',
    },
    {
      type: 'extended-features-block',
      title: 'Почему команды выбирают нас',
      colSizes: { all: 12, sm: 6, md: 4 },
      items: [
        {
          title: 'Запуск за минуту',
          text: 'Таймер запускается одним кликом, а задача и проект подставляются из последней записи.',
        },
        {
          title: 'Прозрачная загрузка',
          text: 'Видно, кто над чем работает прямо сейчас и сколько часов осталось в бюджете проекта.',
        },
        {
          title: 'Отчёты без ручной работы',
          text: 'Итоги по сотрудникам и проектам собираются автоматически и выгружаются в CSV за секунды.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Попробуйте бесплатно',
      subtitle: 'Команда до 5 человек работает бесплатно, без карты и ограничений по времени.',
      color: 'var(--g-color-base-generic)',
      button: {
        text: 'Начать бесплатно',
        url: 'https://example.com/signup',
        theme: 'action',
      },
    },
  ],
};
