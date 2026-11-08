import * as React from 'react';
import {Button, DropdownMenu, Flex, Text} from '@gravity-ui/uikit';
import type {DropdownMenuItem} from '@gravity-ui/uikit';

export function App() {
    const [lastAction, setLastAction] = React.useState<string | null>(null);

    const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
        [
            {text: 'Редактировать', action: () => setLastAction('Редактировать')},
            {text: 'Дублировать', action: () => setLastAction('Дублировать')},
            {text: 'Переименовать', action: () => setLastAction('Переименовать')},
        ],
        [{text: 'Удалить', theme: 'danger', action: () => setLastAction('Удалить')}],
    ];

    return (
        <Flex direction="column" alignItems="flex-start" gap={3} style={{padding: 24}}>
            <DropdownMenu
                items={items}
                renderSwitcher={(props) => (
                    <Button {...props} view="outlined">
                        Действия
                    </Button>
                )}
            />
            <Text color="secondary">
                {lastAction ? `Выбрано: ${lastAction}` : 'Действие не выбрано'}
            </Text>
        </Flex>
    );
}
