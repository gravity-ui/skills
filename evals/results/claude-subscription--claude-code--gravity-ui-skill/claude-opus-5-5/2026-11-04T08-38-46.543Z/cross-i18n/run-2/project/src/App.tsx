import * as React from 'react';
import { Button, Card, ClipboardButton, Flex, Pagination, Select, Text, TextInput } from '@gravity-ui/uikit';

import { useTranslation } from './i18n';
import { LanguageSwitcher } from './i18n/LanguageSwitcher';

const INVITE_LINK = 'https://example.com/invite/7f3a9c';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Flex direction="column" gap={1}>
            <Text variant="subheader-1">{label}</Text>
            {children}
        </Flex>
    );
}

function ProfileCard() {
    const t = useTranslation('profile');
    const [name, setName] = React.useState('');
    const [region, setRegion] = React.useState<string[]>([]);

    const regionOptions = React.useMemo(
        () => [
            { value: 'europe', content: t('region-europe') },
            { value: 'asia', content: t('region-asia') },
            { value: 'america', content: t('region-america') },
        ],
        [t],
    );

    return (
        <Card view="outlined" style={{ padding: 'var(--g-spacing-5)' }}>
            <Flex direction="column" gap={4}>
                <Text variant="header-2">{t('title')}</Text>

                <Field label={t('name-label')}>
                    {/* hasClear: the clear button's label comes from uikit's own translations */}
                    <TextInput value={name} onUpdate={setName} placeholder={t('name-placeholder')} hasClear />
                </Field>

                <Field label={t('region-label')}>
                    {/* filterable: the filter placeholder is a uikit built-in string */}
                    <Select
                        width="max"
                        filterable
                        value={region}
                        onUpdate={setRegion}
                        options={regionOptions}
                        placeholder={t('region-placeholder')}
                        renderEmptyOptions={({ filter }) => (
                            <Text color="secondary" style={{ padding: 'var(--g-spacing-2) var(--g-spacing-3)' }}>
                                {t('region-empty', { filter })}
                            </Text>
                        )}
                    />
                </Field>

                <Field label={t('invite-label')}>
                    <Flex alignItems="center" gap={2}>
                        <Text ellipsis color="secondary" style={{ flex: 1, minWidth: 0 }}>
                            {INVITE_LINK}
                        </Text>
                        {/* Tooltip "Copy" / "Copied" is translated by uikit */}
                        <ClipboardButton text={INVITE_LINK} style={{ flexShrink: 0 }} />
                    </Flex>
                </Field>

                <Flex>
                    <Button view="action">{t('save')}</Button>
                </Flex>
            </Flex>
        </Card>
    );
}

function TasksCard() {
    const t = useTranslation('tasks');
    const [count, setCount] = React.useState(3);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);

    return (
        <Card view="outlined" style={{ padding: 'var(--g-spacing-5)' }}>
            <Flex direction="column" gap={4}>
                <Text variant="header-2">{t('title')}</Text>
                {/* Plural forms: en — one/other; ru — one/few/many */}
                <Text variant="body-2">{t('counter', { count })}</Text>
                <Flex gap={2} wrap>
                    <Button view="outlined" onClick={() => setCount((c) => c + 1)}>
                        {t('add')}
                    </Button>
                    <Button view="flat" disabled={count === 0} onClick={() => setCount((c) => Math.max(0, c - 1))}>
                        {t('remove')}
                    </Button>
                </Flex>
                {/* Previous / Next / "of" labels are uikit built-in strings */}
                <Pagination
                    page={page}
                    pageSize={pageSize}
                    total={120}
                    onUpdate={(nextPage, nextPageSize) => {
                        setPage(nextPage);
                        setPageSize(nextPageSize);
                    }}
                    compact={false}
                    showInput
                />
            </Flex>
        </Card>
    );
}

export function App() {
    const t = useTranslation('app');

    return (
        <Flex
            direction="column"
            gap={5}
            style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--g-spacing-6) var(--g-spacing-4)' }}
        >
            <Flex alignItems="flex-start" justifyContent="space-between" gap={4} wrap>
                <Flex direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="header-1">{t('title')}</Text>
                    <Text color="secondary">{t('subtitle')}</Text>
                </Flex>
                <div style={{ flexShrink: 0 }}>
                    <LanguageSwitcher />
                </div>
            </Flex>

            <ProfileCard />
            <TasksCard />
        </Flex>
    );
}
