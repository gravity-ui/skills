import { CircleInfo, ListCheck } from '@gravity-ui/icons';
import { Card, Flex, Icon, Link, Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text as="h1" variant="display-1">
          Добро пожаловать
        </Text>
        <Text variant="body-3" color="secondary">
          Небольшое приложение с навигацией между страницами и переключателем темы. Попробуйте
          сменить тему в правом верхнем углу — выбор сохранится после перезагрузки.
        </Text>
      </Flex>

      <div className="page-grid">
        <Card view="outlined" spacing={{ p: 4 }}>
          <Flex direction="column" gap={2}>
            <Icon data={ListCheck} size={24} />
            <Text variant="subheader-3">Задачи</Text>
            <Text color="secondary">Простой список дел: добавляйте, отмечайте и удаляйте.</Text>
            <Link href="#/tasks">Перейти к задачам</Link>
          </Flex>
        </Card>
        <Card view="outlined" spacing={{ p: 4 }}>
          <Flex direction="column" gap={2}>
            <Icon data={CircleInfo} size={24} />
            <Text variant="subheader-3">О приложении</Text>
            <Text color="secondary">Из чего собрано и как устроены навигация и темы.</Text>
            <Link href="#/about">Подробнее</Link>
          </Flex>
        </Card>
      </div>
    </Flex>
  );
}
