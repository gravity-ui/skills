export interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    salary: number;
    hiredAt: string; // ISO date
}

const FIRST_NAMES = [
    'Александр', 'Мария', 'Дмитрий', 'Анна', 'Сергей', 'Елена', 'Иван', 'Ольга',
    'Максим', 'Наталья', 'Артём', 'Екатерина', 'Никита', 'Татьяна', 'Павел', 'Юлия',
    'Кирилл', 'Светлана', 'Андрей', 'Ирина', 'Владимир', 'Полина', 'Роман', 'Виктория',
];

const LAST_NAMES = [
    'Иванов', 'Петрова', 'Сидоров', 'Кузнецова', 'Смирнов', 'Васильева', 'Попов',
    'Новикова', 'Фёдоров', 'Морозова', 'Волков', 'Соколова', 'Лебедев', 'Орлова',
    'Козлов', 'Захарова', 'Белов', 'Тарасова', 'Егоров', 'Романова',
];

const ROLES = [
    'Frontend-разработчик', 'Backend-разработчик', 'DevOps-инженер', 'QA-инженер',
    'Аналитик', 'Продакт-менеджер', 'Дизайнер', 'Тимлид', 'Data-инженер', 'Системный администратор',
];

const DEPARTMENTS = ['Разработка', 'Продукт', 'Аналитика', 'Инфраструктура', 'Дизайн', 'Качество'];

/** Детерминированный ГПСЧ, чтобы данные были стабильны между перезапусками */
function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function generateEmployees(count: number): Employee[] {
    const rand = mulberry32(42);
    const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

    return Array.from({length: count}, (_, i) => {
        const salary = Math.round((80 + rand() * 320) * 1000 / 500) * 500; // 80 000 – 400 000, шаг 500
        const hired = new Date(
            2018 + Math.floor(rand() * 8),
            Math.floor(rand() * 12),
            1 + Math.floor(rand() * 28),
        );
        return {
            id: `emp-${i + 1}`,
            name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
            role: pick(ROLES),
            department: pick(DEPARTMENTS),
            salary,
            hiredAt: hired.toISOString().slice(0, 10),
        };
    });
}

export const EMPLOYEES: Employee[] = generateEmployees(57);
