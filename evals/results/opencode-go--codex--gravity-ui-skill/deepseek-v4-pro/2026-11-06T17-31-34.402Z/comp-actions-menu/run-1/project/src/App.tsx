import {Button, DropdownMenu, type DropdownMenuItem} from '@gravity-ui/uikit';

const actions: DropdownMenuItem[] = [
  {
    text: 'Редактировать',
    action: () => console.log('edit'),
  },
  {
    text: 'Дублировать',
    action: () => console.log('duplicate'),
  },
  {
    text: 'Удалить',
    theme: 'danger',
    action: () => console.log('delete'),
  },
];

export function App() {
  return (
    <div style={{padding: 24}}>
      <DropdownMenu
        items={actions}
        renderSwitcher={(props) => (
          <Button view="action" {...props}>
            Действия
          </Button>
        )}
      />
    </div>
  );
}
