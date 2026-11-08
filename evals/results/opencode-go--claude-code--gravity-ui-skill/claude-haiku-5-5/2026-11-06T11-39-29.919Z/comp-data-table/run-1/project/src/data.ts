export type OrderStatus = 'new' | 'paid' | 'shipped' | 'cancelled';

export type Order = {
    id: string;
    client: string;
    amount: number;
    createdAt: number;
    status: OrderStatus;
};

const CLIENT_NAMES = ['Ромашка', 'Вектор', 'Альфа', 'Сириус', 'Компас', 'Орбита', 'Гранит', 'Заря'];
const CLIENT_FORMS = ['ООО', 'АО', 'ИП'];
const STATUSES: OrderStatus[] = ['new', 'paid', 'shipped', 'cancelled'];

// Детерминированный генератор (LCG): одинаковые данные при каждой загрузке.
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

export function generateOrders(count: number): Order[] {
    const random = createRandom(42);
    const base = Date.UTC(2026, 0, 1);
    const day = 24 * 60 * 60 * 1000;

    return Array.from({ length: count }, (_, index) => {
        const form = CLIENT_FORMS[Math.floor(random() * CLIENT_FORMS.length)];
        const name = CLIENT_NAMES[Math.floor(random() * CLIENT_NAMES.length)];
        return {
            id: `ORD-${1000 + index}`,
            client: `${form} «${name}»`,
            amount: Math.round((500 + random() * 99500) / 10) * 10,
            createdAt: base + Math.floor(random() * 300) * day,
            status: STATUSES[Math.floor(random() * STATUSES.length)],
        };
    });
}
