import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useI18n } from './I18nProvider';
import { LANGUAGES, type Language } from './messages';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <SegmentedRadioGroup
      aria-label={t('language.label')}
      value={language}
      onUpdate={(value) => setLanguage(value as Language)}
    >
      {LANGUAGES.map((lang) => (
        <SegmentedRadioGroup.Option key={lang} value={lang} content={t(`language.${lang}`)} />
      ))}
    </SegmentedRadioGroup>
  );
}
