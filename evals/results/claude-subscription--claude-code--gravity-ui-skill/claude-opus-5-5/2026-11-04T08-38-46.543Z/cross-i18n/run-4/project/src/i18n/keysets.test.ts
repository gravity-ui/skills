import {I18N} from '@gravity-ui/i18n';
import {describe, expect, it} from 'vitest';

import {en, ru} from './keysets';

describe('keysets', () => {
    it('ru and en have the same keys', () => {
        for (const keyset of Object.keys(en) as Array<keyof typeof en>) {
            expect(Object.keys(ru[keyset]).sort()).toEqual(Object.keys(en[keyset]).sort());
        }
    });

    it('pluralizes Russian and English correctly', () => {
        const i18n = new I18N({lang: 'ru', fallbackLang: 'en', data: {en, ru}});
        const tasks = (count: number) => i18n.i18n('app', 'label_tasks-left', {count});

        expect([0, 1, 3, 5, 21, 22, 11].map(tasks)).toEqual([
            'Все задачи выполнены',
            'Осталась 1 задача',
            'Осталось 3 задачи',
            'Осталось 5 задач',
            'Осталась 21 задача',
            'Осталось 22 задачи',
            'Осталось 11 задач',
        ]);

        i18n.setLang('en');
        expect([0, 1, 2].map(tasks)).toEqual(['All tasks are done', '1 task left', '2 tasks left']);
    });
});
