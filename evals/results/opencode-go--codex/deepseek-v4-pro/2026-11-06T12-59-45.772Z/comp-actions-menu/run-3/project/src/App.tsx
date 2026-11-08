import React from 'react';
import { DropdownMenu } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

const actions: DropdownMenuItem[] = [
  { text: 'Редактировать', action: () => alert('Редактировать') },
  { text: 'Копировать', action: () => alert('Копировать') },
  { text: 'Переместить', action: () => alert('Переместить') },
  { text: 'Архивировать', action: () => alert('Архивировать') },
  { text: 'Удалить', action: () => alert('Удалить') },
];

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu
        items={[actions.slice(0, 2), actions.slice(2)]}
        defaultSwitcherProps={{ view: 'action' as const, children: 'Действия' }}
      />
    </div>
  );
}
