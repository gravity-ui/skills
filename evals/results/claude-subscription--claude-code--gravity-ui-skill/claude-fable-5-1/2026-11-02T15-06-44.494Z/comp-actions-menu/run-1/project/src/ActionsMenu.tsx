import { useState } from 'react';
import { Button, DropdownMenu, Icon } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';
import { ArrowDownToLine, ChevronDown, Copy, Link, Pencil, TrashBin } from '@gravity-ui/icons';

export type ActionId = 'edit' | 'duplicate' | 'copy-link' | 'download' | 'delete';

export interface ActionsMenuProps {
  /** Called with the id of the chosen action. */
  onAction?: (action: ActionId) => void;
  /** Disables the switcher button and prevents the menu from opening. */
  disabled?: boolean;
}

export function ActionsMenu({ onAction, disabled }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);

  const run = (action: ActionId) => () => onAction?.(action);

  // Nested arrays render as visually separated groups.
  const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
    [
      { text: 'Редактировать', iconStart: <Icon data={Pencil} size={16} />, action: run('edit') },
      { text: 'Дублировать', iconStart: <Icon data={Copy} size={16} />, action: run('duplicate') },
      { text: 'Скопировать ссылку', iconStart: <Icon data={Link} size={16} />, action: run('copy-link') },
      { text: 'Скачать', iconStart: <Icon data={ArrowDownToLine} size={16} />, action: run('download') },
    ],
    [
      {
        text: 'Удалить',
        theme: 'danger',
        iconStart: <Icon data={TrashBin} size={16} />,
        action: run('delete'),
      },
    ],
  ];

  return (
    <DropdownMenu
      open={open}
      onOpenToggle={setOpen}
      disabled={disabled}
      size="m"
      items={items}
      renderSwitcher={(switcherProps) => (
        <Button
          {...switcherProps}
          view="action"
          size="m"
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          Действия
          <Icon data={ChevronDown} size={16} />
        </Button>
      )}
    />
  );
}
