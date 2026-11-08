import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.scss';
import './landing.css';

const content = {
  blocks: [
    {
      type: 'header-block',
      title: 'Время команды — под контролем',
      description: 'Простой учёт рабочих часов помогает видеть загрузку, планировать проекты и вовремя замечать перегрузки.',
      width: 'm',
      centered: true,
      buttons: [{text: 'Попробовать бесплатно', theme: 'action', url: '#start'}],
    },
    {
      type: 'extended-features-block',
      title: 'Больше ясности в каждом проекте',
      items: [
        {title: 'Понятная загрузка', text: 'Сразу видно, над чем работает команда и сколько времени занимают задачи.'},
        {title: 'Точные отчёты', text: 'Собирайте часы по проектам и периодам без ручных таблиц.'},
        {title: 'Здоровый темп', text: 'Замечайте перегрузки и распределяйте работу равномернее.'},
      ],
      animated: false,
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время проще',
      subtitle: 'Попробуйте инструмент вместе со своей командой.',
      button: {text: 'Начать бесплатно', url: '#start'},
      color: 'var(--g-color-base-generic)',
      animated: false,
    },
  ],
};

export function App() {
  return <main className="landing"><PageConstructorProvider><PageConstructor content={content} /></PageConstructorProvider></main>;
}
