import { Card, Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';
import { t, type AppLang } from './i18n';
import { useAppLanguage } from './useAppLanguage';

export function App() {
    const { lang, changeLanguage } = useAppLanguage();

    return (
        <Flex direction="column" gap={5} spacing={{ p: 6 }} style={{ maxWidth: 640 }}>
            <Text variant="display-1">{t('heading')}</Text>
            <Text variant="body-1">{t('body')}</Text>

            <Card view="outlined" qa="language-card">
                <Flex direction="column" gap={3} spacing={{ p: 5 }}>
                    <Flex direction="column" gap={1}>
                        <Text variant="subheader-1">{t('title')}</Text>
                        <Text variant="body-1" color="secondary">
                            {t('hint')}
                        </Text>
                    </Flex>

                    <SegmentedRadioGroup
                        name="language"
                        value={lang}
                        onUpdate={(value) => changeLanguage(value as AppLang)}
                    >
                        <SegmentedRadioGroup.Option value="en" content={t('english')} />
                        <SegmentedRadioGroup.Option value="ru" content={t('russian')} />
                    </SegmentedRadioGroup>
                </Flex>
            </Card>
        </Flex>
    );
}
