import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {LANGUAGES} from '../i18n';
import type {Lang} from '../i18n';
import {useI18n} from '../i18n/I18nProvider';

const LANGUAGE_NAMES: Record<Lang, string> = {
  en: 'English',
  ru: 'Русский',
};

export interface LanguageSwitcherProps {
  size?: 's' | 'm' | 'l' | 'xl';
}

export function LanguageSwitcher({size = 'm'}: LanguageSwitcherProps) {
  const {lang, setLang, t} = useI18n();

  return (
    <SegmentedRadioGroup<Lang>
      size={size}
      value={lang}
      onUpdate={setLang}
      aria-label={t('language.label')}
      qa="language-switcher"
    >
      {LANGUAGES.map((code) => (
        <SegmentedRadioGroup.Option key={code} value={code}>
          {LANGUAGE_NAMES[code]}
        </SegmentedRadioGroup.Option>
      ))}
    </SegmentedRadioGroup>
  );
}
