import { useState } from 'react';
import { ArrowToggle, Button, DropdownMenu, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
    const [open, setOpen] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);

    // Nested array = visually separated group.
    const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
        [
            { text: 'Редактировать', action: () => setLastAction('Редактировать') },
            { text: 'Дублировать', action: () => setLastAction('Дублировать') },
            { text: 'Поделиться', action: () => setLastAction('Поделиться') },
            { text: 'Архивировать', action: () => setLastAction('Архивировать') },
        ],
        [{ text: 'Удалить', theme: 'danger', action: () => setLastAction('Удалить') }],
    ];

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <DropdownMenu
                items={items}
                open={open}
                onOpenToggle={setOpen}
                renderSwitcher={(props) => (
                    <Button {...props} view="action" aria-haspopup="menu" aria-expanded={open}>
                        Действия
                        <Button.Icon side="end">
                            <ArrowToggle direction={open ? 'top' : 'bottom'} />
                        </Button.Icon>
                    </Button>
                )}
            />
            {lastAction && <Text color="secondary">Выбрано действие: «{lastAction}»</Text>}
        </div>
    );
}
