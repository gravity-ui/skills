const benefits = [
  {
    title: 'Точное время',
    text: 'Команда фиксирует часы по задачам и проектам.',
  },
  {
    title: 'Прозрачные отчёты',
    text: 'Руководитель сразу видит загрузку и прогресс.',
  },
  {
    title: 'Быстрый старт',
    text: 'Простая настройка без обучения и сложных схем.',
  },
];

export function App() {
  return (
    <main className="landing">
      <section className="hero">
        <h1>Учёт времени команды без лишней работы</h1>
        <p>Одно место для фиксации часов, контроля загрузки и простых отчётов.</p>
      </section>

      <section aria-labelledby="benefits-title" className="benefits">
        <h2 id="benefits-title">Преимущества</h2>
        <ul>
          {benefits.map((benefit) => (
            <li key={benefit.title}>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cta-title" className="cta">
        <h2 id="cta-title">Начните учитывать время уже сегодня</h2>
        <a href="mailto:hello@timeboard.app">Получить доступ</a>
      </section>
    </main>
  );
}
