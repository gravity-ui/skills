export type ContactStatus = "active" | "new" | "archived";
export type Contact = {
  id: string;
  name: string;
  email: string;
  company: string;
  domain: string;
  status: ContactStatus;
  role: string;
  created: string;
  tone: number;
};
export const statusNames: Record<ContactStatus, string> = {
  active: "Активный",
  new: "Новый",
  archived: "В архиве",
};
const seed = [
  [
    "Анна Смирнова",
    "anna.smirnova",
    "Яндекс",
    "yandex.ru",
    "active",
    "Продакт-менеджер",
  ],
  [
    "Михаил Козлов",
    "m.kozlov",
    "Точка",
    "tochka.com",
    "active",
    "Дизайн-директор",
  ],
  ["Елена Волкова", "elena.volkova", "Авито", "avito.ru", "new", "Маркетолог"],
  [
    "Дмитрий Соколов",
    "d.sokolov",
    "Ozon",
    "ozon.ru",
    "active",
    "Руководитель отдела",
  ],
  [
    "Ольга Новикова",
    "olga.novikova",
    "Самокат",
    "samokat.ru",
    "active",
    "UX/UI-дизайнер",
  ],
  [
    "Александр Морозов",
    "a.morozov",
    "Т-Банк",
    "tbank.ru",
    "archived",
    "Разработчик",
  ],
  ["Мария Кузнецова", "m.kuznetsova", "Сбер", "sber.ru", "new", "HR-менеджер"],
  [
    "Артём Попов",
    "artem.popov",
    "VK",
    "vk.company",
    "active",
    "Продакт-менеджер",
  ],
  [
    "Виктория Лебедева",
    "v.lebedeva",
    "Яндекс",
    "yandex.ru",
    "active",
    "Аналитик",
  ],
  [
    "Иван Петров",
    "ivan.petrov",
    "МТС",
    "mts.ru",
    "active",
    "Руководитель проектов",
  ],
];
const firstNames = [
  "Андрей",
  "София",
  "Максим",
  "Алиса",
  "Сергей",
  "Дарья",
  "Никита",
  "Полина",
  "Павел",
  "Ксения",
  "Роман",
  "Татьяна",
];
const surnames = [
  "Иванов",
  "Орлова",
  "Белов",
  "Миронова",
  "Васильев",
  "Фёдорова",
  "Зайцев",
  "Медведева",
  "Егоров",
  "Тихонова",
];
export function createContacts(): Contact[] {
  return Array.from({ length: 128 }, (_, i) => {
    const s = seed[i % seed.length];
    const status: ContactStatus =
      i < 10
        ? (s[4] as ContactStatus)
        : i < 17
          ? "archived"
          : i < 39
            ? "new"
            : "active";
    return {
      id: `contact-${i + 1}`,
      name:
        i < 10
          ? s[0]
          : `${firstNames[(i - 10) % 12]} ${surnames[Math.floor((i - 10) / 12) % 10]}`,
      email: `${i < 10 ? s[1] : `team.${i + 1}`}@${s[3]}`,
      company: s[2],
      domain: s[3],
      status,
      role: s[5],
      created: new Date(Date.UTC(2026, 10, 5 - Math.floor(i / 2)))
        .toISOString()
        .slice(0, 10),
      tone: i % 5,
    };
  });
}
export function filterAndSort(
  data: Contact[],
  query: string,
  status: string,
  company: string,
  sort: { column: string; order: "asc" | "desc" }[],
) {
  const q = query.trim().toLocaleLowerCase("ru");
  return data
    .filter(
      (c) =>
        (!q ||
          `${c.name} ${c.email} ${c.company} ${c.role}`
            .toLocaleLowerCase("ru")
            .includes(q)) &&
        (status === "all" || c.status === status) &&
        (company === "all" || c.company === company),
    )
    .sort((a, b) => {
      for (const s of sort) {
        const cmp = String(a[s.column as keyof Contact]).localeCompare(
          String(b[s.column as keyof Contact]),
          "ru",
        );
        if (cmp) return s.order === "asc" ? cmp : -cmp;
      }
      return 0;
    });
}
