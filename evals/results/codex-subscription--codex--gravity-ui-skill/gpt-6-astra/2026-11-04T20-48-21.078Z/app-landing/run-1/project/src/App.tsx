import {PageConstructor, PageConstructorProvider, type PageContent} from '@gravity-ui/page-constructor';
import {Text} from '@gravity-ui/uikit';
import '@gravity-ui/page-constructor/styles/styles.scss';
import './styles.css';

const productUrl = import.meta.env.VITE_PRODUCT_URL;

export function App() {
  const shareUrl = `mailto:?subject=${encodeURIComponent('Tempo — время для нашей команды')}&body=${encodeURIComponent(`Давайте попробуем Tempo — простой учёт времени для команды.\n\n${window.location.href}`)}`;

  const content: PageContent = {
    animated: false,
    blocks: [
      {
        type: 'header-block',
        className: 'tempo-hero',
        indent: {top: '0', bottom: '0'},
        animated: false,
        width: 'l',
        centered: true,
        verticalOffset: '0',
        overtitle: <div className="hero-intro">
          <Text as="div" variant="display-1" className="wordmark">tempo<span className="wordmark-dot">.</span></Text>
          <Text as="div" variant="caption-2" className="eyebrow">ВРЕМЯ РАБОТАТЬ В СВОЁМ РИТМЕ</Text>
        </div>,
        title: 'Меньше учёта.<br><span class="hero-accent">Больше дела.</span>',
        description: '<p class="hero-description">Простой трекер времени для команд, которые ценят фокус.<br class="desktop-break"> Соберите часы, проекты и ясность в одном месте.</p>',
      },
      {
        type: 'extended-features-block',
        className: 'tempo-features',
        indent: {top: '0', bottom: '0'},
        animated: false,
        colSizes: {all: 12, sm: 12, md: 4},
        items: [
          {
            title: '<span class="feature-number" aria-hidden="true">01 /</span>Время под рукой',
            text: '<p class="feature-description">Запускайте таймер в один клик.<br>Сосредоточьтесь на задаче —<br>Tempo посчитает минуты.</p>',
          },
          {
            title: '<span class="feature-number" aria-hidden="true">02 /</span>Команда в одном ритме',
            text: '<p class="feature-description">Видите загрузку всей команды.<br>Распределяйте работу спокойно,<br>без лишних встреч и сообщений.</p>',
          },
          {
            title: '<span class="feature-number" aria-hidden="true">03 /</span>Ясность по проектам',
            text: '<p class="feature-description">Понимайте, на что уходят часы.<br>Планируйте сроки на основе данных,<br>а не ощущений.</p>',
          },
        ],
      },
      {
        type: 'content-layout-block',
        className: 'tempo-cta',
        indent: {top: '0', bottom: '0'},
        animated: false,
        centered: true,
        textWidth: 'l',
        textContent: {
          centered: true,
          title: 'У каждой команды свой темп.',
          text: productUrl ? 'Найдите свой. Начните учитывать время с Tempo.' : 'Найдите свой. Познакомьте команду с Tempo.',
          buttons: [{
            text: productUrl ? 'Начать с Tempo  ↗' : 'Поделиться с командой  ↗',
            theme: 'action',
            size: 'xl',
            url: productUrl || shareUrl,
          }],
        },
      },
    ],
  };

  return <main className="tempo-page">
    <PageConstructorProvider locale={{lang: 'ru'}}>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  </main>;
}
