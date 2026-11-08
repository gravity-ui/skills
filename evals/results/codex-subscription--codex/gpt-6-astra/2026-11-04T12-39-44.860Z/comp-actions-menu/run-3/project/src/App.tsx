import {useState} from 'react';
import {Button, DropdownMenu, Text} from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  return (
    <main style={{padding: 24}}>
      <DropdownMenu
        open={open}
        onOpenToggle={setOpen}
        size="l"
        popupProps={{placement: 'bottom-start'}}
        menuProps={{'aria-label': 'Список действий'}}
        renderSwitcher={(props) => (
          <Button
            {...props}
            size="l"
            view="action"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            Действия
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              style={{marginLeft: 8, verticalAlign: 'middle', transform: open ? 'rotate(180deg)' : undefined}}
            >
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        )}
        items={[
          {text: 'Редактировать', action: () => setSelectedAction('Редактировать')},
          {text: 'Дублировать', action: () => setSelectedAction('Дублировать')},
          {text: 'Архивировать', action: () => setSelectedAction('Архивировать')},
          [{text: 'Удалить', theme: 'danger', action: () => setSelectedAction('Удалить')}],
        ]}
      />
      <div role="status" style={{marginTop: 16}}>
        {selectedAction && (
          <Text color="secondary">Выбрано действие: «{selectedAction}»</Text>
        )}
      </div>
    </main>
  );
}
