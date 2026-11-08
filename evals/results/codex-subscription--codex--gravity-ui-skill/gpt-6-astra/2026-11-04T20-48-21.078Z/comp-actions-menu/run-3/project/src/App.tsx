import {useState} from 'react';
import {Button, DropdownMenu, Text} from '@gravity-ui/uikit';

import './App.css';

const actions = ['Редактировать', 'Дублировать', 'Скачать', 'Архивировать'];

export function App() {
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  return (
    <main className="page">
      <section className="actions-card" aria-labelledby="actions-title">
        <div className="actions-heading">
          <Text className="eyebrow" variant="caption-2">БЫСТРЫЙ ДОСТУП</Text>
          <Text as="h1" id="actions-title" variant="header-2">Меню действий</Text>
          <Text as="p" variant="body-2" color="secondary">
            Нужные действия — в одной кнопке.
          </Text>
        </div>

        <div className="actions-preview">
          <DropdownMenu
            open={open}
            onOpenToggle={setOpen}
            size="l"
            menuProps={{'aria-label': 'Доступные действия'}}
            items={actions.map((text) => ({
              text,
              action: () => setSelectedAction(text),
            }))}
            renderSwitcher={(props) => (
              <Button
                {...props}
                view="action"
                size="xl"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                Действия
                <span className="menu-arrow" aria-hidden="true">{open ? '▴' : '▾'}</span>
              </Button>
            )}
          />
          <Text variant="body-1" color="secondary" className="action-status" role="status">
            {selectedAction ? `Выбрано: «${selectedAction}»` : 'Нажмите, чтобы выбрать действие'}
          </Text>
        </div>

        <div className="actions-footer">
          <Text variant="caption-2" color="secondary">4 действия</Text>
          <Text variant="caption-2" color="secondary">Esc — закрыть меню</Text>
        </div>
      </section>
    </main>
  );
}
