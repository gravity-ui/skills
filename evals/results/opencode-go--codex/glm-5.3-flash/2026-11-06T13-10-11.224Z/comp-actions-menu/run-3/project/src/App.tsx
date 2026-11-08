import { Button, DropdownMenu } from '@gravity-ui/uikit';

const actions = [
  {
    id: 'copy',
    text: 'Скопировать',
    action: () => {},
  },
  {
    id: 'rename',
    text: 'Переименовать',
    action: () => {},
  },
  {
    id: 'archive',
    text: 'В архив',
    action: () => {},
  },
  {
    id: 'delete',
    text: 'Удалить',
    theme: 'danger' as const,
    action: () => {},
  },
];

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu
        items={actions}
        renderSwitcher={(props) => (
          <Button {...props} view="outlined">
            Действия
          </Button>
        )}
      />
    </div>
  );
}
