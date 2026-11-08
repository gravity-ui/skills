import {Flex, Select, Text} from '@gravity-ui/uikit';

import {useAppLanguage} from './hooks/use-app-language';
import {getAppKeyset, languages} from './i18n';

export function App() {
  const {changeLanguage, language} = useAppLanguage();
  const keyset = getAppKeyset();

  return (
    <Flex direction="column" grow={1} style={{padding: 24}}>
      <Text as="h1" variant="header-2">
        {keyset('title')}
      </Text>
      <Text variant="body-2" color="secondary">
        {keyset('subtitle')}
      </Text>
      <Flex direction="column" gap="2" width={320}>
        <Text variant="subheader-2">{keyset('language')}</Text>
        <Select
          size="m"
          value={[language]}
          onUpdate={([nextLanguage]) => changeLanguage(nextLanguage as typeof language)}
        >
          {languages.map(({code, name}) => (
            <Select.Option key={code} value={code}>
              {name}
            </Select.Option>
          ))}
        </Select>
        <Text variant="body-1" color="secondary">
          {keyset('selected')}{' '}
          {language === 'ru' ? keyset('russian') : keyset('english')}
        </Text>
      </Flex>
    </Flex>
  );
}
