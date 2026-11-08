import {DropdownMenu} from '@gravity-ui/uikit';
import {EllipsisVertical} from '@gravity-ui/icons';

export function App() {
  const handleAction = (actionName: string) => {
    alert(`Выбрано действие: ${actionName}`);
  };

  return (
    <div style={{padding: 24}}>
      <DropdownMenu
        items={[
          {
            text: 'Редактировать',
            action: () => handleAction('Редактировать'),
          },
          {
            text: 'Копировать',
            action: () => handleAction('Копировать'),
          },
          {
            text: 'Поделиться',
            action: () => handleAction('Поделиться'),
          },
          {
            text: 'Архивировать',
            action: () => handleAction('Архивировать'),
          },
          {
            text: 'Удалить',
            action: () => handleAction('Удалить'),
            theme: 'danger',
          },
        ]}
        renderSwitcher={(props) => (
          <button {...props}>
            <EllipsisVertical />
          </button>
        )}
      />
    </div>
  );
}
