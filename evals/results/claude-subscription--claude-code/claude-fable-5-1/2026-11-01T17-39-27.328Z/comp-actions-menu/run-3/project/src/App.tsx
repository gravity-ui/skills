import {useState} from 'react';
import {Text} from '@gravity-ui/uikit';

import {ActionsMenu} from './ActionsMenu';

export function App() {
    const [lastAction, setLastAction] = useState<string | null>(null);

    return (
        <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start'}}>
            <ActionsMenu
                onEdit={() => setLastAction('Редактировать')}
                onDuplicate={() => setLastAction('Дублировать')}
                onShare={() => setLastAction('Поделиться')}
                onDelete={() => setLastAction('Удалить')}
            />
            <Text color="secondary">
                {lastAction ? `Выбрано: ${lastAction}` : 'Выберите действие из меню'}
            </Text>
        </div>
    );
}
