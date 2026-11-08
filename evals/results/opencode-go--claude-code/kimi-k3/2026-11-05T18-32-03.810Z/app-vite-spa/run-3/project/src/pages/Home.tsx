import {useState} from 'react';
import {Button, Card, Text} from '@gravity-ui/uikit';

export function HomePage() {
    const [count, setCount] = useState(0);

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <Text variant="header-1">Добро пожаловать 👋</Text>
            <Text variant="body-2" color="secondary">
                Это небольшое демо-приложение: три страницы, навигация между ними и
                переключатель светлой/тёмной темы в шапке.
            </Text>
            <Card style={{padding: 20, maxWidth: 420}}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        flexWrap: 'wrap',
                    }}
                >
                    <Text variant="subheader-2">Счётчик: {count}</Text>
                    <Button view="action" onClick={() => setCount((c) => c + 1)}>
                        +1
                    </Button>
                    <Button view="outlined" onClick={() => setCount(0)}>
                        Сбросить
                    </Button>
                </div>
            </Card>
        </div>
    );
}
