import { describe, expect, it } from 'vitest';
import { I18N } from '@gravity-ui/i18n';

import { en } from './keysets/en';
import { ru } from './keysets/ru';

function keyPaths(obj: object, prefix = ''): string[] {
    return Object.entries(obj).flatMap(([key, value]) =>
        typeof value === 'string' || 'other' in value ? [prefix + key] : keyPaths(value, `${prefix}${key}.`),
    );
}

describe('app keysets', () => {
    it('ru has exactly the same keys as en', () => {
        expect(keyPaths(ru).sort()).toEqual(keyPaths(en).sort());
    });

    it('pluralizes and templates in both languages', () => {
        const i18n = new I18N({ data: { en, ru }, fallbackLang: 'en' });

        i18n.setLang('en');
        expect(i18n.i18n('tasks', 'counter', { count: 0 })).toBe('No open tasks');
        expect(i18n.i18n('tasks', 'counter', { count: 1 })).toBe('1 open task');
        expect(i18n.i18n('tasks', 'counter', { count: 5 })).toBe('5 open tasks');

        i18n.setLang('ru');
        expect(i18n.i18n('tasks', 'counter', { count: 1 })).toBe('1 открытая задача');
        expect(i18n.i18n('tasks', 'counter', { count: 3 })).toBe('3 открытые задачи');
        expect(i18n.i18n('tasks', 'counter', { count: 5 })).toBe('5 открытых задач');
        expect(i18n.i18n('tasks', 'counter', { count: 21 })).toBe('21 открытая задача');
        expect(i18n.i18n('profile', 'region-empty', { filter: 'xyz' })).toBe('По запросу «xyz» ничего не найдено');
    });
});
