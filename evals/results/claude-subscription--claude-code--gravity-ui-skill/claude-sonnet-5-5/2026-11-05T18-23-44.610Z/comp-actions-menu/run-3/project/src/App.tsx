import { Button, DropdownMenu, Icon } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';
import { ChevronDown, Copy, Pencil, TrashBin } from '@gravity-ui/icons';

const items: DropdownMenuItem[] = [
  {
    text: 'Редактировать',
    iconStart: <Icon data={Pencil} size={16} />,
    action: () => console.log('edit'),
  },
  {
    text: 'Дублировать',
    iconStart: <Icon data={Copy} size={16} />,
    action: () => console.log('duplicate'),
  },
  {
    text: 'Удалить',
    iconStart: <Icon data={TrashBin} size={16} />,
    theme: 'danger',
    action: () => console.log('delete'),
  },
];

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu
        items={items}
        renderSwitcher={(props) => (
          <Button view="outlined" {...props}>
            Действия
            <Icon data={ChevronDown} size={16} />
          </Button>
        )}
      />
    </div>
  );
}
