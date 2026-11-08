import { Card, Flex, Label, Text } from '@gravity-ui/uikit';

const FIELDS = [
  { name: 'Имя', value: 'Александра Иванова' },
  { name: 'Email', value: 'a.ivanova@example.com' },
  { name: 'Роль', value: 'Администратор' },
  { name: 'Команда', value: 'Платформа' },
];

export function ProfilePage() {
  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="header-1" as="h1">
          Профиль
        </Text>
        <Text variant="body-2" color="secondary">
          Сведения об учётной записи текущего пользователя.
        </Text>
      </Flex>

      <Card type="container" view="outlined" size="l" style={{ maxWidth: 560 }}>
        <Flex direction="column" gap={4}>
          <Flex alignItems="center" justifyContent="space-between" gap={3}>
            <Text variant="subheader-3">Учётная запись</Text>
            <div style={{ flexShrink: 0 }}>
              <Label theme="success" size="m">
                Активна
              </Label>
            </div>
          </Flex>

          <Flex direction="column" gap={3}>
            {FIELDS.map((field) => (
              <Flex key={field.name} gap={3} alignItems="baseline">
                <Text variant="body-1" color="secondary" style={{ width: 96, flexShrink: 0 }}>
                  {field.name}
                </Text>
                <Text variant="body-1" ellipsis style={{ flex: 1, minWidth: 0 }}>
                  {field.value}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
