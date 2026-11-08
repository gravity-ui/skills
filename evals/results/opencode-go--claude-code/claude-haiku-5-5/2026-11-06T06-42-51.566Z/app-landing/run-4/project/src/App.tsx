import { Button, Card, Text } from '@gravity-ui/uikit';

const ADVANTAGES = [
  {
    title: 'Таймер в один клик',
    text: 'Запускайте и останавливайте учёт прямо из задачи. Если забыли включить таймер, добавьте время вручную.',
  },
  {
    title: 'Понятные отчёты',
    text: 'Видно, сколько времени уходит на проекты и задачи, и как это менялось от недели к неделе.',
  },
  {
    title: 'Общая картина команды',
    text: 'Загрузка людей и прогресс по проектам без ручных сводок и лишних созвонов.',
  },
];

const styles = {
  page: {
    maxWidth: 1040,
    margin: '0 auto',
    padding: '96px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 96,
  },
  hero: {
    maxWidth: 720,
    margin: '0 auto',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  advantages: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 24,
  },
  advantageBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 24,
  },
  cta: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
  },
} as const;

export function App() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <Text as="h1" variant="display-2">
          Учёт времени команды без лишней рутины
        </Text>
        <Text as="p" variant="subheader-1" color="secondary">
          Фиксируйте, сколько времени уходит на задачи и проекты, и получайте понятную картину работы
          команды без ручных таблиц и вопросов «что ты делал вчера».
        </Text>
      </section>

      <ul style={styles.advantages}>
        {ADVANTAGES.map((item) => (
          <li key={item.title}>
            <Card type="container" view="outlined" size="l">
              <div style={styles.advantageBody}>
                <Text as="h3" variant="subheader-2">
                  {item.title}
                </Text>
                <Text as="p" variant="body-2" color="secondary">
                  {item.text}
                </Text>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <section style={styles.cta}>
        <Text as="h2" variant="header-1">
          Начните учитывать время уже сегодня
        </Text>
        <Button href="#" view="action" size="xl">
          Начать работу
        </Button>
      </section>
    </main>
  );
}
