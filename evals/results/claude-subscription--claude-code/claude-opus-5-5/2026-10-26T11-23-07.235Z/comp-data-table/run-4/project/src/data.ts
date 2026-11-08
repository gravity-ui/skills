export type EmployeeStatus = 'active' | 'vacation' | 'fired';

export interface Employee {
    id: string;
    name: string;
    department: string;
    position: string;
    salary: number;
    hiredAt: string; // ISO-дата, корректно сортируется как строка
    status: EmployeeStatus;
}

const FEMALE_NAMES = ['Анна', 'Мария', 'Ольга', 'Елена', 'Наталья', 'Ирина', 'Татьяна', 'Светлана'];
const MALE_NAMES = ['Иван', 'Пётр', 'Алексей', 'Дмитрий', 'Сергей', 'Андрей', 'Михаил', 'Николай'];
const LAST_NAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков', 'Лебедев', 'Козлов'];
const DEPARTMENTS = ['Разработка', 'Маркетинг', 'Продажи', 'Финансы', 'Поддержка'];
const POSITIONS = ['Стажёр', 'Специалист', 'Старший специалист', 'Ведущий специалист', 'Руководитель'];
const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'vacation', 'fired'];

// Детерминированный ГПСЧ, чтобы данные не менялись между перезагрузками.
function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function generateEmployees(count: number, seed = 42): Employee[] {
    const random = mulberry32(seed);
    const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)];

    return Array.from({ length: count }, (_, index) => {
        const isFemale = random() < 0.5;
        const firstName = pick(isFemale ? FEMALE_NAMES : MALE_NAMES);
        const lastName = pick(LAST_NAMES);
        const positionIndex = Math.floor(random() * POSITIONS.length);
        const hiredAt = new Date(Date.UTC(2015, 0, 1) + Math.floor(random() * 10 * 365) * 86_400_000);

        return {
            id: String(index + 1),
            name: `${isFemale ? `${lastName}а` : lastName} ${firstName}`,
            department: pick(DEPARTMENTS),
            position: POSITIONS[positionIndex],
            salary: Math.round((60_000 + positionIndex * 45_000 + random() * 40_000) / 1000) * 1000,
            hiredAt: hiredAt.toISOString().slice(0, 10),
            status: pick(STATUSES),
        };
    });
}
