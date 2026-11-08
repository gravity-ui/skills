import {useEffect, useState} from 'react';
import {PageConstructor, PageConstructorProvider, type PageContent} from '@gravity-ui/page-constructor';
import {Button, Text} from '@gravity-ui/uikit';

function TrialTimer() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (startedAt === null) return;
    const update = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  const time = [Math.floor(elapsed / 3600), Math.floor(elapsed / 60) % 60, elapsed % 60]
    .map((value) => String(value).padStart(2, '0')).join(':');

  function toggleTimer() {
    if (startedAt !== null) {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
      setStartedAt(null);
    } else {
      setElapsed(0);
      setStartedAt(Date.now());
      setHasStarted(true);
    }
  }

  return (
    <div className="trial">
      <Button view="action" size="xl" className="trial-button" onClick={toggleTimer}>
        {startedAt !== null ? 'Остановить таймер' : hasStarted ? 'Начать ещё раз' : 'Попробовать Tempo'}
        <span className="button-arrow" aria-hidden="true">↗</span>
      </Button>
      <Text as="p" variant="body-1" color="secondary" className="trial-note">
        {hasStarted ? (
          <><span role="timer" aria-label="Время пробной сессии">{time}</span> · {startedAt !== null ? 'Ваше время под контролем' : 'Пробная сессия завершена'}</>
        ) : 'Пробный таймер · Без регистрации'}
      </Text>
      <span className="sr-only" role="status">
        {hasStarted ? startedAt !== null ? 'Пробный таймер запущен' : `Таймер остановлен. Длительность ${time}` : ''}
      </span>
    </div>
  );
}

const content: PageContent = {
  animated: false,
  blocks: [
    {
      type: 'header-block',
      centered: true,
      width: 'l',
      verticalOffset: '0',
      indent: {top: '0', bottom: '0'},
      overtitle: (
        <div className="hero-intro">
          <Text variant="display-1" className="wordmark">tempo<span className="brand-dot">.</span></Text>
          <Text variant="body-1" className="eyebrow">ВРЕМЯ КОМАНДЫ — В ФОКУСЕ</Text>
        </div>
      ),
      title: '<span class="hero-title">Меньше рутины.<br><span class="hero-accent">Больше времени.</span></span>',
      description: '<p class="hero-description">Простой учёт времени для небольших команд.<br class="desktop-break"> Занимайтесь важным — Tempo поможет понять,<br class="desktop-break"> куда уходят часы.</p>',
    },
    {
      type: 'extended-features-block',
      animated: false,
      indent: {top: 'xl', bottom: 'xl'},
      colSizes: {all: 12, sm: 12, md: 4},
      items: [
        {
          title: '<span class="feature-number">01 /</span>Один клик — и вы в деле',
          text: '<p class="feature-description">Запускайте таймер и возвращайтесь к задаче. Учёт времени, который не отнимает время.</p>',
        },
        {
          title: '<span class="feature-number">02 /</span>Вся команда на виду',
          text: '<p class="feature-description">Понимайте загрузку коллег и распределяйте задачи без лишних сообщений и созвонов.</p>',
        },
        {
          title: '<span class="feature-number">03 /</span>Ясность в каждом часе',
          text: '<p class="feature-description">Видите, сколько времени уходит на проекты. Планируйте на основе фактов, а не ощущений.</p>',
        },
      ],
    },
    {
      type: 'content-layout-block',
      centered: true,
      size: 's',
      textWidth: 'l',
      indent: {top: '0', bottom: '0'},
      textContent: {
        title: '<span class="cta-title">Найдите время для главного.</span>',
        text: '<p class="cta-description">Начните с одной задачи. Остальное — в вашем темпе.</p>',
        buttons: [<TrialTimer key="trial" />],
      },
    },
  ],
};

export function App() {
  return (
    <main className="landing">
      <PageConstructorProvider locale={{lang: 'ru', tld: 'ru'}}>
        <PageConstructor content={content} />
      </PageConstructorProvider>
    </main>
  );
}
