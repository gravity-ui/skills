import * as React from 'react';
import {ArrowDownToLine, ChevronDown, Copy, Pencil, TrashBin} from '@gravity-ui/icons';
import {Button, DropdownMenu, Flex, Icon, Text} from '@gravity-ui/uikit';
import type {DropdownMenuItem} from '@gravity-ui/uikit';

export function App() {
    const [lastAction, setLastAction] = React.useState<string | null>(null);

    const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
        [
            {
                text: 'Редактировать',
                iconStart: <Icon data={Pencil} size={16} />,
                action: () => setLastAction('Редактировать'),
            },
            {
                text: 'Дублировать',
                iconStart: <Icon data={Copy} size={16} />,
                action: () => setLastAction('Дублировать'),
            },
            {
                text: 'Скачать',
                iconStart: <Icon data={ArrowDownToLine} size={16} />,
                action: () => setLastAction('Скачать'),
            },
        ],
        [
            {
                text: 'Удалить',
                theme: 'danger',
                iconStart: <Icon data={TrashBin} size={16} />,
                action: () => setLastAction('Удалить'),
            },
        ],
    ];

    return (
        <Flex direction="column" alignItems="flex-start" gap={3} style={{padding: 24}}>
            <DropdownMenu
                items={items}
                renderSwitcher={(props) => (
                    <Button {...props} view="outlined">
                        Действия
                        <Icon data={ChevronDown} size={16} />
                    </Button>
                )}
            />
            <Text color="secondary">
                {lastAction ? `Выбрано действие: ${lastAction}` : 'Действие не выбрано'}
            </Text>
        </Flex>
    );
}
