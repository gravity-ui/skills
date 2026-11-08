import {useEffect, useRef, useState} from 'react';
import {PageConstructor, PageConstructorProvider, Theme, type PageContent} from '@gravity-ui/page-constructor';
import {Button, Text} from '@gravity-ui/uikit';
import './App.css';

function Benefit({number, title, description}: {number: string; title: string; description: string}) {
  return (
    <article className="benefit">
      <Text variant="caption-2" className="benefit-number">{number} /</Text>
      <Text as="h2" variant="header-1" className="benefit-title">{title}</Text>
      <Text as="p" variant="body-2" className="benefit-description">{description}</Text>
    </article>
  );
}

function TimerCta() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const accumulated = useRef(0);

  useEffect(() => {
    if (!running) return;
    const tick = () => setElapsed(accumulated.current + Date.now() - startedAt.current);
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [running]);

  const toggleTimer = () => {
    if (running) {
      accumulated.current += Date.now() - startedAt.current;
      setElapsed(accumulated.current);
    } else {
      startedAt.current = Date.now();
    }
    setRunning(!running);
  };

  const seconds = Math.floor(elapsed / 1000);
  const time = `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="cta-copy">
        <Text as="p" variant="caption-2" className="eyebrow">ХОРОШАЯ РАБОТА НАЧИНАЕТСЯ С ФОКУСА</Text>
        <Text as="h2" variant="display-1" id="cta-title">Пора ценить своё время.</Text>
        <Text as="p" variant="body-2" className="cta-description">Начните с одной задачи. Остальное — в своём темпе.</Text>
      </div>
      <div className="cta-action">
        <Button view="action" size="xl" className="start-button" onClick={toggleTimer} aria-pressed={running}>
          {running ? 'Приостановить' : elapsed > 0 ? 'Продолжить отсчёт' : 'Попробовать таймер'}
          <span className="button-arrow" aria-hidden="true">{running ? 'Ⅱ' : '↗'}</span>
        </Button>
        <Text as="p" variant="caption-2" className="cta-note">
          {elapsed > 0 || running ? <><span className="timer" role="timer" aria-label="Прошедшее время">{time}</span> · {running ? 'Время идёт' : 'На паузе'}</> : 'Без регистрации. Просто начните.'}
        </Text>
        {(elapsed > 0 || running) && <Text as="span" variant="caption-1" className="demo-note">Демо · до закрытия страницы</Text>}
      </div>
    </section>
  );
}

const content: PageContent = {
  animated: false,
  blocks: [
    {
      type: 'header-block',
      className: 'hero',
      centered: true,
      width: 'l',
      verticalOffset: '0',
      indent: {top: '0', bottom: '0'},
      overtitle: '<div class="wordmark">tempo<span class="wordmark-dot">.</span></div><div class="hero-label">УЧЁТ ВРЕМЕНИ В РИТМЕ КОМАНДЫ</div>',
      title: 'Меньше суеты.<br><span class="hero-accent">Больше времени.</span>',
      description: '<p class="hero-description">Простой учёт времени для небольших команд.<br>Понимайте, куда уходят часы, и фокусируйтесь на важном.</p>',
      additionalInfo: '<p class="hero-note">Для тех, кто ценит работу, а не отчёты о ней.</p>',
    },
    {
      type: 'card-layout-block',
      className: 'benefits',
      indent: {top: '0', bottom: '0'},
      colSizes: {all: 12, sm: 12, md: 4},
      children: [
        {type: 'tempo-benefit', number: '01', title: 'Один клик — и в работе', description: 'Запустите таймер и займитесь делом. Часы останутся в проекте, а не в памяти.'},
        {type: 'tempo-benefit', number: '02', title: 'Вся команда на виду', description: 'Видьте загрузку команды в одном месте. Распределяйте задачи без лишних встреч.'},
        {type: 'tempo-benefit', number: '03', title: 'Часы обретают смысл', description: 'Понятные отчёты по людям и проектам. Планируйте на основе фактов, а не ощущений.'},
      ],
    },
    {type: 'tempo-cta', indent: {top: '0', bottom: '0'}},
  ],
};

const custom = {subBlocks: {'tempo-benefit': Benefit}, blocks: {'tempo-cta': TimerCta}};

export function App() {
  return (
    <main className="landing">
      <PageConstructorProvider theme={Theme.Light} locale={{lang: 'ru', tld: 'ru'}}>
        <PageConstructor content={content} custom={custom} />
      </PageConstructorProvider>
    </main>
  );
}
