import { useState } from 'react';
import { Button, DropdownMenu, Toaster, ToasterProvider, useToaster } from '@gravity-ui/uikit';
import { Copy, Pencil, TrashBin, ArrowShapeDownFromLine } from '@gravity-ui/icons';

const toaster = new Toaster();

function ActionsDemo() {
  const { add } = useToaster();
  const [lastAction, setLastAction] = useState<string | null>(null);

  const notify = (name: string) => {
    setLastAction(name);
    add({ name: 'action', title: name, theme: 'info', isClosable: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <DropdownMenu
        renderSwitcher={({ onClick }) => (
          <Button view="action" onClick={onClick}>
            Действия
          </Button>
        )}
        items={[
          {
            text: 'Редактировать',
            iconStart: <Pencil width={16} height={16} />,
            action: () => notify('Редактировать'),
          },
          {
            text: 'Дублировать',
            iconStart: <Copy width={16} height={16} />,
            action: () => notify('Дублировать'),
          },
          {
            text: 'Экспортировать',
            iconStart: <ArrowShapeDownFromLine width={16} height={16} />,
            action: () => notify('Экспортировать'),
          },
          {
            text: 'Удалить',
            iconStart: <TrashBin width={16} height={16} />,
            theme: 'danger',
            action: () => notify('Удалить'),
          },
        ]}
      />
      {lastAction && <div style={{ opacity: 0.7 }}>Выбрано действие: «{lastAction}»</div>}
    </div>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ padding: 24 }}>
        <ActionsDemo />
      </div>
    </ToasterProvider>
  );
}
