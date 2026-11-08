import { Button } from '@gravity-ui/uikit';

import './App.css';

const ADVANTAGES = [
  {
    title: 'Таймер в один клик',
    text: 'Запускайте и останавливайте учёт прямо из задачи, без отдельных приложений и ручных записей.',
  },
  {
    title: 'Отчёты без таблиц',
    text: 'Сводка по людям, проектам и периодам собирается автоматически и готова для планирования.',
  },
  {
    title: 'Прозрачно для команды',
    text: 'Общий журнал времени виден всем участникам: меньше вопросов «сколько на это ушло?».',
  },
];

export function App() {
  return (
    <main className="page">
      <section className="hero">
        <h1 className="hero__title">Учёт времени для команд без лишней рутины</h1>
        <p className="hero__subtitle">
          Фиксируйте часы по задачам и получайте понятную картину того, куда уходит время команды.
        </p>
      </section>

      <section className="advantages" aria-label="Преимущества">
        <ul className="advantages__list">
          {ADVANTAGES.map((item) => (
            <li key={item.title} className="advantage">
              <h2 className="advantage__title">{item.title}</h2>
              <p className="advantage__text">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="cta">
        <h2 className="cta__title">Начните вести учёт уже сегодня</h2>
        <p className="cta__text">Подключите команду, и картина затрат времени будет перед глазами.</p>
        <Button view="action" size="xl" href="#start">
          Начать работу
        </Button>
      </section>
    </main>
  );
}
