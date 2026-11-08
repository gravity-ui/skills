export type OrderStatus = "processing" | "shipping" | "completed" | "cancelled";
export interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  quantity: number;
  amount: number;
  date: string;
  status: OrderStatus;
  color: number;
  items?: Order[];
  group?: boolean;
}
export const statusInfo: Record<OrderStatus, { label: string; short: string }> =
  {
    processing: { label: "В обработке", short: "В обработке" },
    shipping: { label: "В доставке", short: "В доставке" },
    completed: { label: "Завершён", short: "Завершены" },
    cancelled: { label: "Отменён", short: "Отменены" },
  };
const customers = [
  ["Анна Смирнова", "anna.smirnova@gmail.com"],
  ["Михаил Козлов", "m.kozlov@mail.ru"],
  ["Екатерина Волкова", "kate.volkova@yandex.ru"],
  ["Александр Петров", "a.petrov@gmail.com"],
  ["Ольга Новикова", "olga.novikova@mail.ru"],
  ["Дмитрий Соколов", "d.sokolov@yandex.ru"],
  ["Мария Кузнецова", "maria.k@gmail.com"],
  ["Иван Морозов", "ivan.morozov@mail.ru"],
  ["София Лебедева", "s.lebedeva@yandex.ru"],
  ["Артём Попов", "artem.p@gmail.com"],
  ["Дарья Васильева", "d.vasilieva@mail.ru"],
  ["Максим Орлов", "max.orlov@yandex.ru"],
  ["Полина Белова", "polina.b@gmail.com"],
  ["Никита Павлов", "nikita.p@mail.ru"],
  ["Алиса Фёдорова", "alisa.f@yandex.ru"],
  ["Андрей Егоров", "andrey.e@gmail.com"],
];
const products = [
  ["Наушники Sony WH-1000XM5", 32990],
  ["Apple Watch SE, 44 мм", 24990],
  ["Клавиатура Logitech MX Keys", 12490],
  ["Колонка Яндекс Станция", 16990],
  ["Монитор Samsung ViewFinity", 34990],
  ["Мышь Logitech MX Master 3S", 9990],
  ["Наушники Apple AirPods Pro", 22990],
  ["Камера Fujifilm Instax Mini", 11490],
  ["Портативная колонка JBL Flip 6", 8990],
  ["Планшет Apple iPad Air", 64990],
  ["Смарт-часы Huawei Watch GT", 15990],
  ["Зарядное устройство Anker", 3990],
];
export const initialOrders: Order[] = Array.from({ length: 128 }, (_, i) => {
  const customer = customers[i % customers.length];
  const product = products[i % products.length];
  const status: OrderStatus =
    i < 3
      ? "processing"
      : i < 5
        ? "shipping"
        : i < 8
          ? "completed"
          : i % 13 === 0
            ? "cancelled"
            : (
                [
                  "processing",
                  "shipping",
                  "completed",
                  "completed",
                ] as OrderStatus[]
              )[i % 4];
  return {
    id: String(10248 - i),
    customer: customer[0],
    email: customer[1],
    product: product[0] as string,
    quantity: (i % 3) + 1,
    amount: product[1] as number,
    date: new Date(
      2026,
      10,
      4 - Math.floor(i / 8),
      14 - (i % 7),
      48 - (i % 37),
    ).toISOString(),
    status,
    color: i % 6,
  };
});
export function money(value: number) {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value) +
    " ₽"
  );
}
export function initials(value: string) {
  return value
    .split(" ")
    .slice(0, 2)
    .map((v) => v[0])
    .join("");
}
export function readSaved<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
