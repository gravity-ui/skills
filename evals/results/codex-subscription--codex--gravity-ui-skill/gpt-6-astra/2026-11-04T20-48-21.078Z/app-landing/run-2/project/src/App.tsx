import {PageConstructor, PageConstructorProvider, type PageContent} from '@gravity-ui/page-constructor';
import {Text} from '@gravity-ui/uikit';

const content: PageContent = {
  animated: false,
  blocks: [
    {
      type: 'header-block',
      overtitle: (
        <div className="hero-intro">
          <Text className="wordmark" variant="display-1">такт<span aria-hidden="true">.</span></Text>
          <span className="eyebrow">Меньше рутины. Больше времени.</span>
        </div>
      ),
      title: 'Время команды.<br><span class="hero-accent">Всё на виду.</span>',
      description: 'Простой учёт времени для команд, которые хотят<br class="desktop-break"> заниматься делом, а не заполнять таблицы.',
      additionalInfo: 'В своём ритме. Вместе с командой.',
      centered: true,
      width: 'l',
      verticalOffset: 's',
      background: {color: 'var(--g-color-base-utility-light)', fullWidth: true},
      indent: {top: 'zero', bottom: 'zero'},
    },
    {
      type: 'extended-features-block',
      animated: false,
      colSizes: {all: 12, sm: 12, md: 4},
      indent: {top: 's', bottom: 's'},
      items: [
        {title: 'Учёт без лишних действий', text: 'Запускайте таймер и возвращайтесь к работе. Каждая минута останется в нужном проекте.'},
        {title: 'Общая картина для всех', text: 'Видьте, на что уходит время команды. Планируйте нагрузку без догадок и лишних встреч.'},
        {title: 'Понятные отчёты', text: 'Собирайте часы по людям и проектам. Делитесь результатами с командой и клиентами.'},
      ],
    },
    {
      type: 'banner-block',
      animated: false,
      title: 'Хорошей работе — своё время.',
      subtitle: 'Начните с бесплатного шаблона для вашей команды.',
      color: 'var(--g-color-base-utility-light)',
      button: {text: 'Скачать шаблон  ↗', url: '/takt-template.csv', theme: 'action'},
      indent: {top: 'zero', bottom: 'zero'},
    },
  ],
};

export function App() {
  return (
    <main className="landing">
      <PageConstructorProvider locale={{lang: 'ru'}}>
        <PageConstructor content={content} />
      </PageConstructorProvider>
    </main>
  );
}
