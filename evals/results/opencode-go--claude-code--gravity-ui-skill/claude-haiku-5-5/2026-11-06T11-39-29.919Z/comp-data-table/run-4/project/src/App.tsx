import {Box, Flex, Text} from '@gravity-ui/uikit';

import {DataTable} from './DataTable';
import type {DataTableColumn} from './DataTable';

type Employee = {
    id: string;
    name: string;
    department: string;
    position: string;
    experience: number;
    salary: number;
};

const FIRST_NAMES = [
    'Анна', 'Борис', 'Вера', 'Глеб', 'Дарья', 'Егор', 'Жанна', 'Захар',
    'Ирина', 'Кирилл', 'Лидия', 'Михаил', 'Нина', 'Олег', 'Полина', 'Роман',
];
const LAST_NAMES = [
    'Антонов', 'Белова', 'Волков', 'Гусев', 'Давыдова', 'Еремин', 'Жуков', 'Зайцева',
    'Ильин', 'Калинина', 'Лебедев', 'Мухин', 'Наумова', 'Орлов', 'Павлова', 'Рыбаков',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'HR', 'Финансы'];
const POSITIONS = ['Инженер', 'Дизайнер', 'Аналитик', 'Менеджер', 'Специалист'];

// Deterministic sample data so the table looks the same on every reload.
const EMPLOYEES: Employee[] = Array.from({length: 47}, (_, i) => ({
    id: `emp-${i + 1}`,
    name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 7) % LAST_NAMES.length]}`,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    position: POSITIONS[(i * 3) % POSITIONS.length],
    experience: ((i * 5) % 15) + 1,
    salary: 80_000 + ((i * 7919) % 90) * 1_000,
}));

const COLUMNS: DataTableColumn<Employee>[] = [
    {id: 'name', name: 'Имя', width: 200, sortValue: (e) => e.name, render: (e) => e.name},
    {id: 'department', name: 'Отдел', sortValue: (e) => e.department, render: (e) => e.department},
    {id: 'position', name: 'Должность', sortValue: (e) => e.position, render: (e) => e.position},
    {
        id: 'experience',
        name: 'Стаж, лет',
        align: 'end',
        sortValue: (e) => e.experience,
        render: (e) => e.experience,
    },
    {
        id: 'salary',
        name: 'Зарплата',
        align: 'end',
        sortValue: (e) => e.salary,
        render: (e) => `${e.salary.toLocaleString('ru-RU')} ₽`,
    },
];

export function App() {
    return (
        <Box spacing={{p: 6}}>
            <Flex direction="column" gap={4}>
                <Text variant="header-1">Сотрудники</Text>
                <DataTable data={EMPLOYEES} columns={COLUMNS} />
            </Flex>
        </Box>
    );
}
