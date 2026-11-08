import * as React from 'react';
import {Alert, Box, Button, Card, Flex, Pagination, Text, TextInput} from '@gravity-ui/uikit';

import {LanguageSwitcher} from './LanguageSwitcher';
import {i18n} from './i18n';
import {LangProvider, useLang} from './i18n/LangProvider';

const TOTAL_ITEMS = 42;

function AppContent() {
    const {lang} = useLang();
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [name, setName] = React.useState('');

    return (
        <Box spacing={{p: 6}} maxWidth={720} style={{margin: '0 auto'}}>
            <Flex direction="column" gap={5}>
                <Flex alignItems="center" justifyContent="space-between" gap={4}>
                    <Text variant="header-1" style={{flex: 1, minWidth: 0}} ellipsis>
                        {i18n('title')}
                    </Text>
                    <div style={{flexShrink: 0}}>
                        <LanguageSwitcher />
                    </div>
                </Flex>

                <Text variant="body-2" color="secondary">
                    {i18n('description')}
                </Text>

                <Card type="container" view="outlined" size="l">
                    <Flex direction="column" gap={4}>
                        <Text variant="body-1" color="secondary">
                            {i18n('label_current-language', {lang: i18n(`lang_${lang}`)})}
                        </Text>
                        <TextInput
                            size="l"
                            label={i18n('field_name')}
                            placeholder={i18n('field_name-placeholder')}
                            value={name}
                            onUpdate={setName}
                            hasClear
                        />
                        <Text variant="body-1">
                            {i18n('label_items-count', {count: TOTAL_ITEMS})}
                        </Text>
                        <Flex gap={2}>
                            <Button view="action" size="l">
                                {i18n('button_save')}
                            </Button>
                            <Button view="flat" size="l">
                                {i18n('button_cancel')}
                            </Button>
                        </Flex>
                    </Flex>
                </Card>

                <Alert
                    theme="info"
                    title={i18n('alert_title')}
                    message={i18n('alert_message')}
                />

                <Pagination
                    page={page}
                    pageSize={pageSize}
                    total={TOTAL_ITEMS}
                    pageSizeOptions={[10, 20, 50]}
                    showInput
                    onUpdate={(nextPage, nextPageSize) => {
                        setPage(nextPage);
                        setPageSize(nextPageSize);
                    }}
                />
            </Flex>
        </Box>
    );
}

export function App() {
    return (
        <LangProvider>
            <AppContent />
        </LangProvider>
    );
}
