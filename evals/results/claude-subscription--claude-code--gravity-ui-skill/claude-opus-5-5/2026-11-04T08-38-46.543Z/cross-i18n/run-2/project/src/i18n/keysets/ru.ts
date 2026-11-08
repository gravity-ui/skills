import type { Translation } from './en';

export const ru: Translation = {
    app: {
        title: 'Настройки рабочего пространства',
        subtitle: 'Весь интерфейс, включая встроенные тексты Gravity UI, переключается на выбранный язык.',
        'language-label': 'Язык интерфейса',
    },
    profile: {
        title: 'Профиль',
        'name-label': 'Отображаемое имя',
        'name-placeholder': 'Введите имя',
        'region-label': 'Регион',
        'region-placeholder': 'Выберите регион',
        'region-empty': 'По запросу «{{filter}}» ничего не найдено',
        'region-europe': 'Европа',
        'region-asia': 'Азия',
        'region-america': 'Северная Америка',
        'invite-label': 'Ссылка-приглашение',
        save: 'Сохранить',
    },
    tasks: {
        title: 'Задачи',
        // Russian needs one / few / many (Intl.PluralRules), e.g. 1 задача, 3 задачи, 5 задач.
        counter: {
            zero: 'Нет открытых задач',
            one: '{{count}} открытая задача',
            few: '{{count}} открытые задачи',
            many: '{{count}} открытых задач',
            other: '{{count}} открытой задачи',
        },
        add: 'Добавить задачу',
        remove: 'Закрыть задачу',
    },
};
