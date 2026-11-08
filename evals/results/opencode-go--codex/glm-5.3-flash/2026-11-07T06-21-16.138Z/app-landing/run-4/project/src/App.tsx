import { Button, Card, Container, Flex, Text } from '@gravity-ui/uikit';

import './App.css';

const benefits = [
  {
    title: 'Быстрый учет времени',
    description: 'Отмечайте часы за пару кликов прямо из списка задач.',
  },
  {
    title: 'Понятная загрузка команды',
    description: 'Видьте занятость и распределение часов по проектам.',
  },
  {
    title: 'Готовые отчеты',
    description: 'Экспортируйте сводки для руководства без ручных таблиц.',
  },
];

export function App() {
  return (
    <main className="landing">
      <Container maxWidth="m">
        <section className="hero">
          <Text as="h1" variant="display-2" className="landing-title">
            Учет времени для небольших команд
          </Text>
          <Text as="p" variant="body-2" className="landing-subtitle">
            HoursApp помогает командам фиксировать рабочие часы и видеть загрузку
            по проектам без лишней отчетности.
          </Text>
          <Button size="l" view="action" href="#start">
            Начать бесплатно
          </Button>
        </section>

        <section className="benefits">
          {benefits.map((benefit) => (
            <Card key={benefit.title} type="container" view="outlined" className="benefit-card">
              <Text as="h2" variant="header-2">
                {benefit.title}
              </Text>
              <Text as="p" variant="body-2" color="secondary">
                {benefit.description}
              </Text>
            </Card>
          ))}
        </section>

        <section id="start" className="cta">
          <Text as="h2" variant="display-1">
            Попробуйте HoursApp сегодня
          </Text>
          <Button size="l" view="action" href="#start">
            Начать бесплатно
          </Button>
        </section>
      </Container>
    </main>
  );
}
