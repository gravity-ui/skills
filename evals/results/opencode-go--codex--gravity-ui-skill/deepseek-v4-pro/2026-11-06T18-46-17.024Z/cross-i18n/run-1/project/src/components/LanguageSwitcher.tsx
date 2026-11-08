import {RadioGroup} from '@gravity-ui/uikit';
import type {RadioGroupOption} from '@gravity-ui/uikit';
import {useLang} from '../i18n';
import type {SupportedLang} from '../i18n';

const options: RadioGroupOption[] = [
  {value: 'en', content: 'English'},
  {value: 'ru', content: 'Русский'},
];

export function LanguageSwitcher() {
  const {lang, setLang} = useLang();

  return (
    <RadioGroup
      options={options}
      value={lang}
      onUpdate={(value) => setLang(value as SupportedLang)}
    />
  );
}
