import React from 'react';
import {ArrowToggle, Button, DropdownMenu, Text} from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const handleAction = (name: string) => setLastAction(name);

  return (
    <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start'}}>
      <DropdownMenu
        open={open}
        onOpenToggle={setOpen}
        renderSwitcher={({onClick, onKeyDown}) => (
          <Button view="outlined" size="m" onClick={onClick} onKeyDown={onKeyDown}>
            Действия
            <ArrowToggle direction={open ? 'top' : 'bottom'} />
          </Button>
        )}
        items={[
          [
            {text: 'Редактировать', action: () => handleAction('Редактировать')},
            {text: 'Дублировать', action: () => handleAction('Дублировать')},
            {text: 'Переименовать', action: () => handleAction('Переименовать')},
          ],
          [
            {text: 'Удалить', action: () => handleAction('Удалить'), theme: 'danger'},
          ],
        ]}
      />
      {lastAction && <Text variant="body-1">Выбрано действие: {lastAction}</Text>}
    </div>
  );
}
