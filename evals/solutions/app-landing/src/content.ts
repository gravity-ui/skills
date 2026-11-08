// Landing page content for the page-constructor: the whole page is data,
// described as a list of typed block configs (JSON-native format).
import { BlockType, SubBlockType, type PageContent } from '@gravity-ui/page-constructor';

export const landingContent: PageContent = {
  blocks: [
    // Hero
    {
      type: BlockType.HeaderBlock,
      width: 'm',
      verticalOffset: 'l',
      title: 'ТаймТрек — учёт времени для команд',
      description:
        'Простой SaaS-инструмент, который показывает, куда уходит время вашей команды: ' +
        'таймеры, отчёты по проектам и прозрачная загрузка сотрудников.',
      buttons: [
        {
          text: 'Попробовать бесплатно',
          theme: 'action',
          size: 'promo',
          url: '#cta',
        },
        {
          text: 'Смотреть демо',
          theme: 'outlined',
          size: 'promo',
          url: '#features',
        },
      ],
    },
    // Features
    {
      type: BlockType.CardLayoutBlock,
      anchor: { text: 'Возможности', url: 'features' },
      title: 'Всё для учёта времени в одном месте',
      description: 'Три инструмента, которые закрывают ежедневные задачи команды.',
      colSizes: { all: 12, md: 4 },
      children: [
        {
          type: SubBlockType.BasicCard,
          url: '#features',
          title: 'Таймеры в один клик',
          text: 'Запускайте отсчёт прямо из задачи — в браузере, на десктопе и в мобильном приложении.',
        },
        {
          type: SubBlockType.BasicCard,
          url: '#features',
          title: 'Отчёты по проектам',
          text: 'Детализация по проектам, клиентам и людям. Экспорт в CSV и выгрузка для бухгалтерии.',
        },
        {
          type: SubBlockType.BasicCard,
          url: '#features',
          title: 'Загрузка команды',
          text: 'Наглядная картина занятости: кто перегружен, у кого есть свободные часы на новые задачи.',
        },
      ],
    },
    // Final CTA
    {
      type: BlockType.BannerBlock,
      anchor: { text: 'Начать', url: 'cta' },
      title: 'Готовы навести порядок во времени команды?',
      subtitle: '14 дней полного доступа бесплатно. Без банковской карты.',
      color: '#5282ff',
      theme: 'dark',
      button: {
        text: 'Попробовать бесплатно',
        url: '#features',
        theme: 'raised',
      },
    },
  ],
};
