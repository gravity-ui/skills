import {Lang, configure} from '@gravity-ui/uikit';

import {DataTable} from './DataTable';
import type {Employee, EmployeeStatus} from './DataTable';

// Russian strings for built-in uikit texts (pagination, selection aria-labels, etc.).
configure({lang: Lang.Ru});

const FIRST_NAMES = ['Анна', 'Иван', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Алексей', 'Наталья', 'Павел'];
const LAST_NAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов'];
const DEPARTMENTS = ['Разработка', 'Маркетинг', 'Продажи', 'Финансы', 'Поддержка'];
const POSITIONS = ['Стажёр', 'Специалист', 'Старший специалист', 'Ведущий специалист', 'Руководитель группы'];
const STATUSES: EmployeeStatus[] = ['active', 'active', 'active', 'vacation', 'fired'];

function feminize(lastName: string, firstName: string) {
    const female = /[ая]$/.test(firstName);
    return female ? `${lastName}а` : lastName;
}

// Deterministic demo data so sorting/pagination behave the same on every reload.
const employees: Employee[] = Array.from({length: 57}, (_, i) => {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = feminize(LAST_NAMES[(i * 7) % LAST_NAMES.length], firstName);
    const positionIndex = (i * 3) % POSITIONS.length;
    const hired = new Date(Date.UTC(2015 + (i % 10), (i * 5) % 12, 1 + ((i * 11) % 28)));

    return {
        id: `emp-${i + 1}`,
        name: `${firstName} ${lastName}`,
        department: DEPARTMENTS[(i * 2) % DEPARTMENTS.length],
        position: POSITIONS[positionIndex],
        salary: 60_000 + positionIndex * 35_000 + ((i * 7919) % 20) * 1_500,
        hiredAt: hired.toISOString().slice(0, 10),
        status: STATUSES[(i * 3) % STATUSES.length],
    };
});

export function App() {
    return (
        <div style={{padding: 'var(--g-spacing-6)'}}>
            <DataTable data={employees} />
        </div>
    );
}
