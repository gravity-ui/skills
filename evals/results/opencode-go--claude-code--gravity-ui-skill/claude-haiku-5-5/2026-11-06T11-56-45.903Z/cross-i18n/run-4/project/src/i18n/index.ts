import { I18N } from '@gravity-ui/i18n';

import en from './en.json';
import ru from './ru.json';

export const LANGS = ['en', 'ru'] as const;
export type Lang = (typeof LANGS)[number];

export const isLang = (value: string): value is Lang => (LANGS as readonly string[]).includes(value);

export type AppKey = keyof typeof en.app;

export const i18n = new I18N({ lang: 'en', fallbackLang: 'en' });
i18n.registerKeysets('en', en);
i18n.registerKeysets('ru', ru);
