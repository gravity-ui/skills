import {
    Button,
    Card,
    Flex,
    SegmentedRadioGroup,
    Text,
} from '@gravity-ui/uikit';

import {LANGUAGES} from './i18n';
import {LanguageProvider, useLanguage} from './LanguageContext';

function Dashboard() {
    const {language, setLanguage, t} = useLanguage();

    return (
        <Flex centerContent style={{minHeight: '100vh', padding: 24}}>
            <Card view="raised" style={{width: 640, maxWidth: '100%'}}>
                <Flex direction="column" gap="6">
                    <Flex
                        justifyContent="space-between"
                        alignItems="flex-start"
                        gap="4"
                        wrap
                    >
                        <Flex direction="column" gap="2">
                            <Text variant="header-2">{t.title}</Text>
                            <Text variant="body-1" color="secondary">
                                {t.subtitle}
                            </Text>
                        </Flex>

                        <Flex direction="column" gap="2">
                            <Text variant="caption-1" color="secondary">
                                {t.languageLabel}
                            </Text>
                            <SegmentedRadioGroup
                                name="language"
                                value={language}
                                onUpdate={setLanguage}
                                options={LANGUAGES.map(({value, label}) => ({value, content: label}))}
                                size="m"
                            />
                        </Flex>
                    </Flex>

                    <Flex gap="3" wrap>
                        {[
                            {value: '12', label: t.statProjects},
                            {value: '28', label: t.statTasks},
                            {value: '9', label: t.statMembers},
                        ].map((stat) => (
                            <Card
                                key={stat.label}
                                type="selection"
                                view="outlined"
                                style={{flex: '1 1 140px'}}
                            >
                                <Flex direction="column" gap="1" style={{padding: 16}}>
                                    <Text variant="display-2">{stat.value}</Text>
                                    <Text variant="body-1" color="secondary">
                                        {stat.label}
                                    </Text>
                                </Flex>
                            </Card>
                        ))}
                    </Flex>

                    <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        gap="3"
                        wrap
                    >
                        <Button view="action" size="l">
                            {t.action}
                        </Button>
                        <Text variant="caption-1" color="secondary">
                            {t.updated}
                        </Text>
                    </Flex>
                </Flex>
            </Card>
        </Flex>
    );
}

export function App() {
    return (
        <LanguageProvider>
            <Dashboard />
        </LanguageProvider>
    );
}
