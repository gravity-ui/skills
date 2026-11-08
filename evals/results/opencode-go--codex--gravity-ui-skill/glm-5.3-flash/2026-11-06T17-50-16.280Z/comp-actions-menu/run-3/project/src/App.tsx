import { DropdownMenu, Flex, Text } from '@gravity-ui/uikit';

const actions = [
  { id: 'create', text: 'Создать' },
  { id: 'rename', text: 'Переименовать' },
  { id: 'duplicate', text: 'Дублировать' },
];

export function App() {
  const handleAction = (id: string) => {
    console.info(`Selected action: ${id}`);
  };

  return (
    <Flex direction="column" gap="3" style={{ padding: 24 }}>
      <Text variant="body-2">Доступные действия</Text>
      <DropdownMenu
        items={actions.map(({ id, text }) => ({
          text,
          action: () => handleAction(id),
        }))}
        defaultSwitcherProps={{ children: 'Действия' }}
        popupProps={{ placement: 'bottom-start' }}
      />
    </Flex>
  );
}
