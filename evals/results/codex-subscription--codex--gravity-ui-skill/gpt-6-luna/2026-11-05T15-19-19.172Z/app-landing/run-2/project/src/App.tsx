import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.scss';

const content = {
  blocks: [
    {
      type: 'header-block',
      title: 'Понимайте, куда уходит время команды',
      description:
        'Простой учёт рабочего времени помогает планировать загрузку, видеть прогресс и вовремя замечать перегрузки.',
      width: 'm',
      verticalOffset: 'l',
      centered: true,
      animated: false,
    },
    {
      type: 'extended-features-block',
      title: 'Всё важное — без лишней сложности',
      items: [
        {
          title: 'Учёт за пару кликов',
          text: 'Фиксируйте время по задачам и проектам, не отвлекаясь от работы.',
        },
        {
          title: 'Понятная загрузка команды',
          text: 'Сразу видно, кто чем занят и где потребуется помощь.',
        },
        {
          title: 'Отчёты для решений',
          text: 'Собирайте точные данные по проектам и планируйте следующую неделю.',
        },
      ],
      animated: false,
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время команды',
      subtitle: 'Меньше догадок — больше ясности в каждом проекте.',
      button: {text: 'Попробовать бесплатно', url: 'mailto:hello@timeflow.app', theme: 'action'},
      width: 'm',
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
