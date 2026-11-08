import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.scss';

const content = {
  blocks: [
    {
      type: 'hero-block',
      overtitle: 'Учёт времени',
      title: 'Трекайте время команды без усилий',
      text: 'Прозрачный учёт часов, автоматические отчёты и простая аналитика загрузки — всё в одном инструменте.',
      buttons: [
        {text: 'Попробовать бесплатно', theme: 'action' as const, url: '#cta'},
        {text: 'Узнать больше', theme: 'outlined' as const, url: '#features'},
      ],
      verticalOffset: 'xl' as const,
    },
    {
      type: 'card-layout-block',
      title: 'Почему TimeTrack',
      anchor: 'features',
      colSizes: {all: 12, sm: 6, md: 4},
      children: [
        {
          type: 'basic-card',
          title: 'Одно нажатие',
          text: 'Старт и стоп таймера в один клик. Никаких таблиц и ручного ввода — просто начните работать.',
          size: 'm' as const,
          border: 'line' as const,
        },
        {
          type: 'basic-card',
          title: 'Командная аналитика',
          text: 'Кто чем занят, сколько часов потрачено на проект и когда ждать релиз — видно с первого взгляда.',
          size: 'm' as const,
          border: 'line' as const,
        },
        {
          type: 'basic-card',
          title: 'Интеграции из коробки',
          text: 'Jira, GitHub, Slack и ещё два десятка сервисов — данные подтягиваются сами, без рутины.',
          size: 'm' as const,
          border: 'line' as const,
        },
      ],
    },
    {
      type: 'content-layout-block',
      anchor: 'cta',
      centered: true,
      size: 'l' as const,
      textWidth: 'm' as const,
      textContent: {
        title: 'Начните учитывать время уже сегодня',
        text: 'Первый месяц бесплатно для команд до десяти человек. Без карт, без скрытых платежей, без обязательств.',
        buttons: [{text: 'Зарегистрироваться', theme: 'action' as const, url: '#'}],
        centered: true,
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
