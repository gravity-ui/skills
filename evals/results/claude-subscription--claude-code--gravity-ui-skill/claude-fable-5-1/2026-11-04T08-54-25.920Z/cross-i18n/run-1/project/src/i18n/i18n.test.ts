import {getConfig} from '@gravity-ui/uikit';
import {describe, expect, it} from 'vitest';

import {getAppLang, setAppLang, t} from './index';

describe('interface language switching', () => {
    it('switches application strings and uikit config together', () => {
        setAppLang('ru');
        expect(getAppLang()).toBe('ru');
        expect(getConfig().lang).toBe('ru');
        expect(t('column_name')).toBe('Название');
        expect(t('label_items', {count: 5})).toBe('5 элементов');

        setAppLang('en');
        expect(getAppLang()).toBe('en');
        expect(getConfig().lang).toBe('en');
        expect(t('column_name')).toBe('Name');
        expect(t('label_items', {count: 1})).toBe('1 item');
    });

    it('falls back to English for keys missing in Russian', () => {
        setAppLang('ru');
        expect(getConfig().fallbackLang).toBe('en');
    });
});
