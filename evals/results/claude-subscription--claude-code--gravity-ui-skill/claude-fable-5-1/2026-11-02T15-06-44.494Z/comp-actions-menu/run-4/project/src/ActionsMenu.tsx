import * as React from 'react';
import {Button, DropdownMenu, Icon, Text} from '@gravity-ui/uikit';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {ChevronDown, Copy, Pencil, TrashBin} from '@gravity-ui/icons';

export function ActionsMenu() {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  // Вложенный массив — визуально отделённая группа пунктов.
  const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
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
    [
      {
        text: 'Удалить',
        theme: 'danger',
        iconStart: <Icon data={TrashBin} size={16} />,
        action: () => setLastAction('Удалить'),
      },
    ],
  ];

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--g-spacing-3)'}}>
      <DropdownMenu
        items={items}
        renderSwitcher={(props) => (
          <Button view="normal" size="m" {...props}>
            Действия
            <Button.Icon side="end">
              <Icon data={ChevronDown} size={16} />
            </Button.Icon>
          </Button>
        )}
      />
      <Text variant="body-1" color="secondary">
        {lastAction ? `Выбрано действие: ${lastAction}` : 'Нажмите на кнопку и выберите действие'}
      </Text>
    </div>
  );
}
