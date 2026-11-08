import { Button, DropdownMenu, type DropdownMenuItem } from '@gravity-ui/uikit';

export type ActionId = 'edit' | 'duplicate' | 'rename' | 'delete';

type ActionsButtonProps = {
  /** Вызывается при выборе пункта меню. */
  onAction?: (id: ActionId) => void;
};

export function ActionsButton({ onAction }: ActionsButtonProps) {
  const pick = (id: ActionId) => () => onAction?.(id);

  const items: DropdownMenuItem<unknown>[][] = [
    [
      { text: 'Редактировать', action: pick('edit') },
      { text: 'Дублировать', action: pick('duplicate') },
    ],
    [
      { text: 'Переименовать', action: pick('rename') },
      { text: 'Удалить', action: pick('delete'), theme: 'danger' },
    ],
  ];

  return (
    <DropdownMenu
      items={items}
      renderSwitcher={(switcherProps) => (
        <Button view="outlined" size="m" {...switcherProps}>
          Действия
        </Button>
      )}
    />
  );
}
