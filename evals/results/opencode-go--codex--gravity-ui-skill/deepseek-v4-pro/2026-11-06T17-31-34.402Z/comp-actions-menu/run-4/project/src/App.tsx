import { DropdownMenu } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

const actions: DropdownMenuItem[] = [
  {
    text: 'Редактировать',
    action: () => alert('Редактировать'),
  },
  {
    text: 'Копировать',
    action: () => alert('Копировать'),
  },
  {
    text: 'Удалить',
    action: () => alert('Удалить'),
    theme: 'danger',
  },
];

// Implement the requested feature here (and may add sibling files).
export function App() {
  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu
        items={actions}
        defaultSwitcherProps={{
          view: 'action',
          size: 'm',
        }}
      >
        Действия
      </DropdownMenu>
    </div>
  );
}
