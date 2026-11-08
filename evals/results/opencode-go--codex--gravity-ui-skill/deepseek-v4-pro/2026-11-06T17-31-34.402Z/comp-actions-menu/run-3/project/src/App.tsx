import React from 'react';
import {DropdownMenu} from '@gravity-ui/uikit';

export function App() {
  const handleAction = (action: string) => {
    alert(`Выбрано действие: ${action}`);
  };

  return (
    <div style={{padding: 24}}>
      <DropdownMenu
        size="m"
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
            text: 'Переместить',
            action: () => handleAction('Переместить'),
          },
          {
            text: 'Удалить',
            action: () => handleAction('Удалить'),
            theme: 'danger',
          },
        ]}
      />
    </div>
  );
}
