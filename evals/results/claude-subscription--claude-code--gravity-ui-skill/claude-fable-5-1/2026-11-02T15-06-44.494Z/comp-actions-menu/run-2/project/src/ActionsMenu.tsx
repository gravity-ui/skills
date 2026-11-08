import * as React from 'react';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {ChevronDown, Copy, Pencil, TrashBin} from '@gravity-ui/icons';

export type ActionId = 'edit' | 'duplicate' | 'delete';

export interface ActionsMenuProps {
    /** Called with the id of the chosen action. */
    onAction?: (action: ActionId) => void;
    disabled?: boolean;
}

export function ActionsMenu({onAction, disabled}: ActionsMenuProps) {
    const [open, setOpen] = React.useState(false);

    const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
        // The first nested array is a visually separated group.
        [
            {
                text: 'Редактировать',
                iconStart: <Icon data={Pencil} size={16} />,
                action: () => onAction?.('edit'),
            },
            {
                text: 'Дублировать',
                iconStart: <Icon data={Copy} size={16} />,
                action: () => onAction?.('duplicate'),
            },
        ],
        {
            text: 'Удалить',
            theme: 'danger',
            iconStart: <Icon data={TrashBin} size={16} />,
            action: () => onAction?.('delete'),
        },
    ];

    return (
        <DropdownMenu
            open={open}
            onOpenToggle={setOpen}
            items={items}
            disabled={disabled}
            size="m"
            popupProps={{placement: 'bottom-start'}}
            renderSwitcher={(switcherProps) => (
                <Button
                    {...switcherProps}
                    view="normal"
                    size="m"
                    disabled={disabled}
                    selected={open}
                    aria-haspopup="menu"
                    aria-expanded={open}
                >
                    Действия
                    <Icon data={ChevronDown} size={16} />
                </Button>
            )}
        />
    );
}
