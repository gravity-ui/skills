import { Text } from '@gravity-ui/uikit';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable';

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  salary: number;
  hiredAt: Date;
}

const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'HR', 'Финансы'];
const POSITIONS = ['Инженер', 'Старший инженер', 'Дизайнер', 'Менеджер', 'Аналитик', 'Руководитель'];
const FIRST_NAMES = ['Алексей', 'Мария', 'Дмитрий', 'Анна', 'Игорь', 'Ольга', 'Сергей', 'Екатерина'];
const LAST_NAMES = ['Иванов', 'Петрова', 'Сидоров', 'Кузнецова', 'Смирнов', 'Попова', 'Соколов'];

// Детерминированный генератор (mulberry32): данные одинаковы при каждой перезагрузке.
function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createEmployees(count: number): Employee[] {
  const random = createRandom(42);
  const pick = (items: string[]) => items[Math.floor(random() * items.length)];
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `${pick(LAST_NAMES)} ${pick(FIRST_NAMES)}`,
    department: pick(DEPARTMENTS),
    position: pick(POSITIONS),
    salary: 80_000 + Math.floor(random() * 220) * 1_000,
    hiredAt: new Date(2015 + Math.floor(random() * 11), Math.floor(random() * 12), 1 + Math.floor(random() * 28)),
  }));
}

const EMPLOYEES = createEmployees(87);

const rubles = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

const COLUMNS: DataTableColumn<Employee>[] = [
  { id: 'name', title: 'Сотрудник', sortValue: (e) => e.name },
  { id: 'department', title: 'Отдел', sortValue: (e) => e.department },
  { id: 'position', title: 'Должность', sortValue: (e) => e.position },
  {
    id: 'salary',
    title: 'Зарплата',
    align: 'end',
    sortValue: (e) => e.salary,
    render: (e) => rubles.format(e.salary),
  },
  {
    id: 'hiredAt',
    title: 'Дата найма',
    sortValue: (e) => e.hiredAt.getTime(),
    render: (e) => e.hiredAt.toLocaleDateString('ru-RU'),
  },
];

const getEmployeeId = (e: Employee) => e.id;

export function App() {
  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <Text variant="header-1">Сотрудники</Text>
      <div style={{ marginTop: 16 }}>
        <DataTable rows={EMPLOYEES} columns={COLUMNS} getRowId={getEmployeeId} />
      </div>
    </div>
  );
}
