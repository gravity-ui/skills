import {Button, Text} from '@gravity-ui/uikit';

import './App.css';

const BENEFITS = [
  {
    title: 'Таймер в один клик',
    text: 'Сотрудник нажимает одну кнопку — время начинает учитываться. Без сложных таблиц и лишних шагов.',
  },
  {
    title: 'Отчёты по проектам',
    text: 'Сразу видно, сколько часов уходит на каждый проект и клиента — удобно для счетов и планирования.',
  },
  {
    title: 'Загрузка всей команды',
    text: 'Руководитель видит, кто чем занят, и точнее планирует сроки, не перегружая людей.',
  },
];

export function App() {
  return (
    <main className="page">
      <section className="hero">
        <Text as="h1" variant="display-2" className="hero__title">
          TrackTime — учёт времени для команд
        </Text>
        <Text as="p" variant="body-2" color="secondary" className="hero__subtitle">
          Простой сервис, который показывает, куда уходит рабочее время вашей команды.
          Никакой бюрократии — только понятные цифры.
        </Text>
        <Button view="action" size="xl" href="#cta">
          Попробовать бесплатно
        </Button>
      </section>

      <section className="benefits">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className="benefit">
            <Text as="h3" variant="subheader-3">
              {benefit.title}
            </Text>
            <Text as="p" variant="body-1" color="secondary">
              {benefit.text}
            </Text>
          </div>
        ))}
      </section>

      <section className="cta" id="cta">
        <Text as="h2" variant="header-2">
          Начните учитывать время уже сегодня
        </Text>
        <Button view="action" size="xl">
          Начать бесплатно
        </Button>
      </section>
    </main>
  );
}
