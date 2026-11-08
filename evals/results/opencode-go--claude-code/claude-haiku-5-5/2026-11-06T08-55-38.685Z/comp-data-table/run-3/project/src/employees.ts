export type Employee = {
    id: string;
    name: string;
    department: string;
    position: string;
    salary: number;
    hireDate: string; // ISO yyyy-mm-dd: лексикографический порядок совпадает с хронологическим
};

const FIRST_NAMES = ['Иван', 'Мария', 'Алексей', 'Анна', 'Дмитрий', 'Ольга', 'Сергей', 'Елена', 'Павел', 'Наталья', 'Андрей', 'Ирина'];
const LAST_NAMES = ['Иванов', 'Петрова', 'Смирнов', 'Кузнецова', 'Попов', 'Соколова', 'Лебедев', 'Козлова', 'Новиков', 'Морозова'];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'HR', 'Финансы'];
const POSITIONS = ['Инженер', 'Старший инженер', 'Менеджер', 'Аналитик', 'Дизайнер', 'Специалист'];

// Детерминированные данные: таблица выглядит одинаково при каждой перезагрузке
export const employees: Employee[] = Array.from({ length: 53 }, (_, i) => {
    const hireDate = new Date(Date.UTC(2014 + ((i * 7) % 12), (i * 5) % 12, 1 + ((i * 11) % 28)));
    return {
        id: `emp-${i + 1}`,
        name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3) % LAST_NAMES.length]}`,
        department: DEPARTMENTS[(i * 2) % DEPARTMENTS.length],
        position: POSITIONS[(i * 5) % POSITIONS.length],
        salary: 70_000 + ((i * 7919) % 150) * 1_000,
        hireDate: hireDate.toISOString().slice(0, 10),
    };
});
