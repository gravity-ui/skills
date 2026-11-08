import {
  PageConstructor,
  PageConstructorProvider,
  Theme,
  type PageContent,
  type BlockDecorator,
} from '@gravity-ui/page-constructor';

// Replace with the team's contact address before publishing.
const CONTACT_EMAIL = 'hello@tempo.example';

const content: PageContent = {
  animated: false,
  blocks: [
    {
      type: 'header-block',
      width: 'l',
      verticalOffset: '0',
      overtitle: (
        <div className="hero-intro">
          <span className="wordmark">tempo<span className="wordmark-period">.</span></span>
          <span className="product-label">УЧЁТ ВРЕМЕНИ ДЛЯ КОМАНД</span>
        </div>
      ),
      title: '<span class="hero-title">Меньше учёта.<br /><span class="hero-title-secondary">Больше дела.</span></span>',
      description: '<p class="hero-description">Понимайте, на что уходит время команды.<br class="desktop-break" /> Простой трекер, понятные отчёты и больше внимания работе.</p>',
      additionalInfo: '<span class="hero-note">Ваше время ценно. Пусть оно работает на вас.</span>',
    },
    {
      type: 'extended-features-block',
      animated: false,
      indent: {top: '0', bottom: '0'},
      colSizes: {all: 12, sm: 12, md: 4},
      items: [
        {
          title: '<span class="feature-number" aria-hidden="true">01 /</span><span class="feature-title">Один клик — и в работе</span>',
          text: '<p class="feature-description">Запускайте таймер для любой задачи. Время учитывается, пока вы занимаетесь делом.</p>',
        },
        {
          title: '<span class="feature-number" aria-hidden="true">02 /</span><span class="feature-title">Вся команда на виду</span>',
          text: '<p class="feature-description">Видьте загрузку по людям и проектам. Распределяйте задачи без догадок и лишних созвонов.</p>',
        },
        {
          title: '<span class="feature-number" aria-hidden="true">03 /</span><span class="feature-title">Отчёты, в которых всё ясно</span>',
          text: '<p class="feature-description">Сравнивайте план с фактом и находите, куда уходят часы. Принимайте решения на основе данных.</p>',
        },
      ],
    },
    {
      type: 'content-layout-block',
      indent: {top: '0', bottom: '0'},
      size: 's',
      textWidth: 'l',
      textContent: {
        title: '<span class="cta-title">Хорошей работе — своё время.</span>',
        text: '<p class="cta-description">Начните с простого. Познакомьте свою команду с Tempo.</p>',
        buttons: [{
          text: 'Начать с Tempo ↗',
          theme: 'monochrome',
          size: 'xl',
          url: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Хочу подключить команду к Tempo')}`,
        }],
      },
    },
  ],
};

const decorateBlock: BlockDecorator = ({type, children}) => (
  <div className={type === 'header-block' ? 'hero' : type === 'extended-features-block' ? 'benefits' : 'closing-cta'}>
    {children}
  </div>
);

const custom = {decorators: {block: [decorateBlock]}};

export function App() {
  return (
    <main className="landing">
      <PageConstructorProvider locale={{lang: 'ru'}} theme={Theme.Light} projectSettings={{isAnimationEnabled: false}}>
        <PageConstructor content={content} custom={custom} />
      </PageConstructorProvider>
    </main>
  );
}
