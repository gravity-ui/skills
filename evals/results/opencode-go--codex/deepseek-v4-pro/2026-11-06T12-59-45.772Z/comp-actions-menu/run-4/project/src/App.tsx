import { DropdownMenu } from '@gravity-ui/uikit';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu
        defaultSwitcherProps={{ view: 'action', children: 'Действия' }}
        items={[
          { text: 'Редактировать', action: () => alert('Редактировать') },
          { text: 'Копировать', action: () => alert('Копировать') },
          { text: 'Удалить', action: () => alert('Удалить') },
          [
            { text: 'Экспорт в PDF', action: () => alert('Экспорт в PDF') },
            { text: 'Экспорт в CSV', action: () => alert('Экспорт в CSV') },
          ],
        ]}
      />
    </div>
  );
}
