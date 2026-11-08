import { DropdownMenu } from '@gravity-ui/uikit';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu
        items={[
          [
            {
              text: 'Редактировать',
              action: () => alert('Редактировать'),
            },
            {
              text: 'Копировать',
              action: () => alert('Копировать'),
            },
            {
              text: 'Переместить',
              action: () => alert('Переместить'),
            },
          ],
          [
            {
              text: 'Удалить',
              action: () => alert('Удалить'),
              theme: 'danger',
            },
          ],
        ]}
        defaultSwitcherProps={{
          view: 'action',
        }}
      >
        Действия
      </DropdownMenu>
    </div>
  );
}
