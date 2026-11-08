export type Employee = {
    id: string;
    name: string;
    department: string;
    position: string;
    salary: number;
    /** ISO date, sorts chronologically as a string */
    hiredAt: string;
};

const firstNames = [
    'Александр', 'Мария', 'Дмитрий', 'Анна', 'Сергей', 'Елена', 'Андрей', 'Ольга',
    'Иван', 'Наталья', 'Максим', 'Татьяна', 'Павел', 'Ирина', 'Николай', 'Светлана',
    'Владимир', 'Екатерина', 'Артём', 'Юлия',
];

const lastNames = [
    'Иванов', 'Петрова', 'Сидоров', 'Кузнецова', 'Смирнов', 'Васильева', 'Попов',
    'Новикова', 'Фёдоров', 'Морозова', 'Волков', 'Алексеева', 'Лебедев', 'Семёнова',
    'Егоров', 'Павлова', 'Козлов', 'Степанова', 'Николаев', 'Орлова',
];

const departments = ['Разработка', 'Аналитика', 'Дизайн', 'Маркетинг', 'Поддержка'];

const positions = [
    'Стажёр', 'Специалист', 'Ведущий специалист', 'Руководитель группы', 'Директор направления',
];

// Deterministic pseudo-random generator so the dataset is stable between reloads.
const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export const employees: Employee[] = Array.from({length: 57}, (_, i) => {
    const first = firstNames[Math.floor(pseudoRandom(i * 3 + 1) * firstNames.length)];
    const last = lastNames[Math.floor(pseudoRandom(i * 3 + 2) * lastNames.length)];
    const start = new Date(2018, 0, 1).getTime();
    const end = new Date(2026, 0, 1).getTime();
    const hired = new Date(start + pseudoRandom(i * 3 + 3) * (end - start));

    return {
        id: `emp-${i + 1}`,
        name: `${last} ${first}`,
        department: departments[Math.floor(pseudoRandom(i * 5 + 1) * departments.length)],
        position: positions[Math.floor(pseudoRandom(i * 5 + 2) * positions.length)],
        salary: 80_000 + Math.floor(pseudoRandom(i * 5 + 3) * 32) * 10_000,
        hiredAt: hired.toISOString().slice(0, 10),
    };
});
