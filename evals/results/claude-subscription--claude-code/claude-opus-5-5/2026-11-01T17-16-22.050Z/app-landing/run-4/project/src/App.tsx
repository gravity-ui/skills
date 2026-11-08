import { Button, Card, Text } from '@gravity-ui/uikit';

import './App.css';

const BENEFITS = [
  {
    title: 'Учёт в один клик',
    text: 'Запускайте таймер прямо из задачи — без ручного заполнения табелей в конце недели.',
  },
  {
    title: 'Прозрачная загрузка',
    text: 'Видно, сколько времени уходит на каждый проект и кто из команды перегружен.',
  },
  {
    title: 'Готовые отчёты',
    text: 'Отчёты для клиентов и бухгалтерии формируются автоматически и выгружаются в CSV.',
  },
];

export function App() {
  return (
    <main className="landing">
      <section className="landing__hero">
        <Text as="h1" variant="display-2" className="landing__title">
          Время команды — под контролем
        </Text>
        <Text as="p" variant="body-3" color="secondary" className="landing__lead">
          Часомер — простой инструмент учёта рабочего времени для небольших команд.
          Отслеживайте часы, проекты и загрузку без лишней бюрократии.
        </Text>
      </section>

      <section className="landing__benefits" aria-label="Преимущества">
        {BENEFITS.map(({ title, text }) => (
          <Card key={title} type="container" view="outlined" className="landing__card">
            <Text as="h2" variant="subheader-3">
              {title}
            </Text>
            <Text as="p" variant="body-2" color="secondary">
              {text}
            </Text>
          </Card>
        ))}
      </section>

      <section className="landing__cta">
        <Text as="h2" variant="header-2">
          Попробуйте бесплатно 14 дней
        </Text>
        <Text as="p" variant="body-2" color="secondary">
          Без банковской карты. Настройка займёт пару минут.
        </Text>
        <Button view="action" size="xl" href="/signup">
          Начать бесплатно
        </Button>
      </section>
    </main>
  );
}
