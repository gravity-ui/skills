import { PageConstructor, PageConstructorProvider } from '@gravity-ui/page-constructor';
import type { PageContent } from '@gravity-ui/page-constructor';

const landingContent: PageContent = {
  blocks: [
    {
      type: 'header-block',
      title: 'Учёт времени без лишних шагов',
      description:
        'TimeFrame — компактный инструмент для команд: время фиксируется быстро, отчёты понятны, а планирование остаётся реалистичным.',
      width: 'm',
    },
    {
      type: 'card-layout-block',
      title: 'Три преимущества',
      colSizes: { all: 12, sm: 6, md: 4 },
      children: [
        {
          type: 'basic-card',
          title: 'Отметка за десять секунд',
          text: 'Старт задачи фиксируется в один клик, не прерывая текущую работу.',
          size: 'm',
          border: 'line',
        },
        {
          type: 'basic-card',
          title: 'Полная картина команды',
          text: 'Показатели собраны в наглядных отчётах: время, загрузка и отклонения от плана.',
          size: 'm',
          border: 'line',
        },
        {
          type: 'basic-card',
          title: 'Планирование без перегрузок',
          text: 'Реальные затраты времени показывают, где добавить ресурс или снизить объём работы.',
          size: 'm',
          border: 'line',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните вести прозрачный учёт времени уже сегодня',
      subtitle: 'Простая настройка, понятные отчёты и работа команды в одном месте.',
      button: {
        text: 'Начать бесплатно',
        url: '#get-started',
      },
    },
  ],
};

export function App() {
  return (
    <PageConstructorProvider>
      <PageConstructor content={landingContent} />
    </PageConstructorProvider>
  );
}
