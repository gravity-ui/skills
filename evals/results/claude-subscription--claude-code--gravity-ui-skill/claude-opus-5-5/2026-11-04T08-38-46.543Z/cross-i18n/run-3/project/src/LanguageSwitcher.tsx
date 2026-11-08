import { Lang, SegmentedRadioGroup } from '@gravity-ui/uikit';

import { type AppLang, SUPPORTED_LANGS, setLanguage, useTranslation } from './i18n';

// Language names are shown in their own language, so they are never translated.
const LANG_NAMES: Record<AppLang, string> = {
  [Lang.En]: 'English',
  [Lang.Ru]: 'Русский',
};

export function LanguageSwitcher() {
  const { t, lang } = useTranslation('app');

  return (
    <SegmentedRadioGroup<AppLang>
      aria-label={t('language-switcher_label')}
      value={lang}
      onUpdate={setLanguage}
    >
      {SUPPORTED_LANGS.map((code) => (
        <SegmentedRadioGroup.Option<AppLang> key={code} value={code} content={LANG_NAMES[code]} />
      ))}
    </SegmentedRadioGroup>
  );
}
