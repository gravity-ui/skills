import {useSyncExternalStore} from 'react';

import {getLang, subscribeLang} from './i18n';

export function useLang() {
  return useSyncExternalStore(subscribeLang, getLang);
}
