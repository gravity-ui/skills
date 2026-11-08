import {useState} from 'react';
import {Button, Card, Flex, SegmentedRadioGroup, Text, configure} from '@gravity-ui/uikit';

import {app, i18n} from './i18n';

type Lang = 'en' | 'ru';

export function App() {
    const [lang, setLang] = useState<Lang>('en');

    const updateLang = (value: string) => {
        const next = value as Lang;
        i18n.setLang(next);
        configure({lang: next});
        setLang(next);
    };

    return (
        <Flex direction="column" gap={4} style={{padding: 24}}>
            <Flex direction="column" gap={2}>
                <Text as="h1" variant="header-1">
                    {app('title')}
                </Text>
                <Text variant="body-1">{app('description')}</Text>
            </Flex>

            <Card type="container" view="outlined">
                <Flex direction="column" gap={4} style={{padding: 24}}>
                    <Flex direction="column" gap={1}>
                        <Text variant="subheader-2">{app('language')}</Text>
                        <SegmentedRadioGroup value={lang} onUpdate={updateLang}>
                            <SegmentedRadioGroup.Option value="en">English</SegmentedRadioGroup.Option>
                            <SegmentedRadioGroup.Option value="ru">Русский</SegmentedRadioGroup.Option>
                        </SegmentedRadioGroup>
                    </Flex>

                    <Text variant="body-1">{app('note')}</Text>

                    <Flex>
                        <Button view="action">{app('cta')}</Button>
                    </Flex>
                </Flex>
            </Card>
        </Flex>
    );
}
