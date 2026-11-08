export type EmployeeStatus = 'active' | 'vacation' | 'fired';

export interface Employee {
    id: string;
    name: string;
    department: string;
    position: string;
    salary: number;
    hireDate: string; // ISO yyyy-mm-dd
    status: EmployeeStatus;
}

const FIRST_NAMES = [
    'Анна',
    'Иван',
    'Мария',
    'Пётр',
    'Ольга',
    'Сергей',
    'Елена',
    'Дмитрий',
    'Наталья',
    'Алексей',
    'Татьяна',
    'Михаил',
];
const LAST_NAMES = [
    'Иванов',
    'Смирнов',
    'Кузнецов',
    'Попов',
    'Васильев',
    'Соколов',
    'Михайлов',
    'Новиков',
    'Фёдоров',
    'Морозов',
    'Волков',
];
const DEPARTMENTS = ['Разработка', 'Маркетинг', 'Продажи', 'Поддержка', 'Финансы', 'HR'];
const POSITIONS = ['Стажёр', 'Специалист', 'Старший специалист', 'Ведущий специалист', 'Руководитель'];
const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'vacation', 'fired'];

const FEMALE_NAMES = new Set(['Анна', 'Мария', 'Ольга', 'Елена', 'Наталья', 'Татьяна']);

function makeEmployee(index: number): Employee {
    const firstName = FIRST_NAMES[(index * 7) % FIRST_NAMES.length];
    const baseLastName = LAST_NAMES[(index * 5 + 3) % LAST_NAMES.length];
    const lastName = FEMALE_NAMES.has(firstName) ? `${baseLastName}а` : baseLastName;
    const positionIndex = (index * 3) % POSITIONS.length;

    const year = 2015 + (index % 10);
    const month = String(((index * 5) % 12) + 1).padStart(2, '0');
    const day = String(((index * 11) % 28) + 1).padStart(2, '0');

    return {
        id: `emp-${index + 1}`,
        name: `${lastName} ${firstName}`,
        department: DEPARTMENTS[(index * 4 + 1) % DEPARTMENTS.length],
        position: POSITIONS[positionIndex],
        salary: 60000 + positionIndex * 45000 + ((index * 7919) % 30) * 1000,
        hireDate: `${year}-${month}-${day}`,
        status: STATUSES[(index * 3 + 1) % STATUSES.length],
    };
}

export const EMPLOYEES: Employee[] = Array.from({length: 87}, (_, i) => makeEmployee(i));
