import { Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <section className="page">
      <Text variant="display-1" as="h1">О приложении</Text>
      <Text variant="body-2" color="secondary">Собрано на:</Text>
      <ul>
        <li><Text>React 18 + TypeScript</Text></li>
        <li><Text>Vite</Text></li>
        <li><Text>Gravity UI — компоненты и светлая/тёмная темы</Text></li>
        <li><Text>Собственный hash-роутер (без внешних зависимостей)</Text></li>
      </ul>
    </section>
  );
}
