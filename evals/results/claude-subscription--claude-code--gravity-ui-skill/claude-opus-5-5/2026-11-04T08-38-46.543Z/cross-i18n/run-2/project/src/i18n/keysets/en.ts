// Source of truth for app strings. Other languages must provide the same keys.
export const en = {
    app: {
        title: 'Workspace settings',
        subtitle: 'The whole interface, including built-in Gravity UI texts, follows the selected language.',
        'language-label': 'Interface language',
    },
    profile: {
        title: 'Profile',
        'name-label': 'Display name',
        'name-placeholder': 'Enter your name',
        'region-label': 'Region',
        'region-placeholder': 'Select a region',
        'region-empty': 'Nothing found for “{{filter}}”',
        'region-europe': 'Europe',
        'region-asia': 'Asia',
        'region-america': 'North America',
        'invite-label': 'Invite link',
        save: 'Save',
    },
    tasks: {
        title: 'Tasks',
        counter: {
            zero: 'No open tasks',
            one: '{{count}} open task',
            other: '{{count}} open tasks',
        },
        add: 'Add task',
        remove: 'Close task',
    },
};

export type AppKeysets = typeof en;

type PluralForms = Partial<Record<'zero' | 'one' | 'two' | 'few' | 'many', string>> & { other: string };

/** Shape every translation must match: same keys as `en`; plural keys may use any CLDR forms. */
export type Translation<T = AppKeysets> = {
    [K in keyof T]: T[K] extends string ? string : T[K] extends { other: string } ? PluralForms : Translation<T[K]>;
};
