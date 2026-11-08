import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import {useLanguage} from '../i18n/LanguageContext';
import {LANGUAGES, LANGUAGE_NAMES} from '../i18n/translations';
import type {Language} from '../i18n/translations';

/** Segmented EN / РУ control that switches the whole app language. */
export function LanguageSwitcher() {
  const {language, setLanguage, t} = useLanguage();

  return (
    <SegmentedRadioGroup
      aria-label={t('languageSwitcherLabel')}
      size="m"
      value={language}
      onUpdate={(value) => setLanguage(value as Language)}
      options={LANGUAGES.map((lang) => ({
        value: lang,
        content: LANGUAGE_NAMES[lang],
      }))}
    />
  );
}
