import React from 'react';
import {Button, DropdownMenu, Icon, Text, sp} from '@gravity-ui/uikit';
import {ChevronDown, Copy, Link, Pencil, TrashBin} from '@gravity-ui/icons';

export function App() {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className={sp({p: 6})}>
      <DropdownMenu
        size="m"
        items={[
          {
            text: 'Редактировать',
            iconStart: <Icon data={Pencil} size={16} />,
            action: () => setLastAction('Редактировать'),
          },
          {
            text: 'Дублировать',
            iconStart: <Icon data={Copy} size={16} />,
            action: () => setLastAction('Дублировать'),
          },
          {
            text: 'Копировать ссылку',
            iconStart: <Icon data={Link} size={16} />,
            action: () => setLastAction('Копировать ссылку'),
          },
          [
            {
              text: 'Удалить',
              iconStart: <Icon data={TrashBin} size={16} />,
              theme: 'danger',
              action: () => setLastAction('Удалить'),
            },
          ],
        ]}
        renderSwitcher={(props) => (
          <Button {...props} view="outlined">
            Действия
            <Icon data={ChevronDown} size={16} />
          </Button>
        )}
      />
      {lastAction && (
        <div className={sp({mt: 3})}>
          <Text variant="body-2" color="secondary">
            Выбрано действие: {lastAction}
          </Text>
        </div>
      )}
    </div>
  );
}
