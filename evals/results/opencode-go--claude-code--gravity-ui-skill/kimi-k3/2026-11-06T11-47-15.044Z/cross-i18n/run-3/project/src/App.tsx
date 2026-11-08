import React from 'react';
import {
    Button,
    Card,
    Divider,
    Flex,
    SegmentedRadioGroup,
    Text,
    configure,
} from '@gravity-ui/uikit';

import {setAppLang, t} from './i18n';
import type {AppLang} from './i18n';

export function App() {
    const [lang, setLang] = React.useState<AppLang>('en');
    const [count, setCount] = React.useState(3);

    React.useEffect(() => {
        setAppLang(lang);
        // Localize texts built into Gravity UI components as well
        configure({lang, fallbackLang: 'en'});
    }, [lang]);

    return (
        <Flex
            direction="column"
            gap={6}
            style={{maxWidth: 560, margin: '0 auto', padding: 24}}
        >
            <Flex direction="column" gap={2}>
                <Text variant="header-1">{t('app_title')}</Text>
                <Text variant="body-2" color="secondary">
                    {t('app_description')}
                </Text>
            </Flex>

            <Card view="raised" style={{padding: 20}}>
                <Flex direction="column" gap={4}>
                    <Text variant="subheader-2">{t('label_language')}</Text>
                    <SegmentedRadioGroup
                        size="l"
                        value={lang}
                        onUpdate={(value) => setLang(value as AppLang)}
                    >
                        <SegmentedRadioGroup.Option value="en">
                            English
                        </SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value="ru">
                            Русский
                        </SegmentedRadioGroup.Option>
                    </SegmentedRadioGroup>
                </Flex>
            </Card>

            <Card view="raised" style={{padding: 20}}>
                <Flex direction="column" gap={3}>
                    <Text variant="subheader-2">{t('section_profile')}</Text>
                    <Flex justifyContent="space-between" gap={4}>
                        <Text color="secondary">{t('label_name')}</Text>
                        <Text>{t('value_name')}</Text>
                    </Flex>
                    <Flex justifyContent="space-between" gap={4}>
                        <Text color="secondary">{t('label_role')}</Text>
                        <Text>{t('value_role')}</Text>
                    </Flex>
                    <Flex justifyContent="space-between" gap={4}>
                        <Text color="secondary">{t('label_email')}</Text>
                        <Text>alexandra@example.com</Text>
                    </Flex>
                    <Divider />
                    <Flex gap={2}>
                        <Button view="action">{t('action_save')}</Button>
                        <Button view="normal">{t('action_cancel')}</Button>
                    </Flex>
                </Flex>
            </Card>

            <Card view="raised" style={{padding: 20}}>
                <Flex direction="column" gap={3}>
                    <Text variant="subheader-2">{t('section_plural')}</Text>
                    <Flex gap={3} alignItems="center">
                        <Button
                            view="outlined"
                            onClick={() => setCount((c) => Math.max(0, c - 1))}
                        >
                            −
                        </Button>
                        <Text variant="body-2">{t('notifications', {count})}</Text>
                        <Button view="outlined" onClick={() => setCount((c) => c + 1)}>
                            +
                        </Button>
                    </Flex>
                </Flex>
            </Card>
        </Flex>
    );
}
