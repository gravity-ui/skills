import {PageConstructor, PageConstructorProvider, Theme} from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.scss';

const content = {
  blocks: [
    {
      type: 'header-block',
      title: 'Время команды — под контролем',
      description:
        'Простой учёт рабочего времени помогает видеть загрузку команды и вовремя сдавать проекты.',
      centered: true,
      width: 'm',
      verticalOffset: 'l',
      animated: false,
    },
    {
      type: 'extended-features-block',
      title: 'Всё важное — без лишней рутины',
      items: [
        {
          title: 'Удобный учёт',
          text: 'Команда фиксирует время по задачам за пару минут в день.',
        },
        {
          title: 'Понятная загрузка',
          text: 'Сразу видно, где у команды есть свободное время, а где нужен фокус.',
        },
        {
          title: 'Точные отчёты',
          text: 'Собирайте фактические часы по проектам для планирования и анализа.',
        },
      ],
      animated: false,
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время проще',
      subtitle: 'Подключите команду и наведите порядок в рабочих часах.',
      button: {
        text: 'Попробовать бесплатно',
        url: 'mailto:hello@teamtime.example',
      },
      animated: false,
    },
  ],
};

export function App() {
  return (
    <PageConstructorProvider theme={Theme.Light} locale={{lang: 'ru'}}>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  );
}
