import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {LANGUAGE_NAMES, LANGUAGES, useLanguage} from './i18n/LanguageProvider';

export function LanguageSwitcher() {
  const {lang, setLang, t} = useLanguage();

  return (
    <SegmentedRadioGroup
      name="interface-language"
      aria-label={t('language_switcher_label')}
      value={lang}
      onUpdate={(value) => setLang(value)}
      options={LANGUAGES.map((code) => ({value: code, content: LANGUAGE_NAMES[code]}))}
    />
  );
}
