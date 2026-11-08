import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { LANGUAGES, type Language } from './translations';
import { useTranslation } from './LanguageProvider';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <SegmentedRadioGroup
      size="m"
      value={language}
      onUpdate={(value) => setLanguage(value as Language)}
      aria-label={t('app.languageSwitch')}
    >
      {LANGUAGES.map((item) => (
        <SegmentedRadioGroup.Option key={item.code} value={item.code}>
          {item.label}
        </SegmentedRadioGroup.Option>
      ))}
    </SegmentedRadioGroup>
  );
}
