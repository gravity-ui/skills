import {useState} from 'react';
import {Button, DropdownMenu, Text} from '@gravity-ui/uikit';

import './App.css';

const actions = [
  {text: 'Редактировать', action: () => 'Редактирование'},
  {text: 'Создать копию', action: () => 'Создание копии'},
  {text: 'Переместить в архив', action: () => 'Перемещение в архив'},
  {text: 'Удалить', theme: 'danger' as const, action: () => 'Удаление'},
];

export function App() {
  const [lastAction, setLastAction] = useState('');

  return (
    <main className="page">
      <section className="actions-card" aria-labelledby="actions-title">
        <Text variant="subheader-2" as="h1" id="actions-title">
          Управление записью
        </Text>
        <Text variant="body-2" color="secondary">
          Выберите действие из списка.
        </Text>

        <DropdownMenu
          items={actions.map(({text, action, theme}) => ({
            text,
            ...(theme ? {theme} : {}),
            action: () => setLastAction(action()),
          }))}
          renderSwitcher={({onClick, onKeyDown}) => (
            <Button view="action" onClick={onClick} onKeyDown={onKeyDown}>
              Действия
            </Button>
          )}
        />

        {lastAction && (
          <Text className="action-result" variant="body-2" color="secondary" role="status">
            Выбрано: {lastAction.toLowerCase()}.
          </Text>
        )}
      </section>
    </main>
  );
}
