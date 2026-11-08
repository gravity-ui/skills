import { Card, Flex, Progress, Text } from '@gravity-ui/uikit';

const stats = [
  { title: 'Активные задачи', value: '18', progress: 72 },
  { title: 'Завершено за неделю', value: '12', progress: 86 },
  { title: 'Ожидают проверки', value: '5', progress: 34 },
];

export function Overview() {
  return (
    <section className="page" aria-labelledby="overview-title">
      <Text variant="header-1" as="h1" id="overview-title">
        Обзор
      </Text>
      <Text color="secondary">
        Краткая сводка по команде и работе за текущую неделю.
      </Text>

      <div className="stats-grid">
        {stats.map((stat) => (
          <Card key={stat.title} type="container" view="filled" spacing={{ p: 6 }}>
            <Flex direction="column" gap="3">
              <Text color="secondary">{stat.title}</Text>
              <Text variant="display-2">{stat.value}</Text>
              <Progress value={stat.progress} />
            </Flex>
          </Card>
        ))}
      </div>

      <Card type="container" view="raised" spacing={{ p: 6 }}>
        <Flex direction="column" gap="4">
          <Text variant="header-2" as="h2">
            Команда
          </Text>
          <Text color="secondary">
            Шесть участников работают над тремя направлениями. Основной ритм —
            короткие планирования по вторникам и пятницам.
          </Text>
        </Flex>
      </Card>
    </section>
  );
}
