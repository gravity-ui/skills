import {PageConstructor, PageConstructorProvider, Theme} from '@gravity-ui/page-constructor';
import type {PageContent} from '@gravity-ui/page-constructor';
import './App.css';

const features = [
  {number: '01', title: 'Время под контролем', text: 'Запускайте таймер и занимайтесь делом. Все часы сохранятся в нужном проекте.'},
  {number: '02', title: 'Команда в одном ритме', text: 'Видите загрузку каждого и распределяйте задачи без лишних встреч и сообщений.'},
  {number: '03', title: 'Понятная картина дня', text: 'Узнайте, куда уходит время. Простые отчёты помогут точнее планировать работу.'},
];

// All HTML here is static, trusted page copy, not user-provided content.
const content: PageContent = {
  animated: false,
  blocks: [
    {
      type: 'header-block',
      className: 'tempo-hero',
      width: 'l',
      centered: true,
      verticalOffset: '0',
      indent: {top: '0', bottom: 'xl'},
      overtitle: '<span class="brand-row"><span class="wordmark">tempo<span class="wordmark-dot">.</span></span><span class="brand-note">Время для важного</span></span><span class="hero-kicker">УЧЁТ ВРЕМЕНИ ДЛЯ НЕБОЛЬШИХ КОМАНД</span>',
      title: '<span class="hero-line">Меньше рутины.</span><span class="hero-line hero-accent">Больше фокуса.</span>',
      description: '<span class="hero-description">Всё время команды — в одном месте.<br class="desktop-break" /> Учитывайте часы, следите за проектами и берегите фокус.</span>',
    },
    {
      type: 'extended-features-block',
      animated: false,
      indent: {top: '0', bottom: 'xl'},
      colSizes: {all: 12, sm: 12, md: 4},
      items: features.map(({number, title, text}) => ({
        title: `<span class="feature-heading"><span class="feature-number">${number} /</span><span class="feature-title">${title}</span></span>`,
        text: `<p class="feature-description">${text}</p>`,
      })),
    },
    {
      type: 'banner-block',
      className: 'tempo-cta',
      animated: false,
      indent: {top: '0', bottom: 'm'},
      title: '<span class="cta-heading">Найдите свой рабочий ритм.</span>',
      subtitle: '<span class="cta-description">Начните с Tempo. Напишите нам, чтобы подключить команду.</span>',
      color: 'var(--g-color-base-generic-ultralight)',
      button: {
        text: 'Подключить команду  ↗',
        theme: 'action',
        url: 'mailto:hello@tempo.team?subject=Подключение%20команды%20к%20Tempo',
      },
    },
  ],
};

export function App() {
  return (
    <main className="landing">
      <PageConstructorProvider locale={{lang: 'ru', tld: 'ru'}} theme={Theme.Light}>
        <PageConstructor content={content} />
      </PageConstructorProvider>
    </main>
  );
}
