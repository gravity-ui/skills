import {useState} from 'react';
import {ArrowShapeTurnUpRight, ChevronDown, Copy, Pencil, TrashBin} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import type {DropdownMenuItem} from '@gravity-ui/uikit';

export type ActionsMenuProps = {
    /** Текст на кнопке-переключателе. */
    label?: string;
    onEdit?: () => void;
    onDuplicate?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
};

/**
 * Кнопка, по клику на которую раскрывается список действий.
 * Открытие/закрытие, фокус и навигация с клавиатуры (стрелки, Enter, Esc)
 * обрабатываются DropdownMenu из Gravity UI.
 */
export function ActionsMenu({
    label = 'Действия',
    onEdit,
    onDuplicate,
    onShare,
    onDelete,
}: ActionsMenuProps) {
    const [open, setOpen] = useState(false);

    // Вложенный массив — визуально отделённая группа (разделитель перед «Удалить»).
    const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
        {
            text: 'Редактировать',
            iconStart: <Icon data={Pencil} size={16} />,
            action: () => onEdit?.(),
        },
        {
            text: 'Дублировать',
            iconStart: <Icon data={Copy} size={16} />,
            action: () => onDuplicate?.(),
        },
        {
            text: 'Поделиться',
            iconStart: <Icon data={ArrowShapeTurnUpRight} size={16} />,
            action: () => onShare?.(),
        },
        [
            {
                text: 'Удалить',
                theme: 'danger',
                iconStart: <Icon data={TrashBin} size={16} />,
                action: () => onDelete?.(),
            },
        ],
    ];

    return (
        <DropdownMenu
            open={open}
            onOpenToggle={setOpen}
            items={items}
            size="m"
            popupProps={{placement: 'bottom-start'}}
            renderSwitcher={(switcherProps) => (
                <Button
                    {...switcherProps}
                    view="outlined"
                    size="m"
                    selected={open}
                    aria-haspopup="menu"
                    aria-expanded={open}
                >
                    {label}
                    <Icon data={ChevronDown} size={16} />
                </Button>
            )}
        />
    );
}
