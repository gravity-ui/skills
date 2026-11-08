export type Status = "new" | "processing" | "completed" | "cancelled";
export interface Order {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  date: string;
  time: string;
  amount: number;
  items: number;
  status: Status;
  payment: "paid" | "pending" | "refunded";
  method: string;
  children?: Order[];
}
export const statuses: Record<Status, string> = {
  new: "Новый",
  processing: "В обработке",
  completed: "Выполнен",
  cancelled: "Отменён",
};
const customers = [
  ["Александр Петров", "alex.petrov@mail.ru", "АП", "violet"],
  ["Мария Иванова", "m.ivanova@gmail.com", "МИ", "pink"],
  ["Дмитрий Смирнов", "d.smirnov@yandex.ru", "ДС", "blue"],
  ["Екатерина Козлова", "kate.kozlova@mail.ru", "ЕК", "orange"],
  ["Андрей Соколов", "a.sokolov@gmail.com", "АС", "green"],
  ["Анна Новикова", "anna.novikova@mail.ru", "АН", "pink"],
  ["Михаил Волков", "m.volkov@yandex.ru", "МВ", "blue"],
  ["Ольга Морозова", "olga.m@gmail.com", "ОМ", "violet"],
  ["Сергей Лебедев", "s.lebedev@mail.ru", "СЛ", "green"],
  ["Наталья Попова", "n.popova@gmail.com", "НП", "orange"],
  ["Иван Кузнецов", "i.kuznetsov@yandex.ru", "ИК", "blue"],
  ["Елена Васильева", "e.vasilieva@mail.ru", "ЕВ", "pink"],
];
export const initialOrders: Order[] = Array.from({ length: 48 }, (_, i) => {
  const [name, email, initials, color] = customers[i % customers.length];
  const status: Status = (
    [
      "new",
      "new",
      "new",
      "processing",
      "processing",
      "processing",
      "completed",
      "completed",
      "completed",
      "completed",
      "cancelled",
      "completed",
    ] as Status[]
  )[i % 12];
  return {
    id: String(10548 - i),
    name,
    email,
    initials,
    color,
    date: `2026-11-${String(4 - Math.floor(i / 12)).padStart(2, "0")}`,
    time: [
      "14:32",
      "14:18",
      "13:56",
      "13:41",
      "13:25",
      "12:50",
      "12:34",
      "12:18",
      "11:42",
      "11:20",
      "10:55",
      "10:30",
    ][i % 12],
    amount: [
      12490, 5840, 24900, 8750, 15300, 3290, 18900, 7650, 4260, 21300, 6490,
      11200,
    ][i % 12],
    items: [3, 2, 5, 2, 4, 1, 3, 2, 1, 4, 2, 3][i % 12],
    status,
    payment:
      status === "cancelled" ? "refunded" : i % 6 === 2 ? "pending" : "paid",
    method: i % 4 === 0 ? "СБП" : "Банковская карта",
  };
});
export const money = (amount: number) =>
  new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
export const dateLabel = (date: string) =>
  new Date(date + "T12:00:00")
    .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
    .replace(".", "") + " 2026";
