import {Select} from '@gravity-ui/uikit';
import type {SelectOption} from '@gravity-ui/uikit';

import {useI18n} from '../i18n/context';
import {Lang} from '@gravity-ui/uikit';

const options: SelectOption[] = [
  {value: Lang.En, content: 'English'},
  {value: Lang.Ru, content: 'Русский'},
];

export function LangSwitcher() {
  const {lang, setLang} = useI18n();

  return (
    <Select
      value={[lang]}
      onUpdate={(value) => setLang(value[0] as Lang)}
      options={options}
    />
  );
}
