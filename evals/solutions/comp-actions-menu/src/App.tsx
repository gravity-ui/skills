import {useState} from 'react';
import {Button, DropdownMenu, Flex, Text} from '@gravity-ui/uikit';
import type {DropdownMenuItem} from '@gravity-ui/uikit';

const pageStyle: React.CSSProperties = {padding: 24};

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Пункты меню: несколько действий, сгруппированных разделителем,
  // опасное действие выделено темой `danger`.
  const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
    [
      {text: 'Открыть', action: () => setLastAction('Открыть')},
      {text: 'Переименовать', action: () => setLastAction('Переименовать')},
      {text: 'Дублировать', action: () => setLastAction('Дублировать')},
    ],
    [{text: 'Удалить', theme: 'danger', action: () => setLastAction('Удалить')}],
  ];

  return (
    <Flex direction="column" gap={4} alignItems="flex-start" style={pageStyle}>
      <DropdownMenu
        items={items}
        renderSwitcher={(props) => (
          <Button {...props} view="normal">
            Действия
          </Button>
        )}
      />
      {lastAction ? <Text color="secondary">Последнее действие: {lastAction}</Text> : null}
    </Flex>
  );
}
