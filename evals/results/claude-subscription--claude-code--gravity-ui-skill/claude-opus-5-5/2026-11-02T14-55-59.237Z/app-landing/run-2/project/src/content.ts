import type { PageContent } from '@gravity-ui/page-constructor';

const SIGNUP_URL = '/signup';

export const landingContent: PageContent = {
  blocks: [
    {
      type: 'header-block',
      centered: true,
      width: 'm',
      title: 'Учёт рабочего времени команды без лишней рутины',
      description:
        'Таймтрек — простой сервис, который показывает, сколько времени команда тратит на проекты и задачи. Запустите таймер в один клик и получите понятные отчёты в конце недели.',
      background: { color: 'var(--g-color-base-generic)' },
      buttons: [{ text: 'Попробовать бесплатно', theme: 'action', url: SIGNUP_URL }],
    },
    {
      type: 'extended-features-block',
      title: { text: 'Почему команды выбирают Таймтрек' },
      items: [
        {
          title: 'Старт за минуту',
          text: 'Таймер запускается одним нажатием, а время можно добавить и вручную — без сложной настройки и обучения.',
        },
        {
          title: 'Прозрачные отчёты',
          text: 'Сводки по людям, проектам и задачам за любой период помогают планировать загрузку и выставлять счета.',
        },
        {
          title: 'Создан для команд',
          text: 'Общие проекты, роли участников и единая картина по всей команде вместо разрозненных таблиц.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время уже сегодня',
      subtitle: '14 дней бесплатно, банковская карта не нужна.',
      color: 'var(--g-color-base-generic)',
      button: { text: 'Создать аккаунт', url: SIGNUP_URL, theme: 'action' },
    },
  ],
};
