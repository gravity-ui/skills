import { SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { LANGUAGES, isLanguage, useLanguage, type Language } from '../i18n';

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
};

export interface LanguageSwitcherProps {
  size?: 's' | 'm' | 'l' | 'xl';
}

export function LanguageSwitcher({ size = 'm' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <Text variant="body-2" as="span" id="language-switcher-label">
        {t('language.label')}
      </Text>
      <SegmentedRadioGroup<Language>
        size={size}
        value={language}
        aria-labelledby="language-switcher-label"
        qa="language-switcher"
        onUpdate={(value) => {
          if (isLanguage(value)) {
            setLanguage(value);
          }
        }}
      >
        {LANGUAGES.map((lang) => (
          <SegmentedRadioGroup.Option key={lang} value={lang}>
            {LANGUAGE_LABELS[lang]}
          </SegmentedRadioGroup.Option>
        ))}
      </SegmentedRadioGroup>
    </div>
  );
}
