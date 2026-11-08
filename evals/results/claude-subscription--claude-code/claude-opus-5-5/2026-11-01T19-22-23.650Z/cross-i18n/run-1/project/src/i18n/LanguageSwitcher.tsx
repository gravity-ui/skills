import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { i18n } from './keysets';
import { SUPPORTED_LANGS, type AppLang, useLanguage } from './LanguageProvider';

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const { t } = i18n.useTranslation();

  return (
    <SegmentedRadioGroup<AppLang>
      aria-label={t('label_language')}
      value={lang}
      onUpdate={setLang}
      options={SUPPORTED_LANGS.map((value) => ({
        value,
        content: value.toUpperCase(),
        title: t(`lang_${value}`),
      }))}
    />
  );
}
