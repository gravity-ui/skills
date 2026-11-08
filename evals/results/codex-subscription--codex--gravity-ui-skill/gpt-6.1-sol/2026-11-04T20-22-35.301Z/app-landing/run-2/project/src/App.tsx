import {useEffect, useState} from 'react';
import {Button, Text} from '@gravity-ui/uikit';
import {
  PageConstructor,
  PageConstructorProvider,
  Theme,
  type BlockDecorationProps,
  type PageContent,
} from '@gravity-ui/page-constructor';
import './App.css';

const benefits = [
  {
    label: '01 / ПРОСТОЙ УЧЁТ',
    title: 'Один клик — и вы в потоке',
    text: 'Запускайте таймер, когда начинаете задачу. Время считается само, а вы занимаетесь работой.',
  },
  {
    label: '02 / ОБЩАЯ КАРТИНА',
    title: 'Вся команда на одной странице',
    text: 'Смотрите, сколько времени уходит на проекты. Замечайте перегрузку до того, как она станет проблемой.',
  },
  {
    label: '03 / ПОНЯТНЫЕ ОТЧЁТЫ',
    title: 'Меньше догадок в планах',
    text: 'Опирайтесь на реальные часы, чтобы точнее оценивать задачи и спокойно планировать следующую неделю.',
  },
];

function BlockFrame({type, children}: BlockDecorationProps) {
  const className = type === 'header-block' ? 'hero' :
    type === 'card-layout-block' ? 'benefits' : 'cta';
  return <section className={className}>{children}</section>;
}

const customization = {decorators: {block: [BlockFrame]}};

function formatTime(seconds: number) {
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((value) => String(value).padStart(2, '0')).join(':');
}

export function App() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (startedAt === null) return;
    const interval = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  function toggleTimer() {
    if (startedAt !== null) {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
      setStartedAt(null);
      setFinished(true);
    } else {
      setSeconds(0);
      setFinished(false);
      setStartedAt(Date.now());
    }
  }

  const timerStatus = startedAt !== null
    ? `Демо-сессия идёт · ${formatTime(seconds)}`
    : finished
      ? `Сессия завершена · ${formatTime(seconds)}. Можно начать ещё одну.`
      : 'Без регистрации. Просто начните с одной задачи.';

  const content: PageContent = {
    animated: false,
    blocks: [
      {
        type: 'header-block',
        overtitle: (
          <div className="hero-brand">
            <Text variant="header-2" className="wordmark">такт<span className="wordmark-dot">.</span></Text>
            <Text variant="caption-2" className="hero-eyebrow">ВРЕМЯ РАБОТАТЬ В СВОЁМ РИТМЕ</Text>
          </div>
        ),
        title: '<span class="hero-heading">Время команды.<br><span class="hero-heading-muted">Теперь всё ясно.</span></span>',
        description: '<p class="hero-description">Простой учёт времени для небольших команд.<br class="desktop-break"> Меньше таблиц и вопросов — больше фокуса на важном.</p>',
        width: 'l',
        centered: true,
        verticalOffset: '0',
        indent: {top: '0', bottom: '0'},
      },
      {
        type: 'card-layout-block',
        colSizes: {all: 12, sm: 12, md: 4},
        animated: false,
        indent: {top: '0', bottom: '0'},
        children: benefits.map((benefit) => ({
          type: 'basic-card',
          border: 'none',
          size: 's',
          title: {
            text: `<span class="benefit-label">${benefit.label}</span><span class="benefit-title">${benefit.title}</span>`,
            textSize: 's',
          },
          text: `<p class="benefit-description">${benefit.text}</p>`,
        })),
      },
      {
        type: 'content-layout-block',
        size: 'm',
        textWidth: 'l',
        centered: true,
        indent: {top: '0', bottom: '0'},
        textContent: {
          title: {text: '<span class="cta-title">Хорошая работа начинается с ясности.</span>', textSize: 'm'},
          text: '<p class="cta-description">Почувствуйте, как просто держать время под контролем.</p>',
          buttons: [
            <div className="cta-action" key="start">
              <Button
                view="action"
                size="xl"
                className="start-button"
                onClick={toggleTimer}
                aria-pressed={startedAt !== null}
              >
                {startedAt !== null ? 'Остановить таймер' : finished ? 'Запустить ещё раз' : 'Попробовать таймер'}
                <span className="button-arrow" aria-hidden="true">↗</span>
              </Button>
              <Text
                as="p"
                variant="body-1"
                color="secondary"
                className="timer-status"
                role="status"
                aria-live={startedAt !== null ? 'off' : 'polite'}
              >
                {timerStatus}
              </Text>
            </div>,
          ],
        },
      },
    ],
  };

  return (
    <main className="landing">
      <PageConstructorProvider locale={{lang: 'ru'}} theme={Theme.Light}>
        <PageConstructor content={content} custom={customization} />
      </PageConstructorProvider>
    </main>
  );
}
