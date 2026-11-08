import {Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {SUPPORTED_LANGS, useLang} from './i18n';

export function App() {
  const {lang, setLang, t} = useLang();

  return (
    <Flex direction="column" gap={4} style={{padding: 24}}>
      <Text variant="header-1">{t('title')}</Text>
      <Text variant="body-2">{t('description')}</Text>

      <Flex direction="column" gap={2}>
        <Text variant="subheader-1">{t('language')}</Text>
        <SegmentedRadioGroup
          value={lang}
          onUpdate={setLang}
          aria-label={t('language')}
          qa="lang-switcher"
        >
          {SUPPORTED_LANGS.map((code) => (
            <SegmentedRadioGroup.Option key={code} value={code}>
              {code === 'ru' ? t('lang_ru') : t('lang_en')}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </Flex>

      <Text variant="body-1" color="secondary">
        {t('current', {language: t(`lang_${lang}`)})}
      </Text>
    </Flex>
  );
}
