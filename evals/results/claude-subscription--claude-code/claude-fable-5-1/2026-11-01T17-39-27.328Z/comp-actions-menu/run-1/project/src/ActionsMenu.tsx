import { useState } from 'react';
import { Button, DropdownMenu, Icon } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export type ActionsMenuProps = {
  /** Текст на кнопке-переключателе. */
  label?: string;
  /** Пункты меню. Вложенные массивы отображаются как визуально отделённые группы. */
  items: (DropdownMenuItem | DropdownMenuItem[])[];
  size?: 's' | 'm' | 'l' | 'xl';
  disabled?: boolean;
};

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3.47 5.47a.75.75 0 0 1 1.06 0L8 8.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Кнопка, по клику на которую раскрывается список действий.
 * Обёртка над DropdownMenu из Gravity UI с текстовой кнопкой-переключателем.
 */
export function ActionsMenu({ label = 'Действия', items, size = 'm', disabled }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu
      open={open}
      onOpenToggle={setOpen}
      items={items}
      size={size}
      disabled={disabled}
      renderSwitcher={(switcherProps) => (
        <Button
          {...switcherProps}
          view="normal"
          size={size}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {label}
          <Icon data={ChevronDown} size={16} />
        </Button>
      )}
    />
  );
}
