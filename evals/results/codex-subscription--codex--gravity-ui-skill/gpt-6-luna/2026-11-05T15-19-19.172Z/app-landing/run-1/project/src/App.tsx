import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import type {PageContent} from '@gravity-ui/page-constructor';
import './App.css';

const content: PageContent = {
  blocks: [
    {
      type: 'hero-block',
      className: 'time-hero',
      overtitle: 'УЧЁТ ВРЕМЕНИ ДЛЯ КОМАНД',
      title: 'Понимайте, куда уходит время команды',
      text: 'Удобный учёт часов по проектам и задачам. Без таблиц, лишних напоминаний и догадок в конце месяца.',
      theme: 'light',
      verticalOffset: 'xl',
      animated: false,
    },
    {
      type: 'extended-features-block',
      className: 'time-features',
      title: 'Всё важное — в одном месте',
      items: [
        {
          title: 'Учёт без рутины',
          text: 'Запускайте таймер или добавляйте время вручную — как удобнее в моменте.',
        },
        {
          title: 'Понятная загрузка',
          text: 'Сразу видно, кто над чем работает и где команде нужна помощь.',
        },
        {
          title: 'Точные отчёты',
          text: 'Собирайте часы по проектам и периодам для планирования и счетов.',
        },
      ],
      animated: false,
    },
    {
      type: 'banner-block',
      className: 'time-cta',
      title: 'Попробуйте Timeflow в работе',
      subtitle: 'Начните учитывать время команды проще уже сегодня.',
      button: {
        text: 'Начать бесплатно',
        url: 'mailto:hello@timeflow.app?subject=Timeflow',
        theme: 'action',
      },
      animated: false,
    },
  ],
};

export function App() {
  return (
    <main className="landing-page">
      <PageConstructorProvider locale={{lang: 'ru'}}>
        <PageConstructor content={content} />
      </PageConstructorProvider>
    </main>
  );
}
