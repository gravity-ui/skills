export type EmployeeStatus = 'active' | 'vacation' | 'sick' | 'fired';

export type Employee = {
    id: string;
    name: string;
    department: string;
    position: string;
    salary: number;
    /** ISO-дата, YYYY-MM-DD */
    hiredAt: string;
    status: EmployeeStatus;
};

const FIRST_NAMES = ['Анна', 'Борис', 'Виктория', 'Глеб', 'Дарья', 'Егор', 'Жанна', 'Илья', 'Ксения', 'Лев', 'Мария', 'Никита', 'Ольга', 'Павел', 'Рената', 'Сергей'];
const LAST_NAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков'];
const FEMALE_NAMES = new Set(['Анна', 'Виктория', 'Дарья', 'Жанна', 'Ксения', 'Мария', 'Ольга', 'Рената']);
const DEPARTMENTS: Record<string, string[]> = {
    Разработка: ['Frontend-разработчик', 'Backend-разработчик', 'Тимлид'],
    Дизайн: ['Продуктовый дизайнер', 'UX-исследователь'],
    Маркетинг: ['Маркетолог', 'SMM-менеджер'],
    Продажи: ['Менеджер по продажам', 'Аккаунт-менеджер'],
    Поддержка: ['Специалист поддержки', 'Руководитель поддержки'],
};
const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'active', 'vacation', 'sick', 'fired'];

// Детерминированный ГПСЧ (mulberry32), чтобы данные не менялись между перезагрузками.
function createRandom(seed: number) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function generateEmployees(count: number, seed = 42): Employee[] {
    const random = createRandom(seed);
    const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)];
    const departments = Object.keys(DEPARTMENTS);

    return Array.from({length: count}, (_, index) => {
        const firstName = pick(FIRST_NAMES);
        const lastName = pick(LAST_NAMES) + (FEMALE_NAMES.has(firstName) ? 'а' : '');
        const department = pick(departments);
        const hiredAt = new Date(Date.UTC(2015, 0, 1) + Math.floor(random() * 3800) * 86_400_000);

        return {
            id: `EMP-${String(index + 1).padStart(3, '0')}`,
            name: `${lastName} ${firstName}`,
            department,
            position: pick(DEPARTMENTS[department]),
            salary: 80_000 + Math.round(random() * 320) * 1000,
            hiredAt: hiredAt.toISOString().slice(0, 10),
            status: pick(STATUSES),
        };
    });
}
