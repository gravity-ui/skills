import {useState} from 'react';
import {Box, Button, DropdownMenu, Text} from '@gravity-ui/uikit';

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <Box spacing={{p: 6}}>
      <DropdownMenu
        renderSwitcher={(props) => (
          <Button {...props} view="outlined">
            Действия
          </Button>
        )}
        items={[
          {text: 'Редактировать', action: () => setLastAction('Редактировать')},
          {text: 'Дублировать', action: () => setLastAction('Дублировать')},
          {text: 'Поделиться', action: () => setLastAction('Поделиться')},
          [
            {
              text: 'Удалить',
              theme: 'danger',
              action: () => setLastAction('Удалить'),
            },
          ],
        ]}
      />
      {lastAction && (
        <Box spacing={{mt: 4}}>
          <Text variant="body-1" color="secondary">
            Выбрано действие: {lastAction}
          </Text>
        </Box>
      )}
    </Box>
  );
}
