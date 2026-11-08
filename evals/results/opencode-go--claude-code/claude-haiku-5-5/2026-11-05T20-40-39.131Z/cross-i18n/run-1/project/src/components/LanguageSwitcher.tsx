import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useTranslation } from '../i18n/LanguageProvider';
import { LANGUAGE_NAMES, LANGUAGES } from '../i18n/translations';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <SegmentedRadioGroup
      aria-label={t('language.label')}
      value={language}
      onUpdate={setLanguage}
      options={LANGUAGES.map((code) => ({ value: code, content: LANGUAGE_NAMES[code] }))}
    />
  );
}
