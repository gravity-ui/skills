import type { PageContent } from '@gravity-ui/page-constructor';

export const landingContent: PageContent = {
  blocks: [
    {
      type: 'header-block',
      overtitle: 'Для команд',
      title: 'Учёт времени без лишних отчётов',
      description:
        'Отмечайте рабочее время команды в один клик и сразу получайте понятную нагрузку по проектам.',
      width: 's',
      verticalOffset: 'xl',
    },
    {
      type: 'extended-features-block',
      title: 'Почему командам удобно',
      items: [
        {
          title: 'Вход в один клик',
          text: 'Участники начинают и завершают таймер без переключения между приложениями.',
        },
        {
          title: 'Наглядная нагрузка',
          text: 'Руководитель видит занятость по людям и проектам в едином списке.',
        },
        {
          title: 'Готовые данные',
          text: 'Отчёты по часам собираются автоматически и не требуют ручных сводок.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Попробуйте TimeTeam бесплатно',
      subtitle: '14 дней без оплаты. Достаточно приглашения команды по email.',
      button: {
        text: 'Начать пробный период',
        url: '#',
      },
      width: 's',
    },
  ],
};
