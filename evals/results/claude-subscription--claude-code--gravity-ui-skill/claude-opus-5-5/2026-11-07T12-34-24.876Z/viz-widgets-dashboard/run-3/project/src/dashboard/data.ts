// Демо-данные для виджетов. В реальном приложении их заменит API.

export type KpiIcon = 'revenue' | 'orders' | 'customers' | 'conversion';

export interface KpiWidgetData {
    title: string;
    value: string;
    /** Изменение к прошлому периоду, в процентах. */
    delta: number;
    icon: KpiIcon;
    [key: string]: unknown;
}

export interface TitledWidgetData {
    title: string;
    [key: string]: unknown;
}

export interface Goal {
    id: string;
    name: string;
    current: number;
    target: number;
    unit: string;
}

export const GOALS: Goal[] = [
    {id: 'g1', name: 'Выручка', current: 8.4, target: 12, unit: 'млн ₽'},
    {id: 'g2', name: 'Новые клиенты', current: 312, target: 400, unit: ''},
    {id: 'g3', name: 'Закрытые сделки', current: 47, target: 50, unit: ''},
    {id: 'g4', name: 'NPS', current: 41, target: 60, unit: ''},
];

export type DealStage = 'won' | 'negotiation' | 'lost' | 'new';

export interface Deal {
    id: string;
    client: string;
    manager: string;
    amount: string;
    stage: DealStage;
}

export const DEALS: Deal[] = [
    {id: 'd1', client: 'ООО «Северный ветер»', manager: 'А. Смирнова', amount: '1 240 000 ₽', stage: 'won'},
    {id: 'd2', client: 'ИП Кузнецов', manager: 'Д. Орлов', amount: '380 000 ₽', stage: 'negotiation'},
    {id: 'd3', client: 'АО «Техносфера»', manager: 'А. Смирнова', amount: '2 900 000 ₽', stage: 'new'},
    {id: 'd4', client: 'ООО «Лазурь»', manager: 'М. Ким', amount: '615 000 ₽', stage: 'lost'},
    {id: 'd5', client: 'ГК «Меридиан»', manager: 'Д. Орлов', amount: '1 870 000 ₽', stage: 'negotiation'},
    {id: 'd6', client: 'ООО «Полюс»', manager: 'М. Ким', amount: '450 000 ₽', stage: 'won'},
];

export interface ActivityEvent {
    id: string;
    time: string;
    text: string;
    author: string;
}

export const ACTIVITY: ActivityEvent[] = [
    {id: 'a1', time: '10:42', author: 'А. Смирнова', text: 'закрыла сделку с ООО «Северный ветер»'},
    {id: 'a2', time: '10:15', author: 'Д. Орлов', text: 'отправил КП в ГК «Меридиан»'},
    {id: 'a3', time: '09:58', author: 'М. Ким', text: 'добавил 12 новых лидов из вебинара'},
    {id: 'a4', time: '09:30', author: 'Система', text: 'обновила прогноз выручки на квартал'},
    {id: 'a5', time: 'Вчера', author: 'А. Смирнова', text: 'назначила встречу с АО «Техносфера»'},
    {id: 'a6', time: 'Вчера', author: 'М. Ким', text: 'перевела сделку ООО «Лазурь» в архив'},
];
