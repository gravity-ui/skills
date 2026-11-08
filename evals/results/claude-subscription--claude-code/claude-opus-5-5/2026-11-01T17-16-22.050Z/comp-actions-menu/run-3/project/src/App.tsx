import { useState } from 'react';
import { Archive, ArrowShapeTurnUpRight, ChevronDown, Copy, Pencil, TrashBin } from '@gravity-ui/icons';
import { Button, DropdownMenu, Icon, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Вложенные массивы — визуально разделённые группы пунктов.
  const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
    [
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
        text: 'Поделиться',
        iconStart: <Icon data={ArrowShapeTurnUpRight} size={16} />,
        action: () => setLastAction('Поделиться'),
      },
      {
        text: 'В архив',
        iconStart: <Icon data={Archive} size={16} />,
        action: () => setLastAction('В архив'),
      },
    ],
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
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <DropdownMenu
        open={open}
        onOpenToggle={setOpen}
        items={items}
        renderSwitcher={(props) => (
          <Button
            {...props}
            view="action"
            size="m"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            Действия
            <Icon
              data={ChevronDown}
              size={16}
              style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : undefined }}
            />
          </Button>
        )}
      />

      <Text color="secondary">
        {lastAction ? `Выбрано действие: «${lastAction}»` : 'Действие ещё не выбрано'}
      </Text>
    </div>
  );
}
