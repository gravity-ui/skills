import type { PageContent } from '@gravity-ui/page-constructor';

export const content: PageContent = {
  // No entrance animations anywhere on the page.
  animated: false,
  blocks: [
    {
      type: 'header-block',
      centered: true,
      width: 'm',
      verticalOffset: 'l',
      overtitle: 'Учёт времени для небольших команд',
      title: 'Знайте, куда уходит время вашей команды',
      description:
        'Таймтрекер без лишних настроек: один клик, чтобы начать, и понятный отчёт в конце недели. Для команд от 2 до 50 человек.',
      buttons: [
        { text: 'Попробовать бесплатно', theme: 'action', url: '#start' },
        { text: 'Как это работает', theme: 'outlined', url: '#features' },
      ],
    },
    {
      type: 'extended-features-block',
      anchor: { text: 'Преимущества', url: 'features' },
      title: { text: 'Три причины начать сегодня' },
      items: [
        {
          title: 'Старт за одну минуту',
          text: 'Создайте команду, пригласите коллег по ссылке и запускайте таймер. Без обучения, инструкций и внедрения.',
        },
        {
          title: 'Отчёты, которые читают',
          text: 'Сводка по проектам, людям и неделям формируется автоматически. Один экспорт в CSV или PDF для клиента и бухгалтерии.',
        },
        {
          title: 'Честная цена для маленьких',
          text: 'Фиксированная подписка на команду, а не плата за каждого участника. Приглашайте фрилансеров и подрядчиков бесплатно.',
        },
      ],
    },
    {
      type: 'banner-block',
      anchor: { text: 'Начать', url: 'start' },
      title: 'Начните считать время уже сегодня',
      subtitle: '14 дней бесплатно, без карты и обязательств.',
      color: 'var(--g-color-base-brand)',
      theme: 'dark',
      button: {
        text: 'Создать команду',
        theme: 'normal-contrast',
        url: '#start',
      },
    },
  ],
};
