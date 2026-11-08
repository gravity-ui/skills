import {useState} from 'react';

import {configure, getConfig} from '@gravity-ui/uikit';

import {i18n, languages} from '../i18n';
import type {AppLanguage} from '../i18n';

const fallbackLanguage: AppLanguage = 'en';

function getInitialLanguage(): AppLanguage {
  const configLanguage = getConfig().lang as AppLanguage;

  return languages.some(({code}) => code === configLanguage)
    ? configLanguage
    : fallbackLanguage;
}

export function useAppLanguage() {
  const [language, setLanguage] = useState<AppLanguage>(getInitialLanguage);

  const changeLanguage = (nextLanguage: AppLanguage) => {
    i18n.setLang(nextLanguage);
    configure({lang: nextLanguage});
    setLanguage(nextLanguage);
  };

  return {changeLanguage, language};
}
