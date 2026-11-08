import {useState} from 'react';
import {Button, DropdownMenu, Text} from '@gravity-ui/uikit';

const actions = ['Редактировать', 'Дублировать', 'Архивировать'];

export function App() {
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  return (
    <main
      style={{
        padding: 'var(--g-spacing-6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--g-spacing-4)',
      }}
    >
      <Text as="h1" variant="header-1" style={{margin: 0}}>
        Меню действий
      </Text>
      <Text variant="body-1">Нажмите на кнопку и выберите действие.</Text>

      <DropdownMenu
        open={open}
        onOpenToggle={setOpen}
        size="l"
        renderSwitcher={(props) => (
          <Button {...props} view="action" size="l" aria-haspopup="menu" aria-expanded={open}>
            Действия <span aria-hidden="true">▾</span>
          </Button>
        )}
        items={actions.map((text) => ({
          text,
          action: () => setSelectedAction(text),
        }))}
      />

      <Text variant="body-1" role="status" aria-live="polite" aria-atomic="true">
        {selectedAction ? `Выбрано действие: «${selectedAction}»` : 'Действие пока не выбрано.'}
      </Text>
    </main>
  );
}
