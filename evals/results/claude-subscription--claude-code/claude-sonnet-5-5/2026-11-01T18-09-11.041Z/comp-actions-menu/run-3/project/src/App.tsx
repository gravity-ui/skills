import { ChevronDown, Copy, Pencil, TrashBin } from '@gravity-ui/icons';
import { Button, DropdownMenu, Icon } from '@gravity-ui/uikit';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu
        size="m"
        items={[
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
        ]}
        renderSwitcher={(props) => (
          <Button {...props} view="outlined">
            Действия
            <Icon data={ChevronDown} size={16} />
          </Button>
        )}
      />
    </div>
  );
}
