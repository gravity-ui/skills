import { Button, Card, Text } from '@gravity-ui/uikit';

import './App.css';

const FEATURES = [
  {
    title: 'Старт таймера в один клик',
    text: 'Сотрудники отмечают время по задачам и проектам без лишних полей и настроек.',
  },
  {
    title: 'Прозрачная загрузка команды',
    text: 'Руководитель видит, кто чем занят и сколько часов ушло на каждый проект.',
  },
  {
    title: 'Отчёты для клиентов и счетов',
    text: 'Готовые сводки по часам за неделю или месяц выгружаются в CSV за пару секунд.',
  },
];

export function App() {
  return (
    <main className="landing">
      <section className="landing__hero">
        <Text as="h1" variant="display-2">
          Учёт времени команды без лишней рутины
        </Text>
        <Text as="p" variant="body-3" color="secondary">
          Тайминг помогает небольшим командам понимать, куда уходят часы, и честно выставлять
          счета клиентам.
        </Text>
      </section>

      <section className="landing__features" aria-label="Преимущества">
        {FEATURES.map((feature) => (
          <Card key={feature.title} view="outlined" className="landing__feature">
            <Text as="h2" variant="subheader-3">
              {feature.title}
            </Text>
            <Text as="p" variant="body-2" color="secondary">
              {feature.text}
            </Text>
          </Card>
        ))}
      </section>

      <section className="landing__cta">
        <Text as="h2" variant="header-2">
          Попробуйте 14 дней бесплатно
        </Text>
        <Button view="action" size="xl" href="/signup">
          Начать бесплатно
        </Button>
      </section>
    </main>
  );
}
