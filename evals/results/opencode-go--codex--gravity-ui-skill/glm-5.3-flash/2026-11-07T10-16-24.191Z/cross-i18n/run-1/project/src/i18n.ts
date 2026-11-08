import { I18N } from '@gravity-ui/i18n';
import { configure, Lang } from '@gravity-ui/uikit';

export type AppLanguage = Lang.En | Lang.Ru;

export const appLanguages: AppLanguage[] = [Lang.En, Lang.Ru];

export const languageNames: Record<AppLanguage, string> = {
  en: 'English',
  ru: 'Русский',
};

const en = {
  app: {
    language: 'Language',
    content: 'Application content',
  },
};

const ru = {
  app: {
    language: 'Язык интерфейса',
    content: 'Содержимое приложения',
  },
};

const i18n = new I18N();

for (const language of appLanguages) {
  i18n.registerKeysets(language, language === Lang.En ? en : ru);
}

i18n.setLang(Lang.En);
configure({ lang: Lang.En });

export function setAppLanguage(language: AppLanguage): void {
  i18n.setLang(language);
  configure({ lang: language });
}

export { i18n };
