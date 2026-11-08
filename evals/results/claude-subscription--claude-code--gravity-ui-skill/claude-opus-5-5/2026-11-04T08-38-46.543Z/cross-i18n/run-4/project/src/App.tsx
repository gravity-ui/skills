import * as React from 'react';
import {Button, Card, Flex, Select, Text} from '@gravity-ui/uikit';

import {LanguageSwitcher} from './LanguageSwitcher';
import {useAppLang} from './i18n/LangProvider';
import type {AppKeysets} from './i18n';

const MEMBER_IDS: Array<keyof AppKeysets['members']> = ['alice', 'boris', 'victoria', 'gleb'];
const INITIAL_TASKS = 5;

export function App() {
    const {t} = useAppLang();
    const [members, setMembers] = React.useState<string[]>([]);
    const [tasksLeft, setTasksLeft] = React.useState(INITIAL_TASKS);

    const memberOptions = MEMBER_IDS.map((id) => ({value: id, content: t('members', id)}));

    return (
        <Flex direction="column" gap={6} style={{maxWidth: 720, margin: '0 auto', padding: 'var(--g-spacing-6)'}}>
            <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
                <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                    <Text variant="header-1">{t('app', 'title')}</Text>
                    <Text color="secondary">{t('app', 'subtitle')}</Text>
                </Flex>
                <div style={{flexShrink: 0}}>
                    <LanguageSwitcher />
                </div>
            </Flex>

            <Card view="outlined" style={{padding: 'var(--g-spacing-5)'}}>
                <Flex direction="column" gap={3}>
                    <Text variant="subheader-2">{t('app', 'section_team-title')}</Text>
                    {/* Select's built-in texts (clear button, filter) are translated by uikit itself */}
                    <Select
                        label={t('app', 'field_member-label')}
                        placeholder={t('app', 'field_member-placeholder')}
                        options={memberOptions}
                        value={members}
                        onUpdate={setMembers}
                        multiple
                        filterable
                        hasClear
                        width="max"
                    />
                    <Text color="secondary">
                        {t('app', 'label_selected-members', {count: members.length})}
                    </Text>
                </Flex>
            </Card>

            <Card view="outlined" style={{padding: 'var(--g-spacing-5)'}}>
                <Flex direction="column" gap={3}>
                    <Text variant="subheader-2">{t('app', 'section_tasks-title')}</Text>
                    <Text>{t('app', 'label_tasks-left', {count: tasksLeft})}</Text>
                    <Flex gap={2} wrap>
                        <Button
                            view="action"
                            disabled={tasksLeft === 0}
                            onClick={() => setTasksLeft((n) => Math.max(0, n - 1))}
                        >
                            {t('app', 'action_complete-task')}
                        </Button>
                        <Button view="normal" onClick={() => setTasksLeft(INITIAL_TASKS)}>
                            {t('app', 'action_reset')}
                        </Button>
                    </Flex>
                </Flex>
            </Card>
        </Flex>
    );
}
