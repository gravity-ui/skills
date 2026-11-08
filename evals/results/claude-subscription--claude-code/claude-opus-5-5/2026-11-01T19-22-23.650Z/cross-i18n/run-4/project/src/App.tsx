import * as React from 'react';
import {Button, Card, Flex, Pagination, Text} from '@gravity-ui/uikit';

import {I18nProvider, useI18n} from './i18n/I18nProvider';
import {LanguageSwitcher} from './i18n/LanguageSwitcher';

function Content() {
    const {t} = useI18n();
    const [count, setCount] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);

    return (
        <Flex direction="column" gap={4} style={{padding: 24, maxWidth: 720}}>
            <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
                <Text variant="header-2">{t('app.title')}</Text>
                <LanguageSwitcher />
            </Flex>
            <Text color="secondary">{t('app.description')}</Text>

            <Card view="outlined" style={{padding: 16}}>
                <Flex direction="column" gap={3}>
                    <Text variant="subheader-2">{t('counter.title')}</Text>
                    <Text>{t('counter.value', {count})}</Text>
                    <Flex gap={2}>
                        <Button view="action" onClick={() => setCount((c) => c + 1)}>
                            {t('counter.increment')}
                        </Button>
                        <Button onClick={() => setCount(0)} disabled={count === 0}>
                            {t('counter.reset')}
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            <Card view="outlined" style={{padding: 16}}>
                <Flex direction="column" gap={3}>
                    <Text variant="subheader-2">{t('pagination.title')}</Text>
                    <Text color="secondary">{t('pagination.hint')}</Text>
                    <Pagination
                        page={page}
                        pageSize={pageSize}
                        total={250}
                        compact={false}
                        showInput
                        pageSizeOptions={[10, 25, 50]}
                        onUpdate={(nextPage, nextPageSize) => {
                            setPage(nextPage);
                            setPageSize(nextPageSize);
                        }}
                    />
                </Flex>
            </Card>
        </Flex>
    );
}

export function App() {
    return (
        <I18nProvider>
            <Content />
        </I18nProvider>
    );
}
