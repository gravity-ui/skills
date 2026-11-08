import { Label, Text, configure } from '@gravity-ui/uikit';

import { DataTable, DataTableColumn } from './DataTable';
import { EMPLOYEES, Employee } from './data';

// Подписи пагинации и служебных надписей uikit на русском.
configure({ lang: 'ru' });

const formatDate = (iso: string) => iso.split('-').reverse().join('.');

// Колонки объявлены на уровне модуля, чтобы ссылка на массив не менялась между рендерами.
const columns: DataTableColumn<Employee>[] = [
  { id: 'name', name: 'Сотрудник', sortValue: (r) => r.name },
  { id: 'email', name: 'Email', sortValue: (r) => r.email },
  { id: 'department', name: 'Отдел', sortValue: (r) => r.department },
  { id: 'position', name: 'Должность', sortValue: (r) => r.position },
  {
    id: 'salary',
    name: 'Зарплата',
    align: 'end',
    sortValue: (r) => r.salary,
    render: (r) => `${r.salary.toLocaleString('ru-RU')} ₽`,
  },
  {
    id: 'hiredAt',
    name: 'Дата найма',
    sortValue: (r) => r.hiredAt,
    render: (r) => formatDate(r.hiredAt),
  },
  {
    id: 'active',
    name: 'Статус',
    sortValue: (r) => (r.active ? 0 : 1),
    render: (r) => (
      <Label theme={r.active ? 'success' : 'unknown'}>{r.active ? 'Активен' : 'Неактивен'}</Label>
    ),
  },
];

export function App() {
  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <Text variant="header-1">Сотрудники</Text>
      <div style={{ marginTop: 16 }}>
        <DataTable data={EMPLOYEES} columns={columns} />
      </div>
    </div>
  );
}
