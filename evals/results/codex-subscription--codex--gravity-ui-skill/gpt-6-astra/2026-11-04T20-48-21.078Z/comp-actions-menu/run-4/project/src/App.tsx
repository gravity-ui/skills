import {useState} from 'react';
import {Button, DropdownMenu, Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  const actions = ['Редактировать', 'Дублировать', 'Архивировать', 'Удалить'];

  return (
    <main className="actions-page">
      <section className="actions-card" aria-labelledby="actions-title">
        <Text as="h1" variant="header-1" id="actions-title" className="actions-title">
          Список действий
        </Text>
        <Text as="p" variant="body-2" color="secondary" className="actions-description">
          Нажмите на кнопку и выберите действие.
        </Text>

        <DropdownMenu
          open={open}
          onOpenToggle={setOpen}
          size="l"
          renderSwitcher={(props) => (
            <Button {...props} view="action" size="l" aria-haspopup="menu" aria-expanded={open}>
              Действия
            </Button>
          )}
          items={actions.map((action) => ({
            text: action,
            action: () => setSelectedAction(action),
          }))}
        />

        <Text as="p" variant="body-1" color="secondary" role="status" className="actions-status">
          {selectedAction ? `Выбрано действие: «${selectedAction}»` : 'Действие пока не выбрано'}
        </Text>
      </section>
    </main>
  );
}
