import React from 'react';
import { Button, DropdownMenu, Toaster, ToasterProvider, useToaster } from '@gravity-ui/uikit';
import { Copy, Link, Pencil, TrashBin } from '@gravity-ui/icons';

const toaster = new Toaster();

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <ActionsMenu />
    </ToasterProvider>
  );
}

function ActionsMenu() {
  const { add } = useToaster();

  const handleAction = (name: string) => () => {
    add({
      name: `action-${name}`,
      title: `Действие: ${name}`,
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu
        size="m"
        items={[
          {
            text: 'Редактировать',
            iconStart: <Pencil />,
            action: handleAction('Редактировать'),
          },
          {
            text: 'Скопировать',
            iconStart: <Copy />,
            action: handleAction('Скопировать'),
          },
          {
            text: 'Поделиться',
            iconStart: <Link />,
            action: handleAction('Поделиться'),
          },
          {
            text: 'Удалить',
            iconStart: <TrashBin />,
            theme: 'danger',
            action: handleAction('Удалить'),
          },
        ]}
        renderSwitcher={(props) => (
          <Button {...props} view="outlined">
            Действия
          </Button>
        )}
      />
    </div>
  );
}
