import { Card, Flex, Icon, Text } from '@gravity-ui/uikit';
import { CircleInfo, Gear } from '@gravity-ui/icons';
import type { RoutePath } from '../router';

interface HomePageProps {
  onNavigate: (path: RoutePath) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="display-2" as="h1">
          Главная
        </Text>
        <Text variant="body-2" color="secondary">
          Небольшое приложение на React и Gravity UI: три страницы, навигация по хэшу и
          переключатель светлой и тёмной темы. Выбранная тема запоминается в браузере.
        </Text>
      </Flex>

      <div className="app-cards">
        <Card type="action" size="l" onClick={() => onNavigate('/about')}>
          <Flex direction="column" gap={2}>
            <Icon data={CircleInfo} size={24} />
            <Text variant="subheader-2">О приложении</Text>
            <Text color="secondary">Из чего собрано и как устроена навигация.</Text>
          </Flex>
        </Card>
        <Card type="action" size="l" onClick={() => onNavigate('/settings')}>
          <Flex direction="column" gap={2}>
            <Icon data={Gear} size={24} />
            <Text variant="subheader-2">Настройки</Text>
            <Text color="secondary">Выбор темы оформления.</Text>
          </Flex>
        </Card>
      </div>
    </Flex>
  );
}
