import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {ChevronDown, Copy, Link, Pencil, TrashBin} from '@gravity-ui/icons';

type ActionsMenuProps = {
    onAction: (action: string) => void;
};

export function ActionsMenu({onAction}: ActionsMenuProps) {
    const items: DropdownMenuItemMixed<unknown>[] = [
        {
            text: 'Редактировать',
            iconStart: <Icon data={Pencil} size={16} />,
            action: () => onAction('Редактировать'),
        },
        {
            text: 'Создать копию',
            iconStart: <Icon data={Copy} size={16} />,
            action: () => onAction('Создать копию'),
        },
        {
            text: 'Поделиться',
            iconStart: <Icon data={Link} size={16} />,
            action: () => onAction('Поделиться'),
        },
        [
            {
                text: 'Удалить',
                iconStart: <Icon data={TrashBin} size={16} />,
                theme: 'danger',
                action: () => onAction('Удалить'),
            },
        ],
    ];

    return (
        <DropdownMenu
            items={items}
            renderSwitcher={(props) => (
                <Button {...props} view="outlined" size="l">
                    Действия
                    <Icon data={ChevronDown} size={16} />
                </Button>
            )}
        />
    );
}
