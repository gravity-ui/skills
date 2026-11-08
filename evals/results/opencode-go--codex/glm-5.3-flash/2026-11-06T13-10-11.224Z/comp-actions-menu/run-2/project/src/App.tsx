import {Button, DropdownMenu} from '@gravity-ui/uikit';

const actions = [
  {id: 'copy', text: 'Копировать'},
  {id: 'rename', text: 'Переименовать'},
  {id: 'download', text: 'Скачать'},
  {id: 'delete', text: 'Удалить'},
];

export function App() {
  const handleAction = (id: string) => {
    console.log(`Selected action: ${id}`);
  };

  return (
    <div style={{padding: 24}}>
      <DropdownMenu
        items={actions.map((action) => ({
          action: () => handleAction(action.id),
          text: action.text,
        }))}
        switcher={<Button view="action">Действия</Button>}
      />
    </div>
  );
}
