import type {KeyData} from '@gravity-ui/i18n';

// App-level translations. Keyset name -> key -> text.
// Plural keys use the CLDR forms supported by @gravity-ui/i18n (Intl.PluralRules).
export const en = {
    app: {
        title: 'Project overview',
        subtitle: 'The interface language can be switched at any time — the choice is remembered.',
        'label_language-switcher': 'Interface language',
        'section_team-title': 'Team',
        'field_member-label': 'Member',
        'field_member-placeholder': 'Select a member',
        'label_selected-members': {
            zero: 'No members selected',
            one: '{{count}} member selected',
            other: '{{count}} members selected',
        },
        'section_tasks-title': 'Tasks',
        'label_tasks-left': {
            zero: 'All tasks are done',
            one: '{{count}} task left',
            other: '{{count}} tasks left',
        },
        'action_complete-task': 'Complete a task',
        action_reset: 'Reset',
    },
    members: {
        alice: 'Alice',
        boris: 'Boris',
        victoria: 'Victoria',
        gleb: 'Gleb',
    },
};

// `satisfies` enforces the same keysets/keys as `en` while allowing
// language-specific plural forms (few/many for Russian).
export const ru = {
    app: {
        title: 'Обзор проекта',
        subtitle: 'Язык интерфейса можно сменить в любой момент — выбор сохранится.',
        'label_language-switcher': 'Язык интерфейса',
        'section_team-title': 'Команда',
        'field_member-label': 'Участник',
        'field_member-placeholder': 'Выберите участника',
        'label_selected-members': {
            zero: 'Участники не выбраны',
            one: 'Выбран {{count}} участник',
            few: 'Выбрано {{count}} участника',
            many: 'Выбрано {{count}} участников',
            other: 'Выбрано {{count}} участника',
        },
        'label_tasks-left': {
            zero: 'Все задачи выполнены',
            one: 'Осталась {{count}} задача',
            few: 'Осталось {{count}} задачи',
            many: 'Осталось {{count}} задач',
            other: 'Осталось {{count}} задачи',
        },
        'section_tasks-title': 'Задачи',
        'action_complete-task': 'Выполнить задачу',
        action_reset: 'Сбросить',
    },
    members: {
        alice: 'Алиса',
        boris: 'Борис',
        victoria: 'Виктория',
        gleb: 'Глеб',
    },
} satisfies {[K in keyof typeof en]: Record<keyof (typeof en)[K], KeyData>};
