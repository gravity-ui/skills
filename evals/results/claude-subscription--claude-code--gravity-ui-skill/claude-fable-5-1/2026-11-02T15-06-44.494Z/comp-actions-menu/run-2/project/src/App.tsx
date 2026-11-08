import * as React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

import {ActionsMenu} from './ActionsMenu';
import type {ActionId} from './ActionsMenu';

const ACTION_LABELS: Record<ActionId, string> = {
    edit: 'Редактировать',
    duplicate: 'Дублировать',
    delete: 'Удалить',
};

export function App() {
    const [lastAction, setLastAction] = React.useState<ActionId | null>(null);

    return (
        <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
            <ActionsMenu onAction={setLastAction} />
            <Text variant="body-1" color="secondary">
                {lastAction
                    ? `Выбрано действие: ${ACTION_LABELS[lastAction]}`
                    : 'Действие пока не выбрано'}
            </Text>
        </Flex>
    );
}
