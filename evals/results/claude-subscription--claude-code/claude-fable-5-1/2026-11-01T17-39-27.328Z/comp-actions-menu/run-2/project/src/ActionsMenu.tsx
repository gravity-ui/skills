import * as React from 'react';
import { Button, DropdownMenu, Icon } from '@gravity-ui/uikit';
import type { ButtonProps, DropdownMenuItem } from '@gravity-ui/uikit';

type DropdownMenuSize = 's' | 'm' | 'l' | 'xl';

export type ActionsMenuItem<T = unknown> = DropdownMenuItem<T>;

export interface ActionsMenuProps<T = unknown> {
  /** Подпись на кнопке-переключателе. */
  label?: React.ReactNode;
  /** Список действий. Вложенный массив = визуально отделённая группа. */
  items: (ActionsMenuItem<T> | ActionsMenuItem<T>[])[];
  /** Данные, которые будут переданы в action каждого пункта. */
  data?: T;
  size?: DropdownMenuSize;
  view?: ButtonProps['view'];
  disabled?: boolean;
}

/** Иконка-шеврон, разворачивается при открытом меню. */
const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M3.5 6l4.5 4.5L12.5 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Кнопка, по клику на которую раскрывается список действий.
 * Обёртка над DropdownMenu из Gravity UI с кастомным переключателем.
 */
export function ActionsMenu<T = unknown>({
  label = 'Действия',
  items,
  data,
  size = 'm',
  view = 'normal',
  disabled,
}: ActionsMenuProps<T>) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu<T>
      items={items}
      data={data}
      size={size}
      disabled={disabled}
      open={open}
      onOpenToggle={setOpen}
      renderSwitcher={({ onClick, onKeyDown }) => (
        <Button
          view={view}
          size={size}
          disabled={disabled}
          onClick={onClick}
          onKeyDown={onKeyDown}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {label}
          <Icon
            data={ChevronDown}
            size={16}
            style={{
              transition: 'transform 0.15s ease',
              transform: open ? 'rotate(180deg)' : undefined,
            }}
          />
        </Button>
      )}
    />
  );
}
