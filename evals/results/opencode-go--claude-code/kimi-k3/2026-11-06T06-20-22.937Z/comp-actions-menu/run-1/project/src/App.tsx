import * as React from 'react';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import {ArrowDownToLine, ChevronDown, Copy, Pencil, TrashBin} from '@gravity-ui/icons';

export function App() {
    const [lastAction, setLastAction] = React.useState<string | null>(null);

    return (
        <div style={{padding: 24}}>
            <DropdownMenu
                size="m"
                items={[
                    {
                        text: 'Редактировать',
                        iconStart: <Icon data={Pencil} />,
                        action: () => setLastAction('Редактировать'),
                    },
                    {
                        text: 'Дублировать',
                        iconStart: <Icon data={Copy} />,
                        action: () => setLastAction('Дублировать'),
                    },
                    {
                        text: 'Скачать',
                        iconStart: <Icon data={ArrowDownToLine} />,
                        action: () => setLastAction('Скачать'),
                    },
                    [
                        {
                            text: 'Удалить',
                            iconStart: <Icon data={TrashBin} />,
                            theme: 'danger',
                            action: () => setLastAction('Удалить'),
                        },
                    ],
                ]}
                renderSwitcher={({onClick, onKeyDown}) => (
                    <Button view="action" onClick={onClick} onKeyDown={onKeyDown}>
                        Действия
                        <Icon data={ChevronDown} />
                    </Button>
                )}
            />
            {lastAction && <div style={{marginTop: 16}}>Выбрано действие: {lastAction}</div>}
        </div>
    );
}
