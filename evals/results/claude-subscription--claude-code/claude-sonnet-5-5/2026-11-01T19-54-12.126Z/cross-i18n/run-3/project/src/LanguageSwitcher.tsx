import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useI18n, type Locale } from './i18n';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <SegmentedRadioGroup<Locale>
      aria-label={t('language')}
      value={locale}
      onUpdate={setLocale}
    >
      <SegmentedRadioGroup.Option value="en">{t('english')}</SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="ru">{t('russian')}</SegmentedRadioGroup.Option>
    </SegmentedRadioGroup>
  );
}
