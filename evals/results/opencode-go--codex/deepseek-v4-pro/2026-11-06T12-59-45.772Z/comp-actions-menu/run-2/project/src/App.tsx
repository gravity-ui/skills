import { DropdownMenu } from '@gravity-ui/uikit';

const actionItems = [
  [
    {
      text: 'Редактировать',
      action: () => alert('Редактировать'),
    },
    {
      text: 'Копировать',
      action: () => alert('Копировать'),
    },
    {
      text: 'Переместить',
      action: () => alert('Переместить'),
    },
  ],
  [
    {
      text: 'Удалить',
      action: () => alert('Удалить'),
      theme: 'danger' as const,
    },
  ],
];

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu items={actionItems} defaultSwitcherProps={{ view: 'action', children: 'Действия' }} />
    </div>
  );
}
