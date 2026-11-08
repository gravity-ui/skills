import { useState } from 'react';
import { Button, DropdownMenu, Flex, Icon, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';
import { ChevronDown, Copy, Pencil, TrashBin } from '@gravity-ui/icons';

type ActionId = 'edit' | 'duplicate' | 'delete';

const ACTION_LABELS: Record<ActionId, string> = {
  edit: 'Редактировать',
  duplicate: 'Дублировать',
  delete: 'Удалить',
};

export function ActionsMenuButton() {
  const [lastAction, setLastAction] = useState<ActionId | null>(null);

  // Вложенный массив — визуально отделённая группа (разделитель перед «Удалить»).
  const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
    {
      text: ACTION_LABELS.edit,
      iconStart: <Icon data={Pencil} size={16} />,
      action: () => setLastAction('edit'),
    },
    {
      text: ACTION_LABELS.duplicate,
      iconStart: <Icon data={Copy} size={16} />,
      action: () => setLastAction('duplicate'),
    },
    [
      {
        text: ACTION_LABELS.delete,
        iconStart: <Icon data={TrashBin} size={16} />,
        theme: 'danger',
        action: () => setLastAction('delete'),
      },
    ],
  ];

  return (
    <Flex direction="column" gap={3} alignItems="flex-start">
      <DropdownMenu
        size="m"
        items={items}
        renderSwitcher={(switcherProps) => (
          <Button view="normal" size="m" {...switcherProps}>
            Действия
            <Icon data={ChevronDown} size={16} />
          </Button>
        )}
      />
      <Text variant="body-1" color="secondary">
        {lastAction ? `Выбрано действие: ${ACTION_LABELS[lastAction]}` : 'Действие ещё не выбрано'}
      </Text>
    </Flex>
  );
}
