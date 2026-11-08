import {Button, DropdownMenu, Flex, Icon, Text} from '@gravity-ui/uikit';
import type {DropdownMenuItem, DropdownMenuProps} from '@gravity-ui/uikit';
import {ChevronDown, Copy, Link, Pencil, TrashBin} from '@gravity-ui/icons';

const items: DropdownMenuProps<unknown>['items'] = [
    {
        text: 'Редактировать',
        iconStart: <Icon data={Pencil} size={16} />,
        action: () => alert('Редактировать'),
    },
    {
        text: 'Дублировать',
        iconStart: <Icon data={Copy} size={16} />,
        action: () => alert('Дублировать'),
    },
    {
        text: 'Скопировать ссылку',
        iconStart: <Icon data={Link} size={16} />,
        action: () => alert('Скопировать ссылку'),
    },
    [
        {
            text: 'Удалить',
            iconStart: <Icon data={TrashBin} size={16} />,
            theme: 'danger',
            action: () => alert('Удалить'),
        },
    ],
];

export function App() {
    return (
        <Flex direction="column" gap={4} style={{padding: 24}}>
            <Text variant="header-1">Меню действий</Text>
            <div>
                <DropdownMenu
                    items={items}
                    renderSwitcher={(props) => (
                        <Button {...props} view="normal" size="l">
                            Действия
                            <Icon data={ChevronDown} size={16} />
                        </Button>
                    )}
                />
            </div>
        </Flex>
    );
}
