import { Button, Card, Text } from '@gravity-ui/uikit';

import './App.css';

const BENEFITS = [
  {
    title: 'Таймер в один клик',
    text: 'Запускайте и останавливайте учёт прямо из задачи, не переключаясь между окнами.',
  },
  {
    title: 'Отчёты без таблиц',
    text: 'Сводки по проектам и участникам собираются автоматически из записей времени.',
  },
  {
    title: 'Прозрачность для команды',
    text: 'Видно, на что уходит время, и проще планировать загрузку каждого участника.',
  },
];

export function App() {
  return (
    <main className="page">
      <section className="hero">
        <Text as="h1" variant="display-2" className="hero__title">
          Учёт времени команды без лишней рутины
        </Text>
        <Text as="p" variant="subheader-2" color="secondary" className="hero__lead">
          Фиксируйте, где уходит время, и получайте понятные отчёты по проектам и людям.
        </Text>
      </section>

      <section className="benefits" aria-label="Преимущества">
        {BENEFITS.map((benefit) => (
          <Card key={benefit.title} view="outlined" size="l" className="benefit">
            <Text as="h3" variant="subheader-2" className="benefit__title">
              {benefit.title}
            </Text>
            <Text as="p" variant="body-2" color="secondary">
              {benefit.text}
            </Text>
          </Card>
        ))}
      </section>

      <section className="cta">
        <Text as="h2" variant="header-2">
          Начните учитывать время сегодня
        </Text>
        <Button view="action" size="xl">
          Начать работу
        </Button>
      </section>
    </main>
  );
}
