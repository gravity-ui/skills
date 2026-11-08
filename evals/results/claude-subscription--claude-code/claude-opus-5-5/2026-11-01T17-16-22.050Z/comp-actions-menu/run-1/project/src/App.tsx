import { useState } from 'react';
import { Button, DropdownMenu, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
    const [lastAction, setLastAction] = useState<string | null>(null);

    const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
        [
            { text: 'Редактировать', action: () => setLastAction('Редактировать') },
            { text: 'Дублировать', action: () => setLastAction('Дублировать') },
            { text: 'Поделиться', action: () => setLastAction('Поделиться') },
        ],
        [
            { text: 'В архив', action: () => setLastAction('В архив') },
            { text: 'Удалить', theme: 'danger', action: () => setLastAction('Удалить') },
        ],
    ];

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <DropdownMenu
                items={items}
                renderSwitcher={(props) => (
                    <Button {...props} view="action">
                        Действия
                    </Button>
                )}
            />
            {lastAction && <Text color="secondary">Выбрано действие: {lastAction}</Text>}
        </div>
    );
}
