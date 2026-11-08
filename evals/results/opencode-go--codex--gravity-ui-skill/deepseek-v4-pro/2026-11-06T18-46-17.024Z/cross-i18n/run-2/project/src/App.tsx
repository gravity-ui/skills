import {Text, Flex, sp} from '@gravity-ui/uikit';

import {LangSwitcher} from './components/LangSwitcher';
import {useI18n} from './i18n/context';

export function App() {
  const {i18n, keyset} = useI18n();
  const app = keyset('app');

  return (
    <div className={sp({p: 6})}>
      <Flex direction="column" gap={4}>
        <Flex alignItems="center" gap={4}>
          <Text variant="header-1">{app('title')}</Text>
          <LangSwitcher />
        </Flex>
        <Text variant="body-1">{app('description')}</Text>
      </Flex>
    </div>
  );
}
