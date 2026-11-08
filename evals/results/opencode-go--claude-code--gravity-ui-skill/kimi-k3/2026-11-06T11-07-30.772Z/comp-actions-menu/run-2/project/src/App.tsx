import {useState} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

import {ActionsMenu} from './ActionsMenu';

export function App() {
    const [lastAction, setLastAction] = useState<string | null>(null);

    return (
        <Flex direction="column" gap={4} style={{padding: 24}}>
            <ActionsMenu onAction={setLastAction} />
            {lastAction && <Text color="secondary">Выбрано действие: {lastAction}</Text>}
        </Flex>
    );
}
