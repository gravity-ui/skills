import { Label } from '@gravity-ui/uikit';
import { DataTable, type DataTableColumn } from './DataTable';

type Status = 'active' | 'vacation' | 'dismissed';

interface Employee {
  id: string;
  name: string;
  department: string;
  salary: number;
  hiredAt: string;
  status: Status;
}

const STATUS_META: Record<Status, { title: string; theme: 'success' | 'warning' | 'normal' }> = {
  active: { title: 'Работает', theme: 'success' },
  vacation: { title: 'Отпуск', theme: 'warning' },
  dismissed: { title: 'Уволен', theme: 'normal' },
};

const NAMES = [
  'Анна Иванова',
  'Борис Петров',
  'Вера Смирнова',
  'Григорий Кузнецов',
  'Дарья Соколова',
  'Елена Попова',
  'Игорь Васильев',
  'Ольга Морозова',
  'Павел Новиков',
  'Светлана Фёдорова',
  'Тимур Захаров',
  'Юлия Орлова',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'HR', 'Финансы'];
const STATUSES: Status[] = ['active', 'active', 'active', 'vacation', 'dismissed'];

// Детерминированные тестовые данные (без Math.random, чтобы порядок был стабильным).
const EMPLOYEES: Employee[] = Array.from({ length: 57 }, (_, i) => ({
  id: String(i + 1),
  name: NAMES[i % NAMES.length],
  department: DEPARTMENTS[(i * 5) % DEPARTMENTS.length],
  salary: 90_000 + ((i * 37) % 70) * 1_500,
  hiredAt: new Date(Date.UTC(2016, 0, 1) + ((i * 97) % 3500) * 86_400_000)
    .toISOString()
    .slice(0, 10),
  status: STATUSES[(i * 3) % STATUSES.length],
}));

const COLUMNS: DataTableColumn<Employee>[] = [
  {
    id: 'name',
    title: 'Сотрудник',
    render: (row) => row.name,
    compare: (a, b) => a.name.localeCompare(b.name, 'ru'),
  },
  {
    id: 'department',
    title: 'Отдел',
    render: (row) => row.department,
    compare: (a, b) => a.department.localeCompare(b.department, 'ru'),
  },
  {
    id: 'salary',
    title: 'Зарплата',
    align: 'end',
    render: (row) => `${row.salary.toLocaleString('ru-RU')} ₽`,
    compare: (a, b) => a.salary - b.salary,
  },
  {
    id: 'hiredAt',
    title: 'Дата найма',
    render: (row) => row.hiredAt,
    compare: (a, b) => a.hiredAt.localeCompare(b.hiredAt),
  },
  {
    id: 'status',
    title: 'Статус',
    render: (row) => (
      <Label theme={STATUS_META[row.status].theme}>{STATUS_META[row.status].title}</Label>
    ),
    compare: (a, b) => STATUS_META[a.status].title.localeCompare(STATUS_META[b.status].title, 'ru'),
  },
];

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <DataTable data={EMPLOYEES} columns={COLUMNS} />
    </div>
  );
}
