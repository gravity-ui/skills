import {useEffect, useState} from 'react';
import {Button, Text} from '@gravity-ui/uikit';
import {HeaderBlock, PageConstructor, PageConstructorProvider, Theme, type PageContent} from '@gravity-ui/page-constructor';
import './styles.css';

function Hero() {
  return (
    <div className="hero">
      <div className="wordmark" aria-label="Tempo">
        <Text variant="header-2">tempo<span className="wordmark-dot">.</span></Text>
      </div>
      <HeaderBlock
        title="" centered width="l" verticalOffset="0"
        className="hero-block" contentInnerClassName="hero-inner"
        overtitle={<Text variant="body-1" className="eyebrow"><span className="status-dot" aria-hidden="true" />Время команды — в одном ритме</Text>}
        renderTitle={() => (
          <Text variant="display-4" className="hero-title">
            Меньше учёта.<br /><span className="hero-accent">Больше смысла.</span>
          </Text>
        )}
      >
        <Text as="p" variant="body-3" className="hero-description">
          Простой трекер времени для небольших команд.<br className="desktop-break" />
          Понимайте, куда уходят часы, и оставляйте больше времени на главное.
        </Text>
        <Text as="p" variant="body-1" className="hero-note">Для тех, кто ценит время, а не считает минуты.</Text>
      </HeaderBlock>
    </div>
  );
}

type FeatureProps = {number: string; title: string; description: string; label: string};

function Feature({number, title, description, label}: FeatureProps) {
  return (
    <article className="feature-card">
      <Text variant="body-1" className="feature-number" aria-hidden="true">{number}</Text>
      <Text as="h2" variant="subheader-3" className="feature-title">{title}</Text>
      <Text as="p" variant="body-2" className="feature-description">{description}</Text>
      <Text variant="caption-2" className="feature-label">{label}</Text>
    </article>
  );
}

const STORAGE_KEY = 'tempo-demo-session';
type Session = {startedAt: number | null; elapsed: number};

function readSession(): Session {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && (saved.startedAt === null || (Number.isFinite(saved.startedAt) && saved.startedAt > 0)) && Number.isFinite(saved.elapsed) && saved.elapsed >= 0) return saved;
  } catch { /* Browser storage is optional. */ }
  return {startedAt: null, elapsed: 0};
}

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((part) => String(part).padStart(2, '0')).join(':');
}

function CallToAction() {
  const [session, setSession] = useState<Session>(readSession);
  const [now, setNow] = useState(Date.now);
  const running = session.startedAt !== null;
  const hasSession = running || session.elapsed > 0;
  const elapsed = session.elapsed + (session.startedAt === null ? 0 : now - session.startedAt);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch { /* Optional persistence. */ }
    if (!running) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [session, running]);

  function toggleTimer() {
    const timestamp = Date.now();
    setNow(timestamp);
    setSession((previous) => previous.startedAt === null
      ? {startedAt: timestamp, elapsed: previous.elapsed}
      : {startedAt: null, elapsed: previous.elapsed + timestamp - previous.startedAt});
  }

  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="cta-copy">
        <Text as="p" variant="caption-2" className="cta-eyebrow">ХОРОШАЯ РАБОТА НАЧИНАЕТСЯ СО СПОКОЙСТВИЯ</Text>
        <Text as="h2" variant="display-2" id="cta-title" className="cta-title">Поймайте свой ритм.</Text>
        <Text as="p" variant="body-2" className="cta-description">Первый шаг займёт меньше времени, чем чашка кофе.</Text>
      </div>
      <div className="cta-action">
        {hasSession && <Text as="span" variant="header-1" className="timer" role="timer" aria-label="Время текущей задачи">{formatTime(elapsed)}</Text>}
        <Button view="normal-contrast" size="xl" className="start-button" onClick={toggleTimer}>
          {running ? 'Приостановить' : hasSession ? 'Продолжить' : 'Попробовать Tempo'}
          <span className="button-arrow" aria-hidden="true">{running ? 'Ⅱ' : '↗'}</span>
        </Button>
        <Text as="span" variant="caption-2" className="cta-hint" role="status">
          {running ? 'Демо-таймер запущен. Вы в потоке.' : hasSession ? 'На паузе. Время сохранено в браузере.' : 'Без регистрации. Просто начните.'}
        </Text>
      </div>
    </section>
  );
}

const content: PageContent = {
  animated: false,
  blocks: [
    {type: 'tempo-hero'},
    {
      type: 'card-layout-block', className: 'features', animated: false,
      indent: {top: '0', bottom: '0'},
      colSizes: {all: 12, sm: 12, md: 4},
      children: [
        {type: 'tempo-feature', number: '01', title: 'Один клик — и вы в потоке', description: 'Запускайте таймер, переключайтесь между задачами и занимайтесь работой. Часы посчитаем мы.', label: 'ПРОСТОЙ СТАРТ'},
        {type: 'tempo-feature', number: '02', title: 'Вся команда на одной волне', description: 'Видьте, кто над чем работает и как распределяется нагрузка. Без лишних вопросов и микроменеджмента.', label: 'ПРОЗРАЧНОСТЬ БЕЗ КОНТРОЛЯ'},
        {type: 'tempo-feature', number: '03', title: 'Планы ближе к реальности', description: 'Понимайте, сколько времени занимают проекты. Оценивайте новые задачи на основе опыта, а не догадок.', label: 'ПОНЯТНАЯ КАРТИНА'},
      ],
    },
    {type: 'tempo-cta', indent: {top: '0', bottom: '0'}},
  ],
};

const custom = {
  headers: {'tempo-hero': Hero},
  blocks: {'tempo-cta': CallToAction},
  subBlocks: {'tempo-feature': Feature},
};

export function App() {
  return (
    <main className="landing">
      <PageConstructorProvider locale={{lang: 'ru'}} theme={Theme.Light} projectSettings={{isAnimationEnabled: false}}>
        <PageConstructor content={content} custom={custom} />
      </PageConstructorProvider>
    </main>
  );
}
