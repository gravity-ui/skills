import { useState } from 'react';
import { Button, DropdownMenu, type DropdownMenuItem } from '@gravity-ui/uikit';

export type ActionId = 'edit' | 'duplicate' | 'share' | 'archive' | 'delete';

export interface ActionsMenuProps {
  /** Текст на кнопке-переключателе. */
  label?: string;
  /** Вызывается при выборе пункта меню. */
  onAction?: (action: ActionId) => void;
}

/**
 * Кнопка, по клику на которую раскрывается список действий.
 * Пункты сгруппированы: основные действия и отдельно — опасное «Удалить».
 */
export function ActionsMenu({ label = 'Действия', onAction }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);

  const run = (action: ActionId) => () => onAction?.(action);

  const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
    [
      { text: 'Редактировать', action: run('edit') },
      { text: 'Дублировать', action: run('duplicate') },
      { text: 'Поделиться', action: run('share') },
    ],
    [
      { text: 'Архивировать', action: run('archive') },
      { text: 'Удалить', theme: 'danger', action: run('delete') },
    ],
  ];

  return (
    <DropdownMenu
      items={items}
      size="m"
      open={open}
      onOpenToggle={setOpen}
      popupProps={{ placement: 'bottom-start' }}
      renderSwitcher={(switcherProps) => (
        <Button
          {...switcherProps}
          view="action"
          size="m"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {label} {open ? '▴' : '▾'}
        </Button>
      )}
    />
  );
}
