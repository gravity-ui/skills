export type EmployeeStatus = 'active' | 'vacation' | 'dismissed';

export interface Employee {
    id: string;
    name: string;
    department: string;
    position: string;
    salary: number;
    hiredAt: string; // ISO date, YYYY-MM-DD
    status: EmployeeStatus;
}

const FIRST_NAMES = ['Анна', 'Иван', 'Мария', 'Пётр', 'Елена', 'Сергей', 'Ольга', 'Дмитрий', 'Наталья', 'Алексей'];
const LAST_NAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов'];
const DEPARTMENTS = ['Разработка', 'Маркетинг', 'Продажи', 'Финансы', 'Поддержка'];
const POSITIONS = ['Стажёр', 'Специалист', 'Ведущий специалист', 'Руководитель группы', 'Директор'];
const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'vacation', 'dismissed'];

// Deterministic pseudo-random generator, so the demo data is stable between reloads.
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

function pick<T>(list: T[], random: () => number): T {
    return list[Math.floor(random() * list.length)];
}

function feminize(lastName: string, firstName: string) {
    const female = /[ая]$/.test(firstName);
    return female ? `${lastName}а` : lastName;
}

export function generateEmployees(count: number): Employee[] {
    const random = createRandom(42);

    return Array.from({length: count}, (_, index) => {
        const firstName = pick(FIRST_NAMES, random);
        const lastName = feminize(pick(LAST_NAMES, random), firstName);
        const positionIndex = Math.floor(random() * POSITIONS.length);
        const year = 2015 + Math.floor(random() * 10);
        const month = 1 + Math.floor(random() * 12);
        const day = 1 + Math.floor(random() * 28);

        return {
            id: String(index + 1),
            name: `${lastName} ${firstName}`,
            department: pick(DEPARTMENTS, random),
            position: POSITIONS[positionIndex],
            salary: Math.round((60_000 + positionIndex * 55_000 + random() * 40_000) / 1000) * 1000,
            hiredAt: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            status: pick(STATUSES, random),
        };
    });
}
