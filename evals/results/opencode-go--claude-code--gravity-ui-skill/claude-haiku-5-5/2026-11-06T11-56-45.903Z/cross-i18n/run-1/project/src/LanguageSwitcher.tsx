import { type ControlGroupOption, SegmentedRadioGroup } from '@gravity-ui/uikit';

import { type Lang, useI18n } from './i18n/I18nProvider';

// Language names are shown in their own language, so they are not translated.
const LANG_OPTIONS: ControlGroupOption<Lang>[] = [
  { value: 'en', content: 'English' },
  { value: 'ru', content: 'Русский' },
];

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <SegmentedRadioGroup<Lang>
      aria-label={t('languageLabel')}
      value={lang}
      options={LANG_OPTIONS}
      onUpdate={setLang}
    />
  );
}
