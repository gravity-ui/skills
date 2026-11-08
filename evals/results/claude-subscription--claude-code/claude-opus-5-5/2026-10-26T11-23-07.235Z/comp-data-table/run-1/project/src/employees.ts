export type EmployeeStatus = 'active' | 'vacation' | 'sick';

export interface Employee {
    id: string;
    name: string;
    department: string;
    position: string;
    salary: number;
    hireDate: Date;
    status: EmployeeStatus;
}

const FIRST_NAMES = ['Анна', 'Борис', 'Виктория', 'Глеб', 'Дарья', 'Егор', 'Жанна', 'Илья', 'Ксения', 'Лев', 'Мария', 'Никита', 'Ольга', 'Павел', 'Роман', 'София'];
const LAST_NAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Зайцев', 'Павлов'];
const FEMALE_NAMES = new Set(['Анна', 'Виктория', 'Дарья', 'Жанна', 'Ксения', 'Мария', 'Ольга', 'София']);
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'Поддержка', 'Финансы'];
const POSITIONS = ['Стажёр', 'Специалист', 'Старший специалист', 'Ведущий специалист', 'Руководитель группы'];
const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'vacation', 'sick'];

/** Детерминированный ГПСЧ (mulberry32), чтобы данные не менялись между перезагрузками. */
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
    const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length)];

    return Array.from({ length: count }, (_, index) => {
        const firstName = pick(FIRST_NAMES);
        const lastName = pick(LAST_NAMES) + (FEMALE_NAMES.has(firstName) ? 'а' : '');
        const positionLevel = Math.floor(random() * POSITIONS.length);
        const hireDate = new Date(2015, 0, 1);
        hireDate.setDate(hireDate.getDate() + Math.floor(random() * 365 * 10));

        return {
            id: `emp-${String(index + 1).padStart(3, '0')}`,
            name: `${lastName} ${firstName}`,
            department: pick(DEPARTMENTS),
            position: POSITIONS[positionLevel],
            salary: Math.round((60_000 + positionLevel * 45_000 + random() * 40_000) / 1000) * 1000,
            hireDate,
            status: pick(STATUSES),
        };
    });
}
